# Architecture

## System Overview

MetalPulse is a React Native mobile application built on Expo SDK 54 with the **New Architecture (Fabric renderer)** enabled. It follows a layered architecture with clear separation between data, state, and presentation.

```
┌─────────────────────────────────────────────────────┐
│                    Expo Router v6                     │
│              (File-based Navigation)                 │
├─────────────────────────────────────────────────────┤
│                    Screen Layer                       │
│  HomeScreen │ DetailScreen │ AIInsights │ Portfolio  │
│  SIPCalc    │ Investment   │ Converter  │ Alerts     │
├─────────────────────────────────────────────────────┤
│                  Component Layer                     │
│  MetalTile │ AnimatedPrice │ LivePulse │ SparkLine  │
│  DayRange  │ SpreadIndicator │ OHLCGrid │ Skeleton  │
├─────────────────────────────────────────────────────┤
│                   State Layer                        │
│          MetalsContext (React Context)                │
│     useMetalPrice (useReducer + fetch)               │
├─────────────────────────────────────────────────────┤
│                    Data Layer                        │
│         goldApi.ts        │      inrApi.ts           │
│     (GoldAPI.io REST)     │ (ExchangeRate-API REST) │
├─────────────────────────────────────────────────────┤
│                  Storage Layer                       │
│   SecureStore (PIN)  │  AsyncStorage (Portfolio)    │
│                      │  AsyncStorage (Alerts)       │
└─────────────────────────────────────────────────────┘
```

---

## Architectural Decisions

### 1. React Native New Architecture (Fabric)

**Decision:** Enable `newArchEnabled: true` in app.json.

**Rationale:** Fabric renderer provides synchronous layout, concurrent features, and better performance. However, it introduces strict constraints:

- All SVG numeric props must be actual numbers (not strings)
- `adjustsFontSizeToFit` is not supported
- `TextInput` with `secureTextEntry` crashes on some devices
- Many community libraries have Fabric incompatibilities

**Impact:** Required custom implementations for PIN entry (custom dialpad), careful prop typing across all components, and library version pinning.

### 2. Expo Router (File-based Routing)

**Decision:** Use expo-router v6 instead of React Navigation directly.

**Rationale:** File-based routing reduces boilerplate, provides automatic deep linking, and enforces a predictable URL structure. Each screen maps 1:1 to a file in `app/`.

**Routes:**
```
/                    → HomeScreen (metal grid + tools)
/detail/[metal]      → DetailScreen (price hero + analytics)
/ai-insights         → AIInsightsScreen (technical analysis)
/portfolio           → PortfolioScreen (holdings + P&L)
/sip                 → SIPCalculatorScreen
/invest              → InvestmentScreen
/converter           → ConverterScreen
/alerts              → AlertsScreen
```

### 3. Context + useReducer (No Redux/Zustand)

**Decision:** Use React Context with useReducer for global state.

**Rationale:** The app has a small, well-defined state shape (4 metal caches + exchange rates + preferences). Redux would add unnecessary complexity. The `MetalsContext` provides:

- Shared cache for all 4 metals
- Exchange rate data (fetched once)
- Selected currency state
- Auto-refresh timer (30s interval)
- `refreshTrigger` — incremented to signal all hooks to refetch

Each `MetalTile` uses `useMetalPrice` hook which responds to `refreshTrigger` changes.

### 4. Separated Animation Drivers

**Decision:** Never mix `useNativeDriver: true` and `useNativeDriver: false` on the same `Animated.View`.

**Rationale:** React Native's Animated API throws a runtime error if a node driven by the native driver later receives a JS-driven animation (or vice versa). The `AnimatedPrice` component uses:

- **Outer Animated.View** — background color flash (`useNativeDriver: false`, required for color interpolation)
- **Inner Animated.View** — scale transform (`useNativeDriver: true`, for smooth 60fps)

### 5. Custom PIN Dialpad

**Decision:** Build a custom number pad instead of using `<TextInput secureTextEntry>`.

**Rationale:** The combination of `TextInput` + `secureTextEntry` + Fabric renderer caused a `java.lang.String cannot be cast to java.lang.Boolean` crash on Android. The custom dialpad:

- Renders 12 `TouchableOpacity` keys (0-9, delete, biometric)
- Manages PIN state as a string in component state
- Auto-submits when 4 digits are entered
- Includes shake animation on wrong PIN

---

## Data Flow

```
                    ┌──────────────┐
                    │  GoldAPI.io  │
                    └──────┬───────┘
                           │ HTTP GET /XAU, /XAG, /XPT, /XPD
                           ▼
                    ┌──────────────┐
                    │  goldApi.ts  │  fetchWithTimeout + error classification
                    └──────┬───────┘
                           │
                           ▼
               ┌───────────────────────┐
               │    useMetalPrice()    │  useReducer: idle→loading→success/error
               │  (per-tile instance)  │  responds to refreshTrigger
               └───────────┬───────────┘
                           │ setCacheEntry()
                           ▼
               ┌───────────────────────┐
               │    MetalsContext      │  Shared cache, exchange rates
               │  (React Context)      │  30s auto-refresh interval
               └───────────┬───────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         MetalTile    DetailScreen  AIInsights
         (4 tiles)    (per metal)  (all metals)
```

### Auto-Refresh Cycle

1. `MetalsContext` runs a `setInterval` every 30 seconds
2. Increments `refreshTrigger` counter
3. All `useMetalPrice` hooks detect the change via `useEffect` dependency
4. Each hook fetches fresh data from GoldAPI
5. On success, cache is updated → components re-render with new prices
6. `AnimatedPrice` detects value change and triggers flash animation
7. `nextRefreshAt` timestamp is set → `RefreshCountdown` shows live timer

### AppState Handling

- When app returns to foreground (`AppState === 'active'`), an immediate refresh is triggered
- The interval timer continues running — no duplicate timers

---

## Component Architecture

### Smart vs Presentational

**Smart (stateful):**
- `HomeScreen` — manages refresh state, currency modal
- `DetailScreen` — consumes metal data via route params
- `AppLock` — manages PIN flow state machine
- `MetalTile` — delegates to `useMetalPrice` hook

**Presentational (props-driven):**
- `AnimatedPrice` — receives `value`, `direction`, handles animation internally
- `LivePulse` — pure animated dot, configurable via props
- `SparklineChart` — renders SVG from data points
- All grid/bar/indicator components

### Error Boundaries

Each `MetalTile` independently handles:
- **Loading** → `SkeletonLoader` (shimmer animation)
- **Error** → `ErrorTile` (message + retry button)
- **Success** → `TileContent` (price + change + sparkline)

A single metal's API failure doesn't affect other tiles.

---

## Security

| Concern | Implementation |
|---------|---------------|
| PIN Storage | `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android) |
| Biometric Auth | `expo-local-authentication` with fallback to PIN |
| API Keys | Stored in `.env` (gitignored), accessed via `EXPO_PUBLIC_*` prefix |
| Network | HTTPS-only API calls, timeout protection (10s) |
| Crash Recovery | SecureStore errors caught and PIN reset gracefully |

---

## State Management Detail

```typescript
// MetalsContextType — the entire app state shape
interface MetalsContextType {
  cache: Record<MetalCode, CachedMetal | null>;  // 4 entries
  exchangeRates: Record<string, number> | null;   // ~160 currencies
  exchangeRatesLoading: boolean;
  selectedCurrency: DisplayCurrency;              // one of 8
  setSelectedCurrency: (c: DisplayCurrency) => void;
  setCache: (code: MetalCode, data: GoldApiResponse) => void;
  getCache: (code: MetalCode) => CachedMetal | null;
  isCacheFresh: (code: MetalCode, maxAgeMs?: number) => boolean;
  refreshAll: () => void;
  refreshTrigger: number;                         // increment = refetch all
  getRate: (currency: DisplayCurrency) => number;
  nextRefreshAt: number;                          // for countdown UI
}
```

---

## File Organization Principles

1. **Route files** (`app/`) — thin wrappers that import screen components
2. **Screen files** (`src/screens/`) — compose components, manage screen-level state
3. **Components** (`src/components/`) — reusable UI building blocks
4. **Hooks** (`src/hooks/`) — encapsulate fetch logic with caching
5. **Context** (`src/context/`) — global shared state
6. **API** (`src/api/`) — data fetching, type definitions
7. **Utils** (`src/utils/`) — pure formatting/calculation functions
8. **Constants** (`src/constants/`) — theme, metal configs, currency definitions

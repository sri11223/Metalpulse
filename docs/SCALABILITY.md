# Scalability

This document outlines the scalability characteristics of MetalPulse and the strategies employed to handle growth in data, users, features, and platform targets.

---

## Current Scale

| Metric | Value |
|--------|-------|
| Metals tracked | 4 (Gold, Silver, Platinum, Palladium) |
| Currencies supported | 8 (USD, INR, EUR, GBP, AED, JPY, CAD, AUD) |
| Refresh interval | 30 seconds |
| API calls per refresh cycle | 4 (one per metal) |
| Screens | 8 |
| Components | 16 |

---

## Scaling Dimensions

### 1. Adding More Metals / Assets

**Current design:** Metals are defined in a single `METALS` array in `src/constants/metals.ts`. Each entry has a `code`, `name`, `color`, and `gradient`.

**To add a new metal:**
1. Add an entry to the `METALS` array
2. Add the `MetalCode` to the union type
3. Initialize it as `null` in the context cache

**Scaling concern:** The HomeScreen grid renders all metals. Beyond ~8 metals, the 2-column grid would need pagination or a `FlatList` with virtualization.

**Recommendation:** Replace `ScrollView` + `View.map()` with `FlatList` when metals exceed 6, gaining:
- Windowed rendering (only visible items mounted)
- Built-in scroll optimization
- Efficient re-render via `keyExtractor`

---

### 2. API Rate Limiting & Caching

**Current:** 4 metals × 1 request/30s = 8 requests/minute = ~11,520 requests/day per user.

**GoldAPI.io free tier:** 300 requests/month — sufficient for development only.

**Scaling strategies:**

| Strategy | Description | Effort |
|----------|-------------|--------|
| **Backend proxy** | Centralized server fetches prices once, serves all clients via WebSocket or polling | High |
| **Shared cache** | Server-side cache (Redis) with 15s TTL, clients hit the proxy | Medium |
| **Tiered refresh** | Foreground = 30s, background = 5min, inactive tab = paused | Low |
| **Conditional fetch** | Use `If-None-Match` / `If-Modified-Since` headers if API supports | Low |
| **Batch endpoint** | If GoldAPI adds a batch endpoint, fetch all 4 metals in one call | Depends on API |

**Recommended architecture for production:**

```
Mobile App  ←→  API Gateway (Lambda/Cloud Run)  ←→  GoldAPI.io
                     ↕
                Redis Cache (15s TTL)
```

Benefits:
- Single API key on server (not exposed in client)
- One fetch per interval regardless of user count
- WebSocket fan-out to all connected clients
- Rate limit management centralized

---

### 3. Real-time Data (WebSocket)

**Current limitation:** GoldAPI.io does not offer WebSocket or streaming endpoints. We compensate with:
- 30-second polling
- `AnimatedPrice` flash animations (visual "live" feel)
- `LivePulse` indicator

**Full real-time path:**

```
┌──────────┐    WebSocket     ┌──────────┐      REST       ┌──────────┐
│  Client  │ ◄──────────────► │  Server  │ ◄──────────────► │ GoldAPI  │
│  (App)   │    push prices   │  (WS)    │   poll every 5s  │          │
└──────────┘                  └──────────┘                  └──────────┘
```

**Implementation plan:**
1. Build a lightweight Node.js/Bun server with `ws` or Socket.io
2. Server polls GoldAPI every 5-15 seconds
3. On price change, broadcast to all connected clients
4. Client maintains a WebSocket connection (reconnect on drop)
5. Fall back to REST polling if WebSocket disconnects

---

### 4. State Management at Scale

**Current:** React Context is sufficient for 4 metals + preferences.

**When to migrate:**
- 10+ metals with independent refresh cycles
- Server-synced portfolio with optimistic updates
- Offline-first with conflict resolution
- Multi-tab/window support (web)

**Migration path:**

| Stage | Solution | Use Case |
|-------|----------|----------|
| Current | React Context + useReducer | 4 metals, simple cache |
| Next | Zustand | More metals, derived state, middleware |
| Scale | TanStack Query (React Query) | Server state, background refetching, pagination |
| Enterprise | Redux Toolkit + RTK Query | Complex offline sync, undo/redo |

---

### 5. Offline Support

**Current:** No offline support — shows errors if network unavailable.

**Scaling plan:**

1. **Cache persistence** — Serialize `MetalsContext.cache` to AsyncStorage on every update
2. **Stale-while-revalidate** — Show last known prices with a "stale" indicator
3. **Queue mutations** — Portfolio additions queue locally, sync when online
4. **Background fetch** — Use `expo-background-fetch` for periodic updates (iOS/Android)

**Implementation:**
```typescript
// On every cache update:
AsyncStorage.setItem('metal_cache', JSON.stringify(cache));

// On app start:
const saved = await AsyncStorage.getItem('metal_cache');
if (saved) setCache(JSON.parse(saved)); // show immediately
fetchFresh(); // then update
```

---

### 6. Multi-Platform

**Current:** Android + iOS via Expo.

**Web support:**
- expo-router supports web out of the box
- SVG components work on web
- `SecureStore` needs a web fallback (localStorage + encryption)
- `LocalAuthentication` not available on web — skip biometric, PIN only
- Animations work but may need `requestAnimationFrame` optimizations

**Desktop (Electron/Tauri):**
- Possible via `react-native-web` bridge
- Would need platform-specific storage adapters

---

### 7. Performance Optimization

| Optimization | Status | Impact |
|-------------|--------|--------|
| `React.memo` on tiles | ✅ Already uses pure components | Prevents unnecessary re-renders |
| Virtualized lists | ❌ Not needed yet (4 items) | Critical at 10+ metals |
| Image caching | N/A (no images) | — |
| Bundle splitting | ❌ Not available in RN | — |
| Hermes engine | ✅ Default in Expo SDK 54 | Faster startup, lower memory |
| Native driver animations | ✅ Used where possible | 60fps animations |
| Lazy screen loading | ✅ expo-router lazy by default | Faster initial load |

---

### 8. Testing at Scale

**Recommended testing pyramid:**

```
                    ┌───────┐
                    │  E2E  │  Detox / Maestro
                    │ (few) │  Critical user flows
                    ├───────┤
                    │ Integ │  React Native Testing Library
                    │       │  Screen-level tests
                    ├───────┤
                    │ Unit  │  Jest
                    │(many) │  Utils, hooks, formatters
                    └───────┘
```

**Priority test targets:**
1. `formatPrice.ts` — currency formatting edge cases
2. `useMetalPrice` — state machine transitions
3. `MetalsContext` — cache logic, refresh trigger
4. `AppLock` — PIN flow state machine
5. `AIInsightsScreen.analyzeMetalData` — technical analysis calculations

---

## Scaling Roadmap

| Phase | Timeline | Changes |
|-------|----------|---------|
| **MVP** (current) | Done | 4 metals, client-side polling, local storage |
| **v1.1** | Short-term | Backend proxy + Redis cache, WebSocket for prices |
| **v1.2** | Short-term | Offline support, push notifications for alerts |
| **v2.0** | Medium-term | User accounts, cloud-synced portfolio, historical charts |
| **v2.1** | Medium-term | FlatList virtualization, 10+ assets (crypto, commodities) |
| **v3.0** | Long-term | Web app, social features, real AI/ML price predictions |

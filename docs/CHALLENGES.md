# Challenges Faced

This document chronicles the significant technical challenges encountered during the development of MetalPulse, along with the solutions implemented and lessons learned.

---

## Challenge 1: Fabric Renderer Crash — `java.lang.String cannot be cast to java.lang.Boolean`

### Problem

The app crashed immediately on Android with:

```
java.lang.String cannot be cast to java.lang.Boolean
at com.facebook.react.fabric.mounting.MountItemDispatcher
```

### Root Cause

**Multiple compounding issues**, all related to React Native's New Architecture (Fabric):

1. **`TextInput` with `secureTextEntry`** — Fabric passes `secureTextEntry` as a string internally, but the native side expects a boolean. This was the primary crash trigger on the PIN screen.

2. **SVG string-typed numeric props** — Props like `stopOpacity="0.2"` (string) instead of `stopOpacity={0.2}` (number) caused Fabric type mismatches in gradient/SVG components.

3. **`react-native-toast-message`** — This library was fundamentally incompatible with Fabric, causing overlay rendering crashes.

4. **Package version mismatches** — `react-native-screens`, `react-native-gesture-handler`, and `react-native-svg` were at versions newer than what Expo SDK 54 expects, causing internal bridge mismatches.

5. **`adjustsFontSizeToFit`** — This `Text` prop triggered Fabric layout crashes on certain Android devices.

### Solution

| Fix | Details |
|-----|---------|
| Custom dialpad | Replaced `TextInput` with `secureTextEntry` with 12 `TouchableOpacity` buttons forming a number pad |
| SVG prop typing | Changed all SVG numeric props from strings to JavaScript numbers: `stopOpacity={0.2}` |
| Removed Toast | Uninstalled `react-native-toast-message`, replaced with inline UI feedback |
| Version pinning | Ran `npx expo install --fix` to downgrade packages to SDK 54-compatible versions |
| Removed `adjustsFontSizeToFit` | Stripped from all `Text` components |
| Stack navigator props | Removed `contentStyle` and `animation` props that triggered Fabric edge cases |

### Lesson Learned

> Fabric (New Architecture) is strict about prop types at the native bridge boundary. Every prop that crosses from JS to native must match the expected type exactly. String/boolean/number mismatches that were silently tolerated by the old architecture cause hard crashes in Fabric.

---

## Challenge 2: Animation Native Driver Conflict

### Problem

On auto-refresh, the app threw:

```
Error: Attempting to run JS driven animation on animated node 
that has been moved to "native" earlier by starting an animation 
with `useNativeDriver: true`
```

### Root Cause

The `AnimatedPrice` component had two `Animated.Value` instances applied to the **same** `Animated.View`:

```tsx
// BROKEN — don't do this
<Animated.View style={{
  backgroundColor: bgColor,   // flashAnim → useNativeDriver: false
  transform: [{ scale: scaleAnim }],  // scaleAnim → useNativeDriver: true
}}>
```

React Native tracks which "driver" owns each animated node. When `flashAnim` (JS driver) and `scaleAnim` (native driver) are both applied to the same view, the second animation attempt fails because the node has already been claimed by the other driver.

### Solution

Separated into two nested `Animated.View` components, each driven by exactly one driver type:

```tsx
// FIXED — separate views for separate drivers
<Animated.View style={{ backgroundColor: bgColor }}>        {/* JS driver */}
  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{/* Native driver */}
    <Text>{value}</Text>
  </Animated.View>
</Animated.View>
```

Also changed from `Animated.parallel()` (which ties animations together) to two independent `.start()` calls.

### Lesson Learned

> Never apply `Animated.Value` instances with different `useNativeDriver` settings to the same `Animated.View`. If you need both JS-driven (color, layout) and native-driven (transform, opacity) animations on one element, nest two `Animated.View` layers.

---

## Challenge 3: GoldAPI.io Limitations

### Problem

- **No WebSocket support** — only REST endpoints
- **Rate limiting** — 300 requests/month on free tier (4 metals × 2 req/min = 11,520/day)
- **No batch endpoint** — must fetch each metal individually
- **Inconsistent response times** — 200ms to 3s depending on server load

### Solution

| Strategy | Implementation |
|----------|---------------|
| Client-side caching | `MetalsContext` stores fetched data with timestamps |
| Cache freshness check | `isCacheFresh()` avoids refetching valid data |
| Timeout protection | 10-second `AbortController` timeout on all requests |
| Error classification | `classifyHttpError()` distinguishes retryable (network, 429, 5xx) from permanent (401, 404) errors |
| Visual live feel | `AnimatedPrice` flash + `LivePulse` dot give perception of real-time even with 30s polling |
| Configurable interval | `AUTO_REFRESH_MS` constant easily adjustable |

### Lesson Learned

> When real-time data isn't available via WebSocket, UX animations and visual indicators can create an effective perception of liveness. Users respond to visual feedback more than actual millisecond-level freshness.

---

## Challenge 4: SecureStore Type Casting Errors

### Problem

`expo-secure-store` would occasionally throw `ClassCastException` when reading the stored PIN, especially after app updates or OS-level keychain changes.

### Solution

Built safe wrapper functions that catch and recover:

```typescript
async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('cannot be cast') || msg.includes('ClassCastException')) {
      try { await SecureStore.deleteItemAsync(key); } catch { /* noop */ }
    }
    return null;
  }
}
```

If the stored value is corrupted, it's deleted and the user is prompted to set a new PIN rather than being locked out forever.

### Lesson Learned

> Device-level secure storage can be unreliable across updates. Always wrap secure storage reads in try-catch with graceful degradation. Never let a storage error permanently lock users out.

---

## Challenge 5: Multi-Currency Formatting

### Problem

Displaying prices in 8 different currencies with correct:
- Symbol placement (€ before, ₹ before, ¥ before)
- Decimal handling (JPY has no decimals, INR uses lakhs notation)
- Compact notation for large numbers
- Per-gram prices that can be very small for silver

### Solution

Used `Intl.NumberFormat` with currency-aware configuration:

```typescript
export function formatCurrency(
  amount: number,
  currency: DisplayCurrency,
  compact = false
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
```

Exchange rates are fetched once on app start from ExchangeRate-API's `/latest/USD` endpoint, which returns rates for all currencies in one call. Fallback hardcoded rates ensure the app works even if the exchange rate API is down.

### Lesson Learned

> `Intl.NumberFormat` handles most currency formatting complexities. Fetch all exchange rates in one call rather than per-currency to minimize API usage. Always have fallback rates for offline scenarios.

---

## Challenge 6: Expo Router + Stack Navigator Fabric Bugs

### Problem

The `Stack` navigator from `expo-router` crashed when certain configuration props were passed:

- `contentStyle={{ backgroundColor: '...' }}` triggered a Fabric layout error
- `animation: 'slide_from_right'` caused animation bridge crashes on some devices
- `headerStyle` with shadow properties crashed on Android

### Solution

Stripped the Stack navigator to the absolute minimum configuration:

```tsx
<Stack screenOptions={{ headerShown: false }}>
  {/* Routes auto-discovered from app/ directory */}
</Stack>
```

No `contentStyle`, no `animation`, no `headerStyle`. All visual customization is done within screen components using `SafeAreaView` and manual styling.

### Lesson Learned

> With Fabric enabled, use the navigation library's minimal configuration. Fancy navigator-level styling is the most common source of Fabric crashes. Style within your screens instead.

---

## Challenge 7: TypeScript Strict Mode with StyleProp

### Problem

The `AnimatedPrice` component accepted `style?: TextStyle`, but callers passed an array of styles (`[styles.price, styles.bold]`), which is `TextStyle[]`. TypeScript strict mode rejected this.

### Solution

Changed the type to `StyleProp<TextStyle>`:

```typescript
import { StyleProp, TextStyle } from 'react-native';

interface AnimatedPriceProps {
  style?: StyleProp<TextStyle>;  // accepts TextStyle | TextStyle[] | undefined
}
```

`StyleProp<T>` is React Native's official type that accepts a single style, an array, or `null/undefined`.

### Lesson Learned

> Always use `StyleProp<TextStyle>` or `StyleProp<ViewStyle>` for component style props, never raw `TextStyle` or `ViewStyle`. This is the correct type that handles all possible style value forms.

---

## Summary of Key Principles

1. **Fabric demands strict typing** — every prop crossing the JS-native bridge must be the exact expected type
2. **Separate animation drivers** — never mix `useNativeDriver: true` and `false` on the same animated node
3. **Defensive storage access** — always wrap SecureStore/AsyncStorage in try-catch with recovery
4. **Minimal navigator config** — style within screens, not at the navigator level
5. **Animations create perceived performance** — visual feedback matters more than polling frequency
6. **Fallback data** — always have fallback values for network-dependent data
7. **`StyleProp<T>`** — the correct way to type style props in React Native components

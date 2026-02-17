# MetalPulse ⚡

**Real-time precious metal price tracker for professional investors & traders.**

Built with React Native (Expo SDK 54) — featuring live pricing, AI-powered technical analysis, portfolio tracking, SIP calculator, digital gold, and multi-currency support.

## 📲 Download APK

[![Download APK](https://img.shields.io/badge/Download-Android_APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://expo.dev/artifacts/eas/sd5jqgZvYP8Q89GaYoiuKJ.apk)

> **Direct link:** https://expo.dev/artifacts/eas/sd5jqgZvYP8Q89GaYoiuKJ.apk

---

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Features

### Core

- **Live Metal Prices** — Gold, Silver, Platinum & Palladium with 5-minute auto-refresh
- **8 Currencies** — USD, INR, EUR, GBP, AED, JPY, CAD, AUD with live exchange rates
- **Animated Price Updates** — Green/red flash animations on price changes
- **PIN Lock + Biometric Auth** — 4-digit custom dialpad + fingerprint/face unlock

### Professional Tools

| Feature | Description |
|---------|-------------|
| 🤖 **AI Insights** | Technical analysis with trend detection, RSI, pivot points, support/resistance levels |
| 💼 **Portfolio Tracker** | Track holdings with live P&L, allocation charts, per-holding valuation |
| 📊 **SIP Calculator** | Systematic investment plans for metals — 6 months to 10 years |
| 💰 **Investment Calculator** | Buy by weight or budget, with making charges |
| ⚖️ **Weight Converter** | oz / gram / kg / tola / tael / grain with live pricing |
| 🔔 **Price Alerts** | Above/below price alerts with persistent storage |
| 🪙 **Digital Gold** | Buy/SIP/Gift/Sell gold with live pricing, GST calculation, preset amounts |
| ❓ **FAQ** | Expandable accordion with 15+ questions about digital gold & investing |
| ⚙️ **Settings** | Add your own API keys for higher rate limits (optional, with fallback) |

### UI/UX

- Dark theme optimized for OLED displays
- Market status indicator (open/closed)
- Bid-ask spread & liquidity visualization
- Day range bar with current price marker
- OHLC data grid with per-gram prices
- Sparkline charts
- Pull-to-refresh + countdown timer
- Custom API key support (Settings screen)
- Market sentiment bar with AI analysis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo SDK 54 |
| Language | TypeScript 5.9 (strict mode) |
| Navigation | expo-router v6 (file-based routing) |
| State | React Context + useReducer |
| Storage | AsyncStorage (alerts, portfolio), SecureStore (PIN) |
| Auth | expo-local-authentication (biometric) |
| Charts | react-native-svg (custom sparklines) |
| Animations | React Native Animated API |
| Architecture | New Architecture (Fabric renderer) enabled |

### Data Sources

| API | Purpose | Refresh Rate |
|-----|---------|-------------|
| [GoldAPI.io](https://goldapi.io) | Metal prices (XAU, XAG, XPT, XPD) | 5 minutes |
| [ExchangeRate-API](https://exchangerate-api.com) | Currency conversion rates | On app start |

---

## Local Setup

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or yarn)
- **Expo CLI** — installed globally or via npx
- **Android Studio** (for Android) or **Xcode** (for iOS)
- **Expo Go** app on your device (for quick testing)

### 1. Clone the repository

```bash
git clone https://github.com/sri11223/Metalpulse.git
cd Metalpulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
EXPO_PUBLIC_GOLDAPI_KEY=your_goldapi_key_here
EXPO_PUBLIC_INR_KEY=your_exchangerate_api_key_here
```

**Getting API keys:**

| Key | Where to get it | Free tier |
|-----|----------------|-----------|
| `EXPO_PUBLIC_GOLDAPI_KEY` | [goldapi.io/dashboard](https://goldapi.io/dashboard) | 300 requests/month |
| `EXPO_PUBLIC_INR_KEY` | [exchangerate-api.com](https://app.exchangerate-api.com/sign-up) | 1,500 requests/month |

### 4. Start the development server

```bash
# Using npx
npx expo start

# Or directly
npm start
```

### 5. Run on device/emulator

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Scan QR code with Expo Go app for physical device
```

### Troubleshooting

| Issue | Solution |
|-------|---------|
| Metro bundler port conflict | `npx expo start --port 8082` |
| Cache issues | `npx expo start --clear` |
| Dependency mismatch | `npx expo install --fix` |
| Fabric crash on Text | Remove `adjustsFontSizeToFit` from all `<Text>` components |
| Animation driver crash | Never mix `useNativeDriver: true` and `false` on the same `Animated.View` |

---

## Project Structure

```
metalpulse/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout: SafeArea → AppLock → MetalsProvider → Stack
│   ├── index.tsx                  # / → HomeScreen
│   ├── detail/[metal].tsx         # /detail/:metal → DetailScreen
│   ├── ai-insights.tsx            # /ai-insights → AI Technical Analysis
│   ├── portfolio.tsx              # /portfolio → Portfolio Tracker
│   ├── sip.tsx                    # /sip → SIP Calculator
│   ├── invest.tsx                 # /invest → Investment Calculator
│   ├── converter.tsx              # /converter → Weight Converter
│   ├── alerts.tsx                 # /alerts → Price Alerts
│   ├── digital-gold.tsx           # /digital-gold → Digital Gold Buy/SIP/Gift/Sell
│   ├── faq.tsx                    # /faq → FAQ
│   └── settings.tsx               # /settings → API Key Settings
│
├── src/
│   ├── api/
│   │   ├── types.ts               # All TypeScript interfaces & types
│   │   ├── goldApi.ts             # GoldAPI.io fetch with timeout & error classification
│   │   └── inrApi.ts              # Exchange rate API with fallback rates
│   │
│   ├── components/
│   │   ├── AnimatedPrice.tsx      # Price flash animation (green/red on change)
│   │   ├── AppLock.tsx            # PIN lock + biometric auth (custom dialpad)
│   │   ├── DayRangeBar.tsx        # Day high-low range visualization
│   │   ├── ErrorTile.tsx          # Error state with retry button
│   │   ├── GramPriceRow.tsx       # 24K/22K/18K per-gram prices
│   │   ├── LivePulse.tsx          # Animated pulsing dot for live indicator
│   │   ├── MarketSentimentBar.tsx # AI sentiment overview widget
│   │   ├── MarketStatus.tsx       # Market open/closed indicator
│   │   ├── MetalTile.tsx          # Metal card (orchestrates loading/error/data states)
│   │   ├── OHLCGrid.tsx           # Open/High/Low/Close data grid
│   │   ├── PriceChange.tsx        # Percentage & dollar change badges
│   │   ├── RefreshCountdown.tsx   # Live countdown to next refresh
│   │   ├── SkeletonLoader.tsx     # Shimmer loading placeholder
│   │   ├── SparklineChart.tsx     # SVG sparkline chart
│   │   ├── SpreadIndicator.tsx    # Bid-ask spread visualization
│   │   └── TileContent.tsx        # Metal tile data display
│   │
│   ├── constants/
│   │   ├── metals.ts              # Metal configs, currency definitions, cache settings
│   │   └── theme.ts               # Dark theme: colors, fonts, spacing, shadows
│   │
│   ├── context/
│   │   └── MetalsContext.tsx       # Global state: cache, exchange rates, auto-refresh timer
│   │
│   ├── hooks/
│   │   └── useMetalPrice.ts       # useReducer-based fetch hook with cache & retry
│   │
│   ├── screens/
│   │   ├── AIInsightsScreen.tsx   # AI technical analysis (RSI, pivots, trends, insights)
│   │   ├── AlertsScreen.tsx       # Price alert management
│   │   ├── ConverterScreen.tsx    # Weight unit converter
│   │   ├── DetailScreen.tsx       # Metal detail page with charts & analytics
│   │   ├── HomeScreen.tsx         # Main dashboard with grid, tools, sentiment
│   │   ├── InvestmentScreen.tsx   # Buy calculator
│   │   ├── PortfolioScreen.tsx    # Portfolio tracker with P&L
│   │   ├── SIPCalculatorScreen.tsx # SIP return projections
│   │   ├── DigitalGoldScreen.tsx  # Digital gold Buy/SIP/Gift/Sell with live pricing
│   │   ├── FAQScreen.tsx          # Expandable accordion FAQ
│   │   └── SettingsScreen.tsx     # Custom API key management
│   │
│   └── utils/
│       ├── formatPrice.ts         # Multi-currency formatting (Intl.NumberFormat)
│       ├── formatTime.ts          # Timestamp formatting, market hours, staleness
│       └── priceCalc.ts           # Unit conversion (gram, kg, 10g), currency conversion
│
├── assets/                        # App icons, splash screen
├── .env                           # API keys (not committed)
├── .gitignore
├── app.json                       # Expo config
├── index.ts                       # Entry point
├── package.json
└── tsconfig.json                  # TypeScript strict config
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_GOLDAPI_KEY` | ✅ | GoldAPI.io API key for metal prices |
| `EXPO_PUBLIC_INR_KEY` | ✅ | ExchangeRate-API key for currency conversion |

> **Note:** Variables prefixed with `EXPO_PUBLIC_` are accessible in the client bundle via `process.env.EXPO_PUBLIC_*`. Do not store secrets without this prefix.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android emulator/device |
| `npm run ios` | Start on iOS simulator/device |
| `npm run web` | Start web version |
| `npx tsc --noEmit` | TypeScript type check |
| `npx expo install --fix` | Fix dependency version mismatches |

---

## Architecture Overview

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

**Key architectural decisions:**

1. **Fabric (New Architecture)** enabled — requires careful prop handling (no string-typed numeric SVG props, no `adjustsFontSizeToFit`)
2. **Separated animation drivers** — `useNativeDriver: true` and `false` never on the same `Animated.View`
3. **Custom dialpad** for PIN entry — avoids `TextInput` + `secureTextEntry` Fabric crashes
4. **Context + useReducer** pattern — global state without external state management libraries
5. **File-based routing** via expo-router — each screen is a file in `app/`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and ensure TypeScript passes: `npx tsc --noEmit`
4. Commit with descriptive message: `git commit -m "feat: add feature"`
5. Push and open a Pull Request

---

## License

MIT © [sri11223](https://github.com/sri11223)

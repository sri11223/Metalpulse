import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { METAL_BY_SLUG, CURRENCY_MAP } from '../constants/metals';
import { useMetalPrice } from '../hooks/useMetalPrice';
import { useMetals } from '../context/MetalsContext';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { timeAgo } from '../utils/formatTime';
import PriceChange from '../components/PriceChange';
import SparklineChart from '../components/SparklineChart';
import OHLCGrid from '../components/OHLCGrid';
import GramPriceRow from '../components/GramPriceRow';
import SpreadIndicator from '../components/SpreadIndicator';
import DayRangeBar from '../components/DayRangeBar';
import RefreshCountdown from '../components/RefreshCountdown';
import { Colors, FontSize, Spacing, Radius, Shadows } from '../constants/theme';

export default function DetailScreen() {
  const { metal: slug } = useLocalSearchParams<{ metal: string }>();
  const router = useRouter();
  const metalConfig = slug ? METAL_BY_SLUG[slug] : undefined;
  const { selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currencyInfo = CURRENCY_MAP[selectedCurrency];

  const { state, retry } = useMetalPrice(metalConfig?.code ?? 'XAU');

  if (!metalConfig) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Metal not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const data = state.data;

  // Generate mock sparkline from OHLC data
  const sparkData = data
    ? [
        data.open_price,
        data.low_price,
        (data.open_price + data.high_price) / 2,
        data.high_price,
        (data.high_price + data.low_price) / 2,
        data.price,
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{metalConfig.name}</Text>
          <Text style={styles.headerSub}>
            {metalConfig.symbol} • {metalConfig.purity}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{currencyInfo.flag} {selectedCurrency}</Text>
        </View>
      </View>

      {/* ── Content ── */}
      {state.status === 'loading' && !data && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={metalConfig.color} />
          <Text style={styles.loadingText}>Fetching live prices…</Text>
        </View>
      )}

      {state.status === 'error' && !data && (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{state.error}</Text>
          {state.errorRetryable && (
            <TouchableOpacity style={styles.retryBtn} onPress={retry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {data && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Price Hero ── */}
          <View style={[styles.priceCard, Shadows.card]}>
            <View style={[styles.priceAccent, { backgroundColor: metalConfig.color }]} />
            <View style={styles.priceInner}>
              <Text style={styles.priceLabel}>Troy Ounce</Text>
              <Text style={[styles.priceValue, { color: metalConfig.color }]}>
                {formatCurrency(convertPrice(data.price, rate), selectedCurrency)}
              </Text>
              <PriceChange percentChange={data.chp} dollarChange={data.ch * rate} showDollarChange currency={selectedCurrency} />

              {state.lastFetched && (
                <Text style={styles.updatedAt}>
                  Updated {timeAgo(state.lastFetched / 1000)}
                </Text>
              )}
            </View>

            <View style={styles.sparkContainer}>
              <SparklineChart
                data={sparkData}
                width={140}
                height={50}
                color={metalConfig.color}
              />
            </View>
          </View>

          {/* ── Gram Prices (Gold only) ── */}
          {metalConfig.code === 'XAU' && (
            <GramPriceRow data={data} rate={rate} currency={selectedCurrency} />
          )}

          {/* ── Day Range ── */}
          <DayRangeBar
            data={data}
            rate={rate}
            currency={selectedCurrency}
          />

          {/* ── Bid-Ask Spread ── */}
          {data.ask > 0 && data.bid > 0 && (
            <SpreadIndicator
              data={data}
              rate={rate}
              currency={selectedCurrency}
            />
          )}

          {/* ── OHLC Grid ── */}
          <OHLCGrid data={data} rate={rate} currency={selectedCurrency} />

          {/* ── Refresh Countdown ── */}
          <View style={styles.countdownRow}>
            <RefreshCountdown />
          </View>

          {/* ── Extra Info ── */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About {metalConfig.name}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Exchange</Text>
              <Text style={styles.infoValue}>{data.exchange || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Symbol</Text>
              <Text style={styles.infoValue}>{data.symbol}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Purity</Text>
              <Text style={styles.infoValue}>{metalConfig.purity}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backArrow: { fontSize: 18, color: Colors.textPrimary },
  headerCenter: { flex: 1, marginLeft: Spacing.md },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerBadge: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ── Price Card ──
  priceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceAccent: { height: 3, width: '100%' },
  priceInner: { padding: Spacing.lg },
  priceLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  updatedAt: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  sparkContainer: {
    position: 'absolute',
    right: Spacing.lg,
    top: Spacing.xl + 10,
  },

  // ── Loading / Error ──
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
  errorEmoji: { fontSize: 40, marginBottom: Spacing.md },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: Spacing.lg,
  },
  retryText: {
    color: Colors.bg,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  backLink: {
    color: Colors.accent,
    fontSize: FontSize.md,
    marginTop: Spacing.md,
    fontWeight: '600',
  },

  // ── Info Card ──
  countdownRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

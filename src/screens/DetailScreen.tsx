/**
 * DetailScreen — Full detail view for a single metal
 *
 * Shows: hero price, change badge, sparkline chart, OHLC grid,
 * gram prices, kg price, INR conversion
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MetalSlug, MetalCode } from '../api/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';
import { METAL_BY_SLUG } from '../constants/metals';
import { useMetalPrice } from '../hooks/useMetalPrice';
import { useMetals } from '../context/MetalsContext';
import { formatUSD } from '../utils/formatPrice';
import { formatFullTimestamp, isStale } from '../utils/formatTime';
import PriceChange from '../components/PriceChange';
import SparklineChart from '../components/SparklineChart';
import OHLCGrid from '../components/OHLCGrid';
import GramPriceRow from '../components/GramPriceRow';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorTile from '../components/ErrorTile';

// Mock sparkline data — 7 points simulating weekly trend
function generateMockSparkline(currentPrice: number, changePercent: number): number[] {
  const volatility = currentPrice * 0.008;
  const direction = changePercent >= 0 ? 1 : -1;
  const points: number[] = [];
  let p = currentPrice - direction * volatility * 3;
  for (let i = 0; i < 7; i++) {
    const noise = (Math.random() - 0.5) * volatility;
    p += direction * volatility * 0.6 + noise;
    points.push(p);
  }
  // Ensure last point equals current price
  points[6] = currentPrice;
  return points;
}

export default function DetailScreen() {
  const { metal: metalParam } = useLocalSearchParams<{ metal: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const slug = (metalParam ?? 'gold') as MetalSlug;
  const metalConfig = METAL_BY_SLUG[slug];

  const { state, retry } = useMetalPrice(metalConfig?.code as MetalCode);
  const { inrRate } = useMetals();

  if (!metalConfig) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Metal not found</Text>
      </View>
    );
  }

  const data = state.data;
  const sparkline = data ? generateMockSparkline(data.price, data.chp) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{metalConfig.name}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Loading */}
      {(state.status === 'idle' || state.status === 'loading') && (
        <View style={styles.loadingContainer}>
          <SkeletonLoader lines={6} />
        </View>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <View style={styles.errorContainer}>
          <ErrorTile
            message={state.error ?? 'Failed to load'}
            retryable={state.errorRetryable}
            onRetry={retry}
            metalName={metalConfig.name}
          />
        </View>
      )}

      {/* Success */}
      {state.status === 'success' && data && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Metal identity */}
            <View style={styles.metalIdentity}>
              <View style={[styles.metalIcon, { backgroundColor: metalConfig.color + '20' }]}>
                <Text style={[styles.metalSymbol, { color: metalConfig.color }]}>
                  {metalConfig.symbol}
                </Text>
              </View>
              <View>
                <Text style={styles.metalName}>
                  {metalConfig.name} · {data.metal}/{data.currency}
                </Text>
                <Text style={styles.metalPurity}>{metalConfig.purity}</Text>
              </View>
            </View>

            {/* Stale warning */}
            {isStale(data.timestamp) && (
              <View style={styles.staleWarning}>
                <Text style={styles.staleText}>⚠️ Data may be outdated</Text>
              </View>
            )}

            {/* Hero price */}
            <Text style={styles.heroPrice}>{formatUSD(data.price)}</Text>
            <Text style={styles.heroPriceLabel}>per troy ounce</Text>

            {/* Change badge */}
            <PriceChange
              percentChange={data.chp}
              dollarChange={data.ch}
              showDollarChange
              size="lg"
              style={styles.changeBadge}
            />

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              {formatFullTimestamp(data.timestamp)}
            </Text>
          </View>

          {/* Sparkline Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Trend</Text>
            <SparklineChart
              data={sparkline}
              width={340}
              height={140}
              color={metalConfig.color}
              style={styles.chart}
            />
          </View>

          {/* OHLC Grid */}
          <OHLCGrid data={data} />

          {/* Gram / Kg / INR Prices */}
          <GramPriceRow data={data} metalSlug={slug} inrRate={inrRate} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    padding: Spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  heroSection: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  metalIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metalIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metalSymbol: {
    fontSize: 22,
    fontWeight: '700',
  },
  metalName: {
    ...Typography.bodyBold,
  },
  metalPurity: {
    ...Typography.caption,
  },
  staleWarning: {
    backgroundColor: Colors.warningDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  staleText: {
    ...Typography.caption,
    color: Colors.warning,
    fontSize: 11,
  },
  heroPrice: {
    ...Typography.heroPrice,
    marginBottom: 2,
  },
  heroPriceLabel: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  changeBadge: {
    marginBottom: Spacing.md,
  },
  timestamp: {
    ...Typography.label,
    fontSize: 10,
  },
  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  chart: {
    alignSelf: 'center',
  },
});

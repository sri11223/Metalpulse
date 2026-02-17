/**
 * AI Insights Screen — AI-powered analysis of precious metals
 * Uses technical analysis algorithms to generate insights:
 * - Trend detection (bullish/bearish/neutral)
 * - Support & resistance levels
 * - Volatility analysis
 * - AI-generated recommendations
 * - Market sentiment score
 */
import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMetals } from '../context/MetalsContext';
import { METALS, CURRENCY_MAP } from '../constants/metals';
import { MetalCode } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency, formatPercent } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

// ─── AI Analysis Engine ───
function analyzeMetalData(
  price: number,
  open: number,
  high: number,
  low: number,
  prevClose: number,
  chp: number,
) {
  // Trend detection
  const priceVsOpen = ((price - open) / open) * 100;
  const priceVsPrev = ((price - prevClose) / prevClose) * 100;
  const range = high - low;
  const rangePercent = (range / low) * 100;
  const positionInRange = range > 0 ? ((price - low) / range) * 100 : 50;

  // Sentiment score (0-100)
  let sentiment = 50;
  if (priceVsOpen > 0) sentiment += Math.min(priceVsOpen * 5, 20);
  else sentiment += Math.max(priceVsOpen * 5, -20);
  if (positionInRange > 70) sentiment += 10;
  else if (positionInRange < 30) sentiment -= 10;
  if (priceVsPrev > 0) sentiment += Math.min(priceVsPrev * 3, 10);
  else sentiment += Math.max(priceVsPrev * 3, -10);
  sentiment = Math.max(0, Math.min(100, sentiment));

  // Trend
  let trend: 'bullish' | 'bearish' | 'neutral';
  if (sentiment >= 60) trend = 'bullish';
  else if (sentiment <= 40) trend = 'bearish';
  else trend = 'neutral';

  // Support & resistance (simple pivot point method)
  const pivot = (high + low + price) / 3;
  const support1 = 2 * pivot - high;
  const support2 = pivot - (high - low);
  const resistance1 = 2 * pivot - low;
  const resistance2 = pivot + (high - low);

  // Volatility
  let volatility: 'low' | 'medium' | 'high';
  if (rangePercent < 0.5) volatility = 'low';
  else if (rangePercent < 1.5) volatility = 'medium';
  else volatility = 'high';

  // RSI approximation (simplified from single candle)
  const gain = Math.max(0, price - open);
  const loss = Math.max(0, open - price);
  const rs = loss > 0 ? gain / loss : gain > 0 ? 100 : 1;
  const rsi = 100 - 100 / (1 + rs);

  // Generate AI insights
  const insights: string[] = [];

  if (trend === 'bullish') {
    insights.push(
      `${positionInRange > 80 ? 'Strong' : 'Moderate'} bullish momentum detected. Price is trading ${positionInRange.toFixed(0)}% above the day's low.`
    );
  } else if (trend === 'bearish') {
    insights.push(
      `Bearish pressure observed. Price has declined ${Math.abs(priceVsOpen).toFixed(2)}% from today's open.`
    );
  } else {
    insights.push(
      'Market is consolidating in a neutral range. Watch for a breakout above resistance or below support.'
    );
  }

  if (volatility === 'high') {
    insights.push(
      `High volatility alert: Day range is ${rangePercent.toFixed(2)}%. Consider tighter stop-losses.`
    );
  } else if (volatility === 'low') {
    insights.push(
      `Low volatility suggests accumulation phase. A significant move may be imminent.`
    );
  }

  if (rsi > 70) {
    insights.push('Overbought signal (RSI > 70). A short-term pullback is possible.');
  } else if (rsi < 30) {
    insights.push('Oversold signal (RSI < 30). A bounce may occur from current levels.');
  }

  if (price > resistance1) {
    insights.push('Price has broken above R1 resistance — bullish continuation likely.');
  } else if (price < support1) {
    insights.push('Price has broken below S1 support — bearish continuation risk.');
  }

  return {
    sentiment,
    trend,
    volatility,
    rsi,
    pivot,
    support1,
    support2,
    resistance1,
    resistance2,
    positionInRange,
    priceVsOpen,
    priceVsPrev,
    rangePercent,
    insights,
  };
}

export default function AIInsightsScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const analyses = useMemo(() => {
    return METALS.map((metal) => {
      const data = cache[metal.code]?.data;
      if (!data) return { metal, analysis: null };

      const analysis = analyzeMetalData(
        data.price,
        data.open_price,
        data.high_price,
        data.low_price,
        data.prev_close_price,
        data.chp,
      );

      return { metal, data, analysis };
    });
  }, [cache]);

  // Find best opportunity
  const best = analyses
    .filter((a) => a.analysis)
    .sort((a, b) => (b.analysis?.sentiment ?? 0) - (a.analysis?.sentiment ?? 0))[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <Text style={styles.headerSub}>Powered by Technical Analysis</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 AI</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AI Recommendation Banner */}
        {best?.analysis && best.data && (
          <View style={[styles.banner, { borderColor: best.metal.color + '60' }]}>
            <View style={[styles.bannerAccent, { backgroundColor: best.metal.color }]} />
            <View style={styles.bannerInner}>
              <View style={styles.bannerHeader}>
                <Text style={styles.bannerLabel}>🤖 AI TOP PICK</Text>
                <View style={[styles.trendBadge, {
                  backgroundColor: best.analysis.trend === 'bullish' ? Colors.green + '20' :
                    best.analysis.trend === 'bearish' ? Colors.red + '20' : Colors.accent + '20',
                }]}>
                  <Text style={[styles.trendText, {
                    color: best.analysis.trend === 'bullish' ? Colors.green :
                      best.analysis.trend === 'bearish' ? Colors.red : Colors.accent,
                  }]}>
                    {best.analysis.trend === 'bullish' ? '↑ Bullish' :
                      best.analysis.trend === 'bearish' ? '↓ Bearish' : '→ Neutral'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.bannerMetal, { color: best.metal.color }]}>
                {best.metal.name}
              </Text>
              <Text style={styles.bannerPrice}>
                {formatCurrency(convertPrice(best.data.price, rate), selectedCurrency)}/oz
              </Text>
              <Text style={styles.bannerInsight}>{best.analysis.insights[0]}</Text>
            </View>
          </View>
        )}

        {/* Market Overview */}
        <Text style={styles.sectionTitle}>Market Sentiment</Text>
        <View style={styles.sentimentRow}>
          {analyses.map(({ metal, analysis }) => (
            <SentimentCard
              key={metal.code}
              name={metal.name}
              color={metal.color}
              sentiment={analysis?.sentiment ?? 50}
              trend={analysis?.trend ?? 'neutral'}
            />
          ))}
        </View>

        {/* Detailed Analysis per metal */}
        {analyses.map(({ metal, data, analysis }) => {
          if (!analysis || !data) return null;
          return (
            <View key={metal.code} style={[styles.analysisCard, { borderColor: metal.color + '30' }]}>
              <View style={[styles.cardAccent, { backgroundColor: metal.color }]} />
              <View style={styles.cardInner}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardMetal, { color: metal.color }]}>{metal.name}</Text>
                    <Text style={styles.cardPrice}>
                      {formatCurrency(convertPrice(data.price, rate), selectedCurrency)}
                    </Text>
                  </View>
                  <View style={styles.cardBadges}>
                    <View style={[styles.volBadge, {
                      backgroundColor: analysis.volatility === 'high' ? Colors.red + '20' :
                        analysis.volatility === 'medium' ? Colors.warning + '20' : Colors.green + '20',
                    }]}>
                      <Text style={[styles.volText, {
                        color: analysis.volatility === 'high' ? Colors.red :
                          analysis.volatility === 'medium' ? Colors.warning : Colors.green,
                      }]}>
                        {analysis.volatility.toUpperCase()} VOL
                      </Text>
                    </View>
                    <View style={[styles.rsiBadge, {
                      backgroundColor: analysis.rsi > 70 ? Colors.red + '15' :
                        analysis.rsi < 30 ? Colors.green + '15' : Colors.bgElevated,
                    }]}>
                      <Text style={styles.rsiText}>RSI {analysis.rsi.toFixed(0)}</Text>
                    </View>
                  </View>
                </View>

                {/* Sentiment Meter */}
                <View style={styles.meterContainer}>
                  <Text style={styles.meterLabel}>AI Confidence</Text>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${analysis.sentiment}%`,
                          backgroundColor:
                            analysis.sentiment >= 60 ? Colors.green :
                            analysis.sentiment <= 40 ? Colors.red :
                            Colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.meterValue}>{analysis.sentiment.toFixed(0)}%</Text>
                </View>

                {/* Support / Resistance */}
                <Text style={styles.subTitle}>Key Levels ({selectedCurrency})</Text>
                <View style={styles.levelsGrid}>
                  <LevelItem label="R2" value={formatCurrency(convertPrice(analysis.resistance2, rate), selectedCurrency)} color={Colors.red} />
                  <LevelItem label="R1" value={formatCurrency(convertPrice(analysis.resistance1, rate), selectedCurrency)} color={Colors.red} />
                  <LevelItem label="Pivot" value={formatCurrency(convertPrice(analysis.pivot, rate), selectedCurrency)} color={Colors.accent} />
                  <LevelItem label="S1" value={formatCurrency(convertPrice(analysis.support1, rate), selectedCurrency)} color={Colors.green} />
                  <LevelItem label="S2" value={formatCurrency(convertPrice(analysis.support2, rate), selectedCurrency)} color={Colors.green} />
                </View>

                {/* AI Insights */}
                <Text style={styles.subTitle}>🤖 AI Analysis</Text>
                {analysis.insights.map((insight, i) => (
                  <View key={i} style={styles.insightRow}>
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <StatItem label="vs Open" value={`${analysis.priceVsOpen >= 0 ? '+' : ''}${analysis.priceVsOpen.toFixed(2)}%`}
                    color={analysis.priceVsOpen >= 0 ? Colors.green : Colors.red} />
                  <StatItem label="vs Prev Close" value={`${analysis.priceVsPrev >= 0 ? '+' : ''}${analysis.priceVsPrev.toFixed(2)}%`}
                    color={analysis.priceVsPrev >= 0 ? Colors.green : Colors.red} />
                  <StatItem label="Day Range" value={`${analysis.rangePercent.toFixed(2)}%`} color={Colors.textSecondary} />
                  <StatItem label="Position" value={`${analysis.positionInRange.toFixed(0)}%`} color={Colors.accent} />
                </View>
              </View>
            </View>
          );
        })}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerIcon}>🤖</Text>
          <Text style={styles.disclaimerText}>
            AI insights are generated using technical analysis algorithms including pivot points,
            RSI approximation, and price action analysis. These are educational only and should
            not be considered financial advice. Always do your own research.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───

function SentimentCard({ name, color, sentiment, trend }: {
  name: string; color: string; sentiment: number; trend: string;
}) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const emoji = trend === 'bullish' ? '📈' : trend === 'bearish' ? '📉' : '➡️';

  return (
    <View style={[styles.sentimentCard, { borderColor: color + '40' }]}>
      <Animated.Text style={[styles.sentimentEmoji, { opacity: pulseAnim }]}>
        {emoji}
      </Animated.Text>
      <Text style={[styles.sentimentName, { color }]}>{name}</Text>
      <Text style={styles.sentimentScore}>{sentiment.toFixed(0)}</Text>
      <View style={styles.miniMeter}>
        <View style={[styles.miniMeterFill, {
          width: `${sentiment}%`,
          backgroundColor: sentiment >= 60 ? Colors.green : sentiment <= 40 ? Colors.red : Colors.accent,
        }]} />
      </View>
    </View>
  );
}

function LevelItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.levelItem}>
      <Text style={[styles.levelLabel, { color }]}>{label}</Text>
      <Text style={styles.levelValue}>{value}</Text>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backArrow: { fontSize: 18, color: Colors.textPrimary },
  headerCenter: { flex: 1, marginLeft: Spacing.md },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  aiBadge: {
    backgroundColor: '#7C3AED' + '20', borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#7C3AED' + '40',
  },
  aiBadgeText: { fontSize: FontSize.xs, color: '#7C3AED', fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },

  // Banner
  banner: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  bannerAccent: { height: 3, width: '100%' },
  bannerInner: { padding: Spacing.lg },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  bannerLabel: { fontSize: FontSize.xs, fontWeight: '700', color: '#7C3AED', letterSpacing: 1 },
  trendBadge: { borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  trendText: { fontSize: FontSize.xs, fontWeight: '700' },
  bannerMetal: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: 4 },
  bannerPrice: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm },
  bannerInsight: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Sentiment Row
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm,
  },
  sentimentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  sentimentCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1, gap: 4,
  },
  sentimentEmoji: { fontSize: 20 },
  sentimentName: { fontSize: FontSize.xs, fontWeight: '700' },
  sentimentScore: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  miniMeter: {
    width: '100%', height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden', marginTop: 4,
  },
  miniMeterFill: { height: '100%', borderRadius: 2 },

  // Analysis Card
  analysisCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  cardAccent: { height: 3, width: '100%' },
  cardInner: { padding: Spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  cardMetal: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: 2 },
  cardPrice: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  cardBadges: { flexDirection: 'row', gap: Spacing.sm },
  volBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  volText: { fontSize: 10, fontWeight: '700' },
  rsiBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  rsiText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },

  // Meter
  meterContainer: { marginBottom: Spacing.lg },
  meterLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 6 },
  meterTrack: {
    height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 3 },
  meterValue: {
    fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700',
    marginTop: 4, textAlign: 'right',
  },

  // Levels
  subTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  levelsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  levelItem: {
    backgroundColor: Colors.bg, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 8,
  },
  levelLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  levelValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Insights
  insightRow: { flexDirection: 'row', marginBottom: Spacing.sm, paddingRight: Spacing.md },
  insightDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#7C3AED',
    marginTop: 6, marginRight: Spacing.sm,
  },
  insightText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, flex: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm,
  },
  statItem: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.sm,
    padding: Spacing.sm, alignItems: 'center',
  },
  statLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: FontSize.sm, fontWeight: '700' },

  // Disclaimer
  disclaimerCard: {
    flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#7C3AED' + '30', gap: Spacing.sm,
  },
  disclaimerIcon: { fontSize: 20 },
  disclaimerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
});

/**
 * MarketSentimentBar — compact AI sentiment overview for the home screen
 * Shows overall market sentiment + individual metal scores
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMetals } from '../context/MetalsContext';
import { METALS } from '../constants/metals';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

function computeSentiment(price: number, open: number, high: number, low: number, prevClose: number) {
  const priceVsOpen = ((price - open) / open) * 100;
  const priceVsPrev = ((price - prevClose) / prevClose) * 100;
  const range = high - low;
  const positionInRange = range > 0 ? ((price - low) / range) * 100 : 50;

  let sentiment = 50;
  if (priceVsOpen > 0) sentiment += Math.min(priceVsOpen * 5, 20);
  else sentiment += Math.max(priceVsOpen * 5, -20);
  if (positionInRange > 70) sentiment += 10;
  else if (positionInRange < 30) sentiment -= 10;
  if (priceVsPrev > 0) sentiment += Math.min(priceVsPrev * 3, 10);
  else sentiment += Math.max(priceVsPrev * 3, -10);
  return Math.max(0, Math.min(100, sentiment));
}

export default function MarketSentimentBar() {
  const router = useRouter();
  const { cache } = useMetals();
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scores = METALS.map((metal) => {
    const data = cache[metal.code]?.data;
    if (!data) return { metal, score: 50 };
    return {
      metal,
      score: computeSentiment(data.price, data.open_price, data.high_price, data.low_price, data.prev_close_price),
    };
  });

  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const overallLabel = avgScore >= 60 ? 'Bullish' : avgScore <= 40 ? 'Bearish' : 'Neutral';
  const overallColor = avgScore >= 60 ? Colors.green : avgScore <= 40 ? Colors.red : Colors.accent;
  const overallEmoji = avgScore >= 60 ? '📈' : avgScore <= 40 ? '📉' : '➡️';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => router.push('/ai-insights' as any)}
    >
      <View style={styles.left}>
        <Animated.Text style={[styles.emoji, { opacity: pulseAnim }]}>
          {overallEmoji}
        </Animated.Text>
        <View>
          <Text style={styles.label}>AI SENTIMENT</Text>
          <Text style={[styles.overallText, { color: overallColor }]}>
            {overallLabel} • {avgScore.toFixed(0)}
          </Text>
        </View>
      </View>
      <View style={styles.scores}>
        {scores.map(({ metal, score }) => {
          const color = score >= 60 ? Colors.green : score <= 40 ? Colors.red : Colors.textSecondary;
          return (
            <View key={metal.code} style={styles.scoreItem}>
              <View style={styles.miniBar}>
                <View
                  style={[styles.miniFill, {
                    height: `${score}%`,
                    backgroundColor: color,
                  }]}
                />
              </View>
              <Text style={[styles.scoreLabel, { color: metal.color }]}>
                {metal.code.replace('X', '')}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#7C3AED' + '30',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  emoji: { fontSize: 24 },
  label: { fontSize: 9, fontWeight: '700', color: '#7C3AED', letterSpacing: 0.8, marginBottom: 1 },
  overallText: { fontSize: FontSize.sm, fontWeight: '700' },
  scores: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  scoreItem: { alignItems: 'center', gap: 3 },
  miniBar: {
    width: 6, height: 24, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  miniFill: { width: '100%', borderRadius: 3 },
  scoreLabel: { fontSize: 8, fontWeight: '700' },
  arrow: { fontSize: 18, color: Colors.textMuted },
});

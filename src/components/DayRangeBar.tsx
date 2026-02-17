import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface DayRangeBarProps {
  data: GoldApiResponse;
  rate: number;
  currency: DisplayCurrency;
}

export default function DayRangeBar({ data, rate, currency }: DayRangeBarProps) {
  const low = convertPrice(data.low_price, rate);
  const high = convertPrice(data.high_price, rate);
  const current = convertPrice(data.price, rate);
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Day Range</Text>
      <View style={styles.labels}>
        <Text style={styles.low}>{formatCurrency(low, currency)}</Text>
        <Text style={styles.current}>{formatCurrency(current, currency)}</Text>
        <Text style={styles.high}>{formatCurrency(high, currency)}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barGradient]} />
        <View style={[styles.marker, { left: `${Math.min(Math.max(position, 2), 98)}%` }]}>
          <View style={styles.markerDot} />
        </View>
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>Low</Text>
        <Text style={styles.labelText}>Current</Text>
        <Text style={styles.labelText}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  low: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.red },
  current: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },
  high: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.green },
  barBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    position: 'relative',
  },
  barGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundColor: Colors.accent + '30',
  },
  marker: {
    position: 'absolute',
    top: -4,
    marginLeft: -8,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    borderWidth: 3,
    borderColor: Colors.bg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  labelText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

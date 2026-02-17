import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface SpreadIndicatorProps {
  data: GoldApiResponse;
  rate: number;
  currency: DisplayCurrency;
}

export default function SpreadIndicator({ data, rate, currency }: SpreadIndicatorProps) {
  const bid = convertPrice(data.bid, rate);
  const ask = convertPrice(data.ask, rate);
  const spread = ask - bid;
  const spreadPct = data.bid > 0 ? ((data.ask - data.bid) / data.bid) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bid-Ask Spread</Text>
      <View style={styles.row}>
        <View style={styles.side}>
          <Text style={styles.label}>BID</Text>
          <Text style={[styles.value, { color: Colors.green }]}>
            {formatCurrency(bid, currency)}
          </Text>
        </View>
        <View style={styles.spreadBox}>
          <Text style={styles.spreadValue}>
            {formatCurrency(spread, currency)}
          </Text>
          <Text style={styles.spreadPct}>{spreadPct.toFixed(3)}%</Text>
        </View>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          <Text style={styles.label}>ASK</Text>
          <Text style={[styles.value, { color: Colors.red }]}>
            {formatCurrency(ask, currency)}
          </Text>
        </View>
      </View>
      {/* Spread bar */}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(spreadPct * 20, 100)}%` }]} />
      </View>
      <Text style={styles.note}>
        {spreadPct < 0.1 ? 'Very tight spread — high liquidity' :
         spreadPct < 0.3 ? 'Normal spread' : 'Wide spread — lower liquidity'}
      </Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  side: { flex: 1 },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  spreadBox: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  spreadValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  spreadPct: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  note: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});

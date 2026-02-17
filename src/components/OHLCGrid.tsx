import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface OHLCGridProps {
  data: GoldApiResponse;
  rate: number;
  currency: DisplayCurrency;
}

export default function OHLCGrid({ data, rate, currency }: OHLCGridProps) {
  const cells: { label: string; value: number }[] = [
    { label: 'Open', value: data.open_price },
    { label: 'Close', value: data.prev_close_price },
    { label: 'High', value: data.high_price },
    { label: 'Low', value: data.low_price },
    { label: 'Ask', value: data.ask },
    { label: 'Bid', value: data.bid },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Market Data</Text>
      <View style={styles.grid}>
        {cells.map((cell) => (
          <View key={cell.label} style={styles.cell}>
            <Text style={styles.label}>{cell.label}</Text>
            <Text style={styles.value}>
              {formatCurrency(convertPrice(cell.value, rate), currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.lg },
  heading: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '31%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

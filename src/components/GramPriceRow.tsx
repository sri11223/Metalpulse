import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface GramPriceRowProps {
  data: GoldApiResponse;
  rate: number;
  currency: DisplayCurrency;
}

export default function GramPriceRow({ data, rate, currency }: GramPriceRowProps) {
  const grams: { label: string; value: number }[] = [
    { label: '24K / g', value: data.price_gram_24k },
    { label: '22K / g', value: data.price_gram_22k },
    { label: '18K / g', value: data.price_gram_18k },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Price per Gram</Text>
      <View style={styles.row}>
        {grams.map((g) => (
          <View key={g.label} style={styles.cell}>
            <Text style={styles.label}>{g.label}</Text>
            <Text style={styles.value}>
              {formatCurrency(convertPrice(g.value, rate), currency)}
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cell: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.accent,
  },
});

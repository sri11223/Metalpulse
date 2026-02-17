import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { formatPercent, formatDollarChange } from '../utils/formatPrice';
import { DisplayCurrency } from '../api/types';

interface PriceChangeProps {
  percentChange: number;
  dollarChange?: number;
  size?: 'sm' | 'md' | 'lg';
  showDollarChange?: boolean;
  currency?: DisplayCurrency;
  style?: ViewStyle;
}

export default function PriceChange({
  percentChange,
  dollarChange,
  size = 'sm',
  showDollarChange = false,
  currency = 'USD',
  style,
}: PriceChangeProps) {
  const isPositive = percentChange >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const color = isPositive ? Colors.success : Colors.danger;
  const bgColor = isPositive ? Colors.successDim : Colors.dangerDim;
  const fontSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.text, { color, fontSize }]}>
        {arrow}{' '}
        {showDollarChange && dollarChange !== undefined
          ? `${formatDollarChange(dollarChange, currency)} · `
          : ''}
        {formatPercent(percentChange)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '600' },
});

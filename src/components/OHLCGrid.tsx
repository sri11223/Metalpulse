/**
 * OHLCGrid — Market data grid showing Open/Close/High/Low/Ask/Bid
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse } from '../api/types';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { formatUSD } from '../utils/formatPrice';

interface OHLCGridProps {
  data: GoldApiResponse;
}

interface DataItem {
  label: string;
  value: number;
}

function GridItem({ label, value }: DataItem) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatUSD(value)}</Text>
    </View>
  );
}

export default function OHLCGrid({ data }: OHLCGridProps) {
  const items: DataItem[] = [
    { label: 'Open', value: data.open_price },
    { label: 'Prev Close', value: data.prev_close_price },
    { label: 'High', value: data.high_price },
    { label: 'Low', value: data.low_price },
    { label: 'Ask', value: data.ask },
    { label: 'Bid', value: data.bid },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Market Data</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <GridItem key={item.label} label={item.label} value={item.value} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  item: {
    width: '31%',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
});

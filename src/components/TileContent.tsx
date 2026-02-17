/**
 * TileContent — Success state for a metal tile
 *
 * Shows: metal name, purity, USD price, INR price, % change, timestamp
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, MetalConfig } from '../api/types';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { formatUSD, formatINR } from '../utils/formatPrice';
import { formatTimestamp, isStale } from '../utils/formatTime';
import { inrPer10Gram } from '../utils/priceCalc';
import PriceChange from './PriceChange';

interface TileContentProps {
  metal: MetalConfig;
  data: GoldApiResponse;
  inrRate: number | null;
}

export default function TileContent({ metal, data, inrRate }: TileContentProps) {
  const stale = isStale(data.timestamp);
  const inr10g = inrRate && data.price_gram_24k
    ? inrPer10Gram(data.price_gram_24k, inrRate)
    : null;

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: metal.color + '20' }]}>
          <Text style={[styles.iconText, { color: metal.color }]}>{metal.symbol}</Text>
        </View>
        {stale && (
          <View style={styles.staleBadge}>
            <Text style={styles.staleText}>⚠️</Text>
          </View>
        )}
      </View>

      {/* Metal name & purity */}
      <Text style={styles.name}>{metal.name}</Text>
      <Text style={styles.purity}>{metal.purity}</Text>

      {/* USD Price */}
      <Text style={styles.price}>{formatUSD(data.price)} /oz</Text>

      {/* INR Price */}
      {inr10g !== null && (
        <Text style={styles.inrPrice}>{formatINR(inr10g)} / 10g</Text>
      )}

      {/* Change badge */}
      <PriceChange percentChange={data.chp} style={styles.changeBadge} />

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        Updated {formatTimestamp(data.timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  staleBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleText: {
    fontSize: 14,
  },
  name: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  purity: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  price: {
    ...Typography.tilePrice,
    marginBottom: 2,
  },
  inrPrice: {
    ...Typography.caption,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  changeBadge: {
    marginBottom: Spacing.sm,
  },
  timestamp: {
    ...Typography.label,
    fontSize: 10,
  },
});

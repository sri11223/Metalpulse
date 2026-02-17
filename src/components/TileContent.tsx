import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, MetalConfig, DisplayCurrency } from '../api/types';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { formatCurrency } from '../utils/formatPrice';
import { formatTimestamp, isStale } from '../utils/formatTime';
import { convertPrice, gramPrice } from '../utils/priceCalc';
import PriceChange from './PriceChange';

interface TileContentProps {
  metal: MetalConfig;
  data: GoldApiResponse;
  rate: number;
  currency: DisplayCurrency;
}

export default function TileContent({ metal, data, rate, currency }: TileContentProps) {
  const stale = isStale(data.timestamp);
  const displayPrice = convertPrice(data.price, rate);
  const gram24k = data.price_gram_24k || gramPrice(data.price);
  const displayGram10 = convertPrice(gram24k * 10, rate);

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

      <Text style={styles.name}>{metal.name}</Text>
      <Text style={styles.purity}>{metal.purity}</Text>

      {/* Price in selected currency */}
      <Text style={styles.price} numberOfLines={1}>
        {formatCurrency(displayPrice, currency)} <Text style={styles.priceUnit}>/oz</Text>
      </Text>

      {/* Secondary price — always show INR if not already INR */}
      {currency !== 'INR' && (
        <Text style={styles.inrPrice}>
          {formatCurrency(convertPrice(gram24k * 10, rate), currency)} / 10g
        </Text>
      )}
      {currency === 'INR' && (
        <Text style={styles.inrPrice}>
          {formatCurrency(displayGram10, 'INR')} / 10g
        </Text>
      )}

      <PriceChange percentChange={data.chp} style={styles.changeBadge} />

      <Text style={styles.timestamp}>Updated {formatTimestamp(data.timestamp)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  iconText: { fontSize: 16, fontWeight: '700' },
  staleBadge: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  staleText: { fontSize: 14 },
  name: { ...Typography.bodyBold, marginBottom: 2 },
  purity: { ...Typography.caption, marginBottom: Spacing.sm },
  price: { ...Typography.tilePrice, marginBottom: 2 },
  priceUnit: { fontSize: 12, fontWeight: '400', color: Colors.textSecondary },
  inrPrice: { ...Typography.caption, color: Colors.accent, marginBottom: Spacing.sm },
  changeBadge: { marginBottom: Spacing.sm },
  timestamp: { ...Typography.label, fontSize: 10 },
});

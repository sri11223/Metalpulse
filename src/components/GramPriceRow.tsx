/**
 * GramPriceRow — Per gram & per kg prices + INR conversion
 *
 * For Gold: shows 24K, 22K, 18K gram prices
 * For other metals: shows single gram price
 * Also shows price per kg and INR per 10g
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldApiResponse, MetalSlug } from '../api/types';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { formatUSD, formatINR, formatGram } from '../utils/formatPrice';
import { kgPrice, inrPer10Gram, gramPrice } from '../utils/priceCalc';

interface GramPriceRowProps {
  data: GoldApiResponse;
  metalSlug: MetalSlug;
  inrRate: number | null;
}

export default function GramPriceRow({ data, metalSlug, inrRate }: GramPriceRowProps) {
  const isGold = metalSlug === 'gold';
  const pricePerKg = kgPrice(data.price);
  const gram24k = data.price_gram_24k || gramPrice(data.price);
  const inr10g = inrRate ? inrPer10Gram(gram24k, inrRate) : null;

  return (
    <View style={styles.container}>
      {/* Price per gram */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Per Gram</Text>
        <View style={styles.grid}>
          {isGold ? (
            <>
              <PriceItem label="24 Karat" value={formatGram(data.price_gram_24k)} />
              <PriceItem label="22 Karat" value={formatGram(data.price_gram_22k)} />
              <PriceItem label="18 Karat" value={formatGram(data.price_gram_18k)} />
            </>
          ) : (
            <PriceItem label="Per Gram" value={formatGram(gram24k)} />
          )}
        </View>
      </View>

      {/* Price per kg */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Per Kilogram</Text>
        <View style={styles.kgRow}>
          <Text style={styles.kgPrice}>{formatUSD(pricePerKg)}</Text>
          <Text style={styles.kgLabel}>/kg</Text>
        </View>
      </View>

      {/* INR conversion */}
      {inr10g !== null && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INR Price (10 grams)</Text>
          <View style={styles.inrRow}>
            <Text style={styles.inrPrice}>{formatINR(inr10g)}</Text>
            <Text style={styles.inrLabel}>
              {isGold ? '/ 10g (24K)' : '/ 10g'}
            </Text>
          </View>
          {inrRate && (
            <Text style={styles.rateNote}>
              USD/INR rate: ₹{inrRate.toFixed(2)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function PriceItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceItem}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  priceItem: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  priceLabel: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },
  kgRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kgPrice: {
    ...Typography.h2,
    color: Colors.primary,
  },
  kgLabel: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
  },
  inrRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  inrPrice: {
    ...Typography.h2,
    color: Colors.accent,
  },
  inrLabel: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
  },
  rateNote: {
    ...Typography.label,
    fontSize: 10,
    marginTop: Spacing.sm,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMetals } from '../context/MetalsContext';
import { METALS, CURRENCY_MAP } from '../constants/metals';
import { MetalCode, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

const SIP_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];
const DURATIONS = [
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
  { label: '3Y', months: 36 },
  { label: '5Y', months: 60 },
  { label: '10Y', months: 120 },
];

// Historical avg annual returns (approx)
const AVG_RETURNS: Record<string, number> = {
  XAU: 10.5,
  XAG: 8.2,
  XPT: 5.0,
  XPD: 12.0,
};

export default function SIPCalculatorScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const [selectedMetal, setSelectedMetal] = useState<MetalCode>('XAU');
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [selectedDuration, setSelectedDuration] = useState(12);

  const metalData = cache[selectedMetal]?.data;
  const metalConfig = METALS.find((m) => m.code === selectedMetal)!;
  const annualReturn = AVG_RETURNS[selectedMetal] || 8;

  const results = useMemo(() => {
    const totalInvested = monthlyAmount * selectedDuration;
    const monthlyRate = annualReturn / 100 / 12;
    // SIP future value formula: P × [(1+r)^n - 1] / r × (1+r)
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, selectedDuration) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalReturns = fv - totalInvested;
    const absoluteReturn = totalInvested > 0 ? ((fv - totalInvested) / totalInvested) * 100 : 0;

    // Calculate grams accumulated (at current price)
    const pricePerGram = metalData ? convertPrice(metalData.price_gram_24k || metalData.price / 31.1035, rate) : 0;
    const gramsPerMonth = pricePerGram > 0 ? monthlyAmount / pricePerGram : 0;
    const totalGrams = gramsPerMonth * selectedDuration;

    return {
      totalInvested,
      futureValue: fv,
      totalReturns,
      absoluteReturn,
      gramsPerMonth,
      totalGrams,
      pricePerGram,
    };
  }, [monthlyAmount, selectedDuration, annualReturn, metalData, rate]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIP Calculator</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{currInfo.flag} {selectedCurrency}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metal Selector */}
        <Text style={styles.sectionTitle}>Select Metal</Text>
        <View style={styles.chipRow}>
          {METALS.map((m) => (
            <TouchableOpacity
              key={m.code}
              style={[styles.chip, selectedMetal === m.code && { backgroundColor: m.color + '25', borderColor: m.color }]}
              onPress={() => setSelectedMetal(m.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedMetal === m.code && { color: m.color }]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Monthly Amount */}
        <Text style={styles.sectionTitle}>Monthly Investment</Text>
        <View style={styles.chipRow}>
          {SIP_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.chip, monthlyAmount === amt && styles.chipActive]}
              onPress={() => setMonthlyAmount(amt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, monthlyAmount === amt && styles.chipTextActive]}>
                {currInfo.symbol}{amt >= 1000 ? `${amt / 1000}K` : amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration */}
        <Text style={styles.sectionTitle}>Investment Duration</Text>
        <View style={styles.chipRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.months}
              style={[styles.chip, selectedDuration === d.months && styles.chipActive]}
              onPress={() => setSelectedDuration(d.months)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedDuration === d.months && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results Card */}
        <View style={[styles.resultCard, { borderColor: metalConfig.color + '40' }]}>
          <View style={[styles.resultAccent, { backgroundColor: metalConfig.color }]} />
          <View style={styles.resultInner}>
            <Text style={styles.resultHeading}>
              {metalConfig.name} SIP — {DURATIONS.find((d) => d.months === selectedDuration)?.label}
            </Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Invested</Text>
              <Text style={styles.resultValue}>
                {formatCurrency(results.totalInvested, selectedCurrency)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Expected Returns ({annualReturn}% p.a.)</Text>
              <Text style={[styles.resultValue, { color: Colors.green }]}>
                +{formatCurrency(results.totalReturns, selectedCurrency)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { fontWeight: '700', color: Colors.textPrimary }]}>
                Estimated Value
              </Text>
              <Text style={[styles.resultValue, { fontSize: FontSize.xl, color: metalConfig.color }]}>
                {formatCurrency(results.futureValue, selectedCurrency)}
              </Text>
            </View>

            <View style={styles.returnBadge}>
              <Text style={styles.returnText}>
                {results.absoluteReturn.toFixed(1)}% absolute return
              </Text>
            </View>
          </View>
        </View>

        {/* Gold Grams Card */}
        {metalData && (
          <View style={styles.gramsCard}>
            <Text style={styles.gramsHeading}>Physical {metalConfig.name} (at current price)</Text>
            <View style={styles.gramsRow}>
              <View style={styles.gramsCell}>
                <Text style={styles.gramsLabel}>Per Month</Text>
                <Text style={styles.gramsValue}>{results.gramsPerMonth.toFixed(3)}g</Text>
              </View>
              <View style={styles.gramsDivider} />
              <View style={styles.gramsCell}>
                <Text style={styles.gramsLabel}>Total Accumulated</Text>
                <Text style={[styles.gramsValue, { color: metalConfig.color }]}>
                  {results.totalGrams.toFixed(2)}g
                </Text>
              </View>
            </View>
            <Text style={styles.gramsNote}>
              Current price: {formatCurrency(results.pricePerGram, selectedCurrency)}/g
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          * Returns are based on historical averages and are not guaranteed.
          Past performance does not indicate future results.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backArrow: { fontSize: 18, color: Colors.textPrimary },
  headerTitle: { flex: 1, marginLeft: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  headerBadge: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },

  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipActive: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.accent },

  resultCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    marginTop: Spacing.xl, borderWidth: 1, overflow: 'hidden',
  },
  resultAccent: { height: 3, width: '100%' },
  resultInner: { padding: Spacing.lg },
  resultHeading: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  resultValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  divider: {
    height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md,
  },
  returnBadge: {
    backgroundColor: Colors.green + '15', borderRadius: Radius.sm,
    paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', marginTop: Spacing.sm,
  },
  returnText: { fontSize: FontSize.sm, color: Colors.green, fontWeight: '700' },

  gramsCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  gramsHeading: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  gramsRow: { flexDirection: 'row', alignItems: 'center' },
  gramsCell: { flex: 1, alignItems: 'center' },
  gramsLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  gramsValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  gramsDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  gramsNote: {
    fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center',
    marginTop: Spacing.md,
  },

  disclaimer: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    marginTop: Spacing.xl, lineHeight: 18, fontStyle: 'italic',
  },
});

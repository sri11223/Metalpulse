import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMetals } from '../context/MetalsContext';
import { METALS, CURRENCY_MAP } from '../constants/metals';
import { MetalCode } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

type Unit = 'gram' | 'oz' | 'kg' | 'tola' | 'tael' | 'grain';

const UNITS: { key: Unit; label: string; toGrams: number }[] = [
  { key: 'gram', label: 'Grams', toGrams: 1 },
  { key: 'oz', label: 'Troy Oz', toGrams: 31.1035 },
  { key: 'kg', label: 'Kilograms', toGrams: 1000 },
  { key: 'tola', label: 'Tola', toGrams: 11.6638 },
  { key: 'tael', label: 'Tael', toGrams: 37.429 },
  { key: 'grain', label: 'Grains', toGrams: 0.06479891 },
];

export default function ConverterScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const [selectedMetal, setSelectedMetal] = useState<MetalCode>('XAU');
  const [fromUnit, setFromUnit] = useState<Unit>('oz');
  const [inputValue, setInputValue] = useState('1');

  const metalData = cache[selectedMetal]?.data;
  const metalConfig = METALS.find((m) => m.code === selectedMetal)!;

  const conversions = useMemo(() => {
    const qty = parseFloat(inputValue) || 0;
    const fromInfo = UNITS.find((u) => u.key === fromUnit)!;
    const grams = qty * fromInfo.toGrams;

    const pricePerOz = metalData ? convertPrice(metalData.price, rate) : 0;
    const pricePerGram = pricePerOz / 31.1035;
    const totalValue = grams * pricePerGram;

    return UNITS.map((u) => {
      const converted = u.toGrams > 0 ? grams / u.toGrams : 0;
      const unitPrice = pricePerGram * u.toGrams;
      return {
        key: u.key,
        label: u.label,
        converted,
        unitPrice,
        isActive: u.key === fromUnit,
      };
    });
  }, [inputValue, fromUnit, metalData, rate]);

  const totalGrams = (parseFloat(inputValue) || 0) * (UNITS.find((u) => u.key === fromUnit)?.toGrams || 0);
  const pricePerGram = metalData ? convertPrice(metalData.price, rate) / 31.1035 : 0;
  const totalValue = totalGrams * pricePerGram;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weight Converter</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{currInfo.flag} {selectedCurrency}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metal Selector */}
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

        {/* Input */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={[styles.inputUnit, { color: metalConfig.color }]}>
              {UNITS.find((u) => u.key === fromUnit)?.label}
            </Text>
          </View>
          <View style={styles.fromChips}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u.key}
                onPress={() => setFromUnit(u.key)}
                style={[styles.fromChip, fromUnit === u.key && { backgroundColor: metalConfig.color + '20', borderColor: metalConfig.color }]}
              >
                <Text style={[styles.fromChipText, fromUnit === u.key && { color: metalConfig.color }]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Value */}
        {metalData && (
          <View style={[styles.totalCard, { borderColor: metalConfig.color + '40' }]}>
            <View style={[styles.totalAccent, { backgroundColor: metalConfig.color }]} />
            <View style={styles.totalInner}>
              <Text style={styles.totalLabel}>Total Value</Text>
              <Text style={[styles.totalValue, { color: metalConfig.color }]}>
                {formatCurrency(totalValue, selectedCurrency)}
              </Text>
              <Text style={styles.totalSub}>
                {totalGrams.toFixed(3)}g of {metalConfig.name} at {formatCurrency(pricePerGram, selectedCurrency)}/g
              </Text>
            </View>
          </View>
        )}

        {/* Conversion Grid */}
        <Text style={styles.sectionTitle}>All Conversions</Text>
        <View style={styles.convGrid}>
          {conversions.map((c) => (
            <View key={c.key} style={[styles.convCard, c.isActive && { borderColor: metalConfig.color + '60' }]}>
              <Text style={styles.convLabel}>{c.label}</Text>
              <Text style={[styles.convValue, c.isActive && { color: metalConfig.color }]}>
                {c.converted < 0.001 && c.converted > 0
                  ? c.converted.toExponential(2)
                  : c.converted >= 10000
                  ? c.converted.toFixed(0)
                  : c.converted.toFixed(4)}
              </Text>
              {metalData && (
                <Text style={styles.convPrice}>
                  {formatCurrency(c.unitPrice, selectedCurrency)}/{c.key}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Reference Table */}
        <Text style={styles.sectionTitle}>Quick Reference</Text>
        <View style={styles.refCard}>
          {[
            { label: '1 Troy Ounce', value: '31.1035 grams' },
            { label: '1 Tola', value: '11.6638 grams' },
            { label: '1 Tael', value: '37.429 grams' },
            { label: '1 Kilogram', value: '32.1507 troy oz' },
            { label: '1 Grain', value: '0.0648 grams' },
          ].map((ref) => (
            <View key={ref.label} style={styles.refRow}>
              <Text style={styles.refLabel}>{ref.label}</Text>
              <Text style={styles.refValue}>{ref.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
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

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },

  inputCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'baseline' },
  input: {
    fontSize: 36, fontWeight: '800', color: Colors.textPrimary,
    flex: 1, paddingVertical: 0,
  },
  inputUnit: { fontSize: FontSize.md, fontWeight: '600', marginLeft: Spacing.sm },
  fromChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  fromChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
  },
  fromChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },

  totalCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    marginTop: Spacing.lg, borderWidth: 1, overflow: 'hidden',
  },
  totalAccent: { height: 3, width: '100%' },
  totalInner: { padding: Spacing.lg, alignItems: 'center' },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: '800' },
  totalSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },

  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },
  convGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  convCard: {
    width: '48%', backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  convLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  convValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  convPrice: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },

  refCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  refRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  refLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  refValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
});

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

const WEIGHT_UNITS = ['grams', 'ounces', 'kg', 'tola'] as const;
type WeightUnit = (typeof WEIGHT_UNITS)[number];

const TO_GRAMS: Record<WeightUnit, number> = {
  grams: 1,
  ounces: 31.1035,
  kg: 1000,
  tola: 11.6638,
};

export default function InvestmentScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const [selectedMetal, setSelectedMetal] = useState<MetalCode>('XAU');
  const [mode, setMode] = useState<'weight' | 'budget'>('weight');
  const [weightInput, setWeightInput] = useState('10');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('grams');
  const [budgetInput, setBudgetInput] = useState('100000');
  const [makingCharge, setMakingCharge] = useState(8); // percent

  const metalData = cache[selectedMetal]?.data;
  const metalConfig = METALS.find((m) => m.code === selectedMetal)!;

  const results = useMemo(() => {
    if (!metalData) return null;

    const pricePerOz = convertPrice(metalData.price, rate);
    const pricePerGram = pricePerOz / 31.1035;

    if (mode === 'weight') {
      const qty = parseFloat(weightInput) || 0;
      const grams = qty * TO_GRAMS[weightUnit];
      const basePrice = grams * pricePerGram;
      const making = basePrice * (makingCharge / 100);
      const total = basePrice + making;
      return { mode: 'weight' as const, grams, basePrice, making, total, pricePerGram };
    } else {
      const budget = parseFloat(budgetInput) || 0;
      const effectiveRate = pricePerGram * (1 + makingCharge / 100);
      const gramsCanBuy = effectiveRate > 0 ? budget / effectiveRate : 0;
      const basePrice = gramsCanBuy * pricePerGram;
      const making = budget - basePrice;
      return { mode: 'budget' as const, grams: gramsCanBuy, basePrice, making, total: budget, pricePerGram };
    }
  }, [metalData, rate, mode, weightInput, weightUnit, budgetInput, makingCharge]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investment Calculator</Text>
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

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'weight' && styles.modeBtnActive]}
            onPress={() => setMode('weight')}
          >
            <Text style={[styles.modeBtnText, mode === 'weight' && styles.modeBtnTextActive]}>
              By Weight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'budget' && styles.modeBtnActive]}
            onPress={() => setMode('budget')}
          >
            <Text style={[styles.modeBtnText, mode === 'budget' && styles.modeBtnTextActive]}>
              By Budget
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'weight' ? (
          <>
            {/* Weight Input */}
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.unitChips}>
                {WEIGHT_UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.chipSm, weightUnit === u && styles.chipActive]}
                    onPress={() => setWeightUnit(u)}
                  >
                    <Text style={[styles.chipTextSm, weightUnit === u && styles.chipTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Budget Input */}
            <Text style={styles.sectionTitle}>Budget ({currInfo.symbol})</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>{currInfo.symbol}</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </>
        )}

        {/* Making Charge */}
        <Text style={styles.sectionTitle}>Making Charges</Text>
        <View style={styles.chipRow}>
          {[0, 5, 8, 12, 15, 20].map((pct) => (
            <TouchableOpacity
              key={pct}
              style={[styles.chip, makingCharge === pct && styles.chipActive]}
              onPress={() => setMakingCharge(pct)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, makingCharge === pct && styles.chipTextActive]}>
                {pct}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        {results && (
          <View style={[styles.resultCard, { borderColor: metalConfig.color + '40' }]}>
            <View style={[styles.resultAccent, { backgroundColor: metalConfig.color }]} />
            <View style={styles.resultInner}>
              <Text style={styles.resultHeading}>
                {metalConfig.name} {mode === 'weight' ? 'Purchase' : 'What You Get'}
              </Text>

              {mode === 'budget' && (
                <View style={styles.highlightRow}>
                  <Text style={styles.highlightLabel}>You can buy</Text>
                  <Text style={[styles.highlightValue, { color: metalConfig.color }]}>
                    {results.grams.toFixed(3)} grams
                  </Text>
                </View>
              )}

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rate per gram (24K)</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(results.pricePerGram, selectedCurrency)}
                </Text>
              </View>

              {mode === 'weight' && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Weight</Text>
                  <Text style={styles.resultValue}>{results.grams.toFixed(3)}g</Text>
                </View>
              )}

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Metal Value</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(results.basePrice, selectedCurrency)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Making Charges ({makingCharge}%)</Text>
                <Text style={[styles.resultValue, { color: Colors.red }]}>
                  +{formatCurrency(results.making, selectedCurrency)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { fontWeight: '700', color: Colors.textPrimary }]}>
                  Total {mode === 'weight' ? 'Cost' : 'Budget'}
                </Text>
                <Text style={[styles.resultValue, { fontSize: FontSize.xl, color: metalConfig.color }]}>
                  {formatCurrency(results.total, selectedCurrency)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick conversion row */}
        {results && (
          <View style={styles.convRow}>
            <View style={styles.convCell}>
              <Text style={styles.convLabel}>Ounces</Text>
              <Text style={styles.convValue}>{(results.grams / 31.1035).toFixed(4)} oz</Text>
            </View>
            <View style={styles.convCell}>
              <Text style={styles.convLabel}>Tola</Text>
              <Text style={styles.convValue}>{(results.grams / 11.6638).toFixed(3)} tola</Text>
            </View>
            <View style={styles.convCell}>
              <Text style={styles.convLabel}>Kilograms</Text>
              <Text style={styles.convValue}>{(results.grams / 1000).toFixed(5)} kg</Text>
            </View>
          </View>
        )}
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

  modeToggle: {
    flexDirection: 'row', marginTop: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  modeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.accent + '20' },
  modeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.accent },

  inputRow: { gap: Spacing.sm },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputPrefix: { fontSize: FontSize.lg, color: Colors.textSecondary, marginRight: Spacing.sm },
  input: {
    fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary,
    paddingVertical: 14,
  },
  unitChips: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  chipSm: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipTextSm: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },

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
  highlightRow: {
    backgroundColor: Colors.bg, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  highlightLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  highlightValue: { fontSize: FontSize.xl, fontWeight: '800' },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  resultValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },

  convRow: {
    flexDirection: 'row', marginTop: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  convCell: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRightWidth: 1, borderRightColor: Colors.border,
  },
  convLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  convValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
});

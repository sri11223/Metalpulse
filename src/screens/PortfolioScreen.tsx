/**
 * Portfolio Tracker — track your metal holdings and their live value
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMetals } from '../context/MetalsContext';
import { METALS, CURRENCY_MAP } from '../constants/metals';
import { MetalCode, DisplayCurrency } from '../api/types';
import { convertPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface Holding {
  id: string;
  metal: MetalCode;
  grams: number;
  buyPricePerGram: number;  // in USD
  buyDate: string;
  note: string;
}

const PORTFOLIO_KEY = 'metalpulse_portfolio_v1';

export default function PortfolioScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formMetal, setFormMetal] = useState<MetalCode>('XAU');
  const [formGrams, setFormGrams] = useState('');
  const [formBuyPrice, setFormBuyPrice] = useState('');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    try {
      const stored = await AsyncStorage.getItem(PORTFOLIO_KEY);
      if (stored) setHoldings(JSON.parse(stored));
    } catch {}
  };

  const saveHoldings = async (h: Holding[]) => {
    setHoldings(h);
    try {
      await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(h));
    } catch {}
  };

  const addHolding = () => {
    const grams = parseFloat(formGrams);
    const buyPrice = parseFloat(formBuyPrice);
    if (!grams || grams <= 0) return;

    // If no buy price provided, use current market price per gram in USD
    const metalData = cache[formMetal]?.data;
    const defaultBuyPrice = metalData ? metalData.price / 31.1035 : 0;

    const h: Holding = {
      id: Date.now().toString(),
      metal: formMetal,
      grams,
      buyPricePerGram: buyPrice > 0 ? buyPrice / rate : defaultBuyPrice, // Store in USD
      buyDate: new Date().toISOString().split('T')[0],
      note: formNote,
    };
    saveHoldings([h, ...holdings]);
    setShowAdd(false);
    setFormGrams('');
    setFormBuyPrice('');
    setFormNote('');
  };

  const deleteHolding = (id: string) => {
    saveHoldings(holdings.filter((h) => h.id !== id));
  };

  // Calculate portfolio totals
  const portfolio = useMemo(() => {
    let totalCurrentValue = 0;
    let totalInvestedValue = 0;

    const items = holdings.map((h) => {
      const metalData = cache[h.metal]?.data;
      const currentPricePerGramUSD = metalData ? metalData.price / 31.1035 : 0;
      const currentValue = h.grams * currentPricePerGramUSD * rate;
      const investedValue = h.grams * h.buyPricePerGram * rate;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

      totalCurrentValue += currentValue;
      totalInvestedValue += investedValue;

      return { ...h, currentValue, investedValue, pnl, pnlPercent, currentPricePerGramUSD };
    });

    const totalPnl = totalCurrentValue - totalInvestedValue;
    const totalPnlPercent = totalInvestedValue > 0 ? (totalPnl / totalInvestedValue) * 100 : 0;

    return { items, totalCurrentValue, totalInvestedValue, totalPnl, totalPnlPercent };
  }, [holdings, cache, rate]);

  // Group by metal for allocation
  const allocation = useMemo(() => {
    const groups: Record<string, number> = {};
    portfolio.items.forEach((item) => {
      const metalName = METALS.find((m) => m.code === item.metal)?.name ?? item.metal;
      groups[metalName] = (groups[metalName] || 0) + item.currentValue;
    });
    return Object.entries(groups).map(([name, value]) => ({
      name,
      value,
      percent: portfolio.totalCurrentValue > 0 ? (value / portfolio.totalCurrentValue) * 100 : 0,
      color: METALS.find((m) => m.name === name)?.color ?? Colors.accent,
    }));
  }, [portfolio]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Portfolio Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(portfolio.totalCurrentValue, selectedCurrency)}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Invested</Text>
              <Text style={styles.summaryItemValue}>
                {formatCurrency(portfolio.totalInvestedValue, selectedCurrency)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>P&L</Text>
              <Text style={[styles.summaryItemValue, {
                color: portfolio.totalPnl >= 0 ? Colors.green : Colors.red,
              }]}>
                {portfolio.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnl, selectedCurrency)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Return</Text>
              <Text style={[styles.summaryItemValue, {
                color: portfolio.totalPnlPercent >= 0 ? Colors.green : Colors.red,
              }]}>
                {portfolio.totalPnlPercent >= 0 ? '+' : ''}{portfolio.totalPnlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Allocation Bar */}
        {allocation.length > 0 && (
          <View style={styles.allocCard}>
            <Text style={styles.allocTitle}>Allocation</Text>
            <View style={styles.allocBar}>
              {allocation.map((a) => (
                <View
                  key={a.name}
                  style={[styles.allocSegment, {
                    flex: a.percent,
                    backgroundColor: a.color,
                  }]}
                />
              ))}
            </View>
            <View style={styles.allocLegend}>
              {allocation.map((a) => (
                <View key={a.name} style={styles.allocLegendItem}>
                  <View style={[styles.allocDot, { backgroundColor: a.color }]} />
                  <Text style={styles.allocName}>{a.name}</Text>
                  <Text style={styles.allocPct}>{a.percent.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Holdings List */}
        {portfolio.items.length > 0 && (
          <Text style={styles.sectionTitle}>Holdings ({portfolio.items.length})</Text>
        )}
        {portfolio.items.map((item) => {
          const metalCfg = METALS.find((m) => m.code === item.metal)!;
          return (
            <View key={item.id} style={[styles.holdingCard, { borderLeftColor: metalCfg.color }]}>
              <View style={styles.holdingHeader}>
                <View style={[styles.metalBadge, { backgroundColor: metalCfg.color + '20' }]}>
                  <Text style={[styles.metalBadgeText, { color: metalCfg.color }]}>{metalCfg.name}</Text>
                </View>
                <Text style={styles.holdingGrams}>{item.grams.toFixed(3)}g</Text>
                <TouchableOpacity onPress={() => deleteHolding(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.holdingBody}>
                <View style={styles.holdingCol}>
                  <Text style={styles.holdingLabel}>Current Value</Text>
                  <Text style={styles.holdingValue}>
                    {formatCurrency(item.currentValue, selectedCurrency)}
                  </Text>
                </View>
                <View style={styles.holdingCol}>
                  <Text style={styles.holdingLabel}>Invested</Text>
                  <Text style={styles.holdingValue}>
                    {formatCurrency(item.investedValue, selectedCurrency)}
                  </Text>
                </View>
                <View style={styles.holdingCol}>
                  <Text style={styles.holdingLabel}>P&L</Text>
                  <Text style={[styles.holdingPnl, {
                    color: item.pnl >= 0 ? Colors.green : Colors.red,
                  }]}>
                    {item.pnl >= 0 ? '+' : ''}{item.pnlPercent.toFixed(1)}%
                  </Text>
                </View>
              </View>
              {item.note ? <Text style={styles.holdingNote}>{item.note}</Text> : null}
            </View>
          );
        })}

        {/* Empty State */}
        {holdings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Holdings Yet</Text>
            <Text style={styles.emptyDesc}>
              Add your metal holdings to track their live value and profit/loss.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>Add First Holding</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Holding Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Holding</Text>

            {/* Metal */}
            <Text style={styles.formLabel}>Metal</Text>
            <View style={styles.chipRow}>
              {METALS.map((m) => (
                <TouchableOpacity
                  key={m.code}
                  style={[styles.chip, formMetal === m.code && { backgroundColor: m.color + '25', borderColor: m.color }]}
                  onPress={() => setFormMetal(m.code)}
                >
                  <Text style={[styles.chipText, formMetal === m.code && { color: m.color }]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weight */}
            <Text style={styles.formLabel}>Weight (grams)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={formGrams}
                onChangeText={setFormGrams}
                keyboardType="decimal-pad"
                placeholder="e.g. 10"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.inputSuffix}>g</Text>
            </View>

            {/* Buy Price (optional) */}
            <Text style={styles.formLabel}>Buy Price per gram ({currInfo.symbol}) — optional</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>{currInfo.symbol}</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formBuyPrice}
                onChangeText={setFormBuyPrice}
                keyboardType="decimal-pad"
                placeholder="Leave empty for current price"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Note */}
            <Text style={styles.formLabel}>Note (optional)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formNote}
                onChangeText={setFormNote}
                placeholder="e.g. Wedding jewelry"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={addHolding}>
              <Text style={styles.saveBtnText}>Add to Portfolio</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -1 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },

  // Summary
  summaryCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.accent + '30',
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: {
    fontSize: 32, fontWeight: '800', color: Colors.textPrimary, marginVertical: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', marginTop: Spacing.sm },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryItemLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  summaryItemValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  summaryDivider: { width: 1, backgroundColor: Colors.border },

  // Allocation
  allocCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.lg,
  },
  allocTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  allocBar: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2,
  },
  allocSegment: { borderRadius: 4 },
  allocLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md },
  allocLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allocDot: { width: 8, height: 8, borderRadius: 4 },
  allocName: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  allocPct: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Holdings
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },
  holdingCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3,
  },
  holdingHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  metalBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  metalBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  holdingGrams: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  deleteBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  deleteText: { fontSize: 16, color: Colors.textMuted },
  holdingBody: { flexDirection: 'row', gap: Spacing.sm },
  holdingCol: { flex: 1 },
  holdingLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  holdingValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  holdingPnl: { fontSize: FontSize.sm, fontWeight: '700' },
  holdingNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm, fontStyle: 'italic' },

  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, maxWidth: 280 },
  emptyBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  emptyBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl, paddingTop: Spacing.md,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  formLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  inputPrefix: { fontSize: FontSize.lg, color: Colors.textSecondary, marginRight: 6 },
  input: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, paddingVertical: 12 },
  inputSuffix: { fontSize: FontSize.sm, color: Colors.textMuted, marginLeft: 6 },
  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg,
  },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});

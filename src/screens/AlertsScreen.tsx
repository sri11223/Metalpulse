import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
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

interface PriceAlert {
  id: string;
  metal: MetalCode;
  targetPrice: number;
  direction: 'above' | 'below';
  currency: DisplayCurrency;
  createdAt: number;
  triggered: boolean;
}

const ALERTS_KEY = 'metalpulse_alerts_v1';

export default function AlertsScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currInfo = CURRENCY_MAP[selectedCurrency];

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMetal, setFormMetal] = useState<MetalCode>('XAU');
  const [formPrice, setFormPrice] = useState('');
  const [formDirection, setFormDirection] = useState<'above' | 'below'>('above');

  useEffect(() => {
    loadAlerts();
  }, []);

  // Check alerts on every cache update
  useEffect(() => {
    checkAlerts();
  }, [cache]);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALERTS_KEY);
      if (stored) setAlerts(JSON.parse(stored));
    } catch {}
  };

  const saveAlerts = async (newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    try {
      await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts));
    } catch {}
  };

  const addAlert = () => {
    const price = parseFloat(formPrice);
    if (!price || price <= 0) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      metal: formMetal,
      targetPrice: price,
      direction: formDirection,
      currency: selectedCurrency,
      createdAt: Date.now(),
      triggered: false,
    };

    saveAlerts([newAlert, ...alerts]);
    setShowForm(false);
    setFormPrice('');
  };

  const deleteAlert = (id: string) => {
    saveAlerts(alerts.filter((a) => a.id !== id));
  };

  const checkAlerts = useCallback(() => {
    let changed = false;
    const updated = alerts.map((alert) => {
      if (alert.triggered) return alert;
      const data = cache[alert.metal]?.data;
      if (!data) return alert;
      const currentPrice = convertPrice(data.price / 31.1035, rate); // per gram
      const hit =
        (alert.direction === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.direction === 'below' && currentPrice <= alert.targetPrice);
      if (hit) {
        changed = true;
        return { ...alert, triggered: true };
      }
      return alert;
    });
    if (changed) {
      saveAlerts(updated);
    }
  }, [alerts, cache, rate]);

  const getMetalCurrentPrice = (metal: MetalCode) => {
    const data = cache[metal]?.data;
    if (!data) return 0;
    return convertPrice(data.price / 31.1035, rate);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>{showForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add Alert Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Alert</Text>

            {/* Metal */}
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

            {/* Direction */}
            <View style={styles.dirRow}>
              <TouchableOpacity
                style={[styles.dirBtn, formDirection === 'above' && styles.dirBtnActiveUp]}
                onPress={() => setFormDirection('above')}
              >
                <Text style={[styles.dirText, formDirection === 'above' && { color: Colors.green }]}>
                  Above ↑
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dirBtn, formDirection === 'below' && styles.dirBtnActiveDown]}
                onPress={() => setFormDirection('below')}
              >
                <Text style={[styles.dirText, formDirection === 'below' && { color: Colors.red }]}>
                  Below ↓
                </Text>
              </TouchableOpacity>
            </View>

            {/* Current Price */}
            <Text style={styles.currentNote}>
              Current: {formatCurrency(getMetalCurrentPrice(formMetal), selectedCurrency)}/g
            </Text>

            {/* Price Input */}
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>{currInfo.symbol}</Text>
              <TextInput
                style={styles.input}
                value={formPrice}
                onChangeText={setFormPrice}
                keyboardType="decimal-pad"
                placeholder="Target price per gram"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.inputSuffix}>/g</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={addAlert}>
              <Text style={styles.saveBtnText}>Create Alert</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Alerts */}
        {alerts.filter((a) => !a.triggered).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts
              .filter((a) => !a.triggered)
              .map((alert) => {
                const metalCfg = METALS.find((m) => m.code === alert.metal)!;
                const current = getMetalCurrentPrice(alert.metal);
                const diff = alert.direction === 'above'
                  ? ((alert.targetPrice - current) / current) * 100
                  : ((current - alert.targetPrice) / current) * 100;

                return (
                  <View key={alert.id} style={[styles.alertCard, { borderLeftColor: metalCfg.color }]}>
                    <View style={styles.alertHeader}>
                      <View style={[styles.metalBadge, { backgroundColor: metalCfg.color + '20' }]}>
                        <Text style={[styles.metalBadgeText, { color: metalCfg.color }]}>{metalCfg.name}</Text>
                      </View>
                      <View style={[styles.dirBadge, { backgroundColor: alert.direction === 'above' ? Colors.green + '15' : Colors.red + '15' }]}>
                        <Text style={{ fontSize: FontSize.xs, color: alert.direction === 'above' ? Colors.green : Colors.red, fontWeight: '600' }}>
                          {alert.direction === 'above' ? '↑ Above' : '↓ Below'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteAlert(alert.id)} style={styles.deleteBtn}>
                        <Text style={styles.deleteText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.alertBody}>
                      <View>
                        <Text style={styles.alertTarget}>
                          {formatCurrency(alert.targetPrice, alert.currency)}/g
                        </Text>
                        <Text style={styles.alertCurrent}>
                          Current: {formatCurrency(current, selectedCurrency)}/g
                        </Text>
                      </View>
                      <Text style={[styles.alertDiff, { color: diff > 0 ? Colors.textSecondary : Colors.green }]}>
                        {diff > 0 ? `${diff.toFixed(1)}% away` : 'Near target!'}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </>
        )}

        {/* Triggered Alerts */}
        {alerts.filter((a) => a.triggered).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Triggered</Text>
            {alerts.filter((a) => a.triggered).map((alert) => {
              const metalCfg = METALS.find((m) => m.code === alert.metal)!;
              return (
                <View key={alert.id} style={[styles.alertCard, { borderLeftColor: Colors.green, opacity: 0.7 }]}>
                  <View style={styles.alertHeader}>
                    <View style={[styles.metalBadge, { backgroundColor: Colors.green + '20' }]}>
                      <Text style={[styles.metalBadgeText, { color: Colors.green }]}>{metalCfg.name}</Text>
                    </View>
                    <Text style={{ fontSize: FontSize.xs, color: Colors.green, fontWeight: '700' }}>TRIGGERED</Text>
                    <TouchableOpacity onPress={() => deleteAlert(alert.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.alertTarget}>
                    {alert.direction === 'above' ? '↑' : '↓'} {formatCurrency(alert.targetPrice, alert.currency)}/g
                  </Text>
                </View>
              );
            })}
          </>
        )}

        {/* Empty State */}
        {alerts.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Price Alerts</Text>
            <Text style={styles.emptyDesc}>
              Set alerts to get notified when metals hit your target price.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.emptyBtnText}>Create Your First Alert</Text>
            </TouchableOpacity>
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
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -1 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },

  formCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.accent + '40',
  },
  formTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },

  dirRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dirBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  dirBtnActiveUp: { borderColor: Colors.green, backgroundColor: Colors.green + '10' },
  dirBtnActiveDown: { borderColor: Colors.red, backgroundColor: Colors.red + '10' },
  dirText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },

  currentNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.md,
  },
  inputPrefix: { fontSize: FontSize.lg, color: Colors.textSecondary, marginRight: 6 },
  input: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, paddingVertical: 12 },
  inputSuffix: { fontSize: FontSize.sm, color: Colors.textMuted },

  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },

  alertCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  metalBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  metalBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  dirBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  deleteBtn: {
    marginLeft: 'auto',
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  deleteText: { fontSize: 16, color: Colors.textMuted },
  alertBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  alertTarget: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  alertCurrent: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  alertDiff: { fontSize: FontSize.sm, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, maxWidth: 280 },
  emptyBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  emptyBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});

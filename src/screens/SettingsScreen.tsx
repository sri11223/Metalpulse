import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

const STORAGE_KEY_GOLD = '@metalpulse_custom_gold_api_key';
const STORAGE_KEY_EXCHANGE = '@metalpulse_custom_exchange_api_key';

export { STORAGE_KEY_GOLD, STORAGE_KEY_EXCHANGE };

export async function getCustomGoldApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_GOLD);
  } catch {
    return null;
  }
}

export async function getCustomExchangeApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_EXCHANGE);
  } catch {
    return null;
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const [goldKey, setGoldKey] = useState('');
  const [exchangeKey, setExchangeKey] = useState('');
  const [savedGold, setSavedGold] = useState(false);
  const [savedExchange, setSavedExchange] = useState(false);
  const [hasGoldKey, setHasGoldKey] = useState(false);
  const [hasExchangeKey, setHasExchangeKey] = useState(false);

  useEffect(() => {
    (async () => {
      const gk = await AsyncStorage.getItem(STORAGE_KEY_GOLD);
      const ek = await AsyncStorage.getItem(STORAGE_KEY_EXCHANGE);
      if (gk) {
        setGoldKey(gk);
        setHasGoldKey(true);
      }
      if (ek) {
        setExchangeKey(ek);
        setHasExchangeKey(true);
      }
    })();
  }, []);

  const saveGoldKey = async () => {
    const trimmed = goldKey.trim();
    if (trimmed) {
      await AsyncStorage.setItem(STORAGE_KEY_GOLD, trimmed);
      setHasGoldKey(true);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_GOLD);
      setHasGoldKey(false);
    }
    setSavedGold(true);
    setTimeout(() => setSavedGold(false), 2000);
  };

  const saveExchangeKey = async () => {
    const trimmed = exchangeKey.trim();
    if (trimmed) {
      await AsyncStorage.setItem(STORAGE_KEY_EXCHANGE, trimmed);
      setHasExchangeKey(true);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_EXCHANGE);
      setHasExchangeKey(false);
    }
    setSavedExchange(true);
    setTimeout(() => setSavedExchange(false), 2000);
  };

  const clearAll = () => {
    Alert.alert('Clear API Keys', 'Remove all custom API keys? The app will use built-in keys.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([STORAGE_KEY_GOLD, STORAGE_KEY_EXCHANGE]);
          setGoldKey('');
          setExchangeKey('');
          setHasGoldKey(false);
          setHasExchangeKey(false);
        },
      },
    ]);
  };

  const builtInGold = process.env.EXPO_PUBLIC_GOLDAPI_KEY ? 'Configured' : 'Not set';
  const builtInExchange = process.env.EXPO_PUBLIC_INR_KEY ? 'Configured' : 'Not set';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Add your own API keys for higher rate limits. This is optional — the app works with built-in keys.
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Key Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>GoldAPI.io:</Text>
            <View style={[styles.statusBadge, { backgroundColor: hasGoldKey ? Colors.green + '20' : Colors.accent + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: hasGoldKey ? Colors.green : Colors.accent }]} />
              <Text style={[styles.statusText, { color: hasGoldKey ? Colors.green : Colors.accent }]}>
                {hasGoldKey ? 'Custom Key' : `Built-in (${builtInGold})`}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ExchangeRate:</Text>
            <View style={[styles.statusBadge, { backgroundColor: hasExchangeKey ? Colors.green + '20' : Colors.accent + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: hasExchangeKey ? Colors.green : Colors.accent }]} />
              <Text style={[styles.statusText, { color: hasExchangeKey ? Colors.green : Colors.accent }]}>
                {hasExchangeKey ? 'Custom Key' : `Built-in (${builtInExchange})`}
              </Text>
            </View>
          </View>
        </View>

        {/* Gold API Key */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>GoldAPI.io Key</Text>
            <Text style={styles.sectionBadge}>Metal Prices</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Get your free key at goldapi.io/dashboard (300 req/month free)
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={goldKey}
              onChangeText={setGoldKey}
              placeholder="e.g. goldapi-xxxxx-io"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, savedGold && styles.saveBtnDone]}
            onPress={saveGoldKey}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveBtnText, savedGold && styles.saveBtnTextDone]}>
              {savedGold ? '✓ Saved' : 'Save Key'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exchange Rate API Key */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ExchangeRate-API Key</Text>
            <Text style={styles.sectionBadge}>Currency Rates</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Get your free key at exchangerate-api.com (1,500 req/month free)
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={exchangeKey}
              onChangeText={setExchangeKey}
              placeholder="e.g. a977aba85955..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, savedExchange && styles.saveBtnDone]}
            onPress={saveExchangeKey}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveBtnText, savedExchange && styles.saveBtnTextDone]}>
              {savedExchange ? '✓ Saved' : 'Save Key'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear all */}
        {(hasGoldKey || hasExchangeKey) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>Clear All Custom Keys</Text>
          </TouchableOpacity>
        )}

        {/* Help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How it works</Text>
          <HelpRow num="1" text="Get a free API key from the provider website" />
          <HelpRow num="2" text="Paste it in the field above and tap Save" />
          <HelpRow num="3" text="The app will use your key instead of the built-in one" />
          <HelpRow num="4" text="Leave blank & save to revert to built-in key" />
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Rate Limits</Text>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>GoldAPI.io (Free)</Text>
            <Text style={styles.limitValue}>300 requests/month</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>ExchangeRate-API (Free)</Text>
            <Text style={styles.limitValue}>1,500 requests/month</Text>
          </View>
          <Text style={styles.limitNote}>
            Tip: The app auto-refreshes every 5 minutes. Manual pull-to-refresh is always available.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HelpRow({ num, text }: { num: string; text: string }) {
  return (
    <View style={styles.helpRow}>
      <View style={styles.helpNum}>
        <Text style={styles.helpNumText}>{num}</Text>
      </View>
      <Text style={styles.helpText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 32, color: Colors.accent, fontWeight: '300' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.accent + '12',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
  },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.accent, lineHeight: 20 },

  statusCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statusLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },

  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  sectionBadge: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  sectionDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    marginBottom: Spacing.md,
  },
  input: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    padding: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnDone: { backgroundColor: Colors.green },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  saveBtnTextDone: { color: '#fff' },

  clearBtn: {
    borderWidth: 1,
    borderColor: Colors.red + '40',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  clearBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.red },

  helpCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  helpTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  helpRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  helpNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpNumText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.accent },
  helpText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  limitLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  limitValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  limitNote: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

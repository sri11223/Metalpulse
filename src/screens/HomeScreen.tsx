import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { METALS, CURRENCIES, CURRENCY_MAP } from '../constants/metals';
import { useMetals } from '../context/MetalsContext';
import { DisplayCurrency } from '../api/types';
import MetalTile from '../components/MetalTile';
import MarketStatus from '../components/MarketStatus';
import { Colors, FontSize, Spacing, Radius, Shadows } from '../constants/theme';

export default function HomeScreen() {
  const { refreshAll, selectedCurrency, setSelectedCurrency } = useMetals();
  const [refreshing, setRefreshing] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshAll();
    // Give tiles time to refetch
    setTimeout(() => setRefreshing(false), 2000);
  }, [refreshAll]);

  const currentCurrency = CURRENCY_MAP[selectedCurrency];

  const handleCurrencySelect = (code: DisplayCurrency) => {
    setSelectedCurrency(code);
    setCurrencyModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>MetalPulse</Text>
          <Text style={styles.tagline}>Live Precious Metal Prices</Text>
        </View>
        <View style={styles.headerRight}>
          <MarketStatus />
          <TouchableOpacity
            style={styles.currencyBtn}
            onPress={() => setCurrencyModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.currencyFlag}>{currentCurrency.flag}</Text>
            <Text style={styles.currencyCode}>{selectedCurrency}</Text>
            <Text style={styles.currencyChevron}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Metal Grid ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressBackgroundColor={Colors.bgCard}
          />
        }
      >
        <View style={styles.grid}>
          {METALS.map((metal) => (
            <View key={metal.id} style={styles.tileWrapper}>
              <MetalTile metal={metal} />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pull down to refresh • Data from GoldAPI.io
          </Text>
        </View>
      </ScrollView>

      {/* ── Currency Picker Modal ── */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Currency</Text>

            {CURRENCIES.map((curr) => {
              const isActive = curr.code === selectedCurrency;
              return (
                <TouchableOpacity
                  key={curr.code}
                  style={[styles.currencyOption, isActive && styles.currencyOptionActive]}
                  onPress={() => handleCurrencySelect(curr.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionFlag}>{curr.flag}</Text>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionCode, isActive && styles.optionCodeActive]}>
                      {curr.code}
                    </Text>
                    <Text style={styles.optionName}>{curr.name}</Text>
                  </View>
                  <Text style={styles.optionSymbol}>{curr.symbol}</Text>
                  {isActive && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerLeft: {},
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  currencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  currencyFlag: { fontSize: 16 },
  currencyCode: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  currencyChevron: {
    fontSize: 8,
    color: Colors.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  tileWrapper: {
    width: '47.5%',
    flexGrow: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    paddingTop: Spacing.md,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 4,
    gap: Spacing.md,
  },
  currencyOptionActive: {
    backgroundColor: Colors.accent + '15',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  optionFlag: { fontSize: 24 },
  optionInfo: { flex: 1 },
  optionCode: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optionCodeActive: {
    color: Colors.accent,
  },
  optionName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  optionSymbol: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  check: {
    fontSize: FontSize.md,
    color: Colors.accent,
    fontWeight: '700',
  },
});

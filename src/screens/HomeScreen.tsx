/**
 * HomeScreen — 2×2 grid of metal tiles with header, pull-to-refresh, market status
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';
import { METALS } from '../constants/metals';
import { useMetals } from '../context/MetalsContext';
import MetalTile from '../components/MetalTile';
import MarketStatus from '../components/MarketStatus';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshAll } = useMetals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshAll();
    // Small delay so the user sees the refresh indicator
    setTimeout(() => setRefreshing(false), 1200);
  }, [refreshAll]);

  const handleManualRefresh = () => {
    refreshAll();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="diamond" size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>MetalPulse</Text>
            <Text style={styles.headerSubtitle}>Live Precious Metals</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleManualRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Market Status */}
      <MarketStatus />

      {/* Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.gridContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prices from GoldAPI.io · Tap a tile for details
          </Text>
          <Text style={styles.footerText}>
            Pull down to refresh all tiles
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 11,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tileWrapper: {
    width: '48%',
    flexGrow: 1,
  },
  footer: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.label,
    fontSize: 10,
    textAlign: 'center',
  },
});

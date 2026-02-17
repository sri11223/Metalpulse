/**
 * MetalTile — Smart tile that switches between loading/success/error states
 *
 * Uses useMetalPrice hook for independent data fetching per tile.
 * Tapping navigates to the detail page.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MetalConfig } from '../api/types';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';
import { useMetalPrice } from '../hooks/useMetalPrice';
import { useMetals } from '../context/MetalsContext';
import SkeletonLoader from './SkeletonLoader';
import TileContent from './TileContent';
import ErrorTile from './ErrorTile';

interface MetalTileProps {
  metal: MetalConfig;
}

export default function MetalTile({ metal }: MetalTileProps) {
  const router = useRouter();
  const { state, retry } = useMetalPrice(metal.code);
  const { inrRate } = useMetals();

  const handlePress = () => {
    if (state.status === 'success') {
      router.push(`/detail/${metal.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.tile, Shadows.card]}
      onPress={handlePress}
      activeOpacity={state.status === 'success' ? 0.7 : 1}
      disabled={state.status !== 'success'}
    >
      <View style={[styles.accentBar, { backgroundColor: metal.color }]} />

      {(state.status === 'idle' || state.status === 'loading') && (
        <View style={styles.content}>
          <View style={[styles.iconBadge, { backgroundColor: metal.color + '20' }]}>
            <View style={styles.iconPlaceholder} />
          </View>
          <SkeletonLoader lines={4} />
        </View>
      )}

      {state.status === 'success' && state.data && (
        <View style={styles.content}>
          <TileContent metal={metal} data={state.data} inrRate={inrRate} />
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.content}>
          <ErrorTile
            message={state.error ?? 'Failed to load'}
            retryable={state.errorRetryable}
            onRetry={retry}
            metalName={metal.name}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 220,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: Colors.bgShimmerHighlight,
  },
});

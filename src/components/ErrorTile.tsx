/**
 * ErrorTile — Tile error state with retry button
 *
 * Shows type-specific error message and optional retry button.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

interface ErrorTileProps {
  message: string;
  retryable: boolean;
  onRetry: () => void;
  metalName?: string;
}

export default function ErrorTile({ message, retryable, onRetry, metalName }: ErrorTileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={32} color={Colors.danger} />
      </View>

      {metalName && <Text style={styles.metalName}>{metalName}</Text>}
      <Text style={styles.message}>{message}</Text>

      {retryable && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={14} color={Colors.white} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  metalName: {
    ...Typography.bodyBold,
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.caption,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: Spacing.xs,
  },
  retryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
});

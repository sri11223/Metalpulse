/**
 * MarketStatus — Shows whether NYSE is currently OPEN or CLOSED
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { isMarketOpen } from '../utils/formatTime';

export default function MarketStatus() {
  const open = isMarketOpen();

  return (
    <View style={[styles.container, { backgroundColor: open ? Colors.successDim : Colors.dangerDim }]}>
      <View style={[styles.dot, { backgroundColor: open ? Colors.success : Colors.danger }]} />
      <Text style={[styles.text, { color: open ? Colors.success : Colors.danger }]}>
        NYSE Market {open ? 'OPEN' : 'CLOSED'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignSelf: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
});

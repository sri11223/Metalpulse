import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMetals } from '../context/MetalsContext';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

export default function RefreshCountdown() {
  const { nextRefreshAt } = useMetals();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRefreshAt]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isRefreshing = secondsLeft === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: isRefreshing ? Colors.accent : Colors.green }]} />
      <Text style={styles.label}>
        {isRefreshing ? 'Refreshing...' : `Next update in ${display}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

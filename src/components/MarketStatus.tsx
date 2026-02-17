import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

function isMarketOpen(): boolean {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const total = utcHour * 60 + utcMin;

  // Precious metals trade ~23h/day Sun 22:00 UTC – Fri 21:00 UTC
  if (utcDay === 6) return false; // Saturday
  if (utcDay === 0 && total < 22 * 60) return false; // Sunday before 22:00
  if (utcDay === 5 && total >= 21 * 60) return false; // Friday after 21:00
  return true;
}

export default function MarketStatus() {
  const [open, setOpen] = useState(isMarketOpen);

  useEffect(() => {
    const id = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: open ? Colors.green : Colors.red }]} />
      <Text style={styles.text}>{open ? 'Market Open' : 'Market Closed'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

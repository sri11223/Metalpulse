/**
 * Root Layout — Providers + App Lock + Toast
 *
 * Wraps the entire app with:
 * - MetalsProvider (global cache)
 * - SafeAreaProvider
 * - App lock screen (PIN / biometric)
 * - Toast messages
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MetalsProvider } from '../src/context/MetalsContext';
import AppLock from '../src/components/AppLock';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    Toast.show({
      type: 'success',
      text1: 'Welcome to MetalPulse',
      text2: 'Live precious metal prices at your fingertips',
      position: 'top',
      visibilityTime: 2500,
    });
  }, []);

  return (
    <SafeAreaProvider>
      <MetalsProvider>
        <View style={styles.container}>
          {!unlocked ? (
            <AppLock onUnlock={handleUnlock} />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg },
                animation: 'slide_from_right',
              }}
            />
          )}
          <Toast
            topOffset={60}
          />
        </View>
      </MetalsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});

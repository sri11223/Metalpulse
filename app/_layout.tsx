/**
 * Root layout — wraps the entire app with providers
 */
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MetalsProvider } from '../src/context/MetalsContext';
import AppLock from '../src/components/AppLock';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <AppLock>
          <MetalsProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </MetalsProvider>
        </AppLock>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

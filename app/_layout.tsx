/**
 * Root layout — wraps the entire app with providers
 */
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { MetalsProvider } from '../src/context/MetalsContext';
import AppLock from '../src/components/AppLock';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppLock>
          <MetalsProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg },
                animation: 'slide_from_right',
              }}
            />
            <Toast position="bottom" bottomOffset={60} />
          </MetalsProvider>
        </AppLock>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

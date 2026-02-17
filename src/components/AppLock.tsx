/**
 * AppLock — PIN entry screen with biometric support
 *
 * First launch: user sets a 4-digit PIN stored in SecureStore
 * Subsequent launches: user enters PIN or uses biometric unlock
 * Professional lock screen with keypad UI
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

const PIN_KEY = 'metalpulse_pin';
const PIN_LENGTH = 4;

interface AppLockProps {
  onUnlock: () => void;
}

type LockMode = 'loading' | 'set_pin' | 'confirm_pin' | 'enter_pin';

export default function AppLock({ onUnlock }: AppLockProps) {
  const [mode, setMode] = useState<LockMode>('loading');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [hasBiometric, setHasBiometric] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Check if PIN exists & biometric available
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(PIN_KEY);
        const bioAvailable = await LocalAuthentication.hasHardwareAsync();
        const bioEnrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometric(bioAvailable && bioEnrolled);

        if (stored) {
          setMode('enter_pin');
          // Try biometric first
          if (bioAvailable && bioEnrolled) {
            attemptBiometric();
          }
        } else {
          setMode('set_pin');
        }
      } catch {
        setMode('set_pin');
      }
    })();
  }, []);

  const attemptBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock MetalPulse',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });
      if (result.success) {
        onUnlock();
      }
    } catch {
      // Biometric failed — user will use PIN
    }
  };

  const shakeError = useCallback(() => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      handlePinComplete(next);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (mode === 'set_pin') {
      setNewPin(enteredPin);
      setPin('');
      setMode('confirm_pin');
      return;
    }

    if (mode === 'confirm_pin') {
      if (enteredPin === newPin) {
        await SecureStore.setItemAsync(PIN_KEY, newPin);
        onUnlock();
      } else {
        setPin('');
        setError('PINs do not match. Try again');
        setMode('set_pin');
        setNewPin('');
        shakeError();
      }
      return;
    }

    if (mode === 'enter_pin') {
      const stored = await SecureStore.getItemAsync(PIN_KEY);
      if (enteredPin === stored) {
        onUnlock();
      } else {
        setPin('');
        setError('Wrong PIN. Try again');
        shakeError();
      }
    }
  };

  if (mode === 'loading') {
    return (
      <View style={styles.container}>
        <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
      </View>
    );
  }

  const title =
    mode === 'set_pin'
      ? 'Create Your PIN'
      : mode === 'confirm_pin'
      ? 'Confirm Your PIN'
      : 'Enter Your PIN';

  const subtitle =
    mode === 'set_pin'
      ? 'Set a 4-digit PIN to secure your app'
      : mode === 'confirm_pin'
      ? 'Re-enter your PIN to confirm'
      : 'Enter your PIN to unlock MetalPulse';

  return (
    <View style={styles.container}>
      {/* Logo / Icon */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBg}>
          <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>MetalPulse</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* PIN dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </Animated.View>

      {/* Error */}
      {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorSpace} />}

      {/* Keypad */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'].map((key) => {
          if (key === 'bio') {
            return (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={hasBiometric && mode === 'enter_pin' ? attemptBiometric : undefined}
                disabled={!hasBiometric || mode !== 'enter_pin'}
                activeOpacity={0.6}
              >
                {hasBiometric && mode === 'enter_pin' ? (
                  <Ionicons name="finger-print" size={28} color={Colors.accent} />
                ) : (
                  <View />
                )}
              </TouchableOpacity>
            );
          }

          if (key === 'del') {
            return (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={handleDelete}
                activeOpacity={0.6}
              >
                <Ionicons name="backspace-outline" size={28} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handleDigit(key)}
              activeOpacity={0.6}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h2,
    color: Colors.primary,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  error: {
    ...Typography.caption,
    color: Colors.danger,
    height: 20,
    marginBottom: Spacing.lg,
  },
  errorSpace: {
    height: 20,
    marginBottom: Spacing.lg,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    backgroundColor: Colors.bgCard,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.text,
  },
});

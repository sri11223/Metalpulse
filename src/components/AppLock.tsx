import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Vibration,
  Dimensions,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

/* ── Safe SecureStore wrappers ── */

const PIN_KEY = 'metalpulse_app_pin_v3';
const PIN_LENGTH = 4;

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('cannot be cast') || msg.includes('ClassCastException')) {
      try { await SecureStore.deleteItemAsync(key); } catch { /* noop */ }
    }
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch {
    return false;
  }
}

/* ── Dialpad Key ── */

interface DialKeyProps {
  label: string;
  sub?: string;
  onPress: () => void;
  wide?: boolean;
  accent?: boolean;
}

function DialKey({ label, sub, onPress, wide, accent }: DialKeyProps) {
  return (
    <TouchableOpacity
      style={[
        dStyles.key,
        wide && dStyles.keyWide,
        accent && dStyles.keyAccent,
      ]}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <Text style={[dStyles.keyLabel, accent && dStyles.keyLabelAccent]}>
        {label}
      </Text>
      {!!sub && <Text style={dStyles.keySub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

const SCREEN_W = Dimensions.get('window').width;
const KEY_SIZE = Math.min((SCREEN_W - 80) / 3, 80);

const dStyles = StyleSheet.create({
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  keyWide: { backgroundColor: 'transparent', borderWidth: 0 },
  keyAccent: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent + '40' },
  keyLabel: { fontSize: 28, fontWeight: '600', color: Colors.textPrimary },
  keyLabelAccent: { color: Colors.accent, fontSize: 18 },
  keySub: { fontSize: 9, color: Colors.textSecondary, marginTop: 1, letterSpacing: 2 },
});

/* ── Main Component ── */

interface AppLockProps { children: React.ReactNode }
type Mode = 'loading' | 'setup' | 'confirm' | 'unlock';

export default function AppLock({ children }: AppLockProps) {
  const [mode, setMode] = useState<Mode>('loading');
  const [pin, setPin] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    (async () => {
      const stored = await safeGetItem(PIN_KEY);
      if (stored) {
        setMode('unlock');
        attemptBiometric();
      } else {
        setMode('setup');
      }
    })();
  }, []);

  const shake = useCallback(() => {
    Vibration.vibrate(80);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const attemptBiometric = useCallback(async () => {
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHw && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock MetalPulse',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });
        if (result.success) setUnlocked(true);
      }
    } catch { /* noop */ }
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;

    const timer = setTimeout(async () => {
      if (mode === 'setup') {
        setSetupPin(pin);
        setPin('');
        setError('');
        setMode('confirm');
      } else if (mode === 'confirm') {
        if (pin !== setupPin) {
          setError('PINs don\'t match. Try again.');
          setPin('');
          shake();
          return;
        }
        const saved = await safeSetItem(PIN_KEY, pin);
        if (!saved) {
          setError('Failed to save PIN');
          setPin('');
          shake();
          return;
        }
        setUnlocked(true);
      } else if (mode === 'unlock') {
        const stored = await safeGetItem(PIN_KEY);
        if (!stored) {
          setMode('setup');
          setPin('');
          setError('PIN was reset. Set a new one.');
          return;
        }
        if (pin === stored) {
          setUnlocked(true);
        } else {
          setError('Wrong PIN');
          setPin('');
          shake();
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pin, mode, setupPin, shake]);

  const pressDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    setError('');
    setPin((p) => p + d);
  };

  const pressDelete = () => {
    setError('');
    setPin((p) => p.slice(0, -1));
  };

  if (unlocked) return <>{children}</>;

  if (mode === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const titles: Record<string, string> = {
    setup: 'Create PIN',
    confirm: 'Confirm PIN',
    unlock: 'Enter PIN',
  };
  const subtitles: Record<string, string> = {
    setup: 'Set a 4-digit PIN to secure MetalPulse',
    confirm: 'Re-enter your PIN to confirm',
    unlock: 'Enter your PIN to unlock',
  };

  const dialpadLetters: Record<string, string> = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.lockIcon}>
        <Text style={styles.lockEmoji}>🛡️</Text>
      </View>
      <Text style={styles.title}>{titles[mode]}</Text>
      <Text style={styles.subtitle}>{subtitles[mode]}</Text>

      {/* PIN Dots */}
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

      {!!error && <Text style={styles.error}>{error}</Text>}

      {/* Dialpad */}
      <View style={styles.dialpad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <DialKey
            key={d}
            label={d}
            sub={dialpadLetters[d]}
            onPress={() => pressDigit(d)}
          />
        ))}
        {/* Bottom row: biometric / 0 / delete */}
        {mode === 'unlock' ? (
          <DialKey label="🔑" onPress={attemptBiometric} wide />
        ) : (
          <View style={{ width: KEY_SIZE + 16 }} />
        )}
        <DialKey label="0" onPress={() => pressDigit('0')} />
        <DialKey label="⌫" onPress={pressDelete} accent />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  lockIcon: { marginBottom: Spacing.sm },
  lockEmoji: { fontSize: 44 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotFilled: {
    backgroundColor: Colors.accent,
    borderWidth: 0,
  },
  error: {
    color: Colors.red,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  dialpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: KEY_SIZE * 3 + 48 + 12,
    marginTop: Spacing.sm,
  },
});


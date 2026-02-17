import { Platform } from 'react-native';

export const Colors = {
  bg: '#0A0E1A',
  bgCard: '#141929',
  bgCardHover: '#1A2035',
  bgElevated: '#1E2540',
  bgInput: '#1A1F33',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',
  bgShimmer: '#1A2035',
  bgShimmerHighlight: '#252D45',
  bgModal: '#111627',

  primary: '#FFD700',
  primaryDim: 'rgba(255, 215, 0, 0.15)',
  accent: '#4FC3F7',
  accentDim: 'rgba(79, 195, 247, 0.15)',

  success: '#4CAF50',
  successDim: 'rgba(76, 175, 80, 0.15)',
  danger: '#EF5350',
  dangerDim: 'rgba(239, 83, 80, 0.15)',
  warning: '#FFA726',
  warningDim: 'rgba(255, 167, 38, 0.15)',

  text: '#FFFFFF',
  textSecondary: '#8B95B0',
  textTertiary: '#5A6380',
  textInverse: '#0A0E1A',

  border: '#252D45',
  borderLight: '#1E2540',

  // Aliases used across components
  textPrimary: '#FFFFFF',
  textMuted: '#5A6380',
  green: '#4CAF50',
  red: '#EF5350',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: Colors.text,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    color: Colors.textTertiary,
  },
  heroPrice: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -1,
    color: Colors.text,
  },
  tilePrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: Colors.text,
  },
} as const;

export const Shadows = Platform.select({
  ios: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
    },
  },
  android: {
    card: { elevation: 4 },
    elevated: { elevation: 8 },
  },
  default: {
    card: {},
    elevated: {},
  },
})!;

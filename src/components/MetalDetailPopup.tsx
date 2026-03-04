import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MetalConfig, GoldApiResponse } from '../api/types';
import { useMetalPrice } from '../hooks/useMetalPrice';
import { useMetals } from '../context/MetalsContext';
import { convertPrice, gramPrice } from '../utils/priceCalc';
import { formatCurrency } from '../utils/formatPrice';
import { timeAgo } from '../utils/formatTime';
import { CURRENCY_MAP } from '../constants/metals';
import PriceChange from './PriceChange';
import SparklineChart from './SparklineChart';
import OHLCGrid from './OHLCGrid';
import GramPriceRow from './GramPriceRow';
import SpreadIndicator from './SpreadIndicator';
import DayRangeBar from './DayRangeBar';
import AnimatedPrice from './AnimatedPrice';
import LivePulse from './LivePulse';
import { Colors, FontSize, Spacing, Radius, Shadows } from '../constants/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const POPUP_HEIGHT = SCREEN_HEIGHT * 0.82;

interface MetalDetailPopupProps {
  visible: boolean;
  metal: MetalConfig | null;
  onClose: () => void;
}

export default function MetalDetailPopup({ visible, metal, onClose }: MetalDetailPopupProps) {
  const router = useRouter();
  const { selectedCurrency, getRate } = useMetals();
  const rate = getRate(selectedCurrency);
  const currencyInfo = CURRENCY_MAP[selectedCurrency];

  const slideAnim = useRef(new Animated.Value(POPUP_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { state } = useMetalPrice(metal?.code ?? 'XAU');
  const data = state.data;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: POPUP_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!metal) return null;

  const sparkData = data
    ? [
        data.open_price,
        data.low_price,
        (data.open_price + data.high_price) / 2,
        data.high_price,
        (data.high_price + data.low_price) / 2,
        data.price,
      ]
    : [];

  const handleViewFull = () => {
    onClose();
    setTimeout(() => {
      router.push(`/detail/${metal.id}`);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayTouchable} onPress={onClose} />

        <Animated.View
          style={[
            styles.popup,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Drag Handle ── */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* ── Popup Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.metalIcon, { backgroundColor: metal.color + '20' }]}>
                <Text style={[styles.metalSymbol, { color: metal.color }]}>{metal.symbol}</Text>
              </View>
              <View style={styles.headerInfo}>
                <View style={styles.headerNameRow}>
                  <Text style={styles.headerTitle}>{metal.name}</Text>
                  <LivePulse color={metal.color} size={5} style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.headerSub}>
                  {metal.purity} • {currencyInfo.flag} {selectedCurrency}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          {(state.status === 'loading' && !data) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={metal.color} />
              <Text style={styles.loadingText}>Fetching live prices…</Text>
            </View>
          ) : data ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* ── Price Hero ── */}
              <View style={[styles.priceCard, Shadows.card]}>
                <View style={[styles.priceAccent, { backgroundColor: metal.color }]} />
                <View style={styles.priceInner}>
                  <View style={styles.priceRow}>
                    <View style={styles.priceLeft}>
                      <Text style={styles.priceLabel}>TROY OUNCE</Text>
                      <AnimatedPrice
                        value={formatCurrency(convertPrice(data.price, rate), selectedCurrency)}
                        style={[styles.priceValue, { color: metal.color }]}
                        direction={data.chp > 0 ? 'up' : data.chp < 0 ? 'down' : 'neutral'}
                      />
                      <PriceChange
                        percentChange={data.chp}
                        dollarChange={data.ch * rate}
                        showDollarChange
                        currency={selectedCurrency}
                      />
                      {state.lastFetched && (
                        <Text style={styles.updatedAt}>
                          Updated {timeAgo(state.lastFetched / 1000)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.sparkWrap}>
                      <SparklineChart
                        data={sparkData}
                        width={110}
                        height={45}
                        color={metal.color}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Gram Prices (Gold only) ── */}
              {metal.code === 'XAU' && (
                <GramPriceRow data={data} rate={rate} currency={selectedCurrency} />
              )}

              {/* ── Day Range ── */}
              <DayRangeBar data={data} rate={rate} currency={selectedCurrency} />

              {/* ── Bid-Ask Spread ── */}
              {data.ask > 0 && data.bid > 0 && (
                <SpreadIndicator data={data} rate={rate} currency={selectedCurrency} />
              )}

              {/* ── OHLC Grid ── */}
              <OHLCGrid data={data} rate={rate} currency={selectedCurrency} />

              {/* ── View Full Details Button ── */}
              <TouchableOpacity
                style={[styles.fullDetailBtn, { backgroundColor: metal.color }]}
                onPress={handleViewFull}
                activeOpacity={0.8}
              >
                <Text style={styles.fullDetailText}>View Full Details →</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>Unable to load data</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  popup: {
    height: POPUP_HEIGHT,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metalIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metalSymbol: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // ── Loading ──
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 40,
  },

  // ── Price Card ──
  priceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceAccent: { height: 3, width: '100%' },
  priceInner: { padding: Spacing.lg },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceLeft: { flex: 1 },
  priceLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  updatedAt: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  sparkWrap: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.md,
  },

  // ── Error ──
  errorEmoji: { fontSize: 36, marginBottom: Spacing.md },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
  },

  // ── View Full Details ──
  fullDetailBtn: {
    marginTop: Spacing.xl,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fullDetailText: {
    color: '#000',
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

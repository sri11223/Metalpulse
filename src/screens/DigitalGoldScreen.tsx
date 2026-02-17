import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMetals } from '../context/MetalsContext';
import { formatCurrency } from '../utils/formatPrice';
import LivePulse from '../components/LivePulse';
import RefreshCountdown from '../components/RefreshCountdown';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

type Tab = 'buy' | 'sip' | 'gift' | 'sell';
type SIPFrequency = 'daily' | 'weekly' | 'monthly';

const QUICK_AMOUNTS = [101, 251, 501, 1001, 2501, 5001];
const GST_RATE = 0.03; // 3% GST

export default function DigitalGoldScreen() {
  const router = useRouter();
  const { cache, selectedCurrency, getRate } = useMetals();
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [amount, setAmount] = useState('');
  const [sipFrequency, setSipFrequency] = useState<SIPFrequency>('daily');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [sellGrams, setSellGrams] = useState('');

  // Countdown timer for price validity (5 minutes)
  const [countdown, setCountdown] = useState(300);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get gold price
  const goldData = cache.XAU;
  const rate = getRate(selectedCurrency);
  const pricePerOz = goldData ? goldData.data.price * rate : 0;
  const pricePerGram = pricePerOz / 31.1035;
  const priceWithGST = pricePerGram * (1 + GST_RATE);

  const enteredAmount = parseFloat(amount) || 0;
  const gramsForAmount = enteredAmount > 0 ? enteredAmount / priceWithGST : 0;

  const sellGramsNum = parseFloat(sellGrams) || 0;
  const sellValue = sellGramsNum * pricePerGram;

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currencySymbol = selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'buy', label: 'Buy' },
    { key: 'sip', label: 'S.I.P' },
    { key: 'gift', label: 'Gift' },
    { key: 'sell', label: 'Sell' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Digital Gold</Text>
          <Text style={styles.headerSub}>Powered by SafeGold</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        {activeTab === 'buy' && (
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Start investing in Gold</Text>
              <Text style={styles.heroSubtitle}>
                Starting from just {currencySymbol}1
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🛡️</Text>
                  <Text style={styles.badgeText}>Safe & Secure</Text>
                </View>
                <Text style={styles.badgeSep}>•</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🏦</Text>
                  <Text style={styles.badgeText}>Bank-Grade Storage</Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroEmoji}>🪙</Text>
          </View>
        )}

        {activeTab === 'sip' && (
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Small steps, big returns</Text>
              <Text style={styles.heroSubtitle}>
                Starting from just {currencySymbol}100 daily!
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🛡️</Text>
                  <Text style={styles.badgeText}>Safe & Secure</Text>
                </View>
                <Text style={styles.badgeSep}>•</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🏦</Text>
                  <Text style={styles.badgeText}>Bank-Grade Storage</Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroEmoji}>💰</Text>
          </View>
        )}

        {activeTab === 'gift' && (
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Gift Gold to loved ones</Text>
              <Text style={styles.heroSubtitle}>
                The perfect gift for any occasion
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🎁</Text>
                  <Text style={styles.badgeText}>Instant Delivery</Text>
                </View>
                <Text style={styles.badgeSep}>•</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>💝</Text>
                  <Text style={styles.badgeText}>Personalized</Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroEmoji}>🎁</Text>
          </View>
        )}

        {activeTab === 'sell' && (
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Sell Gold instantly</Text>
              <Text style={styles.heroSubtitle}>
                Get money in your bank within 24hrs
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>⚡</Text>
                  <Text style={styles.badgeText}>Instant Sell</Text>
                </View>
                <Text style={styles.badgeSep}>•</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🏦</Text>
                  <Text style={styles.badgeText}>Direct to Bank</Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroEmoji}>💸</Text>
          </View>
        )}

        {/* Live price bar */}
        <View style={styles.priceBar}>
          <View style={styles.priceLeft}>
            <LivePulse color={Colors.red} size={6} />
            <Text style={styles.priceLabel}>Live Price: </Text>
            <Text style={styles.priceValue}>
              {formatCurrency(pricePerGram, selectedCurrency)}/g
            </Text>
            <Text style={styles.priceGST}> + 3% GST</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerIcon}>⏱</Text>
            <Text style={styles.timerText}>{formatTimer(countdown)}</Text>
          </View>
        </View>

        {/* SIP Frequency selector */}
        {activeTab === 'sip' && (
          <View style={styles.freqRow}>
            {(['daily', 'weekly', 'monthly'] as SIPFrequency[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.freqBtn, sipFrequency === f && styles.freqBtnActive]}
                onPress={() => setSipFrequency(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.freqText,
                    sipFrequency === f && styles.freqTextActive,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Amount input */}
        {(activeTab === 'buy' || activeTab === 'sip' || activeTab === 'gift') && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              {activeTab === 'gift' ? 'Gift Amount' : 'Enter Amount'}
            </Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputCurrency}>{currencySymbol}</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputDivider} />

            {/* Quick amount buttons */}
            <View style={styles.quickAmountRow}>
              {QUICK_AMOUNTS.slice(0, 3).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountBtn,
                    enteredAmount === amt && styles.quickAmountBtnActive,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      enteredAmount === amt && styles.quickAmountTextActive,
                    ]}
                  >
                    {currencySymbol} {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.quickAmountRow, { marginTop: Spacing.sm }]}>
              {QUICK_AMOUNTS.slice(3).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountBtn,
                    enteredAmount === amt && styles.quickAmountBtnActive,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      enteredAmount === amt && styles.quickAmountTextActive,
                    ]}
                  >
                    {currencySymbol} {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gold weight result */}
            {enteredAmount > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>You will get</Text>
                <Text style={styles.resultValue}>
                  {gramsForAmount.toFixed(4)}g
                </Text>
                <Text style={styles.resultSub}>of 24K Pure Gold</Text>
              </View>
            )}
          </View>
        )}

        {/* Gift recipient */}
        {activeTab === 'gift' && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Recipient&apos;s Name</Text>
            <TextInput
              style={styles.giftInput}
              value={giftRecipient}
              onChangeText={setGiftRecipient}
              placeholder="Enter name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Sell input */}
        {activeTab === 'sell' && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter Gold (in grams)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={sellGrams}
                onChangeText={setSellGrams}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <Text style={styles.inputUnit}>grams</Text>
            </View>
            <View style={styles.inputDivider} />

            {sellGramsNum > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>You will receive</Text>
                <Text style={[styles.resultValue, { color: Colors.green }]}>
                  {formatCurrency(sellValue, selectedCurrency)}
                </Text>
                <Text style={styles.resultSub}>in your bank account</Text>
              </View>
            )}
          </View>
        )}

        {/* Social proof */}
        <View style={styles.socialCard}>
          <Text style={styles.socialEmoji}>👥</Text>
          <View>
            <Text style={styles.socialText}>
              <Text style={styles.socialBold}>3.5K+</Text>{' '}
              users bought digital gold on
            </Text>
            <Text style={styles.socialText}>MetalPulse</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why buy Gold on MetalPulse?</Text>
          <View style={styles.infoRow}>
            <InfoCard icon="🔒" title="100% Secure" desc="Bank-grade vault storage" />
            <InfoCard icon="📱" title="Buy from ₹1" desc="Start small, grow big" />
          </View>
          <View style={styles.infoRow}>
            <InfoCard icon="🏆" title="24K Purity" desc="99.9% pure gold" />
            <InfoCard icon="⚡" title="Instant Buy/Sell" desc="Real-time at live rates" />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaText}>
            {activeTab === 'buy'
              ? 'Buy Gold'
              : activeTab === 'sip'
              ? `Start ${sipFrequency.charAt(0).toUpperCase() + sipFrequency.slice(1)} S.I.P`
              : activeTab === 'gift'
              ? 'Send Gift'
              : 'Sell Gold'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardIcon}>{icon}</Text>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 32, color: Colors.accent, fontWeight: '300' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  tab: {
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  heroSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  heroEmoji: { fontSize: 56 },
  heroBadges: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeIcon: { fontSize: 12 },
  badgeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  badgeSep: { color: Colors.textMuted },
  priceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  priceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  priceGST: { fontSize: FontSize.xs, color: Colors.textMuted },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.green + '15',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.green + '30',
  },
  timerIcon: { fontSize: 12 },
  timerText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green },
  freqRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  freqBtnActive: { backgroundColor: Colors.primary },
  freqText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  freqTextActive: { color: Colors.black },
  inputSection: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  inputCurrency: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  input: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    padding: 0,
  },
  inputUnit: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 6 },
  inputDivider: { height: 2, backgroundColor: Colors.primary, marginTop: Spacing.xs },
  giftInput: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  quickAmountRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  quickAmountText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  quickAmountTextActive: { color: Colors.primary },
  resultCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  resultLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  resultValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary, marginVertical: Spacing.xs },
  resultSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  socialEmoji: { fontSize: 28 },
  socialText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  socialBold: { fontWeight: '800', color: Colors.textPrimary },
  infoSection: { marginBottom: Spacing.lg },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCardIcon: { fontSize: 24, marginBottom: Spacing.xs },
  infoCardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  infoCardDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.black,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'What is Digital Gold?',
    answer:
      'Digital Gold allows you to buy, sell, and hold gold electronically. Each purchase is backed by 24K 99.9% pure physical gold stored in secure, insured vaults. You can buy gold starting from as little as ₹1 and accumulate wealth over time without worrying about physical storage.',
  },
  {
    question: 'What is SafeGold?',
    answer:
      'SafeGold is a trusted digital gold platform that enables users to buy, sell, and redeem 24K gold digitally. MetalPulse integrates SafeGold pricing to provide you with accurate, real-time gold rates for informed investment decisions.',
  },
  {
    question: 'Why should I buy Digital Gold?',
    answer:
      'Digital Gold offers several advantages:\n• No storage or security concerns — gold is vaulted for you\n• Buy in small amounts (starting ₹1)\n• 24K purity guaranteed\n• Instant buy/sell at live market rates\n• No making charges (unlike jewellery)\n• Can be converted to physical gold or coins\n• Portfolio diversification & hedge against inflation',
  },
  {
    question: 'How do I pay for Digital Gold?',
    answer:
      'You can pay using UPI (GPay, PhonePe, Paytm), Net Banking, Debit/Credit Cards, or Wallets. All payments are processed through secure, PCI-DSS compliant payment gateways.',
  },
  {
    question: 'Is it safe to buy Digital Gold?',
    answer:
      'Yes! Digital Gold is one of the safest ways to invest in gold:\n• Gold is stored in bank-grade vaults (Brinks/Sequel)\n• Fully insured against theft, damage, and natural disasters\n• Regulated by relevant financial authorities\n• Your holdings are 100% backed by physical gold\n• Transparent pricing with live market rates',
  },
  {
    question: 'Is the gold associated with my purchase kept in safe custody?',
    answer:
      'Absolutely. All gold purchased is stored in LBMA-accredited, bank-grade vaults operated by leading vault operators like Brinks and Sequel Logistics. The vaults are insured, audited regularly, and comply with international safety standards.',
  },
  {
    question: "What is the role of the 'security trustee'?",
    answer:
      "A security trustee is an independent entity (typically a bank or financial institution) that holds the gold on behalf of buyers. This ensures that even if the platform faces financial difficulties, your gold remains safe and cannot be used for the company's obligations. It adds an extra layer of protection for your investment.",
  },
  {
    question: 'Who will insure the physical vault?',
    answer:
      'The physical vaults are insured by leading insurance companies covering risks including theft, burglary, fire, natural disasters, and transit. The insurance is maintained by the vault operator and renewed annually. This ensures your gold is protected at all times.',
  },
  {
    question: 'Is my digital gold 100% secure and insured?',
    answer:
      'Yes. Your digital gold holdings are:\n• Backed 1:1 by physical gold\n• Stored in insured, bank-grade vaults\n• Protected by a security trustee\n• Audited regularly by independent auditors\n• Covered by comprehensive insurance policies\n\nYour investment is as secure as gold in a bank locker — but more convenient.',
  },
  {
    question: 'How long does it take to receive money after selling Digital Gold?',
    answer:
      'When you sell your digital gold, the money is typically credited to your bank account within 24-48 hours on business days. Some platforms offer instant settlement to linked bank accounts or wallets.',
  },
  {
    question: 'Can I buy or sell digital gold at any time?',
    answer:
      'You can buy and sell digital gold 24/7 — there are no market hours restrictions like stock exchanges. Prices update in real-time based on international gold rates, so you always get the live market price.',
  },
  {
    question: 'What is a Gold SIP?',
    answer:
      'A Gold SIP (Systematic Investment Plan) allows you to invest a fixed amount in digital gold at regular intervals — daily, weekly, or monthly. It helps you accumulate gold over time and averages out price fluctuations through rupee-cost averaging. Start with as little as ₹100/day.',
  },
  {
    question: 'Can I convert digital gold to physical gold?',
    answer:
      'Yes! You can redeem your digital gold holdings as physical gold coins, bars, or even jewellery. Delivery is typically within 7-10 business days. Minimum redemption quantities may apply (usually starting from 0.5g or 1g).',
  },
  {
    question: 'Are there any taxes on digital gold?',
    answer:
      'Yes, digital gold is subject to:\n• 3% GST on purchase\n• Capital gains tax on selling:\n  - Short-term (< 3 years): taxed at your income tax slab rate\n  - Long-term (> 3 years): 20% with indexation benefit\n\nConsult your tax advisor for personalized guidance.',
  },
  {
    question: 'How does MetalPulse help me track gold prices?',
    answer:
      'MetalPulse provides:\n• Real-time prices for Gold, Silver, Platinum & Palladium\n• Auto-refresh every 30 seconds\n• AI-powered technical analysis & insights\n• Multi-currency support (8 currencies)\n• SIP calculator for investment planning\n• Price alerts for target monitoring\n• Portfolio tracker with P&L analysis\n• Historical price trends & market sentiment',
  },
];

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Text style={[styles.faqChevron, expanded && styles.faqChevronOpen]}>
          ▼
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
      <View style={styles.faqDivider} />
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>❓</Text>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>
            Everything you need to know about digital gold, investing, and MetalPulse
          </Text>
        </View>

        {/* Count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{FAQ_DATA.length} questions answered</Text>
        </View>

        {/* FAQ List */}
        {FAQ_DATA.map((item, index) => (
          <FAQAccordion key={index} item={item} index={index} />
        ))}

        {/* Bottom CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Still have questions?</Text>
          <Text style={styles.ctaSubtitle}>
            Reach out to us and we'll be happy to help
          </Text>
          <View style={styles.ctaRow}>
            <Text style={styles.ctaEmail}>📧 support@metalpulse.app</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: Colors.accent,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  countBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.accent + '15',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.accent,
  },
  faqItem: {
    marginBottom: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  faqChevron: {
    fontSize: 12,
    color: Colors.textMuted,
    transform: [{ rotate: '0deg' }],
  },
  faqChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    paddingBottom: Spacing.lg,
    paddingRight: Spacing.xl,
  },
  faqAnswerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  faqDivider: {
    height: 1,
    backgroundColor: Colors.accent + '15',
  },
  ctaCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  ctaSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  ctaEmail: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: '600',
  },
});

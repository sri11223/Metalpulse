import { MetalConfig, CurrencyInfo, DisplayCurrency } from '../api/types';

export const METALS: MetalConfig[] = [
  {
    id: 'gold',
    code: 'XAU',
    name: 'Gold',
    symbol: 'Au',
    purity: '24 Karat',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    icon: 'diamond',
  },
  {
    id: 'silver',
    code: 'XAG',
    name: 'Silver',
    symbol: 'Ag',
    purity: '999 Fine',
    color: '#C0C0C0',
    gradient: ['#C0C0C0', '#A8A8A8'],
    icon: 'star',
  },
  {
    id: 'platinum',
    code: 'XPT',
    name: 'Platinum',
    symbol: 'Pt',
    purity: '999.5 Fine',
    color: '#E5E4E2',
    gradient: ['#E5E4E2', '#BCC6CC'],
    icon: 'hexagon',
  },
  {
    id: 'palladium',
    code: 'XPD',
    name: 'Palladium',
    symbol: 'Pd',
    purity: '999.5 Fine',
    color: '#CED0CE',
    gradient: ['#CED0CE', '#9EAEB0'],
    icon: 'octagon',
  },
];

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
];

export const CURRENCY_MAP = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
) as Record<DisplayCurrency, CurrencyInfo>;

export const METAL_BY_SLUG = Object.fromEntries(
  METALS.map((m) => [m.id, m])
) as Record<string, MetalConfig>;

export const METAL_BY_CODE = Object.fromEntries(
  METALS.map((m) => [m.code, m])
) as Record<string, MetalConfig>;

export const TROY_OZ_PER_KG = 32.1507;
export const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
export const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

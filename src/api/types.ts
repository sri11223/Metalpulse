// ─── GoldAPI.io response ───
export interface GoldApiResponse {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  prev_close_price: number;
  open_price: number;
  low_price: number;
  high_price: number;
  open_time: number;
  price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_18k: number;
}

// ─── Exchange rate API response (latest endpoint) ───
export interface ExchangeRateLatestResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  conversion_rates: Record<string, number>;
}

// ─── Supported display currencies ───
export type DisplayCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyInfo {
  code: DisplayCurrency;
  symbol: string;
  name: string;
  flag: string;
}

// ─── Metal identifier ───
export type MetalCode = 'XAU' | 'XAG' | 'XPT' | 'XPD';
export type MetalSlug = 'gold' | 'silver' | 'platinum' | 'palladium';

// ─── Metal config ───
export interface MetalConfig {
  id: MetalSlug;
  code: MetalCode;
  name: string;
  symbol: string;
  purity: string;
  color: string;
  gradient: [string, string];
  icon: string;
}

// ─── Fetch state machine ───
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface MetalPriceState {
  status: FetchStatus;
  data: GoldApiResponse | null;
  error: string | null;
  errorRetryable: boolean;
  lastFetched: number | null;
}

export type MetalPriceAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: GoldApiResponse }
  | { type: 'FETCH_ERROR'; payload: { message: string; retryable: boolean } }
  | { type: 'RESET' };

// ─── Cache entry ───
export interface CachedMetal {
  data: GoldApiResponse;
  fetchedAt: number;
}

// ─── Context shape ───
export interface MetalsContextType {
  cache: Record<MetalCode, CachedMetal | null>;
  exchangeRates: Record<string, number> | null;
  exchangeRatesLoading: boolean;
  selectedCurrency: DisplayCurrency;
  setSelectedCurrency: (c: DisplayCurrency) => void;
  setCache: (code: MetalCode, data: GoldApiResponse) => void;
  getCache: (code: MetalCode) => CachedMetal | null;
  isCacheFresh: (code: MetalCode, maxAgeMs?: number) => boolean;
  refreshAll: () => void;
  refreshTrigger: number;
  getRate: (currency: DisplayCurrency) => number;
}

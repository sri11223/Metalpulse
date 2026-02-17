/**
 * inrApi — Fetch exchange rates from exchangerate-api.com
 *
 * Uses the /latest/USD endpoint that returns ALL conversion rates.
 * This way we support multiple currencies, not just INR.
 */

import { ExchangeRateLatestResponse } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
};

const STORAGE_KEY_EXCHANGE = '@metalpulse_custom_exchange_api_key';

async function getApiKey(): Promise<string> {
  try {
    const customKey = await AsyncStorage.getItem(STORAGE_KEY_EXCHANGE);
    if (customKey) return customKey;
  } catch {
    // ignore
  }
  return process.env.EXPO_PUBLIC_INR_KEY ?? '';
}

/**
 * Fetch all exchange rates from USD base
 * Returns a map of currency code → rate
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  const apiKey = await getApiKey();
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Exchange API] HTTP ${response.status} — using fallback rates`);
      return FALLBACK_RATES;
    }

    const data: ExchangeRateLatestResponse = await response.json();

    if (
      data.result === 'success' &&
      data.conversion_rates &&
      typeof data.conversion_rates === 'object'
    ) {
      return data.conversion_rates;
    }

    console.warn('[Exchange API] Unexpected response — using fallback rates');
    return FALLBACK_RATES;
  } catch (err) {
    console.warn('[Exchange API] Fetch failed — using fallback rates', err);
    return FALLBACK_RATES;
  }
}

export { FALLBACK_RATES };

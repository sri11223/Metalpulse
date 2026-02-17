/**
 * inrApi — Fetch wrapper for exchangerate-api.com (USD → INR)
 *
 * Fetched once per session and cached in context.
 */

import { ExchangeRateResponse } from './types';
import { ApiError } from './goldApi';

const FALLBACK_INR_RATE = 83.5; // Reasonable fallback if API unavailable

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_INR_KEY ?? '';
}

/**
 * Fetch the current USD → INR exchange rate
 */
export async function fetchInrRate(): Promise<number> {
  const apiKey = getApiKey();
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/INR`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[INR API] HTTP ${response.status} — using fallback rate`);
      return FALLBACK_INR_RATE;
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result === 'success' && typeof data.conversion_rate === 'number') {
      return data.conversion_rate;
    }

    console.warn('[INR API] Unexpected response — using fallback rate');
    return FALLBACK_INR_RATE;
  } catch (err) {
    console.warn('[INR API] Fetch failed — using fallback rate', err);
    return FALLBACK_INR_RATE;
  }
}

export { FALLBACK_INR_RATE };

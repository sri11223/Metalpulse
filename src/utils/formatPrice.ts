import { DisplayCurrency } from '../api/types';
import { CURRENCY_MAP } from '../constants/metals';

/**
 * Format a number with currency symbol and proper locale formatting
 */
export function formatCurrency(value: number, currency: DisplayCurrency = 'USD'): string {
  const info = CURRENCY_MAP[currency];
  if (!info) return `$${value.toFixed(2)}`;

  try {
    // Use Intl for proper locale formatting
    const formatter = new Intl.NumberFormat(
      currency === 'INR' ? 'en-IN' : 'en-US',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
      }
    );
    return formatter.format(value);
  } catch {
    return `${info.symbol}${value.toFixed(2)}`;
  }
}

export function formatUSD(value: number): string {
  return formatCurrency(value, 'USD');
}

export function formatINR(value: number): string {
  return formatCurrency(value, 'INR');
}

export function formatGram(value: number, currency: DisplayCurrency = 'USD'): string {
  return `${formatCurrency(value, currency)}/g`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDollarChange(value: number, currency: DisplayCurrency = 'USD'): string {
  const info = CURRENCY_MAP[currency];
  const sym = info?.symbol ?? '$';
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${sym}${Math.abs(value).toFixed(2)}`;
}

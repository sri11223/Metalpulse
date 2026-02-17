/**
 * formatPrice — USD & INR formatting utilities
 */

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const gramFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as USD: $2,341.50
 */
export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

/**
 * Format a number as INR: ₹62,840
 */
export function formatINR(value: number): string {
  return inrFormatter.format(value);
}

/**
 * Format price per gram in USD: $75.32/g
 */
export function formatGram(value: number): string {
  return `${gramFormatter.format(value)}/g`;
}

/**
 * Format a compact number: 2.3K, 1.5M
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

/**
 * Format a percent change: +0.42% or -1.20%
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a dollar change: +$9.80 or -$2.30
 */
export function formatDollarChange(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

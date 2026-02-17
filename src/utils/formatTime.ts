/**
 * formatTime — Timestamp & market-hour utilities
 */

/**
 * Format a UNIX timestamp to a short time string: 10:32 AM
 */
export function formatTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a UNIX timestamp to a full date-time: Tue, 17 Feb 2026 · 10:32 AM EST
 */
export function formatFullTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
  return `${dayName}, ${day} ${month} ${year} · ${time}`;
}

/**
 * Get a relative "Updated X ago" string
 */
export function timeAgo(unixSeconds: number): string {
  const now = Date.now();
  const diff = now - unixSeconds * 1000;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Check whether the NYSE is currently open.
 * NYSE: Mon–Fri 09:30–16:00 Eastern Time (ET)
 */
export function isMarketOpen(): boolean {
  const now = new Date();

  // Convert to ET (handle both EST and EDT)
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const et = new Date(etString);

  const day = et.getDay(); // 0=Sun 6=Sat
  if (day === 0 || day === 6) return false;

  const hours = et.getHours();
  const mins = et.getMinutes();
  const totalMins = hours * 60 + mins;

  // 09:30 = 570, 16:00 = 960
  return totalMins >= 570 && totalMins < 960;
}

/**
 * Check if a given timestamp is stale (older than maxAgeMs)
 */
export function isStale(unixSeconds: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  return Date.now() - unixSeconds * 1000 > maxAgeMs;
}

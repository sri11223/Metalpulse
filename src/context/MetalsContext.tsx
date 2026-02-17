/**
 * MetalsContext — Global cache for metal prices & INR rate
 *
 * - Caches last successful response per metal
 * - Stores INR exchange rate (fetched once per session)
 * - Provides freshness check (5-minute window)
 * - Refresh trigger to coordinate refetch from tiles
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { MetalCode, GoldApiResponse, CachedMetal, MetalsContextType } from '../api/types';
import { fetchInrRate } from '../api/inrApi';
import { CACHE_MAX_AGE_MS } from '../constants/metals';

const MetalsContext = createContext<MetalsContextType | null>(null);

export function MetalsProvider({ children }: { children: React.ReactNode }) {
  const [cache, setFullCache] = useState<Record<MetalCode, CachedMetal | null>>({
    XAU: null,
    XAG: null,
    XPT: null,
    XPD: null,
  });
  const [inrRate, setInrRate] = useState<number | null>(null);
  const [inrRateLoading, setInrRateLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const inrFetched = useRef(false);

  // Fetch INR rate once on mount
  useEffect(() => {
    if (inrFetched.current) return;
    inrFetched.current = true;

    (async () => {
      try {
        const rate = await fetchInrRate();
        setInrRate(rate);
      } catch {
        setInrRate(83.5); // fallback
      } finally {
        setInrRateLoading(false);
      }
    })();
  }, []);

  const setCacheEntry = useCallback((code: MetalCode, data: GoldApiResponse) => {
    setFullCache((prev) => ({
      ...prev,
      [code]: { data, fetchedAt: Date.now() },
    }));
  }, []);

  const getCache = useCallback(
    (code: MetalCode): CachedMetal | null => {
      return cache[code];
    },
    [cache]
  );

  const isCacheFresh = useCallback(
    (code: MetalCode, maxAgeMs: number = CACHE_MAX_AGE_MS): boolean => {
      const entry = cache[code];
      if (!entry) return false;
      return Date.now() - entry.fetchedAt < maxAgeMs;
    },
    [cache]
  );

  const refreshAll = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  const value: MetalsContextType = {
    cache,
    inrRate,
    inrRateLoading,
    setCache: setCacheEntry,
    getCache,
    isCacheFresh,
    refreshAll,
    refreshTrigger,
  };

  return <MetalsContext.Provider value={value}>{children}</MetalsContext.Provider>;
}

/**
 * Hook to consume MetalsContext
 */
export function useMetals(): MetalsContextType {
  const ctx = useContext(MetalsContext);
  if (!ctx) {
    throw new Error('useMetals must be used within <MetalsProvider>');
  }
  return ctx;
}

export default MetalsContext;

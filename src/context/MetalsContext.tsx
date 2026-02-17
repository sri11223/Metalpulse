import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { MetalCode, GoldApiResponse, CachedMetal, MetalsContextType, DisplayCurrency } from '../api/types';
import { fetchExchangeRates } from '../api/inrApi';
import { CACHE_MAX_AGE_MS } from '../constants/metals';

const MetalsContext = createContext<MetalsContextType | null>(null);

export function MetalsProvider({ children }: { children: React.ReactNode }) {
  const [cache, setFullCache] = useState<Record<MetalCode, CachedMetal | null>>({
    XAU: null,
    XAG: null,
    XPT: null,
    XPD: null,
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [exchangeRatesLoading, setExchangeRatesLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<DisplayCurrency>('USD');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const ratesFetched = useRef(false);

  // Fetch exchange rates once on mount
  useEffect(() => {
    if (ratesFetched.current) return;
    ratesFetched.current = true;

    (async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch {
        // fallback rates are returned by fetchExchangeRates on failure
        setExchangeRates({ USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, JPY: 149.5, CAD: 1.36, AUD: 1.53 });
      } finally {
        setExchangeRatesLoading(false);
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
    (code: MetalCode): CachedMetal | null => cache[code],
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

  const getRate = useCallback(
    (currency: DisplayCurrency): number => {
      if (currency === 'USD') return 1;
      if (exchangeRates && exchangeRates[currency]) return exchangeRates[currency];
      return 1;
    },
    [exchangeRates]
  );

  const value: MetalsContextType = {
    cache,
    exchangeRates,
    exchangeRatesLoading,
    selectedCurrency,
    setSelectedCurrency,
    setCache: setCacheEntry,
    getCache,
    isCacheFresh,
    refreshAll,
    refreshTrigger,
    getRate,
  };

  return <MetalsContext.Provider value={value}>{children}</MetalsContext.Provider>;
}

export function useMetals(): MetalsContextType {
  const ctx = useContext(MetalsContext);
  if (!ctx) {
    throw new Error('useMetals must be used within <MetalsProvider>');
  }
  return ctx;
}

export default MetalsContext;

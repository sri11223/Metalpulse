import { useReducer, useCallback, useEffect, useRef } from 'react';
import { MetalCode, MetalPriceState, MetalPriceAction, GoldApiResponse } from '../api/types';
import { fetchMetalPrice, ApiError } from '../api/goldApi';
import { useMetals } from '../context/MetalsContext';

const initialState: MetalPriceState = {
  status: 'idle',
  data: null,
  error: null,
  errorRetryable: false,
  lastFetched: null,
};

function reducer(state: MetalPriceState, action: MetalPriceAction): MetalPriceState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null, errorRetryable: false };
    case 'FETCH_SUCCESS':
      return {
        status: 'success',
        data: action.payload,
        error: null,
        errorRetryable: false,
        lastFetched: Date.now(),
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.message,
        errorRetryable: action.payload.retryable,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useMetalPrice(metalCode: MetalCode) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setCache, getCache, isCacheFresh, refreshTrigger } = useMetals();
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const doFetch = useCallback(
    async (force: boolean = false) => {
      if (fetchingRef.current) return;

      if (!force && isCacheFresh(metalCode)) {
        const cached = getCache(metalCode);
        if (cached) {
          dispatch({ type: 'FETCH_SUCCESS', payload: cached.data });
          return;
        }
      }

      fetchingRef.current = true;
      dispatch({ type: 'FETCH_START' });

      try {
        const data: GoldApiResponse = await fetchMetalPrice(metalCode);
        if (mountedRef.current) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
          setCache(metalCode, data);
        }
      } catch (err) {
        if (mountedRef.current) {
          if (err instanceof ApiError) {
            dispatch({ type: 'FETCH_ERROR', payload: { message: err.message, retryable: err.retryable } });
          } else {
            dispatch({ type: 'FETCH_ERROR', payload: { message: 'An unexpected error occurred', retryable: true } });
          }
        }
      } finally {
        fetchingRef.current = false;
      }
    },
    [metalCode, setCache, getCache, isCacheFresh]
  );

  // Auto-fetch on mount
  useEffect(() => { doFetch(false); }, [doFetch]);

  // Re-fetch on refresh trigger
  const prevTrigger = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger !== prevTrigger.current) {
      prevTrigger.current = refreshTrigger;
      doFetch(true);
    }
  }, [refreshTrigger, doFetch]);

  const retry = useCallback(() => { doFetch(true); }, [doFetch]);

  return { state, fetch: () => doFetch(true), retry };
}

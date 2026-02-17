import { MetalCode, GoldApiResponse } from './types';
import { FETCH_TIMEOUT_MS } from '../constants/metals';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://www.goldapi.io/api';

const STORAGE_KEY_GOLD = '@metalpulse_custom_gold_api_key';

/** Cached custom key to avoid async reads on every request */
let _cachedCustomKey: string | null = null;
let _keyLoaded = false;

async function loadCustomKey(): Promise<void> {
  if (_keyLoaded) return;
  try {
    _cachedCustomKey = await AsyncStorage.getItem(STORAGE_KEY_GOLD);
  } catch {
    _cachedCustomKey = null;
  }
  _keyLoaded = true;
}

/** Call this when user saves a new key to update the cache */
export function invalidateGoldApiKeyCache(): void {
  _keyLoaded = false;
  _cachedCustomKey = null;
}

async function getApiKey(): Promise<string> {
  await loadCustomKey();
  // Custom key takes priority, fallback to built-in env key
  return _cachedCustomKey || process.env.EXPO_PUBLIC_GOLDAPI_KEY || '';
}

export class ApiError extends Error {
  retryable: boolean;
  statusCode?: number;

  constructor(message: string, retryable: boolean, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.retryable = retryable;
    this.statusCode = statusCode;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Tap to retry', true);
    }
    throw new ApiError('No internet connection', true);
  } finally {
    clearTimeout(timeoutId);
  }
}

function classifyHttpError(status: number): ApiError {
  if (status === 401) return new ApiError('Invalid API key', false, 401);
  if (status === 403) return new ApiError('Access forbidden', false, 403);
  if (status === 429) return new ApiError('Rate limit reached. Try later', false, 429);
  if (status >= 500) return new ApiError('Server unavailable. Tap to retry', true, status);
  return new ApiError(`Request failed (${status})`, true, status);
}

export async function fetchMetalPrice(metalCode: MetalCode): Promise<GoldApiResponse> {
  const apiKey = await getApiKey();
  const url = `${BASE_URL}/${metalCode}/USD`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'x-access-token': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw classifyHttpError(response.status);
  }

  try {
    const data = await response.json();
    if (typeof data.price !== 'number' || typeof data.timestamp !== 'number') {
      throw new ApiError('Unexpected response received', true);
    }
    return data as GoldApiResponse;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unexpected response received', true);
  }
}

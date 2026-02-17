import { MetalCode, GoldApiResponse } from './types';
import { FETCH_TIMEOUT_MS } from '../constants/metals';

const BASE_URL = 'https://www.goldapi.io/api';

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_GOLDAPI_KEY ?? '';
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
  const apiKey = getApiKey();
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

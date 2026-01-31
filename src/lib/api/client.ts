/**
 * API Client - Base fetch wrapper with authentication
 *
 * Automatically injects JWT token from auth store and handles
 * response unwrapping, errors, and token expiration.
 */

import { useAuthStore } from '@/stores/auth-store';
import type { ApiResponse, ApiError } from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Configuration
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * API base URL from environment
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Request options extending standard fetch options
 */
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Skip authentication header */
  skipAuth?: boolean;
  /** Request body (will be JSON stringified) */
  body?: unknown;
}

/**
 * API error class with structured error data
 */
export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   API Client
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Make an authenticated API request
 *
 * @param endpoint - API endpoint (e.g., '/users/profile')
 * @param options - Request options
 * @returns Unwrapped response data
 * @throws ApiRequestError on failure
 *
 * @example
 * ```ts
 * // GET request
 * const profile = await apiClient<UserProfile>('/users/profile');
 *
 * // POST request with body
 * const result = await apiClient<WeightLog>('/tracking/weight', {
 *   method: 'POST',
 *   body: { weightKg: 75.5 },
 * });
 *
 * // Request without auth
 * const health = await apiClient('/health', { skipAuth: true });
 * ```
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, body, headers: customHeaders, ...fetchOptions } = options;

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth token if not skipped and available
  if (!skipAuth) {
    const { accessToken, isTokenExpired } = useAuthStore.getState();

    if (accessToken && !isTokenExpired()) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  // Build request URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  const data = await response.json() as ApiResponse<T> | ApiError;

  // Handle error responses
  if (!response.ok || !data.success) {
    const error = data as ApiError;
    throw new ApiRequestError(
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || 'An unexpected error occurred',
      response.status,
      error.error?.details
    );
  }

  // Return unwrapped data
  return (data as ApiResponse<T>).data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HTTP Method Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * HTTP GET request
 */
export function get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * HTTP POST request
 */
export function post<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
  return apiClient<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * HTTP PUT request
 */
export function put<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
  return apiClient<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * HTTP PATCH request
 */
export function patch<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
  return apiClient<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * HTTP DELETE request
 */
export function del<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
}

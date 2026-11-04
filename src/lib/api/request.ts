import 'server-only';

import { cookies } from 'next/headers';
import { ErrorResponse } from '@/types/api';
import { getTranslations } from 'next-intl/server';
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE, AUTH_ID_TOKEN_COOKIE, AUTH_INDICATOR_COOKIE } from '@/constants/auth';

/**
 * Base URL for API requests.
 * Resolved from environment variables with fallback to localhost.
 * @see {@link https://nextjs.org/docs/app/building-your-application/configuring/environment-variables}
 */
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Custom error class for API errors.
 * Extends the standard Error and implements the ErrorResponse interface
 * from the API for consistent error handling.
 * 
 * @example
 * ```typescript
 * try {
 *   await request('/endpoint');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.status, error.message, error.validationErrors);
 *   }
 * }
 * ```
 */
export class ApiError extends Error implements ErrorResponse {
  /** Timestamp when the error occurred */
  timestamp: string;
  /** HTTP status code */
  status: number;
  /** Error type/name from API */
  error: string;
  /** API endpoint path where error occurred */
  path: string;
  /** Validation errors if any (field-specific errors) */
  validationErrors: ErrorResponse['validationErrors'];

  constructor(data: ErrorResponse) {
    super(data.message || data.error || 'An error occurred. Please try again.');
    this.name = 'ApiError';
    this.timestamp = data.timestamp;
    this.status = data.status;
    this.error = data.error;
    this.path = data.path;
    this.validationErrors = data.validationErrors || [];
  }
}

/**
 * Core HTTP request function for server-side API calls.
 * Handles authentication, content-type, error parsing, and logging.
 * This function is server-only and should not be used in client components.
 * 
 * @template T - Expected return type of the API response
 * @param endpoint - API endpoint path (e.g., '/users/me', '/listings')
 * @param options - Standard Fetch API RequestInit options
 * @param includeAuth - Whether to include authentication token (default: true)
 * @returns Promise resolving to typed API response
 * @throws {ApiError} When the API returns a non-OK response
 * 
 * @example
 * ```typescript
 * // GET request
 * const user = await request<User>('/users/me');
 * 
 * // POST request
 * const listing = await request<Listing>('/listings', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * 
 * // Request without auth
 * const publicData = await request<Data>('/public', {}, false);
 * ```
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json, text/plain');

  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (includeAuth) {
    const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const requestUrl = `${BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const requestBodyLength = options.body ? String(options.body).length : 0;

  console.log(`[API Request] ${method} ${requestUrl} | Payload Length: ${requestBodyLength}`);

  const response = await fetch(requestUrl, {
    ...options,
    headers,
    next: options.next || { revalidate: 0 },
  });

  if (response.status === 204) {
    console.log(`[API Response] ${method} ${requestUrl} | Status: 204 | Payload Length: 0`);
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  const responseBodyLength = responseText.length;

  console.log(
    `[API Response] ${method} ${requestUrl} | Status: ${response.status} | Payload Length: ${responseBodyLength}`
  );

  let responseData: unknown = responseText;

  if (responseText && contentType.includes('application/json')) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  } else if (!responseText) {
    responseData = undefined;
  }

  if (!response.ok) {
    const t = await getTranslations();
    const fallbackMessage = t('errors.apiFallback');

    if (response.status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_TOKEN_COOKIE);
      cookieStore.delete(AUTH_REFRESH_TOKEN_COOKIE);
      cookieStore.delete(AUTH_ID_TOKEN_COOKIE);
      cookieStore.delete(AUTH_INDICATOR_COOKIE);
    }

    const errorData: ErrorResponse =
      typeof responseData === 'object' && responseData !== null
        ? {
            ...(responseData as ErrorResponse),
            message: (responseData as ErrorResponse).message || fallbackMessage,
          }
        : {
            timestamp: new Date().toISOString(),
            status: response.status,
            error: response.statusText || 'Error',
            message: typeof responseData === 'string' && responseData ? responseData : fallbackMessage,
            path: endpoint,
            validationErrors: [],
          };
    throw new ApiError({ ...errorData, status: response.status });
  }

  return responseData as T;
}
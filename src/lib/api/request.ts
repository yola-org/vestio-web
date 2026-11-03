import 'server-only';

import { cookies } from 'next/headers';
import { ErrorResponse } from '@/types/api';
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE, AUTH_ID_TOKEN_COOKIE, AUTH_INDICATOR_COOKIE } from '@/constants/auth';

const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';

export class ApiError extends Error implements ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  validationErrors: ErrorResponse['validationErrors'];

  constructor(data: ErrorResponse) {
    super(data.message || data.error || DEFAULT_ERROR_MESSAGE);
    this.name = 'ApiError';
    this.timestamp = data.timestamp;
    this.status = data.status;
    this.error = data.error;
    this.path = data.path;
    this.validationErrors = data.validationErrors || [];
  }
}

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
            message: (responseData as ErrorResponse).message || DEFAULT_ERROR_MESSAGE,
          }
        : {
            timestamp: new Date().toISOString(),
            status: response.status,
            error: response.statusText || 'Error',
            message: typeof responseData === 'string' && responseData ? responseData : DEFAULT_ERROR_MESSAGE,
            path: endpoint,
            validationErrors: [],
          };
    throw new ApiError({ ...errorData, status: response.status });
  }

  return responseData as T;
}
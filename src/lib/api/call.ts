import { createTranslator } from 'next-intl';
import { getApiErrorDetails } from '@/lib/api/errors';
import { defaultLocale, isLocale, LOCALE_COOKIE } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { AUTH_INDICATOR_COOKIE } from '@/constants/auth';
import { clearAuthTracking, wasAuthenticated } from '@/lib/auth';

const PUBLIC_PATHS = ['/welcome', '/login', '/register'];

/**
 * Handler function for custom error messages based on error details
 * @param details - Error details from API response
 * @returns Custom error message string
 */
export type ApiErrorHandler = (details: { code?: string; status?: number; message?: string }) => string;

/**
 * Options for client-side API calls via callApi()
 */
export type CallApiOptions = {
  /** Map of error codes to custom messages or handler functions */
  errors?: Partial<Record<string, string | ApiErrorHandler>>;
  /** If true, suppresses error notifications (default: false) */
  silent?: boolean;
};

const AUTH_INDICATOR_COOKIE_NAME = AUTH_INDICATOR_COOKIE;

/**
 * Gets fallback error message from i18n based on current locale from cookies
 * @returns Translated fallback error message
 * @internal
 */
function getFallbackErrorMessage(): string {
  let locale = defaultLocale;

  if (typeof document !== 'undefined') {
    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`));
    const value = cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : undefined;

    if (isLocale(value)) {
      locale = value;
    }
  }

  return createTranslator({ locale, messages: getDictionary(locale) })('errors.apiFallback');
}

/**
 * Error class for client-side API call errors
 */
export class ApiCallError extends Error {
  /** Error code from API if available */
  code?: string;
  /** HTTP status code if available */
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiCallError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Result wrapper for client-side API calls
 * @template T - Type of successful response data
 */
export interface ApiResult<T> {
  /** Response data if successful, null otherwise */
  data: T | null;
  /** Error object if failed, null otherwise */
  error: ApiCallError | null;
  /** Whether the request was successful */
  success: boolean;
  /**
   * Handle success and error cases with callbacks
   * @param handlers - Callback functions for success and error
   * @returns Promise resolving to this result for chaining
   */
  handle: (handlers: {
    /** Called if request succeeds */
    onSuccess?: (data: T) => void | Promise<void>;
    /** Called if request fails */
    onError?: (error: ApiCallError) => void | Promise<void>;
  }) => Promise<ApiResult<T>>;
}

/**
 * Client-side API call wrapper with error handling.
 * Automatically handles 401 (logout), shows notifications for errors (unless silent),
 * and provides a fluent handle() API for callbacks.
 * Supports both raw promises and ActionResult from server actions.
 * 
 * @template T - Expected response type
 * @param apiCall - Promise from an API function call or Promise<ActionResult<T>>
 * @param options - Configuration for error handling
 * @returns Promise resolving to ApiResult
 * 
 * @example
 * ```typescript
 * import { callApi } from '@/lib/api/call';
 * import { listingsApi } from '@/lib/api';
 * 
 * const result = await callApi(listingsApi.getAll());
 * result.handle({
 *   onSuccess: (listings) => setListings(listings),
 *   onError: (error) => console.error(error.message),
 * });
 * ```
 */
export async function callApi<T>(
  apiCall: Promise<T> | Promise<any>,
  options: CallApiOptions = {}
): Promise<ApiResult<T>> {
  let data: T | null = null;
  let error: ApiCallError | null = null;
  let success = false;

  try {
    const result = await apiCall;
    // Check if it's an ActionResult
    if (result && typeof result === 'object' && 'success' in result && ('data' in result || 'error' in result)) {
      if (result.success) {
        data = result.data as T;
        success = true;
      } else {
        throw new ApiCallError(result.error || getFallbackErrorMessage(), result.code, result.status);
      }
    } else {
      data = result as T;
      success = true;
    }
  } catch (err) {
    const details = getApiErrorDetails(err);
    const codeHandler = details.code === undefined ? undefined : options.errors?.[details.code];
    const hasCustomHandler = codeHandler !== undefined;
    const message =
      typeof codeHandler === 'function'
        ? codeHandler(details)
        : codeHandler ?? details.message ?? getFallbackErrorMessage();

    error = new ApiCallError(message, details.code, details.status);

    if (details.status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      clearAuthTracking();
      window.dispatchEvent(new Event('vestio:auth-changed'));
    }

    if (!hasCustomHandler && details.status === 500) {
      throw error;
    }

    if (!hasCustomHandler && !options.silent && details.status !== 401 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vestio:notification', {
          detail: { type: 'error', message },
        })
      );
    }
  }

  const result: ApiResult<T> = {
    data,
    error,
    success,
    handle: async (handlers) => {
      if (success && handlers.onSuccess) {
        await handlers.onSuccess(data!);
      } else if (!success && handlers.onError) {
        await handlers.onError(error!);
      }
      return result;
    },
  };

  return result;
}
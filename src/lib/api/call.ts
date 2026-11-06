import { createTranslator } from 'next-intl';
import { getApiErrorDetails } from '@/lib/api/errors';
import { defaultLocale, isLocale, LOCALE_COOKIE } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { clearAuthTracking } from '@/lib/auth';

export type ApiErrorHandler = (details: { code?: string; status?: number; message?: string }) => string;

export type CallApiOptions = {
  errors?: Partial<Record<string, string | ApiErrorHandler>>;
  silent?: boolean;
};

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

export class ApiCallError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiCallError';
    this.code = code;
    this.status = status;
  }
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiCallError | null;
  success: boolean;
  handle: (handlers: {
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: ApiCallError) => void | Promise<void>;
  }) => Promise<ApiResult<T>>;
}

export async function callApi<T>(apiCall: Promise<T>, options: CallApiOptions = {}): Promise<ApiResult<T>> {
  let data: T | null = null;
  let error: ApiCallError | null = null;
  let success = false;

  try {
    data = await apiCall;
    success = true;
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

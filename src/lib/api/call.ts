import { getApiErrorDetails } from '@/lib/api/errors';

export type ApiErrorHandler = (details: { code?: string; status?: number; message?: string }) => string;

export type CallApiOptions = {
  errors?: Partial<Record<string, string | ApiErrorHandler>>;
  fallbackMessage?: string;
  silent?: boolean;
};

const FALLBACK_ERROR_MESSAGE = 'An error occurred. Please try again.';

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

export async function callApi<T>(
  apiCall: Promise<T>,
  options: CallApiOptions = {}
): Promise<ApiResult<T>> {
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
        : codeHandler ?? details.message ?? options.fallbackMessage ?? FALLBACK_ERROR_MESSAGE;

    error = new ApiCallError(message, details.code, details.status);

    if (details.status === 401 && typeof window !== 'undefined') {
      if (!hasCustomHandler) {
        localStorage.clear();
        window.dispatchEvent(new Event('vestio:auth-changed'));
        window.location.href = '/login';
      } else {
        window.dispatchEvent(new Event('vestio:auth-changed'));
      }
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
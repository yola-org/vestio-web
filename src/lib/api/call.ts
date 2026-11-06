import {FALLBACK_ERROR_MESSAGE, getApiError} from '@/lib/api/errors';
import { isApiResult, type ApiCallOptions, type ApiError, type ApiErrorConfig, type ApiResult } from '@/lib/api/result';
import { clearAuthTracking } from '@/lib/auth';
import { logger } from '@/lib/logger';

export type {
  ApiCallOptions,
  ApiErrorAction,
  ApiErrorConfig,
  ApiError,
  ApiErrorHandler,
  ApiResult,
} from '@/lib/api/result';
export { isApiResult } from '@/lib/api/result';

function messageFor(error: ApiError, config?: ApiErrorConfig): ApiError {
  if (typeof config === 'string') return error.withMessage(config);
  if (typeof config === 'function') return error.withMessage(config(error));
  if (config?.message === undefined) return error;
  return error.withMessage(
    typeof config.message === 'function' ? config.message(error) : config.message
  );
}

/**
 * Client-side wrapper around a server action (or any promise).
 *
 * It reuses the exact same result shape, options, fallback message and error
 * structure as `runAction`, and adds client-only behavior:
 * - runs `onSuccess` / `onError` callbacks from the options
 * - 401: clears local auth state and notifies listeners
 * - dispatches an error notification (unless `silent` or a custom handler exists)
 * - logs unhandled errors
 *
 * @example
 * ```ts
 * await callApi(authApi.login(credentials), {
 *   errors: {
 *     ERR_UNAUTHORIZED: {
 *       message: t('auth.login.invalidCredentials'),
 *       action: (error) => setLoginError(error.message),
 *     },
 *   },
 *   onSuccess: () => router.push('/'),
 * });
 * ```
 */
export function callApi<T>(
  apiCall: Promise<ApiResult<T>>,
  options?: ApiCallOptions<T>
): Promise<ApiResult<T>>;
export function callApi<T>(
  apiCall: Promise<T>,
  options?: ApiCallOptions<T>
): Promise<ApiResult<T>>;
export async function callApi<T>(
  apiCall: Promise<ApiResult<T>> | Promise<T>,
  options: ApiCallOptions<T> = {}
): Promise<ApiResult<T>> {
  let failure: ApiError;

  try {
    const value = await apiCall;
    if (isApiResult<T>(value)) {
      if (value.success) {
        await options.onSuccess?.(value.data);
        return value;
      }
      failure = getApiError(value.error);
    } else {
      await options.onSuccess?.(value);
      return { success: true, data: value };
    }
  } catch (error) {
    failure = getApiError(error);
  }

  const config = options.errors?.[failure.code];
  failure = messageFor(failure, config);
  const hasCustomHandler = config !== undefined;

  if (!hasCustomHandler) {
    logger.error('CLIENT_ACTION', failure);
  }

  if (failure.status === 401 && typeof window !== 'undefined') {
    localStorage.clear();
    clearAuthTracking();
    window.dispatchEvent(new Event('vestio:auth-changed'));
  }

  if (config && typeof config === 'object' && config.action) {
    try {
      await config.action(failure);
    } catch (actionError) {
      logger.error('CLIENT_ERROR_HANDLER', actionError, { code: failure.code });
    }
  }

  if (!hasCustomHandler && !options.silent && failure.status !== 401 && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vestio:notification', {
        detail: { type: 'error', message: FALLBACK_ERROR_MESSAGE },
      })
    );
  }

  await options.onError?.(failure);

  return { success: false, error: failure };
}

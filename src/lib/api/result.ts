import {ApiError} from "@/lib/api/api-error.ts";

export { ApiError } from '@/lib/api/api-error';

/**
 * The single result type used by both server actions (`runAction`) and
 * client-side calls (`callApi`).
 *
 * It is intentionally a plain discriminated union: no class instances and
 * no methods, so it can be returned from a Server Action unchanged.
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * Resolves a custom message for an API error code.
 */
export type ApiErrorHandler = (error: ApiError) => string;

/**
 * Per-error-code configuration.
 *
 * A plain string or a message resolver only customizes the message.
 * An object additionally lets you run an action when that error occurs,
 * so callers don't have to re-check `error.code` in a generic `onError`.
 *
 * @example
 * ```ts
 * errors: {
 *   ERR_UNAUTHORIZED: {
 *     message: t('auth.login.invalidCredentials'),
 *     action: (error) => setLoginError(error.message),
 *   },
 * }
 * ```
 */
export interface ApiErrorAction {
  /** Custom message or message resolver for this error code */
  message?: string | ApiErrorHandler;
  /** Action executed by `callApi` when this error code occurs */
  action?: (error: ApiError) => void | Promise<void>;
}

/**
 * Accepted value for an entry in {@link ApiCallOptions.errors}.
 */
export type ApiErrorConfig = string | ApiErrorHandler | ApiErrorAction;

/**
 * Options accepted by the client-side `callApi` wrapper.
 */
export interface ApiCallOptions<T = unknown> {
  /**
   * Map of error codes to custom messages, message resolvers, or
   * `{ message, action }` configurations.
   */
  errors?: Partial<Record<string, ApiErrorConfig>>;
  /**
   * Marks the call as critical (must-have / static data). When a critical
   * call fails without a custom handler in `errors`, a severe error
   * notification is shown and the browser is sent to the `/500` error page.
   * Non-critical calls only show the default error notification.
   */
  critical?: boolean;
  /** Client-only: runs after a successful result */
  onSuccess?: (data: T) => void | Promise<void>;
  /** Client-only: runs after a failed result */
  onError?: (error: ApiError) => void | Promise<void>;
}

/**
 * Type guard for the unified result shape.
 */
export function isApiResult<T>(value: unknown): value is ApiResult<T> {
  if (typeof value !== 'object' || value === null || !('success' in value)) {
    return false;
  }

  return (value as { success: boolean }).success ? 'data' in value : 'error' in value;
}

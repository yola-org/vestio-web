
import 'server-only';

import { getApiError } from '@/lib/api/errors';
import { ApiError, type ApiResult } from '@/lib/api/result';
import { logger } from '@/lib/logger';

export type { ApiCallOptions, ApiError, ApiResult } from '@/lib/api/result';

/**
 * Wrapper for server actions that catches errors and returns the same
 * {@link ApiResult} shape used by the client layer.
 *
 * Each action has one error boundary. Expected API errors are returned to the
 * caller; unexpected/server errors are additionally logged here.
 *
 * @example
 * ```ts
 * 'use server';
 * import { runAction } from '@/lib/api/action-result';
 *
 * export async function getUserAction(id: string) {
 *   return runAction(async () => request<User>(`/users/${id}`));
 * }
 * ```
 */
export async function runAction<T>(
  action: () => Promise<T>
): Promise<ApiResult<T>> {
  try {
    return { success: true, data: await action() };
  } catch (error) {
    const apiError = getApiError(error);
    // Backend failures (network or API error) are already logged by the
    // API layer (API_REQUEST) with method/path/status/duration. Only
    // log unexpected failures here (bugs in the action itself, or errors
    // not tied to an API call).
    const alreadyLogged = apiError instanceof ApiError && apiError.path !== '';
    if (!alreadyLogged && apiError.status >= 500) {
      logger.error('SERVER_ACTION', apiError);
    }
    return { success: false, error: apiError.toJSON() as ApiError };
  }
}

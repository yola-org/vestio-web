
import 'server-only';

import { getApiError } from '@/lib/api/errors';
import type { ApiError, ApiResult } from '@/lib/api/result';
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
    if (apiError.status >= 500) {
      logger.error('SERVER_ACTION', apiError);
    }
    return { success: false, error: apiError.toJSON() as ApiError };
  }
}

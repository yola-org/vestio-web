import { getTranslations } from 'next-intl/server';

/**
 * Result type for server actions.
 * Discriminated union for type-safe success/error handling.
 * 
 * @template T - Type of data returned on success
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; status?: number };

/**
 * Extracts error details from unknown error objects
 * @param error - Unknown error thrown
 * @param fallbackMessage - Fallback message if error details not found
 * @returns Normalized error details
 * @internal
 */
function getApiErrorDetails(
  error: unknown,
  fallbackMessage: string
): { message: string; code?: string; status?: number } {
  if (typeof error !== 'object' || error === null) {
    return { message: fallbackMessage };
  }

  const status = 'status' in error && typeof error.status === 'number' ? error.status : undefined;
  const code = 'code' in error && typeof error.code === 'string'
    ? error.code
    : 'error' in error && typeof error.error === 'string'
      ? error.error
      : undefined;
  const message = 'message' in error && typeof error.message === 'string' && error.message.trim()
    ? error.message
    : fallbackMessage;

  return { message, code, status };
}

/**
 * Wrapper for server actions that catches errors and returns ActionResult.
 * Automatically translates error messages using i18n.
 * 
 * @template T - Type of data returned by the action
 * @param action - Async function to execute
 * @returns Promise of ActionResult with success or error
 * 
 * @example
 * ```typescript
 * 'use server';
 * import { runAction } from '@/lib/api/action-result';
 * 
 * export async function getUserAction(id: string) {
 *   return runAction(async () => {
 *     return await request<User>(`/users/${id}`);
 *   });
 * }
 * ```
 */
export async function runAction<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await action() };
  } catch (error) {
    const t = await getTranslations();
    const fallbackMessage = t('errors.apiFallback');
    const details = getApiErrorDetails(error, fallbackMessage);
    return {
      success: false,
      error: details.message,
      code: details.code,
      status: details.status,
    };
  }
}

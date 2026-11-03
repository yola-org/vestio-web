export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; status?: number };

const FALLBACK_ERROR_MESSAGE = 'An error occurred. Please try again.';

function getApiErrorDetails(error: unknown): { message: string; code?: string; status?: number } {
  if (typeof error !== 'object' || error === null) {
    return { message: FALLBACK_ERROR_MESSAGE };
  }

  const status = 'status' in error && typeof error.status === 'number' ? error.status : undefined;
  const code = 'code' in error && typeof error.code === 'string'
    ? error.code
    : 'error' in error && typeof error.error === 'string'
      ? error.error
      : undefined;
  const message = 'message' in error && typeof error.message === 'string' && error.message.trim()
    ? error.message
    : FALLBACK_ERROR_MESSAGE;

  return { message, code, status };
}

export async function runAction<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await action() };
  } catch (error) {
    const details = getApiErrorDetails(error);
    return {
      success: false,
      error: details.message,
      code: details.code,
      status: details.status,
    };
  }
}
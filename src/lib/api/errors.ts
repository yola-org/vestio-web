export function getApiErrorDetails(error: unknown): { code?: string; status?: number; message?: string } {
  if (typeof error !== 'object' || error === null) {
    return {};
  }

  const code = 'code' in error && typeof error.code === 'string'
    ? error.code
    : 'error' in error && typeof error.error === 'string'
      ? error.error
      : undefined;
  const status = 'status' in error && typeof error.status === 'number' ? error.status : undefined;
  const message = 'message' in error && typeof error.message === 'string' && error.message.trim()
    ? error.message
    : undefined;

  return { code, status, message };
}
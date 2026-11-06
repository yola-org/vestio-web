import { ApiError } from '@/lib/api/api-error';

/**
 * Extracts normalized error details from any thrown/returned error value.
 */
export function getApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Server Actions serialize class instances into plain objects.
  if (ApiError.isErrorResponse(error)) {
    return new ApiError(error);
  }

  return new ApiError({
    timestamp: new Date().toISOString(),
    status: 500,
    error: 'ERR_UNEXPECTED',
    message: error instanceof Error ? error.message : String(error || 'Unknown error'),
    path: '',
    validationErrors: [],
  });
}

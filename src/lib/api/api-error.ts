import type { ApiErrorResponse } from '@/lib/api/schemas';
import { ApiErrorResponseSchema } from '@/lib/api/schemas';

/** Reads a non-empty string field from an untrusted response body. */
function readStringField(data: unknown, field: string): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const value = (data as Record<string, unknown>)[field];

  return typeof value === 'string' && value.trim() ? value : undefined;
}

export class ApiError extends Error implements ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  validationErrors: ApiErrorResponse['validationErrors'];

  constructor(data: ApiErrorResponse) {
    super(data.message || data.error || 'An error occurred.');
    this.name = 'ApiError';

    this.timestamp = data.timestamp;
    this.status = data.status;
    this.error = data.error;
    this.path = data.path;
    this.validationErrors = data.validationErrors ?? [];

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Stable application error code used by client error handlers. */
  get code(): string {
    return this.error;
  }

  withMessage(message: string): ApiError {
    return new ApiError({ ...this.toJSON(), message });
  }

  static createApiError(
      data: unknown,
      status: number,
      statusText: string,
      path: string
  ): ApiError {
    // Backend returned a valid ApiErrorResponse
    if (this.isErrorResponse(data)) {
      return new ApiError({
        ...data
      });
    }

    // Use the backend's error code even when the payload is not a complete
    // ApiErrorResponse, so client error handlers can match on it.
    const responseError =
      readStringField(data, 'error') || statusText.trim() || 'ERR_UNEXPECTED';

    const responseMessage =
      typeof data === 'string' && data.trim()
        ? data
        : readStringField(data, 'message') || statusText || `HTTP ${status}`;

    // Preserve the diagnostic response message. The client decides what safe
    // fallback message, if any, is appropriate to show to the user.
    return new ApiError({
      timestamp: new Date().toISOString(),
      status,
      error: responseError,
      message: responseMessage,
      path,
      validationErrors: [],
    });
  }

  static isErrorResponse(data: unknown): data is ApiErrorResponse {
    return ApiErrorResponseSchema.safeParse(data).success;
  }

  toJSON(): ApiErrorResponse {
    return {
      message: this.message,
      timestamp: this.timestamp,
      status: this.status,
      error: this.error,
      path: this.path,
      validationErrors: this.validationErrors,
    };
  }

}

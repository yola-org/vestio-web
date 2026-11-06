import type { z } from 'zod';
import { ApiError } from '@/lib/api/api-error';

/** Parses untrusted action input into a typed value or throws one ApiError. */
export function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (result.success) return result.data;

  throw new ApiError({
    timestamp: new Date().toISOString(),
    status: 400,
    error: 'VALIDATION_ERROR',
    message: 'Please correct the invalid fields.',
    path: '',
    validationErrors: result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      rejectedValue: undefined,
    })),
  });
}

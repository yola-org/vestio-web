import { ApiError } from '@/lib/api/api-error';

const SENSITIVE_KEYS = new Set([
  'authorization', 'cookie', 'setcookie', 'password', 'token',
  'accesstoken', 'refreshtoken', 'secret', 'apikey', 'email', 'phone',
]);

const ANSI = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/** Logs only actionable failures, with sensitive fields redacted. */
class Logger {
  private sanitize(value: unknown, depth = 0): unknown {
    if (depth > 8) return '[max depth]';
    if (value === null || value === undefined || typeof value !== 'object') return value;
    if (value instanceof Error) return this.errorDetails(value);
    if (Array.isArray(value)) return value.map((item) => this.sanitize(item, depth + 1));

    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase().replace(/[-_]/g, ''))
        ? '[REDACTED]'
        : this.sanitize(item, depth + 1),
    ]));
  }

  private errorDetails(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: error.message,
      ...(error instanceof ApiError && {
        code: error.code,
        status: error.status,
        path: error.path,
      }),
      ...(error.stack && { stack: error.stack }),
    };
  }

  error(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    const normalized = error instanceof Error ? error : new Error(String(error));
    const apiDetails = normalized instanceof ApiError
      ? ` code=${normalized.code} status=${normalized.status} path=${normalized.path}`
      : '';
    const plainPrefix = `[ERROR] ${new Date().toISOString()} ${context}${apiDetails}`;

    // Browser DevTools use CSS colors; terminals use ANSI only in development.
    if (typeof window !== 'undefined') {
      const args = metadata ? [normalized, this.sanitize(metadata)] : [normalized];
      console.error(`%c${plainPrefix}`, 'color: #dc2626; font-weight: 700', ...args);
      return;
    }

    const prefix = process.env.NODE_ENV === 'development'
      ? `${ANSI.bold}${ANSI.red}[ERROR]${ANSI.reset} ${ANSI.gray}${new Date().toISOString()}${ANSI.reset} ${ANSI.yellow}${context}${ANSI.reset}${apiDetails}`
      : plainPrefix;

    // Passing the Error object (instead of JSON-stringifying its stack) makes
    // Node/Vercel print a readable multi-line stack to stderr.
    if (metadata) {
      console.error(prefix, normalized, this.sanitize(metadata));
      return;
    }

    console.error(prefix, normalized);
  }
}

export const logger = new Logger();
export default logger;

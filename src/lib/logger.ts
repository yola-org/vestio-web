import { ApiError } from '@/lib/api/api-error';

const SENSITIVE_KEYS = new Set([
  'authorization', 'cookie', 'setcookie', 'password', 'token',
  'accesstoken', 'refreshtoken', 'secret', 'apikey', 'email', 'phone',
]);

const ANSI = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

type Level = 'INFO' | 'WARN' | 'ERROR';

const LEVEL_METHOD: Record<Level, 'info' | 'warn' | 'error'> = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const LEVEL_ANSI: Record<Level, string> = {
  INFO: ANSI.blue,
  WARN: ANSI.yellow,
  ERROR: ANSI.red,
};

const LEVEL_DEV_COLOR: Record<Level, string> = {
  INFO: '#2563eb',
  WARN: '#d97706',
  ERROR: '#dc2626',
};

/**
 * Single-line structured logger. Every event is exactly one line:
 *
 *   [ERROR] 2026-11-06T11:40:11.108Z API_REQUEST code=NETWORK_ERROR status=503 path=/api/cities method=GET durationMs=3
 *
 * One line per event keeps logs greppable and safe to ship to log
 * aggregators (naive multi-line stacks break ingestion pipelines).
 * Sensitive keys are redacted from metadata.
 */
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

  private errorDetails(error: unknown): Record<string, unknown> {
    if (error instanceof ApiError) {
      // ApiError stacks only point at `new ApiError(...)` inside the API
      // layer - they carry no signal, so we keep the line lean.
      return { code: error.code, status: error.status, path: error.path, message: error.message };
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(error.stack && { stack: error.stack.replace(/\n/g, '\\n') }),
      };
    }

    return { message: String(error) };
  }

  private record(metadata?: Record<string, unknown>): Record<string, unknown> {
    return metadata ? (this.sanitize(metadata) as Record<string, unknown>) : {};
  }

  private renderValue(value: unknown): string {
    if (value === null || value === undefined) return String(value);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    const text = String(value);
    return /[\s"=]/.test(text) ? JSON.stringify(text) : text;
  }

  private write(level: Level, context: string, fields: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const body = Object.entries(fields)
      .map(([key, value]) => `${key}=${this.renderValue(value)}`)
      .join(' ');
    const method = LEVEL_METHOD[level];

    if (typeof window !== 'undefined') {
      const prefix = `[${level}] ${timestamp} ${context}`;
      console[method](`%c${prefix}`, `color: ${LEVEL_DEV_COLOR[level]}; font-weight: 700`, body);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      const colored = `${ANSI.bold}${LEVEL_ANSI[level]}[${level}]${ANSI.reset} ${ANSI.gray}${timestamp}${ANSI.reset} ${ANSI.yellow}${context}${ANSI.reset}`;
      console[method](`${colored} ${body}`);
      return;
    }

    console[method](`[${level}] ${timestamp} ${context} ${body}`);
  }

  info(context: string, message: string, metadata?: Record<string, unknown>): void {
    this.write('INFO', context, { message, ...this.record(metadata) });
  }

  warn(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    this.write('WARN', context, { ...this.errorDetails(error), ...this.record(metadata) });
  }

  error(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    this.write('ERROR', context, { ...this.errorDetails(error), ...this.record(metadata) });
  }
}

export const logger = new Logger();
export default logger;

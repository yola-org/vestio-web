# API Layer Documentation

The API layer provides a unified, type-safe interface for communicating with the backend. It handles authentication, error translation, logging, and consistent response processing.

## Architecture

```
src/lib/api/
├── request.ts      # Core HTTP client (server-side)
├── call.ts         # Client-side API wrapper
├── action-result.ts # Server action result types
├── errors.ts       # Error utilities
└── index.ts        # API endpoint definitions
```

## Server-Side API (`request.ts`)

Located in `src/lib/api/request.ts`. This is a server-only module (`'server-only'`).

### Features
- **Base URL Resolution**: `process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'`
- **Authentication**: Automatically attaches Bearer token from `AUTH_TOKEN_COOKIE` (if `includeAuth` is true)
- **Content-Type Handling**: Auto-sets `application/json` for request bodies
- **Logging**: Logs all requests and responses with method, URL, status, and payload length
- **Error Handling**: Translates errors using i18n, cleans up auth cookies on 401
- **Response Parsing**: Handles JSON, text, and 204 No Content responses
- **Type Safety**: Generic `request<T>()` returns typed responses

### Usage

```typescript
import { request } from '@/lib/api/request';

const data = await request<User>('/users/me');
const listings = await request<Listing[]>('/listings', { method: 'GET' });
```

### ApiError Class

```typescript
export class ApiError extends Error implements ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  validationErrors: ErrorResponse['validationErrors'];
}
```

Thrown for non-OK responses. Contains structured error information from the API.

### Authentication Behavior

On 401 responses:
1. Deletes all auth cookies: `AUTH_TOKEN_COOKIE`, `AUTH_REFRESH_TOKEN_COOKIE`, `AUTH_ID_TOKEN_COOKIE`, `AUTH_INDICATOR_COOKIE`
2. Throws `ApiError` with translated error message

### Error Translation
Uses `getTranslations()` from next-intl server to translate error messages via `t('errors.apiFallback')`.

## Client-Side API Wrapper (`call.ts`)

Located in `src/lib/api/call.ts`. Used in Client Components.

### Features
- **Critical Mode**: `critical: true` shows a severe error notification and navigates to the `/500` error page (for must-have/static data)
- **Error Handling**: Uses `getApiError()` for consistent error processing
- **401 Handling**: If the user was logged in, an error notification asks them to log in again (guests fail silently)

### Logging

Every event is logged as **one single line** (greppable and safe to ship to log aggregators), e.g.:

```
[ERROR] 2026-11-06T11:40:11.108Z API_REQUEST code=NETWORK_ERROR status=503 path=/api/cities method=GET durationMs=3
[WARN] 2026-11-06T11:40:12.510Z API_REQUEST code=ERR_NOT_FOUND status=404 path=/api/listings method=GET durationMs=9
[INFO] 2026-11-06T11:40:12.800Z API_REQUEST message=ok method=GET path=/api/cities status=200 durationMs=4
```

- Backend responses logged by `API_REQUEST` (in `request.ts`): 2xx → `INFO`, 4xx → `WARN`, **5xx and 404/410 → `ERROR`** (404/410 means contract drift, e.g. a missing endpoint after a backend version bump)
- Trace context (`traceparent`, W3C) is propagated to the backend by the `@vercel/otel` fetch instrumentation (see `src/instrumentation.ts`, `propagateContextUrls`), so frontend and backend spans/logs can be correlated by trace ID
- `SERVER_ACTION` only logs unexpected action-level failures; API-originated errors are logged once by `API_REQUEST`
- Sensitive keys (`authorization`, `cookie`, `token`, `email`, ...) in metadata are redacted automatically
- Browser logs the same single-line format via `console.info/warn/error`

### Usage

```typescript
import { callApi } from '@/lib/api/call';
import { profileApi } from '@/lib/api';

const result = await callApi(profileApi.getProfile());

if (result.success) {
  setProfile(result.data);
}
```

### Options

```typescript
interface ApiCallOptions {
  critical?: boolean; // If true, a failure shows a severe error notification and goes to /500
  errors?: Partial<Record<string, ApiErrorConfig>>; // Per-code message/action overrides
}
```

Custom handlers in `errors` take precedence: no toast and no `/500` redirect for handled error codes.

## API Endpoint Definitions (`index.ts`)

Central location for all API endpoint functions. Each function returns a promise from `request()`.

### Example Structure

```typescript
export const authApi = {
  login: (data: LoginRequest) => request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

export const listingsApi = {
  getAll: () => request<Listing[]>('/listings'),
  getById: (id: string) => request<Listing>(`/listings/${id}`),
};
```

### Exports
The main `src/lib/api.ts` re-exports from here for convenient imports.

## Server Actions Result Pattern (`action-result.ts`)

Standardized result type for server actions:

```typescript
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

### Usage in Server Actions

```typescript
'use server';

import { ActionResult } from '@/lib/api/action-result';

export async function loginAction(formData: FormData): Promise<ActionResult<AuthResponse>> {
  try {
    const result = await request<AuthResponse>('/auth/login', {...});
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'An unexpected error occurred' };
  }
}
```

## Best Practices

### When to use what
- **Server Components/Server Actions**: Use `request()` directly from `@/lib/api/request`
- **Client Components**: Use `callApi()` wrapper from `@/lib/api/call`
- **API Definitions**: Add new endpoints to `src/lib/api/index.ts`

### Error Handling
- Always handle errors appropriately in UI
- Use `ApiError` for structured error information
- Leverage i18n translations where possible
- Clean up auth state on 401 (handled automatically)

### Type Safety
- Define types in `src/types/` for API responses
- Use generic types with `request<T>()`
- Export types from API modules when needed

### Security
- Tokens are stored in HTTP-only cookies (server-side access only)
- `request.ts` is server-only to prevent token exposure
- Client auth uses indicator cookie only

### Performance
- Use Next.js caching options in `fetch` via `next` property
- Set appropriate cache/revalidation strategies
- Use `critical: true` for must-have/static requests (e.g. cities, categories) so failures show a severe error and navigate to `/500`

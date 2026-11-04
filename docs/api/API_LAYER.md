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
- **Silent Mode**: Can suppress error toasts/logging
- **Error Handling**: Uses `handleApiError()` for consistent error processing
- **Locale Awareness**: Gets locale from cookies for error translations

### Usage

```typescript
import { callApi } from '@/lib/api/call';
import { profileApi } from '@/lib/api';

const result = await callApi(profileApi.getProfile(), { silent: false });

result.handle({
  onSuccess: (data) => {
    setProfile(data);
  },
  onError: (error) => {
    // Custom error handling
  }
});
```

### Options

```typescript
interface CallApiOptions {
  silent?: boolean; // If true, suppress error handling/UI feedback
}
```

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
- Use `silent: true` for background/non-critical requests

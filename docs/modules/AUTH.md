# Authentication Documentation

## Overview

Authentication in Vestio uses cookie-based session management with both server-side and client-side utilities. Tokens are stored securely in HTTP-only cookies, while the client uses a non-httpOnly indicator cookie to track auth state.

## Cookie Configuration

Defined in `src/constants/auth.ts`:

```typescript
export const AUTH_TOKEN_COOKIE = 'vestio_access_token';
export const AUTH_REFRESH_TOKEN_COOKIE = 'vestio_refresh_token';
export const AUTH_ID_TOKEN_COOKIE = 'vestio_id_token';
export const AUTH_INDICATOR_COOKIE = 'vestio_auth';
```

## Server-Side Auth

### Request Layer (`src/lib/api/request.ts`)
- Reads `AUTH_TOKEN_COOKIE` and attaches as `Authorization: Bearer <token>` header
- On 401 response, deletes all auth cookies
- Only runs on server (`'server-only'` import)

### Server Actions (`src/lib/actions/auth.ts`)
Handles login, logout, and token management on the server.

```typescript
// Example pattern
export async function loginAction(credentials: LoginCredentials) {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Set cookies
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, response.accessToken, { /* options */ });
  // ...
  
  return { ok: true, data: response };
}
```

## Client-Side Auth

### `src/lib/auth.ts`

```typescript
import { AUTH_INDICATOR_COOKIE } from '@/constants/auth';

export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith(`${AUTH_INDICATOR_COOKIE}=1`));
}

export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vestio:auth-changed'));
  }
}
```

**Usage:**
- `isAuthenticated()` - Check if user is logged in (client-side)
- `notifyAuthChanged()` - Dispatch event to notify components of auth state change

### Auth State Updates
Components listen for `vestio:auth-changed` events:

```typescript
useEffect(() => {
  const updateAuthentication = () => setIsAuthenticated(hasAuthSession());
  updateAuthentication();
  window.addEventListener('vestio:auth-changed', updateAuthentication);
  return () => window.removeEventListener('vestio:auth-changed', updateAuthentication);
}, []);
```

See `src/components/layout/Header.tsx` for example usage.

## Auth Flow

### Login
1. User submits credentials via form
2. Server Action calls API, receives tokens
3. Server sets HTTP-only cookies for tokens
4. Server sets `AUTH_INDICATOR_COOKIE` for client to detect auth
5. Client calls `notifyAuthChanged()` and refreshes/re-routes

### Logout
1. Server Action calls logout endpoint
2. Server deletes all auth cookies
3. Client detects change via indicator or explicit call
4. Client calls `notifyAuthChanged()`

### Token Expiration
1. API returns 401
2. `request.ts` automatically deletes all auth cookies
3. User is effectively logged out
4. Client can detect via `isAuthenticated()` returning false

## Security Considerations

- **HTTP-Only Tokens**: Access/refresh/ID tokens are stored in HTTP-only cookies (not accessible via JavaScript)
- **Indicator Cookie**: `AUTH_INDICATOR_COOKIE` is likely non-HTTP-only so client can check auth state
- **Secure Cookies**: Should use `Secure`, `SameSite` attributes in production
- **Token Cleanup**: Automatic cleanup on 401 prevents stale sessions
- **Server-Only Request**: Token attachment only happens server-side

## Best Practices

- Always use Server Actions for auth operations that set cookies
- Use `isAuthenticated()` on client for UI state only, not for security checks
- Always validate auth server-side for protected operations
- Call `notifyAuthChanged()` after auth state changes
- Listen for `vestio:auth-changed` event in components that need reactive auth state
- Don't expose tokens to client-side JavaScript

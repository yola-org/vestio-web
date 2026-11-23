# Authentication

Cookie-based session management. Tokens are HTTP-only; the client reads a non-HTTP-only indicator cookie for UI state.

## Cookie names (`src/constants/auth.ts`)

| Constant | Cookie name |
|---|---|
| `AUTH_TOKEN_COOKIE` | `vestio_access_token` |
| `AUTH_REFRESH_TOKEN_COOKIE` | `vestio_refresh_token` |
| `AUTH_ID_TOKEN_COOKIE` | `vestio_id_token` |
| `AUTH_INDICATOR_COOKIE` | `vestio_auth` |

Keep these in sync with `tests/helpers/api-mock.ts`.

## Server-side

`src/lib/api/request.ts` (server-only) reads `AUTH_TOKEN_COOKIE` and attaches it as a Bearer header. On 401 it deletes all four cookies and throws `ApiError`. Auth mutations (login, logout, refresh) live in `src/lib/actions/auth.ts`.

## Client-side (`src/lib/auth.ts`)

- `isAuthenticated()` — reads `vestio_auth=1` from `document.cookie`. Use for UI state only, never for security checks.
- `notifyAuthChanged()` — dispatches `vestio:auth-changed` on `window`. Components that need reactive auth state listen for this event.

## Auth flow

**Login**: server action calls API → sets HTTP-only token cookies + indicator cookie → client calls `notifyAuthChanged()` + `router.refresh()`.

**Logout**: server action clears all cookies → client calls `notifyAuthChanged()`.

**Token expiry**: `request.ts` deletes cookies on 401 automatically. The client detects the missing indicator on the next check.

**Refresh**: a valid refresh token produces a new access token. Invalid/missing refresh credentials clear the session.

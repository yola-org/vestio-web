# API Layer

```
src/lib/api/
├── request.ts        # Server-only HTTP client
├── call.ts           # Client-side wrapper
├── action-result.ts  # ActionResult<T> type
├── errors.ts         # Error utilities
├── schemas.ts        # Domain shapes and enums
└── index.ts          # Endpoint definitions
```

## `request.ts` (server-only)

- Resolves base URL from `API_URL` → `NEXT_PUBLIC_API_URL` → `http://localhost:8080`.
- Attaches `Authorization: Bearer <token>` from `AUTH_TOKEN_COOKIE` when `includeAuth` is true.
- On 401: deletes all auth cookies, throws `ApiError`.
- Logs every request/response as a single structured line (`API_REQUEST`), level `INFO`/`WARN`/`ERROR`.
- Returns typed `T`; handles JSON, text, and 204 No Content.

## `call.ts` (client)

Wraps `request()` for use in Client Components. Handles 401 (shows re-login prompt if the user was authenticated), and supports `critical: true` to navigate to `/500` on failure. Per-error-code overrides suppress the default toast/redirect for handled codes.

## `index.ts`

All endpoint functions are defined here and re-exported through `src/lib/api.ts`. Add new endpoints here, typed with `request<T>()`.

## `schemas.ts`

Domain enums and shapes (listing statuses, contact modes, offer directions, etc.). Use these as the source of truth for domain values — don't hardcode string literals elsewhere.

## `ActionResult<T>`

```
{ ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
```

Used by all server actions. See [ACTIONS.md](../modules/ACTIONS.md).

# Types and Utilities

## Types (`src/types/`)

API response shapes and domain entities. Import with `import type { ... } from '@/types/api'`.

Domain enums and DTO shapes (listing statuses, contact modes, offer directions, etc.) live in `src/lib/api/schemas.ts` — use that as the source of truth for domain values.

## Constants (`src/constants/auth.ts`)

Auth cookie names. See [AUTH.md](AUTH.md).

## Key utilities

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | `isAuthenticated()`, `notifyAuthChanged()` |
| `src/lib/category-utils.ts` | Category tree helpers |
| `src/lib/api/errors.ts` | `getApiError()` and error classification |
| `src/lib/api/action-result.ts` | `ActionResult<T>` type |
| `src/components/events/resolvers/` | Notification and chat event wording and navigation targets |
| `src/lib/events/realtime-event-resolver.ts` | Validates and normalizes incoming AppSync envelopes |

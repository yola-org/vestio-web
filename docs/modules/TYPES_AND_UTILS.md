# Types and Utilities Documentation

## Types (`src/types/`)

Type definitions for the application, primarily API response types.

### Common Types
Look in `src/types/api.ts` for API-related types like:
- `ErrorResponse` - API error structure
- `Listing`, `Category`, `City` - Domain entities
- Auth-related types
- API response types

### Usage
```typescript
import type { Listing, Category } from '@/types/api';
```

## Constants (`src/constants/`)

### Auth Constants (`src/constants/auth.ts`)
```typescript
export const AUTH_TOKEN_COOKIE = 'vestio_access_token';
export const AUTH_REFRESH_TOKEN_COOKIE = 'vestio_refresh_token';
export const AUTH_ID_TOKEN_COOKIE = 'vestio_id_token';
export const AUTH_INDICATOR_COOKIE = 'vestio_auth';
```

## Utilities

### Category Utils (`src/lib/category-utils.ts`)
Utility functions for working with categories. Check the file for specific helpers.

### API Utilities
- `src/lib/api/errors.ts` - Error handling utilities
- `src/lib/api/action-result.ts` - Server action result types (documented in Actions)

## Best Practices

- Define shared types in `src/types/`
- Keep constants in `src/constants/`
- Put pure utility functions in appropriate lib files
- Use TypeScript strictly
- Export types with `export type`

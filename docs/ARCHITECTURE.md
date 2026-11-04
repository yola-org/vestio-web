# Architecture Overview

## Overview

Vestio Web is a Next.js 15 application using the App Router architecture. It follows a modular structure with clear separation of concerns between UI components, business logic, API communication, and internationalization.

## Core Architecture Principles

- **Server-First**: Leverage React Server Components where possible, use Client Components only when needed (interactivity, hooks)
- **Type Safety**: Full TypeScript coverage with strict typing
- **Modular Design**: Components organized by feature/domain
- **Centralized API Layer**: All HTTP communication goes through a unified API client
- **i18n First**: All user-facing strings go through next-intl
- **Design System Driven**: Consistent styling via Tailwind CSS v4 with semantic tokens

## Directory Structure

### `src/app/`
Next.js App Router directory containing routes, layouts, and pages.
- `layout.tsx` - Root layout with font setup, i18n, and HTML direction
- `page.tsx` - Home page
- Route groups/pages like `login/`, `register/`, `profile/`, `listings/`, etc.

### `src/components/`
UI components organized by purpose:

- **`layout/`** - Application shell components
  - `Header.tsx` - Main navigation, search, auth state, language switcher
  - `Footer.tsx` - Site footer
  - `UserDropdown.tsx` - User menu
  - `OnboardingStatus.tsx` - Onboarding progress
  - `LanguageSwitcher.tsx` - Locale switching
  - `HeaderSkeletons.tsx` - Loading skeletons
- **`home/`** - Landing page sections (hero, categories, etc.)
- **`shared/`** - Reusable components used across features
  - `Icons.tsx` - Custom SVG icon components
- **Feature components** - Component files at root level for specific features (e.g., `ProfileSkeleton.tsx`)

### `src/lib/`
Core utilities and business logic:

- **`api/`** - API communication layer
  - `request.ts` - Low-level HTTP client with auth, error handling
  - `call.ts` - Client-side API wrapper with error handling
  - `action-result.ts` - Result types for server actions
  - `errors.ts` - Error utilities
  - `index.ts` - API endpoint definitions
- **`actions/`** - Next.js Server Actions
- **`api.ts`** - Barrel export for API functions
- **`auth.ts`** - Client-side auth utilities
- **`category-utils.ts`** - Category-related helpers

### `src/i18n/`
Internationalization setup:
- `config.ts` - Locale configuration (FR, AR), cookie name, direction helpers
- `request.ts` - next-intl request configuration
- `routing.ts` - Routing configuration
- `dictionaries/` - Translation dictionaries

### `src/constants/`
Application constants:
- `auth.ts` - Auth-related cookie names

### `src/types/`
TypeScript type definitions for API responses, entities, etc.

## Data Flow

### Server-Side Data Fetching
1. Server Components or Server Actions call functions from `src/lib/api/`
2. `request.ts` makes HTTP calls to the backend API
3. Handles authentication via cookies, error translation, token cleanup on 401
4. Returns typed data or throws `ApiError`

### Client-Side Data Fetching
1. Client Components use `callApi()` from `src/lib/api/call.ts`
2. Wraps API calls with consistent error handling
3. Can show toasts/errors, handle loading states
4. Integrates with i18n for error messages

### Authentication Flow
- Tokens stored in HTTP-only cookies (`AUTH_TOKEN_COOKIE`, `AUTH_REFRESH_TOKEN_COOKIE`, etc.)
- Client checks auth via `isAuthenticated()` reading `AUTH_INDICATOR_COOKIE`
- Auth state changes trigger `vestio:auth-changed` event
- 401 responses trigger automatic token cleanup

## Design System

### Colors (Tailwind v4)
Defined in `src/app/globals.css` as CSS variables:
- `--color-background`: `#f7f3ea` (bg-background)
- `--color-primary`: `#151515` (text-primary)
- `--color-accent`: `#ff5d39` (bg-accent) - Primary actions
- `--color-deep-accent`: `#173fdb` (bg-deep-accent) - Secondary actions
- `--color-sub-accent`: `#d8f05e`
- Category colors: femme, homme, enfant, chaussures, sacs, traditionnel

### Typography
- **Display**: `Manrope` (font-display) - Headings, bold statements
- **Sans**: `DM Sans` (font-sans) - Body text, UI elements

### Spacing & Patterns
- Container: `main-container`, `content-padding` utilities
- Buttons: Rounded-full, hover effects with translate
- Mobile-first responsive design

## Routing

Uses Next.js App Router. Routes are file-system based under `src/app/`. The app uses next-intl for locale routing/handling.

## State Management

- **Server State**: Primarily server components, no global state library
- **Client State**: React hooks (`useState`, `useEffect`) for local UI state
- **Auth State**: Cookie-based with event-driven updates
- **Form State**: Local component state

## Best Practices

See [Best Practices Guide](./guides/BEST_PRACTICES.md) for detailed coding standards.

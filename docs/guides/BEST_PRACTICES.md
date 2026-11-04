# Best Practices Guide

## Code Style

### TypeScript
- Use strict TypeScript, avoid `any` when possible
- Define interfaces/types for all data structures
- Use type inference where appropriate
- Export types from relevant modules
- Use `as const` for literal types

### Naming Conventions
- **Components**: PascalCase (`Header.tsx`, `UserDropdown.tsx`)
- **Files/Utilities**: kebab-case or camelCase consistently
- **Functions**: camelCase (`getUserData`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`AUTH_TOKEN_COOKIE`)
- **Types/Interfaces**: PascalCase (`User`, `ApiError`, `ActionResult`)
- **CSS Classes**: Use Tailwind utilities

### File Organization Order
Maintain a consistent order within files:

1. **Imports** - External libraries first, then internal modules
2. **Constants** - Module-level constants
3. **Types and interfaces** - Type definitions
4. **Main implementation** - Functions, classes, hooks, components
5. **Exports** - Re-exports if not inline

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { HeaderIcon } from '@/components/shared/Icons';
import { callApi } from '@/lib/api/call';
import { profileApi } from '@/lib/api';
import type { User } from '@/types/api';

// 2. Constants
const MAX_ITEMS = 10;
const API_TIMEOUT = 5000;

// 3. Types and interfaces
interface ComponentProps {
  className?: string;
  title: string;
}

type Status = 'idle' | 'loading' | 'error';

// 4. Main implementation
export default function Component({ className = '', title }: ComponentProps) {
  // ...
}

// 5. Exports (if additional exports needed)
export { Component };
```

### Imports
- Use path aliases (`@/components/...`, `@/lib/...`)
- Group imports: React/Next, third-party, local components, utilities, types
- Use named imports when possible
- Avoid default exports unless it's the main export of a module

```typescript
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { HeaderIcon } from '@/components/shared/Icons';
import { callApi } from '@/lib/api/call';
import { profileApi } from '@/lib/api';
import type { User } from '@/types/api';
```

## React/Next.js

### Server vs Client Components
- Default to Server Components
- Add `'use client'` only when using hooks, event handlers, browser APIs
- Keep Client Components as small as possible (leaf components)
- Pass data from Server to Client Components as props

### Data Fetching
- Fetch data in Server Components when possible
- Use the API layer (`request()` for server, `callApi()` for client)
- Handle loading states with Suspense or skeleton components
- Handle errors gracefully

### Performance
- Use `next/image` for images (when adding images)
- Lazy load heavy client components with `dynamic()`
- Minimize client-side JavaScript
- Use proper caching strategies

### Routing
- Use Next.js Link for navigation
- Use `router.push()`, `router.refresh()` appropriately
- Handle loading and error states

## Styling

### Tailwind CSS
- Follow the design system tokens (see `AI_GUIDELINES.md`)
- Use semantic classes over arbitrary values when tokens exist
- Mobile-first approach
- Use logical properties for RTL: `start/end` not `left/right`
- Group related classes logically

```typescript
// Good
<button className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">

// Avoid arbitrary colors
<button className="bg-[#ff5d39]"> // Use bg-accent instead
```

### Responsive Design
- Test on mobile, tablet, desktop
- Use responsive prefixes appropriately
- Use `clamp()` for fluid typography where needed

## API & Data

### API Calls
- Use `request()` in server context
- Use `callApi()` in client context
- Define endpoints in `src/lib/api/index.ts`
- Type all API responses
- Handle errors consistently

### Error Handling
- Always catch and handle errors
- Show user-friendly messages (use i18n)
- Log errors for debugging
- Clean up state on errors

### Authentication
- Check auth server-side for protected operations
- Use `isAuthenticated()` only for UI state
- Handle 401s (automatic in request layer)
- Clear auth state properly on logout

## i18n

- All user-facing strings must use `t()`
- Add translations to both FR and AR dictionaries
- Use semantic keys
- Test in both locales
- Use logical CSS for RTL

## Components

- Keep components focused and reusable
- Extract complex logic to hooks or utilities
- Use TypeScript for all props
- Provide default values where sensible
- Add proper accessibility attributes
- Create skeletons for loading states

## Git & Workflow

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Test changes before committing
- Follow existing code patterns
- Update documentation when adding features

## Security

- Never expose tokens to client-side
- Use HTTP-only cookies for sensitive data
- Validate all inputs server-side
- Sanitize user content
- Use environment variables for secrets
- Be careful with `dangerouslySetInnerHTML`

## Testing Considerations

- Test in both languages (FR/AR)
- Test RTL layout
- Test responsive breakpoints
- Test auth flows
- Test error states

## Code Quality

- Remove console.logs in production code (or use proper logging)
- Remove unused imports and variables
- Keep files reasonably sized
- Follow DRY principle
- Comment complex logic
- Use early returns for clarity

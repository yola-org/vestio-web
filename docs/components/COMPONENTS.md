# Components Guide

## Component Organization

Components are organized by purpose and reusability:

```
src/components/
├── layout/      # App layout components (Header, Footer)
├── home/        # Home page specific sections
├── shared/      # Reusable shared components
└── *.tsx        # Feature-specific components
```

## Component Patterns

### Client vs Server Components
- **Server Components (default)**: Use for static content, data fetching, SEO
- **Client Components** (`'use client'`): Use for interactivity, hooks, event listeners, browser APIs

```typescript
// Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}

// Client Component
'use client';
import { useState } from 'react';

export default function Interactive() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(!open)}>Toggle</button>;
}
```

### Component Structure

```typescript
'use client'; // if needed

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SomeIcon } from '@/components/shared/Icons';

interface ComponentProps {
  className?: string;
  title: string;
}

export default function Component({ className = '', title }: ComponentProps) {
  const t = useTranslations();
  const [state, setState] = useState(false);
  
  return (
    <div className={`... ${className}`}>
      {/* Component content */}
    </div>
  );
}
```

### Props
- Always define TypeScript interfaces for props
- Provide sensible defaults
- Accept `className` for style customization where appropriate
- Use descriptive prop names

## Layout Components

### Header (`src/components/layout/Header.tsx`)
Main site header with:
- Logo
- Search bar (city selector + search input)
- Navigation links
- Language switcher
- Auth state (login/register or user menu)
- Category mega menu
- Mobile responsive menu

### Footer (`src/components/layout/Footer.tsx`)
Site footer with links, language switcher, etc.

### LanguageSwitcher
See [i18n documentation](../modules/I18N.md#language-switching).

## Shared Components

### Icons (`src/components/shared/Icons.tsx`)
Custom SVG icon components. All icons follow a consistent pattern:

```typescript
export function GlobeIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* ... */}
    </svg>
  );
}

interface IconProps {
  className?: string;
}
```

**Usage:**
```typescript
import { SearchIcon, HeartIcon } from '@/components/shared/Icons';
<SearchIcon className="h-5 w-5" />
```

## Home Components

Located in `src/components/home/`. Modular sections for the landing page. Check `constants.ts` for static data.

## Styling Guidelines

### Tailwind CSS v4
- Use semantic color classes: `bg-background`, `text-primary`, `text-accent`, `bg-deep-accent`
- Use design system tokens from `globals.css`
- Mobile-first: base styles for mobile, add breakpoints (`sm:`, `md:`, `lg:`)
- Use logical properties for RTL support (`start`/`end`, `ms-`/`me-`, `ps-`/`pe-`)

### Common Patterns
```typescript
// Container
<div className="main-container">...</div>

// Section padding
<section className="py-16 md:py-24">...</section>

// Button primary
<button className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90">
  ...
</button>

// Card
<div className="rounded-xl border border-black/10 bg-white shadow-sm">
  ...
</div>
```

### Hover Effects
Use subtle transforms: `hover:-translate-y-0.5`, opacity changes, color transitions

## Accessibility

- Use semantic HTML elements
- Add `aria-label`, `aria-expanded`, `aria-haspopup` where appropriate
- Ensure keyboard navigation works
- Use proper focus states
- Test with screen readers

## Performance

- Use dynamic imports for heavy components if needed
- Optimize images (use Next.js Image when appropriate)
- Avoid unnecessary re-renders
- Use skeleton components for loading states (see `HeaderSkeletons.tsx`)

## Best Practices

1. **Keep components small and focused** - Single responsibility principle
2. **Make them reusable** - Accept props for customization
3. **Type everything** - Props, state, returns
4. **Use 'use client' sparingly** - Only when necessary
5. **Follow naming conventions** - PascalCase for components, camelCase for utilities
6. **Extract constants** - Put static data in separate files
7. **Use translations** - All user-facing text through next-intl
8. **Consistent styling** - Follow design system, use Tailwind classes
9. **Handle loading/error states** - Provide good UX
10. **Test responsiveness** - Check mobile, tablet, desktop

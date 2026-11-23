# Best Practices

## TypeScript

- Strict mode, avoid `any`. Define interfaces for all data shapes.
- `UPPER_SNAKE_CASE` for constants, `PascalCase` for types/components, `camelCase` for functions/utilities.
- Export types with `export type`.

## File organization

Imports order: React/Next → third-party → local components → utilities → types. Use path aliases (`@/components/...`, `@/lib/...`).

Within a file: imports → constants → types → implementation → exports.

## React / Next.js

- Default to Server Components; add `'use client'` only for interactivity, hooks, or browser APIs.
- Fetch data server-side; use `request()` on the server and `callApi()` on the client.
- Use `next/image` for images. Lazy-load heavy client components with `dynamic()`.

## Styling

- Use semantic token classes (`bg-background`, `text-primary`, `text-accent`) — no hardcoded hex values.
- Mobile-first. Use logical properties for RTL (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`).
- Avoid `rtl:` overrides unless a true directional exception is needed.

## API

- Server context: `request()` from `src/lib/api/request`.
- Client context: `callApi()` from `src/lib/api/call`.
- Define endpoints in `src/lib/api/index.ts`.

## Security

- Tokens in HTTP-only cookies only — never in JS-accessible storage or logs.
- Validate all input server-side. Use env vars for secrets.
- `request.ts` is server-only; never import it in client code.

## i18n

- All user-facing strings through `t()`. Add keys to both `fr` and `ar` dictionaries. Test in both locales and check RTL layout.

## Code quality

- Remove `console.log` from production code (use the structured logger).
- Remove unused imports. Early returns for clarity. Comment non-obvious logic.
- Keep commits atomic with descriptive messages.

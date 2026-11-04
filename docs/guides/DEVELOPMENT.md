# Development Guide

## Setup

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm, pnpm, or yarn
- Git

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd vestio-web

# Install dependencies
npm install
```

### Environment Configuration
Create `.env.local`:
```env
API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Development Workflow

### Running the Dev Server
```bash
npm run dev
```
Access at [http://localhost:3000](http://localhost:3000)

### Building
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```
Uses oxfmt for code formatting.

## Project Structure Tips

### Adding a New Page
1. Create route in `src/app/your-route/page.tsx`
2. Add any necessary components in `src/components/`
3. Add translations if needed
4. Update navigation if needed

### Adding an API Endpoint
1. Define types in `src/types/` if needed
2. Add endpoint function in `src/lib/api/index.ts`
3. Use `request()` helper
4. Export from `src/lib/api.ts` if needed for convenience

```typescript
// src/lib/api/index.ts
export const listingsApi = {
  getById: (id: string) => request<Listing>(`/listings/${id}`),
};
```

### Adding a Component
1. Decide if it's layout, home, shared, or feature-specific
2. Place in appropriate directory under `src/components/`
3. Follow component patterns (props interface, TypeScript)
4. Use translations for text
5. Follow design system

### Adding Translations
1. Find dictionary files in `src/i18n/dictionaries/`
2. Add keys to all locale dictionaries (fr, ar)
3. Use `useTranslations()` or `getTranslations()` to access

### Adding Server Actions
1. Create in `src/lib/actions/`
2. Use `'use server'` directive
3. Return `ActionResult<T>`
4. Handle errors with try/catch
5. Use in client components

## Debugging

### API Requests
The API layer logs all requests/responses in development:
```
[API Request] GET http://localhost:8080/listings | Payload Length: 0
[API Response] GET http://localhost:8080/listings | Status: 200 | Payload Length: 1234
```

### Auth Issues
- Check cookies in browser DevTools (Application > Cookies)
- Verify `AUTH_INDICATOR_COOKIE` is set
- Check network tab for 401 responses
- Use `isAuthenticated()` to debug client state

### i18n Issues
- Check locale cookie
- Verify dictionary has the key
- Check HTML lang/dir attributes
- Test both locales

### Styling Issues
- Check Tailwind classes are correct
- Verify design tokens in globals.css
- Use browser DevTools
- Test RTL layout

## Common Tasks

### Updating Design Tokens
Edit `src/app/globals.css` in the `@theme` section.

### Adding New Icons
Add to `src/components/shared/Icons.tsx` following existing pattern.

### Modifying Header
Edit `src/components/layout/Header.tsx`. Be careful about auth state and responsive behavior.

### Working with Forms
Use controlled components or Server Actions. See actions documentation.

## Tips & Tricks

- Use the TypeScript language server for autocomplete
- Leverage path aliases
- Check existing similar components before creating new ones
- Follow the patterns in the codebase
- Use skeleton components for better UX
- Test mobile view early and often
- Remember RTL support for Arabic

## Troubleshooting

### Build Errors
- Check TypeScript errors
- Verify all imports are correct
- Check for missing dependencies

### Hydration Errors
- Ensure client/server rendering is consistent
- Check for browser-only code without guards
- Verify cookies access patterns

### Auth Not Working
- Check cookie settings (httpOnly, secure, sameSite)
- Verify API is setting cookies correctly
- Check CORS configuration
- Ensure indicator cookie is accessible to client

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [AI_GUIDELINES.md](../../AI_GUIDELINES.md) - Design system guidelines

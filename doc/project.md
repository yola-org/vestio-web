# Vestio Web

Moroccan community marketplace for second-hand and new fashion. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and next-intl (FR/EN/AR, RTL).

## Tech Stack

- **Framework**: Next.js 16, App Router
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom tokens in `src/app/globals.css`
- **i18n**: next-intl — FR/EN/AR, RTL for Arabic
- **Formatting**: oxfmt

## Setup

Requires Node.js 22 (see `.mise.toml`).

```bash
npm install
```

Create `.env.local`:
```env
API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Optional AppSync endpoints for realtime (`NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT`, `NEXT_PUBLIC_APPSYNC_EVENTS_WEBSOCKET_ENDPOINT`) — see `.env.example`. Set `NEXT_PUBLIC_LISTING_ASSETS_BASE_URL` at build time to point at a custom CDN.

```bash
npm run dev        # localhost:3000
npm run build && npm run start
npx oxfmt --check .
```

## Project Structure

```
src/
├── app/           # App Router pages and layouts
├── components/    # UI components (layout/, home/, shared/, feature dirs)
├── constants/     # App constants (auth cookie names)
├── i18n/          # next-intl config and dictionaries
├── lib/
│   ├── api/       # HTTP client, error handling, endpoint definitions
│   ├── actions/   # Server actions
│   └── ...        # Auth helpers, category utils, event resolvers
└── types/         # TypeScript type definitions
```

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Layer](./api/API_LAYER.md)
- [Authentication](./modules/AUTH.md)
- [Internationalization](./modules/I18N.md)
- [Server Actions](./modules/ACTIONS.md)
- [Components](./components/COMPONENTS.md)
- [Best Practices](./guides/BEST_PRACTICES.md)
- [Development Guide](./guides/DEVELOPMENT.md)
- [Business behavior](./business.md)
- [Testing](./testing.md)
- [Styling](./styling.md)
- [AI Guidelines](./AI_GUIDELINES.md)

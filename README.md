# Vestio Web

Vestio is a Moroccan community marketplace for second-hand and new fashion. Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, and next-intl for internationalization (French/Arabic with RTL support).

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens in `src/app/globals.css`
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/) (FR/AR, RTL support)
- **Carousel**: [Embla Carousel](https://www.embla-carousel.com/)
- **Formatting/Linting**: [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)

## Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- pnpm/npm/yarn - check `package-lock.json`/`pnpm-lock.yaml` (project has both; use your preferred package manager consistently)

### Installation
```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Environment Variables
Create a `.env.local` file with at least:
```env
API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```
The API base URL is resolved as `process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'` (see `src/lib/api/request.ts`).

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build
```bash
npm run build
npm run start
```

### Lint/Format
```bash
npm run lint
npm run format
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages/layouts)
├── components/             # UI components
│   ├── layout/            # Header, Footer, navigation
│   ├── home/              # Landing page sections
│   ├── shared/            # Reusable components (Icons)
│   └── ...
├── constants/             # App constants (auth cookies, etc.)
├── i18n/                  # Internationalization config & dictionaries
├── lib/                   # Core utilities and integrations
│   ├── api/               # API client layer (request, call wrapper, errors)
│   ├── actions/           # Server actions
│   ├── api.ts             # API facade exports
│   ├── auth.ts            # Client auth helpers
│   └── category-utils.ts  # Category utilities
└── types/                 # TypeScript type definitions
```

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

- [Architecture Overview](./docs/ARCHITECTURE.md) - App structure, patterns, and design system
- [API Layer](./docs/api/API_LAYER.md) - HTTP client, error handling, auth flow
- [Authentication](./docs/modules/AUTH.md) - Auth state, cookies, flows
- [Internationalization (i18n)](./docs/modules/I18N.md) - next-intl setup, locales, RTL
- [Components Guide](./docs/components/COMPONENTS.md) - Component patterns and usage
- [Server Actions](./docs/modules/ACTIONS.md) - Server actions patterns
- [Best Practices](./docs/guides/BEST_PRACTICES.md) - Coding standards and guidelines
- [Development Guide](./docs/guides/DEVELOPMENT.md) - Setup, workflows, tips

Also see [AI_GUIDELINES.md](./AI_GUIDELINES.md) for design system and AI agent guidelines.

## Features

- **Multi-language**: French and Arabic with automatic RTL layout for Arabic
- **Authentication**: Cookie-based auth with refresh token handling
- **Marketplace**: Browse listings, categories, cities
- **Responsive Design**: Mobile-first with Tailwind CSS v4
- **Server Components**: Leverages Next.js App Router for optimal performance

## Contributing

See [Best Practices](./docs/guides/BEST_PRACTICES.md) for coding standards. Follow the patterns established in the codebase and refer to [AI_GUIDELINES.md](./AI_GUIDELINES.md) for design system rules.

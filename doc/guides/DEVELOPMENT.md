# Development Guide

## Setup

Node.js 22, then `npm install`. See [project.md](../project.md) for env vars.

## Common tasks

**New page** — add `src/app/your-route/page.tsx`, add translations, update navigation if needed.

**New API endpoint** — define the function in `src/lib/api/index.ts` using `request()`, export from `src/lib/api.ts` if convenient.

**New component** — pick the right directory (`layout/`, `home/`, `shared/`, or a feature dir), follow the props-interface pattern, use `useTranslations` for all text.

**New translation** — add keys to both `fr` and `ar` dictionaries in `src/i18n/dictionaries/`.

**New server action** — create in `src/lib/actions/`, use `'use server'`, return `ActionResult<T>`. See [ACTIONS.md](../modules/ACTIONS.md).

## Debugging

- **API**: the request layer logs every call in dev (`[API Request]` / `[API Response]`).
- **Auth**: check cookies in DevTools → Application → Cookies; look for `vestio_auth` indicator and 401s in the network tab.
- **i18n**: check locale cookie, verify dictionary key exists, inspect `lang`/`dir` on `<html>`.
- **Styling**: verify token names against `globals.css`; test RTL in Arabic locale.

## CI

CI runs `npx oxfmt --check .` (not `next lint`). Build before running e2e in CI mode — see [testing.md](../testing.md).

## Troubleshooting

- **Hydration errors**: guard browser-only code, verify consistent client/server render.
- **Auth not working**: check cookie `httpOnly`/`secure`/`sameSite`; confirm indicator cookie is readable client-side.
- **Build errors**: run `npx tsc --noEmit` to surface type errors first.

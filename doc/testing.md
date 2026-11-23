# Testing and mocks

## Running tests

Use Node.js 22 (`.mise.toml`), install dependencies, then install Chromium:

```bash
npm ci
npx playwright install chromium
npm run test:e2e
```

On a Linux machine missing browser libraries, use `npx playwright install --with-deps chromium`. Useful variants:

```bash
npm run test:e2e -- tests/e2e/header/notifications.spec.ts
npm run test:e2e -- --grep "owners can accept"
npm run test:e2e:ui
npm run test:e2e:headed
npx playwright show-report
npx tsc --noEmit
npx oxfmt --check .
```

`npm run lint` currently invokes the removed `next lint` command; CI uses the formatter check above. The Playwright config discovers `tests/e2e` only. To run the small metadata cache unit suite separately:

Create a temporary config in the repository root that imports the main config, overrides `testDir: "./tests/unit"`, and sets `webServer: undefined`, then run `npx playwright test --config=<that-file>`. Remove the temporary config afterward. There is currently no dedicated unit-test npm script.

## Process coordination

`playwright.config.ts` starts these processes in order and waits for readiness before launching tests:

| Process | Address | Purpose |
| --- | --- | --- |
| `node tests/mock-backend.mjs` | `http://localhost:8081/healthz` | In-memory REST backend and test seeding endpoints |
| Next.js | `http://localhost:3100` | Real application, including Server Actions and API routes |
| Chromium | Configured `baseURL` above | Browser interactions and assertions |

Both servers belong to the test run; existing servers are rejected. Local runs use two workers, `next dev --port 3100`, and `.next/e2e` as the output directory. Your ordinary development server can stay on port 3000. `NEXT_DIST_DIR` in `next.config.ts` supports the separate output directory.

The app receives `API_URL` and `NEXT_PUBLIC_API_URL` pointing to port 8081. Browser-side interception cannot replace backend calls performed inside Server Actions. The HTTP mock covers those server-to-server requests while retaining the real browser → Server Action → API path.

CI sets `CI=true`, runs one worker against `next start --port 3100`, forbids `test.only`, and retries failures twice. Build before reproducing CI locally:

```bash
npm run build
CI=true npm run test:e2e
```

Public environment variables are embedded at build time. For a custom production output directory, set the same `NEXT_DIST_DIR` for both build and test commands. The mock backend is not a deployed service and must never be exposed as a production API.

## Mock state and authentication

`tests/mock-backend.mjs` uses Node's HTTP server without backend dependencies. It implements metadata, authentication and refresh, profiles, listings, favorites, notifications, offers, and chat history. Responses must stay compatible with `src/lib/api/schemas.ts`, action contracts, and realtime validators. It keeps sockets alive for 90 seconds to avoid races when Next.js reuses an idle connection.

`tests/helpers/api-mock.ts` seeds the access, refresh, ID-token and authenticated-indicator cookies, plus the browser's prior-authentication marker. The normal shared token is `mock-access-token`; refresh produces `refreshed-access-token`. Keep cookie names synchronized with `src/constants/auth.ts`. Tests that exercise login or refresh should use the actual flows and intentionally invalid or absent cookies.

Notification, chat and offer scenarios create a token such as `notification-test-${randomUUID()}`, replace the access-token cookie, and seed the corresponding inbox using the same bearer token:

| Endpoint | Seed body |
| --- | --- |
| `POST /__test/notifications` | Array of notification records |
| `POST /__test/chats` | `{ chats, messages, senderId, ...options }` |
| `POST /__test/offers` | `{ items, delay?, failNext?, staleNext? }` |

`GET /__test/chats` and `GET /__test/offers` expose state for persistence and request-count assertions. Offer seeds use `direction: "received"` or `"sent"`. Failure/delay options test recovery, stale decisions, and duplicate-submit prevention. See the mock implementation for each supported option.

Inboxes are scoped by bearer token. Some listing and favorite fixtures are shared process state. Create unique IDs and titles for mutable scenarios; never delete or overwrite the three shared search listings. Keep fixture text distinct from seeded search titles, and clean up created records when the scenario allows it. Parallel tests must not reset global state while another test uses it. State is reset when the mock server restarts.

## Realtime coordination

Realtime specs in `tests/e2e/header/notifications.spec.ts` mock `/api/auth/realtime` and intercept the AppSync socket with `page.routeWebSocket`. They simulate connection acknowledgements, subscriptions, deliveries, duplicates, and reconnects; they do not need a live AWS connection.

These tests are conditionally skipped unless the required `NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT` and/or `NEXT_PUBLIC_APPSYNC_EVENTS_WEBSOCKET_ENDPOINT` variables exist in the Playwright process. Values in `.env.local` are loaded by Next.js, but are not automatically loaded into the Playwright runner. Supply matching variables to both processes, and to the production build when testing CI. Namespace defaults are `notifications` and `chat`.

A realtime event should be seeded into REST history before socket emission so reconnect and refetch see the same state. Use valid JWT-shaped claims for the mocked realtime session. Maintain both envelope and payload IDs and timestamps. Tests focused on saved state can intercept `/api/auth/realtime` with a 401 to avoid starting a socket without invalidating the backend session.

## Assertions and troubleshooting

- Use role/name locators and scope them to the current dialog, navigation, or visible page. Next.js can retain hidden page trees; raw CSS and text locators may match those too.
- Offers, chats, and notification history open in panels. `/offers`, `/offers/sent`, `/offers/received`, `/chats`, and `/chats/:id` are removed page paths. Open the header trigger and use panel buttons instead.
- Panels preserve the background URL and restore their state after reload. Assert the restored dialog before interacting; the modal blocks clicks on the background header.
- Use web-first assertions and `expect.poll` for asynchronous state. Use `page.clock` for notification expiry, midnight, and DST checks instead of real sleeps.
- Verify backend state after mutations, including read flags and offer action counts. Do not replace persistence checks with only a success toast.
- Metadata is shared among mounted components. Wait for the first observed metadata response before asserting its count, then ensure navigation does not trigger another browser metadata load.
- Session-expired failures across unrelated tests often mean the app is connected to the wrong backend. Check the isolated server environment before changing authentication expectations.
- Inspect `playwright-report/` and `test-results/`: screenshots are captured on failures and traces on the first retry. These generated artifacts are ignored by Git.

Some additional tests are currently ignored by the repository-wide `tests/` rule even though tracked tests still run. Check `git status --short --ignored tests` when adding or editing a spec; a successful local run does not mean an ignored new file will be included in a commit.

## Maintaining coverage

Keep user flows in `tests/e2e`, shared interactions in `tests/pages`, session helpers in `tests/helpers`, and reusable sample envelopes in `tests/fixtures`. Extend the HTTP mock when the backend contract changes, then cover the actual browser flow and important failure cases. Add translations and RTL/mobile cases when a feature changes localized layout or navigation. Update this guide when process coordination, ports, seeding contracts, or test commands change.

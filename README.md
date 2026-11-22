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

Listing images use the public S3 endpoint for `vestio-dev-assets` in local development and `vestio-assets` in production builds. Set `NEXT_PUBLIC_LISTING_ASSETS_BASE_URL` at build time to point a deployment at a different bucket or CDN.

### Development
AppSync event logging is optional. Set `NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT`
and `NEXT_PUBLIC_APPSYNC_EVENTS_WEBSOCKET_ENDPOINT` in `.env.local` (see
`.env.example`), then restart the dev server. The namespace variables default to
`notifications` and `chat`. Logged-in clients use the backend-issued access token
to listen on `/<namespace>/<userId>` and log `APPSYNC_EVENT` in the browser
console. Logged-out clients skip the connection.

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

The authenticated header shows a notification bell on desktop and mobile. Incoming
`notification` events match the common envelope (`id`, `type`,
`payload`, and `occurredAt`) and are deduplicated by notification UUID.
The bell loads saved history from `/api/notifications` through authenticated
server actions, with pagination and a server-supplied unread count. Reading one
notification or marking all read persists to the backend. AppSync events update
the bell immediately; reconnecting or focusing the window refreshes saved state.
Changing authentication clears the current inbox before loading the new one.
Every AppSync data event, including other event types, is logged as
`APPSYNC_EVENT` in the browser console using the existing sanitized logger.

Listing notifications distinguish `listing-created` (waiting for images) from
`listing-published` (all renditions processed and the listing is available). Ready
notifications link to the published listing; the pending-listings view refreshes
when it receives a ready notification. The optional listing ID is a notification field; display data is in its JSON payload.

Offer notifications use `offer-sent` with the shared `OfferSentPayload` fields:
`offerId`, numeric `amount`, `senderId`, `senderName` and `listingTitle`. The bell
shows a localized amount, the sender name and listing, and links to received
offers. The received-offers view refreshes when a new notification arrives.
Saved history and live events use the same rendering and deduplication behavior.

Chat events follow `ChatEvent` in `vestio-common:0.7.0`: `{id, type: "chat", payload, occurredAt}`.
The event ID must equal the message ID. The payload matches `MessageDto` and is
validated as a regular or system message before use. `/chats` lists conversations
with the latest message; `/chats/{id}` displays paginated history and sends text
through authenticated server actions. The header Messages shortcut opens the inbox, and
accepted-offer notifications open the corresponding conversation. French and Arabic
system messages are rendered from `systemType` and `params`, with a generic fallback
for unsupported types. UTC timestamps are displayed in the browser timezone.
The realtime provider deduplicates chat events and refreshes the current chat/list
from persisted REST data after events, reconnects, focus and online recovery.
Authentication changes clear cached events and remount the chat inbox to discard
previous-session requests and data.

Event presentation is resolved in `src/components/events/resolvers`: notification
rules produce content and navigation actions; chat rules produce message content
and sender details for both history and previews. Generic notification/message
items own layout and interaction controls. `src/lib/events/realtime-event-resolver.ts`
validates and normalizes incoming notification/chat envelopes before the realtime
provider updates state. Add new event-specific rendering in these resolvers.

The chat inbox uses a two-pane desktop layout: the paginated conversation list
stays visible beside the selected thread. On mobile, the list and thread occupy
one pane at a time, with a back control. Listing covers use the backend’s nullable
`listingCoverAssetKey` and the existing thumbnail URL/fallback conventions. The
composer stays at the bottom while history scrolls; Enter sends and Shift+Enter
adds a line. Message ownership comes from the authenticated profile, with
distinct incoming/outgoing bubbles and the same event resolvers as previews.

Live notification and incoming-chat events also appear in the shared notification
provider as dismissible bottom-right alerts for eight seconds. Timers pause during
hover or keyboard focus; the three most recent unique alerts are visible with a six-pixel vertical gap.
New alerts replace the oldest visible one when all three slots are occupied. Local success/error/info alerts deduplicate by type and text or
translation key; live alerts deduplicate by event ID. Duplicate alerts do not
restart an existing timer. Event IDs prevent duplicate alerts and counts. Saved history loads silently,
and self-sent chat messages do not trigger alerts or unread badges.
The notification bell uses the persisted server unread count. Chat and per-thread
badges track incoming events in this browser tab, stored in sessionStorage per
user (they are not a server-backed, cross-device unread history). A focused, visible
conversation clears its count once its latest messages load successfully. Mobile
shows the chat count on the menu and Messages shortcut. Authentication changes
clear visible alerts and activity before loading the next user's counts.

The chat header and inbox live in the persistent `/chats` layout. Conversation
selection within the inbox uses native history updates integrated with Next.js;
only the conversation panel changes. Sidebar state survives switching, browser
Back/Forward restores selection, and deep links still load the requested chat.
Ordinary modified clicks retain normal new-tab behavior.

Within each history page, consecutive regular messages from the same sender are
grouped under one sender label and a timestamp for the last message, with each
message retaining its own bubble.
Each group spans at most ten minutes from its first message (including the exact
ten-minute boundary). Sender changes and system messages always start a new group.
The grouping helper and resolver build the groups outside the chat UI components;
saved messages, previews and realtime event payloads retain their original records.

Chat rows fill the sidebar with inline content padding, extra top/bottom list
spacing and a full-width gray selected background without rounded selection cards. Summary dates show localized Today,
Yesterday or a relative number of days. Inside conversations, timestamps show
Today/Yesterday at HH:MM, or DD/MM at HH:MM for older dates. Chat date calculations
use local calendar days (including DST), update each minute and on focus, and
preserve the original UTC instant in the time element. Full dates remain available
in the timestamp tooltip. Notification history keeps its existing date format.

Chat shortcuts from the header, notification inbox and live alerts
open one global slide-in chat dialog over the current page. Selecting threads or
returning to its list keeps the background URL and page state intact. Browser Back
closes the panel and Forward restores it; Escape, the backdrop and the close button
also dismiss it. The native dialog traps focus, restores the trigger on close,
locks background scrolling and fills the screen on mobile. Alert portal containers
move into the dialog's top layer without remounting alerts or restarting timers.
Direct `/chats` URLs remain available for bookmarks and modified/new-tab clicks.

The authenticated header groups Offers (a labeled icon), Messages and Notifications
before the account control and Sell action. Favorites is in the account dropdown;
Offers and Messages remain outside that dropdown. Mobile shortcuts expose Offers
and Messages, with Favorites inside the expandable account menu.

### Listing filters

Search and category pages use React Select dropdowns with searchable checkbox options
and selected-value chips for multiple cities, sizes,
item conditions, and contact types. Color swatches also support multiple selections.
Forms use the `colors`, `cityIds`, `sizeIds`, `conditions`,
and `contactTypes` parameters; shared links accept repeated or comma-separated
values. Each filter matches any selected value, and different filters combine.
Selections persist through reloads, pagination, and header searches. Changing the
category retains sizes that apply to the new category and clears incompatible
sizes. Leaving a dropdown empty applies no restriction for that group.

The category filter uses a searchable, single-select React Select dropdown grouped
by parent category. Parent categories and their descendants remain selectable;
clearing the selection returns to all categories.

### Shared form controls

Use `Field`, `Input`, `Textarea`, `Checkbox`, `NativeSelect`, and `SelectInput`
from `@/components/shared/forms` for standard form controls. Their visual tokens
live in `src/components/shared/forms/styles.ts`; update that file to change
borders, typography, spacing, focus, disabled, and validation styling together.
`Field` assigns a stable input ID and connects its label, description, and error
to the nested control. Pass an explicit `id` when an existing identifier matters.

```tsx
import { Field, Input, SelectInput } from "@/components/shared/forms"

<Field label="Email" description="Used for your account" error={emailError}>
  <Input type="email" name="email" required />
</Field>

<SelectInput name="category" label="Category" options={categoryGroups}
  value={category} onChange={setCategory} />
<SelectInput multiple name="cityIds" label="Cities" options={cities}
  value={cityIds} onChange={setCityIds} />
```

Select options use `{ value, label }`; groups use `{ label, options }`.
`SelectInput` handles search, localization, RTL, clearing, and form serialization
for both modes. `MultiSelect` and `CategorySelect` are thin adapters that keep
screen-specific configuration outside the shared presentation. Standard fields
in login, registration, settings, listing creation, and offers use these controls.

### Profile photos

Settings includes an immediate profile-photo upload (JPEG, PNG or WebP, up to
10 MB). Photos appear in Settings, the profile and the account menu. Uploads call
`POST /api/profile/image` as multipart data and refresh the account display
cookie; the backend writes directly to S3 without the listing optimization queue.
The profile photo button opens the upload section in Settings. Failed replacements
keep the previous photo, and unsupported or oversized files are rejected.

Profile and listing images share the configured assets origin
(`NEXT_PUBLIC_LISTING_ASSETS_BASE_URL`, with the existing environment defaults).
The infrastructure profile-image read policy must be deployed for public avatar
URLs to load. `profileImageKey` is relative (`{userId}/profile/{assetId}.png`)
in profile and login display-name data; the frontend adds `users/` to build the
public asset URL.

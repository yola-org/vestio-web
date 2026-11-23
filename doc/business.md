# Business behavior

This document describes the behavior implemented in the web client. The backend owns authorization, persistence, and valid state transitions. Mock responses and browser checks do not replace those guarantees.

## Product and participants

Vestio is a Moroccan community marketplace for second-hand and new fashion and related categories. People browse by category and city, publish listings, negotiate offers, and discuss accepted offers. French, English and Arabic are supported, including right-to-left layout for Arabic. Prices are normally presented in Moroccan dirhams; accepted-offer events may carry an explicit currency.

A visitor can discover and search listings and view a public listing detail. Authentication enables personal features such as favorites, listing publication and management, offers, chat, notifications, and profile settings. Listing owners see management controls where buyers see offer actions. Client-side visibility is a usability rule; server actions and backend ownership checks must still authorize every mutation.

## Discovery

`/welcome` presents discovery content; `/` adapts to authentication. `/search` and `/categories/[...slugs]` provide filtered browsing. Filters include query, city, category, price range, size, condition, color, contact mode, and gender where supported.

Category URLs use readable paths. Legacy category identifiers and repeated filter parameters are normalized while preserving selections. Parent categories can include descendants. Size options follow the selected category's applicable size groups; changing category preserves compatible sizes and clears incompatible selections.

Multiple values within a filter represent alternatives. The current header city control selects one city and replaces that part of the search; the filter panel supports multiple cities. Other active filters should survive a header search. The price slider supports an unrestricted maximum and preserves saved high or fractional values. Pagination retains filters and provides a way back from an empty shared page.

## Listings and favorites

A listing includes a title, description, price, category, city selections, condition, contact modes, optional sizes/colors, quantity, and image assets. Domain values are defined in `src/lib/api/schemas.ts`; UI labels come from the dictionaries. Contact modes include `MEETUP`, `DELIVERY`, and `PARCEL`.

Creation and publication are separate steps. `listing-created` indicates pending image preparation. `listing-published` indicates the listing is ready and available. The pending-listings view refreshes when publication events arrive. Image keys resolve to listing renditions with fallbacks when a cover is absent or unavailable.

Owner management supports opening a Manage menu, editing prefilled details, and deleting with explicit confirmation. Successful deletion returns to the profile. Guests cannot use the edit form. Keep mutations scoped to the selected listing and preserve backend errors in the UI.

Favorites are persisted through authenticated API operations and remain saved after reload. Guests opening `/favorites` are sent to login. The account menu provides the favorites link on desktop and mobile. Removing the final favorite shows the empty state and a link back to browsing.

## Offers

A buyer submits an amount and supported contact/delivery choices for a listing, with an optional message. The offers panel separates received and sent offers. A seller can accept or refuse a pending received offer. A buyer can edit or cancel a pending sent offer. Completed offers do not retain pending-action controls.

Mutations disable duplicate submissions while a request is in flight. A recoverable request failure leaves actions available for retry. A backend `ERR_OFFER_NOT_PENDING` response means the displayed state is stale; refresh persisted state instead of applying another decision locally.

Acceptance enables a conversation between buyer and owner. `offer-sent` and `offer-accepted` notifications carry structured display data. Render amounts, names and listing titles through the shared resolvers and locale-aware formatters. Invalid or unsupported event payloads use a generic fallback without an unsafe action.

## Panels and chat

Offers, chat and notification history are panels over the current page. They preserve the underlying page and URL, coordinate browser Back/Forward, restore panel state on reload, and return focus on dismissal. `/chats`, `/chats/:id`, `/offers`, `/offers/sent`, and `/offers/received` are removed page routes and return 404; navigation should use panel actions.

Chat provides persisted conversation lists, paginated messages, system messages, and text sending through authenticated Server Actions. Desktop shows a list beside the selected conversation. Mobile shows one pane at a time and provides a back-to-conversations control. Enter sends; Shift+Enter adds a line.

Consecutive regular messages from the same sender share one sender label and timestamp while retaining individual bubbles. A group spans at most ten minutes from its first message; sender changes and system messages start a new group. Timestamps originate in UTC and are displayed in the browser timezone, with local today/yesterday/date labels.

## Notifications and realtime

Saved notification history and read status are backend state. The bell uses the server's unread count; read-one and read-all operations persist. Received-offer badges account for unread offer notifications beyond the first page of general history, and viewed offers can be marked read.

AppSync events complement REST state. Validated event IDs deduplicate repeated delivery. Reconnect, window focus, and online recovery refresh persisted data. New events should not erase loaded history. Authentication changes clear prior-user activity and invalidate previous-session work.

Live notification and incoming-chat events can show dismissible alerts for eight seconds. Hover or keyboard focus pauses expiry. At most three unique alerts are visible; a new one replaces the oldest without resetting surviving timers. Saved-history loads are silent, and self-sent chat messages do not create incoming-message alerts.

Chat unread counts are browser-tab state stored in `sessionStorage` per user, rather than a server-backed cross-device history. Viewing a focused, visible conversation clears its count after messages successfully load. Preserve that distinction when adding badges or analytics.

## Accounts and boundaries

Authentication uses access and refresh cookies, plus an authenticated indicator for UI state. Expired or missing access tokens can be renewed with a valid refresh token. Rejected refresh credentials clear the session; protected flows redirect or request sign-in. Profile editing includes preferences, city and profile-image upload, with validation and visible failure recovery.

The web client contains no checkout/payment flow among its current app routes. Do not infer payment completion, escrow, delivery fulfillment, revenue rules, or moderation guarantees from offer acceptance. Define new product rules with backend contracts and relevant tests before presenting them as implemented behavior.

## Implementation references

- `src/lib/api/schemas.ts`: domain shapes and enums.
- `src/lib/actions/`: authenticated mutations and public reads.
- `src/components/events/resolvers/`: event wording and action targets.
- `src/lib/events/realtime-event-resolver.ts`: event validation.
- `src/components/shared/RealtimeProvider.tsx`: realtime coordination.
- Feature panel providers: focus, dismissal, history and session lifecycle.
- [testing.md](testing.md): mocks, persistence assertions, and regression coverage.

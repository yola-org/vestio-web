# Styling

## Sources and visual direction

The application uses Tailwind CSS v4 with theme tokens and shared CSS in `src/app/globals.css`. Use the existing shared components before adding another variation. [AI_GUIDELINES.md](AI_GUIDELINES.md) contains the broader visual direction; this guide describes the current implementation.

Vestio combines warm backgrounds, dark text, expressive fashion photography, bold headings, rounded controls, and restrained accent colors. Layouts must work in French, English, and Arabic, on narrow mobile screens and desktop.

## Colors

Use semantic Tailwind classes from `@theme` instead of repeating hex values:

| Token | Value | Typical use |
| --- | --- | --- |
| `background` | `#f7f3ea` | Page canvas |
| `primary` | `#151515` | Text and dark surfaces |
| `accent` | `#ff5d39` | Highlighted actions, badges, selection |
| `deep-accent` | `#173fdb` | Links, focus, prominent controls |
| `sub-accent` | `#d8f05e` | Contrasting highlights |
| `muted-accent` | `#b8c7ba` | Muted decorative surfaces |

Examples: `bg-background`, `text-primary`, `text-accent`, `border-primary/10`, and `focus-visible:outline-accent`. Category tokens are `femme`, `homme`, `enfant`, `chaussures`, `sacs`, and `traditionnel`; use them for category presentation without treating the color as the only label. Shared token changes belong in `globals.css`.

## Typography and spacing

`font-sans` uses DM Sans for body text and controls. `font-display` uses Manrope; the base layer applies it to `h1`–`h3`. Arabic body text and headings use Cairo. Fonts are currently imported from Google Fonts in `globals.css`.

Use semantic heading levels, readable line heights, and the existing weight hierarchy. Large display titles may use tighter tracking; the RTL stylesheet resets tracking utilities for Arabic. Avoid assuming translated copy has the same length. Use `min-w-0`, wrapping, and deliberate truncation for constrained previews; full descriptions should remain readable.

`.main-container` centers content with a 1440px maximum width and horizontal padding of `px-5 lg:px-10`. `.content-padding` supplies matching padding without centering or a width limit. Reuse these utilities to align headers, content, and footers. Prefer the Tailwind spacing scale and shared control sizes over arbitrary dimensions.

## Shared components

| Area | Implementation |
| --- | --- |
| Buttons, icons, modals, skeletons | `src/components/shared/` |
| Labels, inputs, checkboxes, selects | `src/components/shared/forms/` |
| Multiple selections | `src/components/shared/MultiSelect.tsx` |
| Header action styles | `src/components/layout/header-styles.ts` |
| Listing cards and grids | `src/components/listings/`, `src/components/home/` |
| Participant avatars and listing covers | `ParticipantListingCover`, `ProfileAvatar`, `ChatCover` |
| Chat, offer and notification panels | Respective feature directories |

Form controls share base styles from `shared/forms/styles.ts`. `SelectInput` uses react-select for single and multiple selection, with accessible labels and checkbox-style multiple options. Use existing controls so keyboard navigation, error presentation, direction, and submitted values remain consistent.

Primary and secondary buttons generally use rounded-full shapes, bold labels, and distinct hover, focus, loading, and disabled states. Use the existing `Button` or feature control where its behavior fits. Icons come from the existing SVG icon components; decorative icons should not duplicate the control's accessible label.

## Responsive behavior and RTL

Build mobile first. The header changes at `lg`; chat list/conversation visibility uses its own responsive layout. Check the relevant component instead of assuming every feature shares one breakpoint. Test at approximately 390×844 and a desktop viewport, with long translated labels and content.

Use logical utilities such as `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, and `text-start`. Use `rtl:` only when a directional exception is required. The stylesheet mirrors `[data-icon='arrow']` via `scale`; avoid applying another reversal to an already mirrored icon. Locale changes update both `lang` and `dir`.

## Panels, overlays and alerts

Chat, offers, and notification history use modal panels over the current page. The background stays mounted and the URL stays unchanged. Panel providers coordinate which panel is open and preserve browser history state. Reuse their controls and providers rather than introducing a parallel overlay mechanism.

Panel CSS uses a 220ms horizontal entry/exit animation, with the offset reversed for RTL. Reduced-motion media rules shorten transitions and panel entry animation. Keep keyboard focus inside dialogs, provide a labeled close control, support Escape, lock background scrolling, and restore focus to the trigger on dismissal.

Shared toast rendering owns placement, stacking, dismissal, and timer behavior. Keep event-specific wording in the resolvers; avoid separate notification styling for each event type. Native modal content and notification overlays need to stay in the same top-layer context, which the current providers coordinate.

## Before finishing a styling change

Check French, English and Arabic; mobile and desktop; keyboard navigation and visible focus; loading, empty, error and disabled states; and horizontal overflow. Verify that image failures have a useful fallback and content remains usable with reduced motion. Run the relevant Playwright flow described in [testing.md](testing.md). Add screenshots when they help review an intentional layout change, but avoid tests that only duplicate CSS values without protecting meaningful behavior.

# Components

## Directory structure

```
src/components/
├── layout/       # Header, Footer, LanguageSwitcher, UserDropdown, skeletons
├── home/         # Landing page sections; static data in constants.ts
├── shared/       # Icons, Button, shared form controls (forms/)
├── listings/     # Listing cards, grids, detail, filters
├── events/       # Event resolvers (notification and chat wording/actions)
├── offers/       # Offer panel, offer items
├── chats/        # Chat panel, conversation list, thread, composer
└── ...           # Other feature directories
```

## Rules

- Default to Server Components. Add `'use client'` only for interactivity, hooks, or browser APIs.
- Define a TypeScript interface for every component's props.
- All user-facing text through `useTranslations` / `getTranslations`.
- Use `className` prop for style customization where it makes sense.

## Shared form controls

Use `Field`, `Input`, `Textarea`, `Checkbox`, `NativeSelect`, and `SelectInput` from `src/components/shared/forms/`. Visual tokens are in `forms/styles.ts` — update there to change borders, focus, disabled, and validation styling globally. `SelectInput` handles single and multiple selection, RTL, and form serialization.

## Panels

Chat, offers, and notification history are modal panels over the current page, not separate routes. Use the existing panel providers and controls — don't add a parallel overlay mechanism.

## Icons

Custom SVG icons in `src/components/shared/Icons.tsx`. Avoid adding icon libraries. Decorative icons must not duplicate the accessible label of their control.

## Styling

Follow [styling.md](../styling.md) and [AI_GUIDELINES.md](../AI_GUIDELINES.md). Semantic token classes only (`bg-background`, `text-accent`, etc.); no hardcoded hex values.

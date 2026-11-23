# Vestio AI Design System & Guidelines

This document provides context and rules for AI agents working on the Vestio project. Vestio is a Moroccan community marketplace for second-hand and new fashion.

## 1. Brand Identity
- **Name:** Vestio
- **Concept:** Moroccan fashion community, circular economy, style, and authenticity.
- **Tone:** Modern, bold, premium yet accessible, deeply rooted in Moroccan urban culture.

## 2. Color Palette

The project uses a sophisticated palette defined as Tailwind CSS variables in `src/app/globals.css`. Always use the semantic variable names instead of hardcoded hex codes.

### Core Colors
- **Main Background:** `var(--color-background)` (`#f7f3ea`) - Use `bg-background`.
- **Primary Text:** `var(--color-primary)` (`#151515`) - Use `text-primary`.
- **Accent (Primary Action):** `var(--color-accent)` (`#ff5d39`) - Use `bg-accent`, `text-accent`, etc.
- **Sub-Accent (High Contrast):** `var(--color-sub-accent)` (`#d8f05e`) - Use `bg-sub-accent`.
- **Muted Accent:** `var(--color-muted-accent)` (`#b8c7ba`) - Use `bg-muted-accent`.
- **Deep Accent:** `var(--color-deep-accent)` (`#173fdb`) - Use `bg-deep-accent` or `text-deep-accent`.

### Category Colors
Used for category-specific UI elements (e.g., `bg-femme`):
- Femme: `#e3b7a8` (`--color-femme`)
- Homme: `#b8c7ba` (`--color-homme`)
- Enfant: `#d3bd98` (`--color-enfant`)
- Chaussures: `#a9b7c0` (`--color-chaussures`)
- Sacs: `#c4a58e` (`--color-sacs`)
- Traditionnel: `#bcc3a1` (`--color-traditionnel`)

## 3. Typography
The project uses two primary Google Fonts defined in `@theme`:
- **Display (Headings):** `Manrope` (`font-display`).
  - Used for `h1`, `h2`, `h3`, and big bold statements.
  - Often paired with `tracking-[-0.05em]` or tighter.
  - Used with `uppercase` and `font-black` for maximum impact.
- **Sans (Body/System):** `DM Sans` (`font-sans`).
  - Used for body text, descriptions, and UI elements.
  - Set as default on `body`.

## 4. UI Patterns & Spacing

### Buttons
- **Primary:** Rounded-full, `bg-[#ff5d39]`, white text, bold.
- **Secondary:** Rounded-full, bordered, with backdrop-blur.
- **Hover effects:** Subtle translations `hover:-translate-y-0.5` and slight color shifts.

### Grid & Layout
- **Container Widths:** 
  - Hero: `w-full` (mobile/tablet) -> `lg:max-w-[1440px]` (large screens).
  - Sections: Usually `max-w-[1600px]` for full-width feel on large monitors.
- **Spacing:** Large vertical paddings (`py-16` to `py-24`) to maintain a premium, airy feel.
- **Selection:** `selection:bg-[#ff5d39] selection:text-white`.

## 5. Components Architecture
- **Location:** `src/components/`
- **Sub-folders:**
  - `layout/`: `Header`, `Footer`.
  - `home/`: Modular sections for the landing page.
  - `shared/`: Reusable small components like `Icons`.
- **Constants:** `src/components/home/constants.ts` stores static data, images, and category definitions. Use this to keep logic clean.

## 6. Development Rules
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS v4 (using `@theme` in `globals.css`).
- **Icons:** Custom SVG icons in `Icons.tsx`. Avoid adding heavy icon libraries unless necessary.
- **Images:** High-quality photography from Unsplash, typically with Moroccan or fashion context.
- **Responsive:** Mobile-first approach. Pay attention to `clamp()` for fluid typography in headings.

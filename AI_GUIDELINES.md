# Vestio AI Design System & Guidelines

This document provides context and rules for AI agents working on the Vestio project. Vestio is a Moroccan community marketplace for second-hand and new fashion.

## 1. Brand Identity
- **Name:** Vestio
- **Concept:** Moroccan fashion community, circular economy, style, and authenticity.
- **Tone:** Modern, bold, premium yet accessible, deeply rooted in Moroccan urban culture.

## 2. Color Palette

The project uses a sophisticated palette with specific hex codes. Avoid using generic colors.

### Core Colors
- **Main Background:** `#f7f3ea` (Cream/Off-white) - Use for page backgrounds.
- **Primary Text:** `#151515` (Deep Black/Charcoal) - For all main readability.
- **Accent (Primary Action):** `#ff5d39` (Burnt Orange) - For CTA buttons, selection background, and key highlights.
- **Sub-Accent (High Contrast):** `#d8f05e` (Lime Green) - For secondary highlights, specifically on dark backgrounds.
- **Muted Accent:** `#b8c7ba` (Sage Green) - For marquee backgrounds and softer sections.
- **Deep Accent:** `#173fdb` (Royal Blue) - Used for high-impact sections like Call to Action.

### Category/Tone Colors (Muted Earth Tones)
Used for category backgrounds and specific UI elements:
- Femme: `#e3b7a8` (Terracotta/Blush)
- Homme: `#b8c7ba` (Sage)
- Enfant: `#d3bd98` (Sand)
- Chaussures: `#a9b7c0` (Slate Blue)
- Sacs: `#c4a58e` (Tan)
- Traditionnel: `#bcc3a1` (Olive)

## 3. Typography
The project uses two primary Google Fonts:
- **Display (Headings):** `Manrope` (font-weight 700-800).
  - Used for `h1`, `h2`, `h3`, and big bold statements.
  - Often paired with `tracking-[-0.05em]` or tighter.
  - Used with `uppercase` and `font-black` for maximum impact.
- **Sans (Body/System):** `DM Sans` (font-weight 400-700).
  - Used for body text, descriptions, and UI elements.

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

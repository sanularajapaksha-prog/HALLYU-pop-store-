# Proposal: 001-frontend-foundation

## What

Scaffold a Next.js 15 (App Router) + TypeScript + Tailwind project for the
K-pop marketplace storefront, and implement the design token system
(colors, typography, spacing, radii) defined in `kpop_marketplace_design_system.md`
§4–9. No product/commerce features yet — this change only establishes the
foundation everything else builds on.

## Why

- §46 (MVP Feature Priorities) lists "Design tokens" and "Typography" as the
  first two Phase 1 items, before any component work.
- §48 (Implementation Order) explicitly puts tokens/typography before
  Button/Badge/Input, before Navbar, before ProductCard.
- Building components against ad-hoc styles first and retrofitting tokens
  later would mean rewriting every component's classes twice.

## Scope

**In scope:**
- `create-next-app` scaffold: TypeScript, Tailwind, App Router, `src/` dir.
- `next/font/google` setup for Inter (UI) + Space Grotesk (display), per §4.
- `tailwind.config.ts` extended with color tokens (§6), spacing scale (§7),
  border radii (§8) — light mode only for this change (dark mode tokens
  exist in the doc's tables but are out of scope until theming is requested).
- `globals.css` base layer (background/foreground, font application).
- A `/design-tokens` verification page rendering the palette, type scale,
  spacing scale, and radii so the tokens are visually checkable before
  anything is built on top of them.

**Out of scope (future changes):**
- UI primitives (Button/Badge/Input) — change 002.
- Navbar/MobileNav — change 003.
- ProductCard/ProductGrid + mock data — change 004.
- Homepage assembly — change 005.
- Dark mode — not in the doc's MVP priorities (§46), deferred until asked.

## Risk

Low. No external dependencies beyond npm packages already on the allowed
network (registry.npmjs.org). No backend/data model involved yet.

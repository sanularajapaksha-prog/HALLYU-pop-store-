# Tasks: 001-frontend-foundation

## Wave 1

- [ ] T1 — Scaffold Next.js 15 project (TypeScript, Tailwind, App Router, `src/` dir, ESLint). Confirm Tailwind major version installed. **Files:** whole project skeleton. **Depends:** none.

## Wave 2 (parallel, both depend on T1)

- [ ] T2 — Install `@fontsource/inter` + `@fontsource/space-grotesk`, wire into `src/app/layout.tsx`, define `font-sans` / `font-display` utilities. **Files:** `layout.tsx`, `package.json`. **Depends:** T1.
- [ ] T3 — Write token theme (`globals.css` `@theme` block or `tailwind.config.ts`, per confirmed Tailwind version) for colors (§6), spacing (§7), radii (§8). **Files:** `globals.css`, `tailwind.config.ts` (if applicable), `src/lib/tokens.ts`. **Depends:** T1.

## Wave 3 (depends on T2 + T3)

- [ ] T4 — Build `/design-tokens` verification page rendering all colors, type scale, spacing scale, radii per spec.md AC2–AC5. **Files:** `src/app/design-tokens/page.tsx`. **Depends:** T2, T3.

## Wave 4

- [ ] T5 — Verify: `npm run build` exits 0 (AC1); manual visual check of `/design-tokens` output against doc §5–9. **Files:** none (verification only). **Depends:** T4.

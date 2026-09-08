# Tasks: 001-frontend-foundation

## Wave 1

- [x] T1 — Scaffold Next.js 15 project (TypeScript, Tailwind, App Router, `src/` dir, ESLint). Confirm Tailwind major version installed. **Files:** whole project skeleton. **Depends:** none.
  - Confirmed: Tailwind v4 (CSS-first `@theme inline`, no `tailwind.config.ts`) — design.md's contingency path is the one in effect.
  - `npm run build` fails on default scaffold: `next/font/google` (Geist/Geist Mono) can't reach `fonts.googleapis.com` — matches spec.md EC1 exactly. Resolved by T2 (fontsource swap), not a T1 defect.

## Wave 2 (parallel, both depend on T1)

- [x] T2 — Install `@fontsource/inter` + `@fontsource/space-grotesk`, wire into `src/app/layout.tsx`, define `font-sans` / `font-display` utilities. **Files:** `layout.tsx`, `package.json`. **Depends:** T1.
  - Only 400/500/600 weight files imported (matches doc's actual usage — no 100-900 bloat).
- [x] T3 — Write token theme (Tailwind v4 `@theme inline` block in `globals.css`, confirmed no `tailwind.config.ts` needed) for colors (§6), radii (§8), fonts (§4). **Files:** `globals.css`, `src/lib/tokens.ts`. **Depends:** T1.
  - Spacing (§7) needed **no override** — Tailwind v4's default 4px-multiplier scale already matches the doc's sequence exactly; documented in a comment instead of duplicated.
  - Type scale (§5) implemented as `@utility` classes (mobile-first, desktop step-up at `md:` 768px) since it's outside plain color/radius theme tokens — **flagging the `md:` breakpoint as my assumption**, since §5 only gives Desktop/Mobile columns with no explicit breakpoint, and §40 shows Tablet as a distinct 640–1024px band with no scale values of its own.

## Wave 3 (depends on T2 + T3)

- [x] T4 — Build `/design-tokens` verification page rendering all colors, type scale, spacing scale, radii per spec.md AC2–AC5. **Files:** `src/app/design-tokens/page.tsx`. **Depends:** T2, T3.
  - Also replaced scaffold's default `src/app/page.tsx` (Vercel/Next boilerplate) with a minimal placeholder linking to `/design-tokens`, per design.md's file map.

## Wave 4

- [x] T5 — Verify: `npm run build` exits 0 (AC1) — PASS. `npm run lint` — PASS, 0 errors. Started `next start`, curled `/design-tokens`, confirmed structurally: all 6 core + accent + 4 semantic hex values present (AC2), all 12 type-scale token names present (AC3), Space Grotesk applied to display/heading utilities and Inter to body/caption (AC4), all 5 `rounded-*` radius classes generated correctly from custom `--radius-*` theme tokens confirming the token→utility pipeline works end-to-end (AC5). **Files:** none (verification only). **Depends:** T4.
  - **Unverified:** pixel-exact visual check (does 72px actually *look* like the doc's hero size) — this sandbox has no headless browser/screenshot tool, so verification was structural (HTML/class inspection via curl), not visual. Recommend a quick `npm run dev` + eyeball check on your end before building on top of these tokens.

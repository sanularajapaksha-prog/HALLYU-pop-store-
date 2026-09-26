# Tasks: Skill-Driven Revamp

**Change:** 006-skill-driven-revamp
**Created:** 2026-09-23
**Total Tasks:** 12

## Summary

12 tasks in 5 waves. Wave 1 fixes live 404s and the class of bug that produced
them. Wave 2 is the point of the change — three agents, each *invoking* its
skill rather than following a paraphrase. Wave 3 is cleanup and making the 19
existing self-checks executable. Waves 4–5 gate and verify.

**Task count is deliberately low.** Guardrail Rule 2: FR4–FR8 are five
requirements but three tasks, grouped by the surface each touches. Five agents
on overlapping component files invites the concurrent-write corruption already
seen in this project.

**Wave 2 is the only subjective work.** Everything before it is deterministic;
everything after is verification. If time is short, Waves 1, 4 and 5 alone
still leave the site correct — just not revamped.

## Tasks

### Wave 1 — Link integrity (no dependencies, all parallel-safe)

- [x] `T1` — Create the `ROUTES` single source of truth
  - Files: `src/lib/routes.ts` (new)
  - Estimate: small
  - Kind: impl
  - Notes: Static paths plus `product(slug)`, `category(slug)`, `artist(slug)`
    builders. See design.md "The BottomNav derivation problem" for the exact
    shape. No behaviour change yet — this task only creates the constant.

- [x] `T2` — Point every nav/CTA href at `ROUTES`
  - Files: `src/components/navigation/BottomNav.tsx`, `src/components/navigation/MobileNav.tsx`, `src/components/home/ComebackCard.tsx`, `src/components/home/NewDrop.tsx`, `src/components/home/EditorialBanner.tsx`, `src/lib/constants.ts`
  - Estimate: medium
  - Kind: refactor
  - Depends: T1
  - Notes: Fixes all 8 broken hrefs. Two are live homepage 404s
    (`ComebackCard` → `/products/${slug}`, `NewDrop` →
    `/collections/nightfall-edition`). **Do NOT force `BottomNav` to derive
    its list from `NAV_LINKS`** — they are legitimately different link sets
    (5 thumb targets with icons vs 4 catalogue sections). Share `ROUTES`, keep
    separate lists. `NewDrop`'s default must use a real slug from
    `src/lib/categories.ts`.

- [x] `T3` — Link-integrity self-check
  - Files: `src/lib/__checks__/routes.check.ts` (new)
  - Estimate: small
  - Kind: test
  - Depends: T1
  - Notes: Assert every value in `ROUTES` resolves to a real `page.tsx` under
    `src/app` (accounting for dynamic segments). Eight broken hrefs reached
    production; this must fail the gate instead of reaching a user.

### Wave 2 — Skill-driven craft (the point of this change)

- [x] `T4` — Motion pass via `animate` + `emil-design-eng`
  - Files: `src/components/ui/Button.tsx`, `src/components/ui/Drawer.tsx`, `src/components/product/ProductGallery.tsx`, `src/components/product/ProductVariantSelector.tsx`, `src/components/ui/Reveal.tsx`
  - Estimate: large
  - Kind: impl
  - Depends: T2
  - Notes: **Invoke both skills via the Skill tool — do not paraphrase them.**
    Follow `animate`'s documented order: should it animate at all → purpose →
    tool → properties → curve/duration → interrupt → exit. `WishlistButton` is
    already at the target standard (proposal §9.5) and is the reference bar —
    do not redo it. `Button` and `Drawer` were audited and found correct; if
    the skills confirm that, report "no change needed" rather than churning.
    Must report what each skill changed vs the default approach (AC11).

- [x] `T5` — Art direction via `impeccable` + `design-taste-frontend`
  - Files: `src/app/page.tsx`, `src/components/home/Hero.tsx`, `src/components/home/EditorialBanner.tsx`, `src/components/home/NewDrop.tsx`, `src/app/editorial/page.tsx`
  - Estimate: large
  - Kind: impl
  - Depends: T2
  - Notes: **Invoke both skills.** Homepage, hero and editorial surfaces only.
    `design-taste-frontend` is explicitly excluded from `/checkout`,
    `/account`, `/cart` — its SKILL.md states it is for landing pages and
    redesigns, *not* multi-step product UI. Binding constraint from proposal
    §6: parallax reads as depth, not effect; speeds stay 0.12–0.28; text,
    prices, countdowns and CTAs never parallax. `../designsys.md` wins on
    tokens/type/spacing where a skill disagrees. Must report skill impact
    (AC11).

- [x] `T6` — Structural consistency via `high-end-visual-design`
  - Files: `src/components/product/ProductCard.tsx`, `src/components/artist/ArtistCard.tsx`, `src/components/collection/CategoryCard.tsx`, `src/components/home/ComebackCard.tsx`
  - Estimate: medium
  - Kind: refactor
  - Depends: T2
  - Notes: **Invoke the skill.** Audit bezel/depth/spacing consistency across
    card surfaces — these techniques are already partly applied, so this is a
    consistency pass, not a reapplication. Respect `../designsys.md` §8 radius
    cap (20px) and §7 section gaps (64–96px) over the skill's `rounded-[2rem]`
    / `py-40`. Must report skill impact (AC11).

### Wave 3 — Cleanup and test harness

- [x] `T7` — Resolve the four deferred design findings
  - Files: `src/components/home/Categories.tsx`, `src/components/layout/Section.tsx`, `src/components/navigation/AnnouncementBar.tsx`, `src/components/ui/Drawer.tsx`, `src/lib/products.ts`
  - Estimate: medium
  - Kind: impl
  - Depends: T4, T5, T6
  - Notes: (1) `Categories.tsx:18` `md:grid-cols-3` → `md:grid-cols-2` per doc
    §22's 2-column diagram. (2) Unify three arrow treatments — route through
    `Button` tertiary rather than a naked `→` character. (3) `Drawer` shadow
    `0.12` → house value `0.06`. (4) De-overlap `newDropProducts`: two slugs
    currently also appear in other rails, so a visitor sees the same product
    twice in one scroll. Runs after Wave 2 so it does not fight those edits.

- [x] `T8` — Make the 19 self-checks executable
  - Files: `package.json`, `src/lib/__checks__/` (as needed)
  - Estimate: small
  - Kind: config
  - Notes: Add `"check": "tsx src/**/*.check.ts"`. The 4 `.tsx` checks render
    React and need a harness — exclude them explicitly with a stated reason
    rather than silently. `tsx` as a devDependency is acceptable per design D5
    (test harness, never ships). If unavailable, fall back to `tsc` → temp dir
    → `node`.

- [x] `T9` — Remove the two dead redirect stopgaps
  - Files: `src/app/new-drops/page.tsx` (delete), `src/app/account/wishlist/page.tsx` (delete)
  - Estimate: small
  - Kind: refactor
  - Depends: T2
  - Notes: These exist only because nav files were out of scope during a
    parallel run. Once T2 fixes the hrefs they are dead weight. **Keep
    `/orders`** — it redirects to `/account?tab=orders` and is a plausible URL
    a user would type. Verify nothing else links to the two being deleted
    before removing.

### Wave 4 — Gate

- [x] `T10` — Cold build gate
  - Files: (none — verification only)
  - Estimate: medium
  - Kind: test
  - Depends: T7, T8, T9
  - Notes: `rm -rf .next tsconfig.tsbuildinfo` **first** — a prior run
    confirmed a stale cache masked two real defects and produced a false pass.
    Then `npx tsc --noEmit`, `npm run lint`, `npm run check`, `npm run build`.
    All four must exit 0 (AC1–AC4). OneDrive path: builds are slow, use a
    600s timeout and be patient. Fix root causes only — no `any`, no
    `@ts-ignore`, no disabled lint rules, no deleting features to pass.

### Wave 5 — Real-browser verification

- [x] `T11` — Render every route via `playwright-cli`
  - Files: (none — verification only)
  - Estimate: large
  - Kind: test
  - Depends: T10
  - Notes: **Invoke the `playwright-cli` skill.** All 26 routes in a real
    browser. Must catch what curl cannot: console errors behind HTTP 200
    (`/account` returned 200 while throwing, once), hydration mismatches,
    broken images. Read real slugs from `src/lib/products.ts`,
    `src/lib/artists.ts`, `src/lib/categories.ts` — never guess. A timeout is
    a FAILURE, not a pass. Zero console errors required (AC5).

- [x] `T12` — Parallax and reduced-motion behaviour under real scroll
  - Files: (none — verification only)
  - Estimate: medium
  - Kind: test
  - Depends: T10
  - Notes: **Invoke `playwright-cli`.** Verify: (a) parallax offset actually
    changes on scroll — `ParallaxLayer` renders no transform at rest *by
    design*, so static HTML cannot prove this (EC4); (b) under
    `prefers-reduced-motion: reduce` parallax is **fully inert** — offset 0,
    no listeners attached, not merely reduced (AC6); (c) no parallax below
    768px unless opted in (AC7); (d) no jank with 6+ tiles on screen in
    `ArtistGrid` — measure, do not reason (R1). Also run
    `web-design-guidelines` (FR8) for the a11y audit while a browser is
    driving: contrast, focus order, heading hierarchy, keyboard operability.

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed

**Task format:**
```
- [ ] `T<n>` — <title>
  - Files: <files to create/modify>
  - Estimate: small | medium | large
  - Kind: docs | test | config | refactor | impl | migration
  - Depends: <task ids> (if any)
  - Notes: <additional context>
```

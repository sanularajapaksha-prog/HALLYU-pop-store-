# Design: Skill-Driven Revamp

**Change:** 006-skill-driven-revamp
**Created:** 2026-09-23

## Technical Approach

Four independent workstreams, sequenced so cheap correctness fixes land before
expensive subjective work, and so verification runs last against a settled
tree:

1. **Link integrity** (FR1–FR3) — small, mechanical, high user impact. Two
   live 404s reachable from the homepage.
2. **Skill-driven craft** (FR4–FR8) — the point of the change. Each agent
   loads its `SKILL.md` and follows that framework.
3. **Deferred findings + harness** (FR9, FR10) — cleanup and making the
   existing 19 self-checks executable.
4. **Real-browser verification** (FR11) — `playwright-cli` against the final
   tree.

**Why this order.** Workstream 1 is deterministic and fast; leaving broken
links while agents churn design files would risk losing them in the noise.
Workstream 4 must be last because it validates the composite result — running
it earlier verifies a state that no longer exists. The prior workflow proved
this: its first build passed against 37 routes, a later one 57, the final 62,
and any earlier green would have been a false pass.

**Guardrail Rule 2 (Simplicity First) applied.** FR4–FR8 are five separate
requirements but only three agent tasks, because `animate` + `emil-design-eng`
share one motion surface and `impeccable` + `design-taste-frontend` +
`high-end-visual-design` share one visual surface. Splitting them five ways
would mean five agents editing overlapping files — more coordination cost,
more conflict risk, no better output.

## Architecture

No architectural change. This extends existing infrastructure:

```
src/hooks/useParallax.ts      ← built, gate-passing, do not rewrite
src/components/ui/ParallaxLayer.tsx
src/lib/motion.ts             ← SPRING_ENTER, SPRING_STATE,
                                 PARALLAX_SPEED{subtle,standard,pronounced},
                                 STAGGER_MS
src/components/ui/Reveal.tsx  ← entrance motion, 29 consumers
```

New surface is limited to one self-check file, one npm script, and one
possible devDependency.

### The `BottomNav` derivation problem

FR2 says "derive `BottomNav` links from `NAV_LINKS`." **A naive derivation
breaks the component**, and the design must account for it:

```ts
// BottomNav ITEMS — 5 entries, each with an Icon component
{ label: "Home",     href: "/",                Icon: HomeIcon  }
{ label: "Shop",     href: "/shop",            Icon: GridIcon  }
{ label: "Drops",    href: "/new-drops",       Icon: SparkIcon }  // wrong
{ label: "Wishlist", href: "/account/wishlist",Icon: HeartIcon }  // wrong
{ label: "Account",  href: "/account",         Icon: UserIcon  }

// NAV_LINKS — 4 entries, no icons
{ label: "Shop",        href: "/shop" }
{ label: "Artists",     href: "/artists" }
{ label: "New Drops",   href: "/drops" }
{ label: "Collections", href: "/collections" }
```

They are **different link sets serving different surfaces**. Bottom nav is
five thumb-reachable destinations including Home and Account; the desktop nav
is four catalogue sections. Forcing one to derive from the other would put
Collections in the bottom bar and drop Account.

**Chosen approach:** keep `BottomNav`'s own list, but source each `href` from
a single shared route constant rather than a string literal, so a route can
only be spelled in one place:

```ts
// src/lib/routes.ts  (new)
export const ROUTES = {
  home: "/", shop: "/shop", artists: "/artists", drops: "/drops",
  collections: "/collections", wishlist: "/wishlist",
  collection: "/collection", cart: "/cart", account: "/account",
  product: (slug: string) => `/product/${slug}`,
  category: (slug: string) => `/collections/${slug}`,
  artist:  (slug: string) => `/artists/${slug}`,
} as const;
```

`NAV_LINKS`, `FOOTER_GROUPS`, `BottomNav`, `MobileNav`, and the homepage CTA
defaults all reference `ROUTES`. The FR3 check then validates `ROUTES` against
the filesystem — one assertion covering every link surface.

This is more robust than correcting eight strings, and smaller than a
navigation refactor.

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `src/lib/routes.ts` | create | Single source of truth for every internal route path |
| `src/components/navigation/BottomNav.tsx` | modify | `/new-drops`→`ROUTES.drops`, `/account/wishlist`→`ROUTES.wishlist` |
| `src/components/navigation/MobileNav.tsx` | modify | `/account/wishlist`→`ROUTES.wishlist` |
| `src/components/home/ComebackCard.tsx` | modify | `/products/${slug}`→`ROUTES.product(slug)` (FR1) |
| `src/components/home/NewDrop.tsx` | modify | Default href → a real category slug (FR1) |
| `src/components/home/EditorialBanner.tsx` | modify | Default href → `/editorial` via `ROUTES` |
| `src/lib/constants.ts` | modify | `NAV_LINKS`/`FOOTER_GROUPS` reference `ROUTES` |
| `src/lib/__checks__/routes.check.ts` | create | FR3 link-integrity assertion |
| `src/app/new-drops/page.tsx` | delete | Redirect stopgap, unnecessary once href fixed (EC5) |
| `src/app/account/wishlist/page.tsx` | delete | Same |
| `src/app/orders/page.tsx` | keep | Defensible alias → `/account?tab=orders` |
| `package.json` | modify | Add `check` script; possibly `tsx` devDependency (FR10) |
| Motion surfaces | modify | Per `animate` / `emil-design-eng` output (FR4, FR5) |
| Homepage + editorial | modify | Per `impeccable` / `design-taste-frontend` (FR6) |
| `src/components/home/Categories.tsx` | modify | `md:grid-cols-3`→`md:grid-cols-2` per doc §22 (FR9) |
| `src/components/layout/Section.tsx` | modify | Unify arrow treatment (FR9) |
| `src/components/navigation/AnnouncementBar.tsx` | modify | Same |
| `src/components/ui/Drawer.tsx` | modify | Shadow `0.12`→`0.06` house value (FR9) |
| `src/lib/products.ts` | modify | De-overlap `newDropProducts` slugs (FR9) |

## Data Model Changes

None. `Product`, `Artist`, `Category`, `Comeback` types are unchanged. The
33-item catalogue is edited only to remove the two-slug overlap between
`newDropProducts` and the other rails (FR9) — no schema change.

## API Changes

None. No backend exists; all data is static imports from `src/lib/`.

## Key Decisions

**D1 — `ROUTES` constant over eight string fixes.** Eight broken hrefs across
five files, two found only by live browser. Correcting the strings leaves the
same failure mode available. A single route map plus a gate-enforced check
removes the class of bug, not the instances.

**D2 — `BottomNav` keeps its own list.** Rejected literal derivation from
`NAV_LINKS`: the two surfaces legitimately differ (5 thumb targets with icons
vs 4 catalogue sections). Sharing `ROUTES` gets the safety without forcing a
wrong information architecture.

**D3 — Delete two redirect stopgaps, keep one.** `/new-drops` and
`/account/wishlist` exist only because nav files were out of scope during a
parallel run. Once hrefs are fixed they are dead weight. `/orders` stays —
it is a plausible URL a user might type or bookmark.

**D4 — Three agent tasks for five skill requirements.** Grouped by the surface
each touches, not by skill count. Five agents on overlapping files invites the
concurrent-write corruption already seen in this project.

**D5 — `tsx` as a devDependency is acceptable.** NFR5 forbids new
dependencies, intended to mean runtime/bundle deps. A test-harness devDep that
never ships is a different category. Flagged in the spec's Dependencies
section; if rejected, FR10 needs another runner.

**D6 — Verification is browser-based, not curl.** Recorded because it is
non-obvious: `ParallaxLayer` renders no transform at rest by design, so its
absence in curl'd HTML is correct. Only real scroll proves the feature. A
status code already hid a real bug once (`/account` returned 200 while
throwing).

## Risks & Mitigations

**R1 — Parallax jank in dense grids (MEDIUM).** `ArtistGrid` and the category
grid render 6+ parallax tiles at once. Too generous an IntersectionObserver
`rootMargin` means 6+ live scroll listeners.
*Mitigation:* `playwright-cli` measures real scroll performance rather than
reasoning about it. Existing guards (rAF batching, observer gating,
transform-only, mobile-off-by-default) are verified, not assumed.

**R2 — Design incoherence from parallel skills (MEDIUM).** Four design skills
with different philosophies can produce a site where each section looks like a
different designer made it.
*Mitigation:* the proposal §6 parallax resolution is binding on every agent; a
cross-component consistency audit follows the art-direction pass.

**R3 — Regression in passing code (MEDIUM).** Everything currently gates
green. A revamp can break it.
*Mitigation:* agents instructed to report "verified, no change needed" rather
than churn — two already did this correctly on `Button` and `Drawer`. Cold
gate before and after.

**R4 — Concurrent-write corruption (MEDIUM).** Parallel agents in the same
file.
*Mitigation:* one owner per file per wave; grouped by surface; quiet-tree wait
between waves.

**R5 — Deleting redirects breaks an unknown link (LOW).** Someone may have
bookmarked `/new-drops`.
*Mitigation:* nothing external links to it (site is not deployed). If this
changes, keeping the redirect costs three lines.

**R6 — `tsx` unavailable or rejected (LOW).** FR10 blocks.
*Mitigation:* fall back to compiling checks with `tsc` to a temp dir and
running with `node`. Slower, no new dep.

## Grounding sources

- **`../designsys.md`** — authoritative for tokens and layout. §22 specifies
  the category grid the FR9 fix restores: *"Homepage presentation: `[ Albums ]
  [ Photocards ] / [ Lightsticks ] [ Apparel ] / [ Accessories ] [ Official
  Merch ]`"* — a 2-column pairing, which `Categories.tsx:18`'s
  `md:grid-cols-3` contradicts. §7 caps section gaps at *"Section gap: 64–96px"*
  and §8 caps radius at *"xl: 20px"*, both of which override
  `high-end-visual-design`'s `py-40` / `rounded-[2rem]`.
- **`README.md`** (rank 2, 36 lines, via `specclaw-discover-context`) — read;
  contains setup/run instructions only, no conventions bearing on this change.
- **Skill `SKILL.md` frontmatter**, read directly from
  `~/.claude/skills/*/SKILL.md`. `design-taste-frontend` states:
  *"Landing pages, portfolios, and redesigns. Not dashboards, not data tables,
  not multi-step product UI."* — the exact line grounding FR6's exclusion of
  `/checkout`, `/account`, `/cart`.
- **`.specclaw/changes/006-skill-driven-revamp/proposal.md`** §9 — the
  verification record; every current-state claim in this design traces to a
  command that ran, not to inspection.
- **No `.specclaw/context.md` or `.specclaw/knowledge/` exists** — checked;
  nothing to apply from those sources.

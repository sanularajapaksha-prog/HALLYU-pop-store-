# Spec: Skill-Driven Revamp

**Change:** 006-skill-driven-revamp
**Created:** 2026-09-23
**Status:** 🟡 Draft

## Overview

Apply seven installed agent skills to the work each one actually specialises
in, so the marketplace's motion, art direction, and accessibility are produced
by the skills' own documented frameworks rather than by paraphrased
instructions. Also close the remaining broken hrefs and make the 19 existing
self-checks executable.

The site currently passes every automated gate (`tsc` 0, `lint` 0, `build` 0,
26 routes, 27/29 live routes verified, zero console errors). **Zero of seven
skills have been invoked.** That gap is this change.

**Stated assumption (Guardrail Rule 1):** "amazing website" is interpreted as
*motion and visual craft produced by the specialist skills, verified in a real
browser* — not as new features, new pages, or a visual redesign of the
existing layout. The design system in `../designsys.md` remains authoritative
for tokens, type scale, and spacing. If a different interpretation was
intended, this spec needs revising before build.

## Requirements

### Functional Requirements

**FR1 — Fix the two remaining broken hrefs at source**
`ComebackCard.tsx:56` links to `/products/${slug}`; the real route is
`/product/[slug]`. `NewDrop.tsx:27` defaults to
`/collections/nightfall-edition`, which is not one of the six real category
slugs in `src/lib/categories.ts`. Both are user-facing 404s reachable from the
homepage.

**FR2 — Make `BottomNav` derive its links from `NAV_LINKS`**
`BottomNav.tsx` hardcodes a parallel link list that drifted out of sync with
`src/lib/constants.ts`, producing two of the eight broken hrefs. Correcting
the strings without removing the duplication invites recurrence.

**FR3 — Add a link-integrity self-check**
Assert that every href in `NAV_LINKS`, `FOOTER_GROUPS`, and the nav components
resolves to a real route under `src/app`. This class of bug must fail the gate
rather than reach a user — eight instances reached production.

**FR4 — Rebuild motion through the `animate` skill**
Each animation decision follows the skill's documented order: *should it
animate at all → what purpose → which tool → which properties → which curve
and duration → how it interrupts → how it exits*. The invoking agent reports
which decisions the skill changed versus its default approach.

**FR5 — Polish component micro-interactions through `emil-design-eng`**
Scope: button press immediacy, drawer exit feel, gallery cross-fade, variant
selection acknowledgement, and any interaction the skill's philosophy flags.
`WishlistButton` is already done to this standard (see proposal §9.5) and
serves as the reference bar.

**FR6 — Art direction through `impeccable` + `design-taste-frontend`**
Applied to homepage, hero, and editorial surfaces only.
`design-taste-frontend` is explicitly excluded from `/checkout`, `/account`,
and `/cart` — its own SKILL.md states it is for landing pages, portfolios and
redesigns, *not* multi-step product UI.

**FR7 — Structural craft through `high-end-visual-design`**
Bezel, depth, and spacing consistency across card surfaces. This skill's
techniques are already partly applied; this pass audits consistency rather
than reapplying from scratch.

**FR8 — Compliance audit through `web-design-guidelines`**
All 26 routes: contrast, focus order, heading hierarchy, keyboard
operability, reduced-motion coverage, nested-interactive violations.

**FR9 — Resolve the four deferred design findings**
`Categories.tsx:18` renders `md:grid-cols-3` where doc §22 diagrams 2×3;
three inconsistent arrow treatments coexist; `newDropProducts` overlaps other
rails on two slugs; `Drawer.tsx` uses a one-off shadow opacity.

**FR10 — Wire the self-checks into the gate**
19 `*.check.ts*` files compile but none execute. Add a `check` script covering
the 15 pure-logic files; the 4 `.tsx` ones render React and are excluded with
a stated reason.

**FR11 — Real-browser verification through `playwright-cli`**
All 26 routes rendered in an actual browser. Must catch what curl cannot:
console errors behind HTTP 200, hydration mismatches, parallax jank,
`prefers-reduced-motion` inertness.

### Non-Functional Requirements

**NFR1 — No regression.** The cold gate passes today. It must still pass.
Agents verify and report "already correct, no change needed" rather than
changing working code for the sake of activity.

**NFR2 — Parallax performance.** Transform/opacity only; never layout
properties. rAF-batched, IntersectionObserver-gated so off-screen tiles do
zero work. The 6+-tile grid case (`ArtistGrid`, category grid) is the specific
hazard to measure, not reason about.

**NFR3 — Accessibility is non-negotiable.** Every animated component respects
`prefers-reduced-motion` by becoming *fully inert*, not merely reduced.
Keyboard operability and focus visibility preserved throughout.

**NFR4 — Honesty preserved.** `/checkout` and `/account` remain UI-complete
mocks and must continue to state so plainly. No fabricated payment fields or
trust badges.

**NFR5 — No new dependencies.** Tailwind utilities and existing packages only.

**NFR6 — Design coherence.** Four design skills running in parallel must not
produce a site where each section looks like a different designer made it.
The §6 parallax resolution in the proposal is binding on every agent.

## Acceptance Criteria

Each criterion must pass for the change to be considered complete.

- **AC1** — `npx tsc --noEmit` exits 0 from a cold state (`.next` and
  `tsconfig.tsbuildinfo` deleted first).
- **AC2** — `npm run lint` exits 0 with zero problems.
- **AC3** — `npm run build` exits 0; all 26 routes compile.
- **AC4** — `npm run check` executes the pure-logic self-checks; all pass.
- **AC5** — All 26 routes render in a real browser via `playwright-cli` with
  **zero console errors** — not merely HTTP 200.
- **AC6** — `prefers-reduced-motion: reduce` makes parallax completely inert
  (offset 0, no listeners attached), verified in-browser.
- **AC7** — Parallax does not fire below 768px unless explicitly opted in.
- **AC8** — Zero hydration mismatch warnings on any route.
- **AC9** — No `Lorem`, `TODO`, or `Sample Product` strings in rendered pages.
  Legitimate HTML `placeholder=` attributes are permitted.
- **AC10** — Every href in `NAV_LINKS`, `FOOTER_GROUPS`, `BottomNav`,
  `MobileNav`, and homepage CTA defaults resolves to a real route. Enforced by
  the FR3 self-check, not manual inspection.
- **AC11** — Each skill-driven agent reports which skill it invoked and what
  that skill changed about its output versus its default approach.
- **AC12** — `/checkout` and `/account` still state plainly they are
  demo/mock.
- **AC13** — The four FR9 findings are resolved, or explicitly re-deferred
  with a stated reason.

## Edge Cases

**EC1 — Rapid wishlist toggle.** Remove-then-re-add within one animation
cycle must replay the pop. Already handled via an incrementing `popKey` used
as a React key; a boolean would silently no-op. Any new animation with the
same shape needs the same treatment.

**EC2 — Parallax in a dense grid.** `ArtistGrid` renders 6+ tiles
simultaneously. If the IntersectionObserver `rootMargin` is too generous, that
is 6+ active scroll listeners at once. Must be measured under real scroll.

**EC3 — Reduced motion mid-session.** A user toggling the OS setting while
the page is open. The hook reads it via `usePrefersReducedMotion`; verify the
listener path, not just initial state.

**EC4 — Parallax invisible to static checks.** `ParallaxLayer` renders no
transform at rest by design — offset starts at 0 and only becomes non-zero
from a client scroll listener. Absence of a transform in curl'd HTML is
*correct*, not a defect. Only a real browser can verify this.

**EC5 — Redirect routes now masking bugs.** `/new-drops`,
`/account/wishlist`, `/orders` are thin redirects added as stopgaps. Once
FR1/FR2 fix the hrefs, each needs an explicit keep-or-remove decision.
`/orders → /account?tab=orders` is defensible as an alias; `/new-drops` is
not, since nothing external links to it.

**EC6 — Concurrent agent writes.** Parallel agents editing the same file
corrupt each other. A prior run hit `Another next build process is already
running` and correctly waited rather than deleting `.next/lock`.

**EC7 — Empty/missing data.** Any component touched must still handle a
product with one image, an artist with zero products, and an empty cart —
these paths exist today and must not regress.

## Dependencies

- **Installed skills** (all verified present in `~/.claude/skills/`):
  `animate`, `emil-design-eng`, `impeccable`, `design-taste-frontend`,
  `high-end-visual-design`, `web-design-guidelines`, `playwright-cli`.
- **`tsx`** — needed to execute the self-checks (FR10). Not currently a
  dependency; NFR5 forbids new runtime deps but a devDependency for the test
  harness is in scope. If adding it is unacceptable, FR10 needs an alternative
  runner and this spec should be revised.
- **Existing motion infrastructure** — `useParallax`, `ParallaxLayer`,
  `src/lib/motion.ts`. Built and gate-passing; this change extends rather than
  replaces them.
- **`../designsys.md`** — authoritative for tokens, type scale, spacing,
  radius. Skill output must not contradict it (see Notes).

## Notes

**Skill conflict is real and pre-resolved.** `impeccable` says "go all out,
dream big and bold." `emil-design-eng` argues motion must earn its place. The
user chose *both* "parallax everywhere it fits" and "emil-design-eng leads."
Binding resolution from proposal §6: parallax applies broadly, but every
instance must read as a **depth cue** rather than an effect. Speeds stay in
the 0.12–0.28 band. Text, prices, countdown numbers and CTAs never parallax.
Test: if a reviewer says *"nice parallax"* rather than *"that feels deep,"*
it is too strong.

**Spec conflicts with skills, where they arise.** `high-end-visual-design`
bans Inter and wants `py-40` / `rounded-[2rem]`; `../designsys.md` §4 mandates
Inter and caps radius at 20px with 64–96px section gaps. The design doc wins
on tokens; the skill wins on technique. This was decided earlier in the
project and is recorded here so no agent relitigates it.

**What is deliberately not in scope:** backend, auth, payments, dark mode, the
`package-lock.json` workspace-root issue (tracked as change 008), and exit
animations on list removal (requires restructuring array ownership in
`useCart`/`useWishlist`).

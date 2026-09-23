# Proposal: 006-skill-driven-revamp

> **Status at time of writing.** The revamp workflow has completed. Parallax
> infrastructure is built and applied to 8 components; the missing routes are
> built; 8 broken hrefs were found and 2 of them fixed at source; the cold
> build gate passes (`tsc` 0, `lint` 0, `build` 0, 26 routes); 28 routes were
> verified on a live dev server with zero console errors.
>
> **The specialist skill pass has still not run.** Motion so far was written
> by agents following paraphrased principles, not by agents invoking
> `animate` / `emil-design-eng` / `impeccable` / `design-taste-frontend` /
> `high-end-visual-design` / `web-design-guidelines`. That is the core of
> what remains.
>
> Gate state independently re-verified immediately before this revision:
> `npx tsc --noEmit` exit 0, `npm run lint` exit 0.

---

## 1. Summary

Turn a functionally complete K-pop marketplace into one that feels
professionally designed, by applying seven installed agent skills to the work
each one actually specialises in — and by fixing the defects the current
half-finished revamp has introduced.

**One sentence:** the site works; this change makes it *feel* like a $150k
build without breaking the accessibility, performance, or honesty of what is
already there.

---

## 2. Why this change exists

### 2.1 The skills were described, not invoked

Every prior change wrote instructions like *"apply emil-design-eng
principles"* directly into agent prompts. That is a paraphrase recalled from
memory. It is not an agent loading `emil-design-eng/SKILL.md` and following
its documented decision framework.

The difference is concrete. The `animate` skill defines a specific decision
order:

```
should it animate at all
  -> what purpose does the motion serve
    -> which tool
      -> which properties
        -> which curve and duration
          -> how does it interrupt
            -> how does it exit
```

No agent in this project has followed that sequence. Motion was added by
pattern-matching ("add a spring transition here"), which is exactly the
approach the skill exists to replace.

### 2.2 Seven skills, seven distinct jobs

| Skill | Documented specialisation | Applies to |
|---|---|---|
| `animate` | **Builds** animations via the decision order above | All motion work |
| `emil-design-eng` | UI polish, component design, invisible details | Micro-interactions, component feel |
| `impeccable` | Out-of-distribution craft, bold art direction | Homepage, editorial, hero |
| `design-taste-frontend` | Anti-slop, audit-first on redesigns | Landing/editorial pages **only** |
| `high-end-visual-design` | Bezels, spacing, shadows, motion choreography | Depth and structural craft |
| `web-design-guidelines` | Interface-guideline and a11y compliance review | Audit pass, all pages |
| `playwright-cli` | Real browser automation | Verification of all 26 routes |

Collapsing these into one generic "make it look good" prompt wastes six of
the seven.

### 2.3 The 404s — root cause was wrong hrefs, not missing pages

The reported 404 behaviour had two distinct causes. Diagnosis found six
**broken links pointing at routes that never existed**, plus genuinely
missing informational pages.

**Category A — wrong hrefs in navigation and homepage components:**

| Broken href | Real route | Location | Status |
|---|---|---|---|
| `/account/wishlist` | `/wishlist` | `BottomNav.tsx:18`, `MobileNav.tsx:14` | redirect stopgap |
| `/new-drops` | `/drops` | `BottomNav.tsx:17` | redirect stopgap |
| `/products/${slug}` | `/product/${slug}` | `ComebackCard.tsx:56` | **unfixed** |
| `/editorial` | *(did not exist)* | `EditorialBanner.tsx:30` | page built |
| `/collections/nightfall-edition` | *(not a real category slug)* | `NewDrop.tsx:27` | **unfixed** |
| `/legal/privacy` | `/privacy` | `Footer.tsx` | **fixed at source** |
| `/legal/terms` | `/terms` | `Footer.tsx` | **fixed at source** |

The last two were found only during live browser verification, not during
static diagnosis — the footer's legal block hardcoded a `/legal/` prefix for
routes that live at the top level. No `/legal` directory has ever existed.
They were corrected in `Footer.tsx` and re-verified as 200.

**Eight broken hrefs in total.** Two fixed at source, three masked by
redirects, one resolved by building the page, and two (`ComebackCard`,
`NewDrop`) still pointing at non-existent targets.

`BottomNav` is the primary culprit: it is the fixed mobile tab bar rendered
on **every mobile page load** (`md:hidden`), and it carried two wrong paths.
The desktop `Navbar` was correct because it reads `NAV_LINKS` from
`constants.ts` — `BottomNav` hardcoded its own list and silently drifted out
of sync. **That drift is the root cause, not six independent typos.**

Two homepage CTAs also 404'd for every visitor: the "Explore" button on
`EditorialBanner` and "Shop now" on `NewDrop`, because `page.tsx` renders
both with no `href` override, so their broken default props applied.

**Category B — genuinely missing informational pages**, linked from the
footer per doc section 36: `/shipping`, `/returns`, `/faq`, `/contact`,
`/privacy`, `/terms`.

**Current mitigation (partial).** Category B pages are now built with real
content. Category A was closed with **redirect routes** rather than href
fixes, because nav files were held out of scope to avoid concurrent-write
conflicts during a parallel run:

```ts
// src/app/new-drops/page.tsx
export default function NewDropsRedirect() { redirect("/drops"); }
```

`/account/wishlist`, `/new-drops` and `/orders` are all thin redirects, not
duplicated UI. This resolves the user-facing 404 but leaves the wrong hrefs
in place. **Fixing the hrefs properly — and making `BottomNav` read from
`NAV_LINKS` so it cannot drift again — is in scope for this change**
(section 5.1 G).

### 2.4 Status-code verification has already proven insufficient

Prior changes verified routes with `curl` HTTP codes alone. That failed once
already: `/account` returned **HTTP 200 while throwing a server error on
every request**. The root cause was `parseAccountTab` living in a
`"use client"` module and being called directly from a Server Component —
invisible to a status check, obvious in a browser.

`playwright-cli` exists to catch exactly this class of defect.

---

## 3. Current state (verified, not assumed)

Measured immediately before writing this proposal:

| Metric | Value |
|---|---|
| Routes | 26 |
| Source files (`.ts`/`.tsx`) | 149 |
| Products in catalogue | 33 |
| `<Reveal>` entrance animation | 29 files |
| `<ParallaxLayer>` applied | 8 files |
| Self-check files (`*.check.ts*`) | 19 (**0 executed**) |
| `npx tsc --noEmit` (cold) | **exit 0 PASS** |
| `npm run lint` | **exit 0 PASS** |
| `npm run build` (cold) | **exit 0 PASS**, 26 routes |
| Live routes verified | **27 / 29**, 0 console errors |
| Skills actually invoked | **0 of 7** |

The last row is the reason this change exists. Everything else is green; the
specialist work has not started.

### 3.1 Parallax is applied

```
components/home/Hero.tsx               components/home/HeroBackground.tsx
components/home/NewDrop.tsx            components/home/NewDropBackground.tsx
components/home/EditorialBannerImage.tsx
components/home/ComebackCard.tsx
components/artist/ArtistCard.tsx
components/collection/CategoryCard.tsx
```

Infrastructure: `useParallax` hook, `ParallaxLayer` component, and
`src/lib/motion.ts` defining shared tokens:

```ts
SPRING_ENTER   = 'ease-[cubic-bezier(0.32,0.72,0,1)]'  // entrances
SPRING_STATE   = 'ease-[cubic-bezier(0.4,0,0.2,1)]'    // state changes
PARALLAX_SPEED = { subtle: 0.12, standard: 0.18, pronounced: 0.28 }
STAGGER_MS     = 60
```

---

## 4. Known defects this change must fix

### 4.1 RESOLVED — three lint errors in `useParallax.ts`

**Status: fixed and independently re-verified. Documented because the fix is
instructive and the reasoning should survive in the record.**

`npm run lint` was failing with three errors, all in the core parallax hook
imported by all six parallax components:

```
src/hooks/useParallax.ts
  61:3  error  Cannot access refs during render
  63:3  error  Cannot access refs during render
  67:7  error  Calling setState synchronously within an effect
               can trigger cascading renders
```

**Lines 61/63** assigned to refs in the render body:

```ts
const speedRef = useRef(speed);
speedRef.current = speed;      // ref write during render
const mobileRef = useRef(mobile);
mobileRef.current = mobile;    // ref write during render
```

The intent was sound — avoid tearing down the IntersectionObserver when a
caller passes a fresh options object every render. The implementation broke
React's rule that refs must not be written during render, which fails under
concurrent rendering and Strict Mode double-invocation.

**Applied fix** — sync in a dedicated effect keyed on the primitives:

```ts
const speedRef = useRef(speed);
const mobileRef = useRef(mobile);
useEffect(() => {
  speedRef.current = speed;
  mobileRef.current = mobile;
}, [speed, mobile]);
```

**Line 67** called `setOffset(0)` synchronously inside the effect when `skip`
was true. This was **redundant, not merely suboptimal**: the hook's return
statement already derives `offset: skip ? 0 : offset`, so callers were
guaranteed to see 0 regardless. The effect write added a second render for a
value the render output already produced.

**Applied fix** — deleted the call, replaced with a plain early return:

```ts
if (skip) return;   // returned offset is already forced to 0 below
```

Identical runtime behaviour, one fewer render, GPU-safe transform-only
contract and `prefers-reduced-motion` short-circuit both preserved. Only
`src/hooks/useParallax.ts` was touched.

**Note on classification.** Both are React Compiler-era lint rules, stricter
than the rules in force when most of this codebase was written. They were not
latent bugs in the parallax logic — the hook worked. They are correctness
hazards that would surface under concurrent rendering. Worth recording so a
future reader does not assume the parallax implementation was broken.

### 4.2 Deferred design findings from the prior review

Eight minor findings were accepted as deferred. The four worth addressing:

| Finding | File | Detail |
|---|---|---|
| Grid mismatch | `home/Categories.tsx:18` | Renders `md:grid-cols-3` (3x2); spec section 22 diagrams 2x3 |
| Inconsistent arrows | `layout/Section.tsx`, `navigation/AnnouncementBar.tsx` | Three different arrow treatments coexist: circled (Button), naked arrow character, inline SVG |
| Rail overlap | `lib/products.ts` | `newDropProducts` shares 2 slugs with the other rails — same product appears twice in one scroll |
| Shadow drift | `ui/Drawer.tsx` | Uses `rgba(0,0,0,0.12)`; every other surface uses `0.06` |

### 4.3 Nineteen self-checks that never execute

```
19 x *.check.ts / *.check.tsx   - compile only, never run
package.json scripts: dev, build, start, lint   - no check script
```

The build gate proves these files *typecheck*. It does not prove their
assertions hold. They are the only executable proof of the filter, cart,
account, and search logic.

**Fix:** add `"check": "tsx src/**/*.check.ts"` to `package.json` and fold it
into the gate. The 4 `.tsx` ones render React and need a harness — scope
those separately or exclude them explicitly.

---

## 5. Scope

### 5.1 In scope

**A. Fix blocking defects**

- Repair the 3 lint errors in `useParallax.ts` (section 4.1) without
  weakening the hook's performance contract.
- Re-verify the cold gate passes: `tsc --noEmit` + `lint` + `next build`.

**B. Skill-driven motion pass** — each agent *invokes* its skill

- `animate` rebuilds motion through its decision order. Every animation must
  answer *should this animate at all* before *which curve*.
- `emil-design-eng` polishes component micro-interactions: the wishlist
  heart's overshoot-and-settle, button press immediacy, drawer exit feel,
  gallery cross-fade.
- Both skills produce a written rationale per decision, so the choices are
  reviewable rather than assumed.

**C. Art direction pass**

- `impeccable` on homepage, hero, editorial surfaces — bold craft.
- `design-taste-frontend` audit-first on the same surfaces.
- `high-end-visual-design` for bezel/depth/spacing consistency across all card
  surfaces.
- Resolve the four deferred findings in section 4.2.

**D. Compliance audit**

- `web-design-guidelines` across all 26 routes: contrast, focus order,
  heading hierarchy, keyboard operability, reduced-motion coverage,
  nested-interactive violations.

**E. Test harness**

- Add the `check` script; wire the 15 pure-logic checks into the gate.

**F. Real verification**

- `playwright-cli` renders all 26 routes in an actual browser.
- Catches: hydration mismatches, console errors behind 200s, broken images,
  parallax jank, layout shift.
- Explicitly tests `prefers-reduced-motion` — parallax must be fully inert,
  not merely reduced.

**G. Fix the broken hrefs at source (not via redirect)**

The redirect routes currently masking the Category A 404s (section 2.3) are a
stopgap. Proper fixes:

- `BottomNav.tsx` — correct `/new-drops` to `/drops` and `/account/wishlist`
  to `/wishlist`, and refactor it to **derive its links from `NAV_LINKS` in
  `constants.ts`** rather than hardcoding a parallel list. The hardcoded list
  is why it drifted; correcting the two strings without fixing the drift
  invites the same bug again.
- `MobileNav.tsx` — correct `/account/wishlist` to `/wishlist`.
- `ComebackCard.tsx:56` — correct `/products/${slug}` to `/product/${slug}`.
- `EditorialBanner.tsx:30` — point the default `href` at the real
  `/editorial` page now that it exists, or at a real collection.
- `NewDrop.tsx:27` — point the default `href` at a real category slug from
  `categories.ts` (`albums`, `photocards`, `lightsticks`, `apparel`,
  `accessories`, `official-merch`).
- Once hrefs are correct, decide per redirect route whether to keep it as a
  deliberate alias (harmless, protects external links) or remove it. Keeping
  `/orders -> /account?tab=orders` is defensible; `/new-drops` is not, since
  nothing external links to it.
- Add a self-check asserting every href in `NAV_LINKS`, `FOOTER_GROUPS`, and
  the nav components resolves to a real route, so this class of bug fails the
  gate instead of reaching a user.

### 5.2 Out of scope

| Excluded | Reason |
|---|---|
| Backend, auth, payments | Deferred per original spec. `/checkout` and `/account` stay UI-complete mocks, **honestly labelled** as such. |
| Dark mode | Not in doc section 46 MVP priorities. |
| `design-taste-frontend` on `/checkout`, `/account`, `/cart` | Its SKILL.md states it is for landing pages, portfolios and redesigns — explicitly *not* multi-step product UI. Applying it there would misuse it. |
| New product data | The ~30-item catalogue in `lib/products.ts` is the source. This change verifies it renders; it does not replace it. |
| `package-lock.json` workspace root | Real issue, but a project-structure decision. Tracked as change 008. |
| Exit animations on list removal | Requires restructuring array ownership in `useCart`/`useWishlist` to keep exiting items mounted. Out of scope for a motion pass. |

---

## 6. The central design tension

Two direction choices were made that pull against each other:

- **"Parallax everywhere it fits"** — a maximalist scroll-effects instruction.
- **"emil-design-eng leads"** — a restraint philosophy that argues against
  decoration serving no function.

These are genuinely in conflict. `impeccable` says *"go all out, dream big and
bold."* `emil-design-eng` says motion must earn its place.

**Resolution adopted:** parallax applies broadly (all six image-forward
surfaces), but every instance must read as a **depth cue** — the image sits
*behind* the card — rather than as an effect the user notices as motion.
Concretely:

- Speeds stay in the `0.12`-`0.28` band. Never higher.
- Text, prices, countdown numbers, and CTAs **never** parallax. Only
  decorative imagery moves.
- If a reviewer looking at a section says *"nice parallax"* rather than *"that
  feels deep,"* the effect is too strong.

This is a judgement call, recorded here so it is reviewable rather than
silently assumed. If it reads as too conservative once built, the `pronounced`
tier exists.

---

## 7. Acceptance criteria

The change is done when **all** of these hold:

1. `npx tsc --noEmit` exits 0 from a **cold** state (`.next` and
   `tsconfig.tsbuildinfo` deleted first).
2. `npm run lint` exits 0 with **zero** errors.
3. `npm run build` exits 0; all 26 routes compile.
4. `npm run check` runs the pure-logic self-checks and all pass.
5. All 26 routes render in a real browser via `playwright-cli` with **zero
   console errors** — not merely HTTP 200.
6. `prefers-reduced-motion: reduce` makes parallax **completely inert**
   (offset 0, no listeners attached), verified in-browser.
7. Parallax does not fire below 768px unless explicitly opted in.
8. No hydration mismatch warnings on any route.
9. No `Lorem`, `placeholder`, `TODO`, or `Sample Product` strings in any
   rendered page.
10. Each skill-driven agent reports which skill it invoked and what that skill
    changed about its output versus its default approach.
11. `/checkout` and `/account` still state plainly they are demo/mock.
12. The four section 4.2 findings are resolved or explicitly re-deferred with
    a stated reason.

---

## 8. Risk

**Overall: Medium — the highest of any change in this project.**

### 8.1 Parallax performance — the main risk

Scroll-linked transforms cause jank, and on touch devices, motion discomfort.
Specific hazard: `ArtistGrid` and the category grid render **6+ parallax tiles
simultaneously**. If the `IntersectionObserver` gating's `rootMargin` is too
generous, that is 6+ active scroll listeners at once.

Mitigations already built in, to be verified not assumed:

- Transform/opacity only — never layout properties.
- `requestAnimationFrame` batching with a pending-frame flag, not one rAF per
  scroll event.
- IntersectionObserver gates the listener on/off; off-screen tiles do zero
  work.
- Full opt-out under `prefers-reduced-motion`.
- Disabled below 768px by default.

`playwright-cli` should measure this rather than reason about it.

### 8.2 Concurrent-write corruption

Parallel agents editing the same file corrupt each other. This already
produced a near-miss: a build agent hit
`Another next build process is already running` and correctly waited rather
than deleting `.next/lock`.

**Mitigation:** group work strictly per-file; one owner per file per phase;
require a quiet source tree between phases.

### 8.3 Skill conflict producing incoherence

Four design skills with different philosophies, running in parallel, can
produce a site where each section looks like a different designer made it.

**Mitigation:** the section 6 resolution is binding on every agent; a
cross-component consistency audit runs after the art-direction pass.

### 8.4 Regression in working code

The site currently passes typecheck and serves all 26 routes. A revamp can
break what works.

**Mitigation:** agents are instructed to verify and report *"already correct,
no change needed"* rather than change working code for the sake of activity;
the cold gate runs before and after.

### 8.5 Low risk

The ten new informational pages are static content with no data model.

---

## 9. Verification record (what has actually been proven)

This section exists so no future reader has to trust a summary. Every claim
below was produced by a command that ran, not by inspection.

### 9.1 Cold build gate — PASSING

Run from a genuinely cold state (`rm -rf tsconfig.tsbuildinfo .next` first,
so a stale incremental cache could not mask a failure):

| Command | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, zero problems |
| `npm run build` | exit 0, compiled in 13.8s |

Build output: **26 routes**. Static informational pages present
(`shipping`, `returns`, `faq`, `contact`, `privacy`, `terms`, `drops`,
`editorial`, `new-drops`). Dynamic routes prerendered —
`product/[slug]` 30 paths, `artists/[slug]` 10 paths,
`collections/[slug]` 6 paths. `account`, `photocards`, `search`, `shop`
server-rendered dynamic.

Re-verified independently at the time of this revision: `tsc` 0, `lint` 0.

### 9.2 Live-server route verification — 27/29

Fresh dev server (Next 16.3.4 Turbopack, ready in 2.1s). **29 routes
checked, 27 passing.** The two failures were the `/legal/*` hrefs described
in section 2.3 — found broken, fixed, re-verified 200.

`/this-route-does-not-exist` correctly returns 404, confirming the catch-all
works rather than something silently swallowing unknown paths.

**Zero console errors. Zero hydration warnings.** The only log line was a
benign Turbopack notice about the OneDrive path.

### 9.3 Content sanity

HTML of `/`, `/shop`, `/product/*`, `/artists/*`, `/faq`, `/contact`,
`/privacy`, `/terms`, `/shipping`, `/returns` was fetched and grepped for
`Application error`, `Unhandled Runtime Error`, `This page could not be
found`, `Hydration failed`, `did not match`, `__next_error__`, `Lorem`,
`TODO`. **No hits.**

Every `placeholder` hit was verified as a legitimate HTML `placeholder=`
attribute or Tailwind `placeholder:` variant on a real form input — not
filler content.

Catalogue confirmed at **33 real products** with real names, prices and
seeded images.

### 9.4 Parallax verification — and an important caveat

`ParallaxLayer` is confirmed imported and rendered in all 8 target
components.

**A curl-based check cannot prove parallax works, and it is worth stating
why.** By design, `ParallaxLayer` renders a plain `div` with no `transform`
and no `will-change` in its SSR/idle state — offset starts at 0 and only
becomes non-zero from a client-side scroll listener gated by
IntersectionObserver. This is deliberate: it avoids giving every element a
needless GPU compositor layer at rest.

So the absence of an inline transform in raw HTML is **expected, not a
defect**. Verification was therefore by confirming the component is actually
rendered — not by grepping for a transform that correctly is not there yet.

**This is precisely why `playwright-cli` is in scope.** Real scroll
behaviour, jank under a 6-tile grid, and `prefers-reduced-motion` inertness
cannot be verified without a real browser driving real scroll events.

### 9.5 What the motion pass actually changed

Three agents audited; two reported **"verified, no change needed"** rather
than churning working code, which was the instruction:

- **`Button.tsx` — no change.** `active:scale-[0.98]` rides the same
  `transition-all` as hover; CSS transitions interpolate from the current
  computed value, so hover-off mid-transition reverses smoothly by
  construction. No enter-only asymmetry existed.
- **`Drawer.tsx` — no change.** Open and close both drive the same
  `transition-transform` with the same cubic-bezier off one boolean. The
  exit is the same considered curve, not a linear reverse-hack.
- **13 pages audited — no change.** All already wrap content in `<Reveal>`
  with the correct capped stagger. `PageHeader` already reveals internally;
  confirmed no page double-wraps it.

- **`WishlistButton.tsx` — real fix.** The previous animation was a linear
  `scale-100 -> scale-110`, which does not read as physical. Replaced with a
  `@keyframes heart-pop` (0 -> 1, 40% -> 1.15, 100% -> 1, 350ms) as a
  Tailwind v4 `@utility`, transform-only.

  The non-obvious part: it is driven by a `popKey` **counter**, not a
  boolean, incremented only on the OFF -> ON transition and used as a React
  `key` on the `<svg>`. A boolean would silently fail to replay when a user
  removes and re-adds within one animation cycle — the class would re-render
  identically and the animation would not restart. That edge case was traced
  and handled. Never fires on mount or hydration. Gated by
  `motion-reduce:animate-none`.

This is the standard the specialist pass should meet: verify first, change
only what is actually wrong, and explain the reasoning.

---

## 10. Sequencing

```
[DONE]   Fix lint errors in useParallax                   gate passing
[DONE]   Build the missing informational routes           26 routes live
[DONE]   Apply parallax to 8 components                   infrastructure done
[DONE]   Fix /legal/* hrefs in Footer.tsx                 verified 200

Phase 1  Fix remaining broken hrefs at source             [section 5.1 G]
Phase 2  animate + emil-design-eng motion pass            [SKILLS INVOKED]
Phase 3  impeccable + design-taste + high-end art pass    [SKILLS INVOKED]
Phase 4  Resolve deferred findings + consistency audit
Phase 5  web-design-guidelines compliance audit           [SKILL INVOKED]
Phase 6  Test harness - check script wired into gate
Phase 7  Cold build gate
Phase 8  playwright-cli real-browser verification
```

**Phase 1 first** because `ComebackCard` and `NewDrop` still link to routes
that do not exist, and those are user-facing 404s on the homepage. Cheap to
fix, and the `NAV_LINKS` refactor prevents recurrence.

**Phases 2 and 3 are the actual point of this change.** Everything before
them is cleanup; everything after is verification. The distinguishing
requirement is that each agent *invokes its skill* — loads the `SKILL.md`
and follows its documented framework — rather than acting on a paraphrase
written into a prompt. Section 7 criterion 10 makes this checkable: each
agent must report which skill it invoked and what that changed about its
output versus its default approach.

**Phase 8 is not optional.** Sections 2.4 and 9.4 both show why: a status
code proved insufficient once (`/account` returned 200 while throwing), and
parallax correctness is invisible to curl by design. Real scroll, real
reduced-motion, real console.

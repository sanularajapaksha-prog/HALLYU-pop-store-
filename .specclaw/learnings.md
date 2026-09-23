# Learnings: 006-skill-driven-revamp

Build learnings, spec gaps, and patterns discovered.

**Categories:** spec_gap | design_gap | pattern | best_practice | agent_issue

---

## [L1] design_gap — card.check.tsx:99 asserts href="/products/proof-standard"...

**When:** 2026-09-23 14:25 UTC
**Category:** design_gap
**Priority:** high
**Status:** pending

### Detail
card.check.tsx:99 asserts href="/products/proof-standard" (plural) but ProductCard.tsx:175 renders /product/ (singular). Runtime string assert, so tsc does not catch it. Will fail the moment T8 makes checks executable.

### Action
T8 must fix this assert to /product/ before wiring the check script into the gate

---

## [L2] design_gap — Duplicate route dirs exist: src/app/account/wishlist/page...

**When:** 2026-09-23 14:25 UTC
**Category:** design_gap
**Priority:** medium
**Status:** pending

### Detail
Duplicate route dirs exist: src/app/account/wishlist/page.tsx alongside src/app/wishlist/page.tsx, and src/app/new-drops/page.tsx alongside src/app/drops/page.tsx. The old hrefs were never 404ing - they resolved to duplicate pages. Proposal and spec both described them as 404s.

### Action
T9 deletes both orphans; correct the 404 framing in proposal section 2.3

---

## [L3] pattern — Button.tsx:52,74 hardcodes ease-[cubic-bezier(0.4,0,0.2,1...

**When:** 2026-09-23 15:29 UTC
**Category:** pattern
**Priority:** low
**Status:** pending

### Detail
Button.tsx:52,74 hardcodes ease-[cubic-bezier(0.4,0,0.2,1)] inline instead of importing SPRING_STATE from @/lib/motion. Same value today so no visual drift, but an un-deduplicated copy that can silently diverge.

### Action
T4 owns Button.tsx - swap the literal for the imported constant

---

## [L4] design_gap — Systemic parallax edge-gap: ArtistCard, CategoryCard, Com...

**When:** 2026-09-23 15:35 UTC
**Category:** design_gap
**Priority:** medium
**Status:** pending

### Detail
Systemic parallax edge-gap: ArtistCard, CategoryCard, ComebackCard use absolute inset-0 inside ParallaxLayer. Translating a layer exactly as tall as its frame pulls a transparent band in at one edge. T5 fixed its own three leaves with vertical overscan; these three remain.

### Action
Move the overscan into ParallaxLayer as a default, or add -inset-y to the three card image wrappers

---

## [L5] design_gap — PageHeader.tsx still renders the bordered eyebrow pill. H...

**When:** 2026-09-23 15:35 UTC
**Category:** design_gap
**Priority:** low
**Status:** pending

### Detail
PageHeader.tsx still renders the bordered eyebrow pill. Homepage and /editorial were weaned off it, but every other interior page still opens with it, so the gesture is now inconsistent across the site.

### Action
Decide: restore the pill on homepage surfaces, or remove it from PageHeader site-wide

---

## [L6] pattern — motion.ts comment on SPRING_STATE says 'snappier, no over...

**When:** 2026-09-23 15:37 UTC
**Category:** pattern
**Priority:** low
**Status:** pending

### Detail
motion.ts comment on SPRING_STATE says 'snappier, no overshoot'. Inaccurate: cubic-bezier(0.4,0,0.2,1) is standard ease-in-out and is NOT snappier than SPRING_ENTER, whose (0.32,0.72,0,1) is far more front-loaded. Also both named SPRING_* but neither is a spring - they are beziers, and springs vs beziers differ on interrupt behaviour.

### Action
Fix the comment; consider renaming to EASE_* so the tool class is honest

---

## [L7] pattern — src/lib/cn.ts is a dead compatibility shim re-exporting c...

**When:** 2026-09-23 15:37 UTC
**Category:** pattern
**Priority:** low
**Status:** pending

### Detail
src/lib/cn.ts is a dead compatibility shim re-exporting cn from @/lib/utils. Button.tsx and Reveal.tsx import from it; Drawer, ProductGallery, ProductVariantSelector import from @/lib/utils. Two import paths for one function across five sibling files.

### Action
Consolidate on @/lib/utils and delete cn.ts

---

## [L8] pattern — dev.log and AGENTS.md untracked in repo root; dev.log loo...

**When:** 2026-09-23 15:37 UTC
**Category:** pattern
**Priority:** low
**Status:** pending

### Detail
dev.log and AGENTS.md untracked in repo root; dev.log looks like it should be gitignored

### Action
Add dev.log to .gitignore

---

## [L9] design_gap — src/components/home/__checks__/sections.check.tsx fails w...

**When:** 2026-09-23 15:54 UTC
**Category:** design_gap
**Priority:** high
**Status:** pending

### Detail
src/components/home/__checks__/sections.check.tsx fails with 'useCart must be used inside <AppProviders>'. ProductCard calls useCart() but the check renders it via react-dom/server without a provider wrapper. Confirmed pre-existing by stashing changes and re-running on a clean tree.

### Action
Wrap the render in <AppProviders> inside that check file. Affects T8 - this is one of the .tsx checks it must decide about.

---

## [L10] pattern — Stale .next/types/validator.ts referenced the two routes ...

**When:** 2026-09-23 15:54 UTC
**Category:** pattern
**Priority:** medium
**Status:** pending

### Detail
Stale .next/types/validator.ts referenced the two routes T9 deleted, making tsc fail with TS2307 until .next/types was removed. Route deletions invalidate Next generated types; a cold tsc before the next build hits a false failure.

### Action
Delete .next/types after any route deletion, or always run the cold gate with .next removed first

---

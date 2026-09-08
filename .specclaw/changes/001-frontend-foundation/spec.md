# Spec: 001-frontend-foundation

## Functional Requirements

- FR1: Project builds and runs with `npm run build` / `npm run dev` with zero
  TypeScript or lint errors.
- FR2: Inter is applied as the default body/UI font; Space Grotesk is
  available as a utility class (`font-display`) for headlines per §4.
- FR3: Tailwind exposes the exact token values from §6–9 as named
  utilities (e.g. `bg-surface`, `text-muted`, `bg-accent`, `rounded-lg`,
  `p-6`) rather than raw hex/px values scattered through component code.
- FR4: A `/design-tokens` page renders every color swatch, every type-scale
  step (§5), the spacing scale (§7), and the radius scale (§8) with labels,
  so the tokens can be checked against the doc by eye.

## Non-Functional Requirements

- NFR1: Only light-mode tokens (§6 "Light" column) — dark mode explicitly
  deferred, do not build a theme switcher speculatively.
  Doc reference: §6 Core Colors table.
- NFR2: Spacing/radius/color values must match the doc's tables exactly
  (no "close enough" rounding) — §5–8 give exact px/hex values.
- NFR3: No component library dependency (shadcn, MUI, etc.) — the doc's
  own component list (§41) implies hand-built primitives in a later change.

## Acceptance Criteria

- AC1: `npm run build` exits 0.
- AC2: `/design-tokens` renders all 6 core color tokens (background,
  foreground, surface, surface-2, border, muted) plus the accent
  (`#7C3AED`) and 4 semantic colors, each with its hex value visible.
- AC3: `/design-tokens` renders all 12 typography scale steps (display-xl
  through micro) each in its own font-size/weight, labeled with the token
  name.
- AC4: Headings on the page use Space Grotesk; body text uses Inter —
  visually distinguishable.
- AC5: `/design-tokens` renders the spacing scale (4–120) as a row of
  bars/blocks with their px labels, and the 5 radius steps as boxes.

## Edge Cases

- EC1: `next/font/google` requires network access at build time — allowed
  network list includes registry.npmjs.org but font files are served from
  Google Fonts' CDN, not npm. **Confirmed risk**: if the sandbox's egress
  proxy blocks Google Fonts, `next/font` will fail the build. Mitigation:
  if the build fails on font fetch, fall back to self-hosted font files or
  a system-font stack and flag it — do not silently swap fonts without
  telling the user.
- EC2: Tailwind v4 changed config format (CSS-first, no `tailwind.config.ts`
  by default) vs Tailwind v3. Must confirm which major version
  `create-next-app` installs and use the matching config approach —
  do not assume v3 syntax works unchanged.

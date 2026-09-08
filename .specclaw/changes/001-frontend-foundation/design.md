# Design: 001-frontend-foundation

## Technical Approach

Standard `create-next-app` scaffold, then layer Tailwind theme tokens as
CSS custom properties + Tailwind v4 `@theme` block (Tailwind v4 is
CSS-first — no `tailwind.config.ts` needed for simple token extension,
confirmed by scaffold output before writing token code).

## Key Decision: font delivery

**Rejected:** `next/font/google` (the doc's obvious choice, and Next.js's
own recommended pattern). At build time it fetches font files from
`fonts.gstatic.com`, which is **not** on this sandbox's allowed egress
list (only `registry.npmjs.org` and a fixed set of package/git hosts are
allowed) — the build would fail on font fetch (spec.md EC1).

**Chosen instead:** `@fontsource/inter` + `@fontsource/space-grotesk` npm
packages. These ship the actual `.woff2` files inside the npm package
itself, so they download via `registry.npmjs.org` (allowed) with zero
runtime network calls. Same visual result (same font files, same weights),
just a different delivery mechanism. If this project is later moved to an
environment with open internet access, swapping to `next/font/google` is a
one-file change in `layout.tsx` — not blocking.

## File Changes Map

```
kpop-marketplace/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # NEW — root layout, font imports, metadata
│   │   ├── globals.css         # NEW — @theme tokens, base layer
│   │   ├── page.tsx            # REPLACED — create-next-app default → placeholder
│   │   └── design-tokens/
│   │       └── page.tsx        # NEW — token verification page
│   └── lib/
│       └── tokens.ts           # NEW — token values as typed JS objects (for design-tokens page + future component use)
├── tailwind.config.ts          # NEW (if v3) or absorbed into globals.css @theme (if v4)
├── package.json                # MODIFIED — add @fontsource/inter, @fontsource/space-grotesk
└── tsconfig.json               # from scaffold, unmodified
```

## Token Mapping (doc → Tailwind)

| Doc token (§6) | Value | Tailwind name |
|---|---|---|
| background | `#FFFFFF` | `bg-background` |
| foreground | `#0A0A0A` | `text-foreground` |
| surface | `#F5F5F5` | `bg-surface` |
| surface-2 | `#EBEBEB` | `bg-surface-2` |
| border | `#E5E5E5` | `border-border` |
| muted | `#737373` | `text-muted` |
| accent (Electric Violet) | `#7C3AED` | `bg-accent` / `text-accent` |
| success | `#16A34A` | `text-success` |
| warning | `#F59E0B` | `text-warning` |
| error | `#DC2626` | `text-error` |
| info | `#2563EB` | `text-info` |

Spacing (§7) and radius (§8) tables map 1:1 to Tailwind's `spacing`/`borderRadius`
theme extension keys, named after the doc's own tokens (`radius-sm/md/lg/xl/pill`).

## Risks

- Tailwind v4 syntax differs meaningfully from v3 tutorials/muscle memory —
  will verify actual installed version before writing token config (spec.md EC2).
- `@fontsource` packages set global CSS class-free `@font-face` — need to
  confirm weight files match what §4/§5 actually need (400/500/600) to avoid
  bundling unused weights.

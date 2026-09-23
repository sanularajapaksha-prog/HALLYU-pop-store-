/**
 * Runnable check that every route in ROUTES resolves to a real page.
 *   npx tsx src/lib/__checks__/routes.check.ts
 *
 * Eight broken hrefs reached production (`/products/:slug` for the real
 * `/product/:slug`, `/legal/privacy` for `/privacy`, `/new-drops` for
 * `/drops`, ...) and only a live browser caught them. This walks the
 * `src/app` tree instead, so a route that points at nothing fails the gate.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES, STATIC_ROUTES } from '../routes'

// Repo root is derived from this file's own URL, not process.cwd(), so the
// check gives the same answer whether it is run from the repo root, from a
// subdirectory, or by a runner that sets its own working directory.
// (import.meta.url over walking up for package.json: this file's depth is
// fixed by its own path, so one join beats a filesystem search loop.)
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const APP_DIR = path.join(REPO_ROOT, 'src', 'app')

/** `/shop` -> `src/app/shop/page.tsx`; `/` -> `src/app/page.tsx`. */
const pageFileFor = (route: string) =>
  path.join(APP_DIR, ...route.split('/').filter(Boolean), 'page.tsx')

const rel = (abs: string) => path.relative(REPO_ROOT, abs).split(path.sep).join('/')

// A silently-empty array would make every loop below vacuously pass — the
// classic way a check like this rots into a no-op.
assert.ok(
  STATIC_ROUTES.length > 0,
  'STATIC_ROUTES is empty: src/lib/routes.ts exports no static paths, so this check would pass without asserting anything',
)

// --- static routes ----------------------------------------------------------
for (const route of STATIC_ROUTES) {
  assert.ok(
    route.startsWith('/'),
    `ROUTES value ${JSON.stringify(route)} is not an absolute path - every route must start with "/"`,
  )
  const file = pageFileFor(route)
  assert.ok(
    existsSync(file),
    `route "${route}" (from STATIC_ROUTES in src/lib/routes.ts) has no page: expected ${rel(file)}. Either create that page or fix the path in src/lib/routes.ts.`,
  )
}

// --- dynamic builders -------------------------------------------------------
// Each builder is called with a probe slug; the `[slug]` segment directory is
// what must exist on disk, so the probe value itself is irrelevant.
const PROBE = '__probe__'
const builders: ReadonlyArray<[string, (slug: string) => string]> = [
  ['ROUTES.product', ROUTES.product],
  ['ROUTES.artist', ROUTES.artist],
  ['ROUTES.category', ROUTES.category],
]

for (const [name, build] of builders) {
  const built = build(PROBE)
  assert.ok(
    built.endsWith(`/${PROBE}`),
    `${name}("${PROBE}") returned "${built}" - a builder must append the slug as the last segment`,
  )
  const prefix = built.slice(0, -PROBE.length - 1)
  const file = path.join(APP_DIR, ...prefix.split('/').filter(Boolean), '[slug]', 'page.tsx')
  assert.ok(
    existsSync(file),
    `${name}() builds "${prefix}/<slug>" but there is no dynamic segment for it: expected ${rel(file)}. Either create that page or fix the builder in src/lib/routes.ts.`,
  )
}

console.log(`routes.check OK (${STATIC_ROUTES.length} static routes, ${builders.length} dynamic)`)

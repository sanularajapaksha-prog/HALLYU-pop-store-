/**
 * Runnable check for /shop's URL-sync round trip.
 *   npx tsx src/components/shop/__checks__/shopUrl.check.ts
 *
 * ShopView writes the URL and the server page parses it back. Those are two
 * different files, so this asserts they actually agree — a shared filter link
 * must reopen the exact view the sender was looking at.
 */
import assert from 'node:assert/strict'
import {
  EMPTY_FILTERS,
  filtersToParams,
  parseFiltersFromParams,
  parseSortFromParams,
  type ProductFilters,
  type SortKey,
} from '../../../lib/filters'

/** Mirrors ShopView.syncUrl exactly. Keep in sync if that changes. */
function buildQuery(filters: ProductFilters, sort: SortKey): string {
  const params = new URLSearchParams(filtersToParams(filters))
  if (sort !== 'featured') params.set('sort', sort)
  return params.toString()
}

/** Mirrors how Next hands searchParams to the page. */
function parseQuery(query: string): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {}
  for (const [k, v] of new URLSearchParams(query)) out[k] = v
  return out
}

function roundTrip(filters: ProductFilters, sort: SortKey) {
  const sp = parseQuery(buildQuery(filters, sort))
  return { filters: parseFiltersFromParams(sp), sort: parseSortFromParams(sp) }
}

// 1. Empty state produces a bare URL and survives the trip.
assert.equal(buildQuery(EMPTY_FILTERS, 'featured'), '', 'default view must have no query')
// NOTE: parseFiltersFromParams returns explicit `undefined` price keys while
// EMPTY_FILTERS omits them — same value, different key presence — so compare
// the facets and the bounds separately rather than with one deepEqual.
const blank = roundTrip(EMPTY_FILTERS, 'featured')
assert.deepEqual(blank.filters.artists, [])
assert.deepEqual(blank.filters.categories, [])
assert.deepEqual(blank.filters.availability, [])
assert.equal(blank.filters.minPrice, undefined)
assert.equal(blank.filters.maxPrice, undefined)
assert.equal(blank.sort, 'featured')

// 2. A fully loaded filter set round-trips field for field.
const full: ProductFilters = {
  artists: ['bts', 'ive'],
  categories: ['album'],
  availability: ['in-stock', 'pre-order'],
  minPrice: 0,
  maxPrice: 25000,
}
const loaded = roundTrip(full, 'price-desc')
assert.deepEqual(loaded.filters, full)
assert.equal(loaded.sort, 'price-desc')

// 3. minPrice: 0 is a real bound, not falsy-dropped.
assert.equal(roundTrip({ ...EMPTY_FILTERS, minPrice: 0 }, 'featured').filters.minPrice, 0)

// 4. Every sort key survives; 'featured' stays implicit (clean shareable URL).
for (const k of ['featured', 'newest', 'price-asc', 'price-desc', 'name'] as SortKey[]) {
  assert.equal(roundTrip(EMPTY_FILTERS, k).sort, k, `sort ${k} lost in round trip`)
}
assert.ok(!buildQuery(EMPTY_FILTERS, 'featured').includes('sort'))
assert.ok(buildQuery(EMPTY_FILTERS, 'newest').includes('sort=newest'))

// 5. A hand-edited / junk URL degrades to the default view, never throws.
const junk = parseFiltersFromParams(parseQuery('minPrice=abc&availability=teleported&sort=chaos'))
assert.equal(junk.minPrice, undefined)
assert.deepEqual(junk.availability, [])
assert.equal(parseSortFromParams(parseQuery('sort=chaos')), 'featured')

console.log('shopUrl.check OK')

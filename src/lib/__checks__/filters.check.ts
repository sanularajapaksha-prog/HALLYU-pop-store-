import assert from 'node:assert'
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filterProducts,
  filtersToParams,
  parseFiltersFromParams,
  parseSortFromParams,
  sortProducts,
  type ProductFilters,
} from '@/lib/filters'
import type { Product } from '@/types/product'

function p(over: Partial<Product> & { id: string }): Product {
  return {
    name: over.id,
    slug: over.id,
    artistId: 'art-bts',
    categoryId: 'cat-albums',
    description: '',
    price: 1000,
    stock: 5,
    status: 'ACTIVE',
    images: [],
    variants: [],
    releaseDate: '2026-01-01',
    isPreorder: false,
    isFeatured: false,
    isLimited: false,
    createdAt: '2026-01-01',
    ...over,
  }
}

const catalogue: Product[] = [
  p({ id: 'a', artistId: 'art-bts', price: 3000, createdAt: '2026-03-01', name: 'Zed' }),
  p({ id: 'b', artistId: 'art-ive', categoryId: 'cat-photocards', price: 1000, stock: 0 }),
  p({ id: 'c', artistId: 'art-ive', price: 2000, isPreorder: true, isFeatured: true, name: 'Ace' }),
]
const ids = (list: Product[]) => list.map((x) => x.id)

// --- totality: empty input never throws ---
assert.deepStrictEqual(filterProducts([], EMPTY_FILTERS), [])
assert.deepStrictEqual(sortProducts([], 'newest'), [])
assert.strictEqual(countActiveFilters(EMPTY_FILTERS), 0)

// empty facet = no constraint
assert.deepStrictEqual(ids(filterProducts(catalogue, EMPTY_FILTERS)), ['a', 'b', 'c'])

// unknown id matches nothing rather than crashing
assert.deepStrictEqual(filterProducts(catalogue, { ...EMPTY_FILTERS, artists: ['nope'] }), [])

// values inside a facet OR; facets AND
assert.deepStrictEqual(
  ids(filterProducts(catalogue, { ...EMPTY_FILTERS, artists: ['art-bts', 'art-ive'] })),
  ['a', 'b', 'c'],
)
assert.deepStrictEqual(
  ids(
    filterProducts(catalogue, {
      ...EMPTY_FILTERS,
      artists: ['art-ive'],
      categories: ['cat-albums'],
    }),
  ),
  ['c'],
)

// availability derives from stock + isPreorder; a pre-order with stock is not "in stock"
assert.deepStrictEqual(
  ids(filterProducts(catalogue, { ...EMPTY_FILTERS, availability: ['in-stock'] })),
  ['a'],
)
assert.deepStrictEqual(
  ids(filterProducts(catalogue, { ...EMPTY_FILTERS, availability: ['sold-out'] })),
  ['b'],
)
assert.deepStrictEqual(
  ids(filterProducts(catalogue, { ...EMPTY_FILTERS, availability: ['pre-order'] })),
  ['c'],
)

// price bounds are inclusive; inverted bounds yield nothing, not a throw
assert.deepStrictEqual(
  ids(filterProducts(catalogue, { ...EMPTY_FILTERS, minPrice: 1000, maxPrice: 2000 })),
  ['b', 'c'],
)
assert.deepStrictEqual(
  filterProducts(catalogue, { ...EMPTY_FILTERS, minPrice: 5000, maxPrice: 10 }),
  [],
)

// --- sort purity: input array untouched ---
const before = ids(catalogue)
sortProducts(catalogue, 'price-desc')
assert.deepStrictEqual(ids(catalogue), before, 'sortProducts must not mutate its input')

assert.deepStrictEqual(ids(sortProducts(catalogue, 'price-asc')), ['b', 'c', 'a'])
assert.deepStrictEqual(ids(sortProducts(catalogue, 'price-desc')), ['a', 'c', 'b'])
assert.deepStrictEqual(ids(sortProducts(catalogue, 'newest')), ['a', 'b', 'c'])
assert.deepStrictEqual(ids(sortProducts(catalogue, 'name')), ['c', 'b', 'a'])
// featured first, source order otherwise (stable)
assert.deepStrictEqual(ids(sortProducts(catalogue, 'featured')), ['c', 'a', 'b'])

// --- counting ---
assert.strictEqual(
  countActiveFilters({ artists: ['x', 'y'], categories: [], availability: ['in-stock'], minPrice: 0 }),
  4,
  'minPrice: 0 is a real bound and must count',
)

// --- URL round trip ---
const round: ProductFilters = {
  artists: ['art-bts', 'art-ive'],
  categories: ['cat-albums'],
  availability: ['in-stock', 'pre-order'],
  minPrice: 500,
  maxPrice: 9000,
}
assert.deepStrictEqual(parseFiltersFromParams(filtersToParams(round)), round)
assert.deepStrictEqual(filtersToParams(EMPTY_FILTERS), {}, 'empty facets omitted from the URL')

// junk params degrade to "no filter" rather than corrupting a compare
assert.deepStrictEqual(
  parseFiltersFromParams({
    artists: '',
    availability: 'in-stock,banana',
    minPrice: 'abc',
    maxPrice: '-5',
  }),
  { artists: [], categories: [], availability: ['in-stock'], minPrice: undefined, maxPrice: undefined },
)
// repeated query keys arrive as string[]
assert.deepStrictEqual(parseFiltersFromParams({ artists: ['a', 'b'] }).artists, ['a', 'b'])

assert.strictEqual(parseSortFromParams({}), 'featured')
assert.strictEqual(parseSortFromParams({ sort: 'bogus' }), 'featured')
assert.strictEqual(parseSortFromParams({ sort: 'price-desc' }), 'price-desc')

console.log('filters.check OK')

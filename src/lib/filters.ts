/**
 * Catalogue filter + sort logic — designsys.md §27 (Marketplace Filters).
 *
 * Pure and total: no React, no clock, no throwing. Every exported function
 * accepts empty arrays, unknown ids and malformed params without crashing, so
 * both Server Components and the client filter UI can call them freely.
 */

import type { Product } from '@/types/product'

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Name: A–Z' },
]

const SORT_KEYS: readonly SortKey[] = SORT_OPTIONS.map((o) => o.key)

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as readonly string[]).includes(value)
}

export type Availability = 'in-stock' | 'pre-order' | 'sold-out'

const AVAILABILITY_VALUES: readonly Availability[] = ['in-stock', 'pre-order', 'sold-out']

export interface ProductFilters {
  /** Artist ids. Empty = no constraint from this facet. */
  artists: string[]
  /** Category ids. Empty = no constraint from this facet. */
  categories: string[]
  availability: Availability[]
  /** Inclusive bound in integer LKR. Absent = unbounded. */
  minPrice?: number
  /** Inclusive bound in integer LKR. Absent = unbounded. */
  maxPrice?: number
}

export const EMPTY_FILTERS: ProductFilters = {
  artists: [],
  categories: [],
  availability: [],
}

/**
 * Availability is derived, never stored: a pre-order is a pre-order even when
 * it has stock, and anything else with no units left is sold out. Exported so
 * the sidebar's per-option counts use exactly the same rule as the filter.
 */
export function availabilityOf(product: Product): Availability {
  if (product.isPreorder) return 'pre-order'
  if (product.stock <= 0 || product.status === 'SOLD_OUT') return 'sold-out'
  return 'in-stock'
}

/** Facets AND together; values inside one facet OR together. */
export function filterProducts(products: Product[], f: ProductFilters): Product[] {
  return products.filter((p) => {
    if (f.artists.length > 0 && !f.artists.includes(p.artistId)) return false
    if (f.categories.length > 0 && !f.categories.includes(p.categoryId)) return false
    if (f.availability.length > 0 && !f.availability.includes(availabilityOf(p))) return false
    if (f.minPrice !== undefined && p.price < f.minPrice) return false
    if (f.maxPrice !== undefined && p.price > f.maxPrice) return false
    return true
  })
}

/**
 * Never mutates the input — callers pass module-level catalogue arrays.
 * Array#sort is stable in every engine Next 16 targets, so ties keep source
 * order and 'featured' needs no secondary key.
 */
export function sortProducts(products: Product[], key: SortKey): Product[] {
  const copy = [...products]
  switch (key) {
    case 'newest':
      // ISO 8601 strings compare lexicographically in chronological order.
      return copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'featured':
      return copy.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    default:
      return copy
  }
}

/** One per selected value, plus one for each price bound that is set. */
export function countActiveFilters(f: ProductFilters): number {
  return (
    f.artists.length +
    f.categories.length +
    f.availability.length +
    (f.minPrice !== undefined ? 1 : 0) +
    (f.maxPrice !== undefined ? 1 : 0)
  )
}

/** Next gives repeated query keys as string[]; take the first and split on commas. */
function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  const raw = Array.isArray(value) ? value.join(',') : value
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function toPrice(value: string | string[] | undefined): number | undefined {
  const first = Array.isArray(value) ? value[0] : value
  if (first === undefined || first.trim() === '') return undefined
  const n = Number(first)
  // Reject NaN, Infinity and negatives rather than letting them poison a compare.
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function parseFiltersFromParams(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  return {
    artists: toList(params.artists),
    categories: toList(params.categories),
    availability: toList(params.availability).filter((v): v is Availability =>
      (AVAILABILITY_VALUES as readonly string[]).includes(v),
    ),
    minPrice: toPrice(params.minPrice),
    maxPrice: toPrice(params.maxPrice),
  }
}

/** Inverse of parseFiltersFromParams. Empty facets are omitted, not blank. */
export function filtersToParams(f: ProductFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (f.artists.length > 0) out.artists = f.artists.join(',')
  if (f.categories.length > 0) out.categories = f.categories.join(',')
  if (f.availability.length > 0) out.availability = f.availability.join(',')
  if (f.minPrice !== undefined) out.minPrice = String(f.minPrice)
  if (f.maxPrice !== undefined) out.maxPrice = String(f.maxPrice)
  return out
}

export function parseSortFromParams(
  params: Record<string, string | string[] | undefined>,
): SortKey {
  const raw = Array.isArray(params.sort) ? params.sort[0] : params.sort
  return raw !== undefined && isSortKey(raw) ? raw : 'featured'
}

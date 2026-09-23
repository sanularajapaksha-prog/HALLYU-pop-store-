'use client'

import { useCallback, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/layout/EmptyState'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ActiveFilterChips } from '@/components/shop/ActiveFilterChips'
import { FilterDrawer } from '@/components/shop/FilterDrawer'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { SortSelect } from '@/components/shop/SortSelect'
import { getArtistById } from '@/lib/artists'
import {
  countActiveFilters,
  EMPTY_FILTERS,
  filterProducts,
  filtersToParams,
  sortProducts,
  type ProductFilters,
  type SortKey,
} from '@/lib/filters'
import type { Product } from '@/types/product'

export interface ShopViewProps {
  products: Product[]
  initialFilters: ProductFilters
  initialSort: SortKey
}

/** ponytail: 4 cards is one desktop row — beyond that they are below the fold. */
const PRIORITY_CARDS = 4
/** Craft rule 5 — stagger caps at 7 so a long grid never waits ~1s for the tail. */
const MAX_STAGGER_STEPS = 7

export function ShopView({ products, initialFilters, initialSort }: ShopViewProps) {
  const router = useRouter()
  const pathname = usePathname()

  // The URL is a WRITE-only mirror here, not the source of truth. Reading state
  // back out of useSearchParams would make every replace() a round trip and let
  // a stale render fight the user's next click; the page seeds us once from the
  // server-parsed params and we own it from there.
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters)
  const [sort, setSortState] = useState<SortKey>(initialSort)

  // Only ever called from a click (never per keystroke), so no debounce is
  // needed — the filter controls commit whole values, not characters.
  const syncUrl = useCallback(
    (nextFilters: ProductFilters, nextSort: SortKey) => {
      const params = new URLSearchParams(filtersToParams(nextFilters))
      if (nextSort !== 'featured') params.set('sort', nextSort)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  const setFilters = useCallback(
    (next: ProductFilters) => {
      setFiltersState(next)
      syncUrl(next, sort)
    },
    [sort, syncUrl],
  )

  const setSort = useCallback(
    (next: SortKey) => {
      setSortState(next)
      syncUrl(filters, next)
    },
    [filters, syncUrl],
  )

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters])

  const visible = sortProducts(filterProducts(products, filters), sort)
  const hasActiveFilters = countActiveFilters(filters) > 0

  return (
    <Container className="pb-20 md:pb-28">
      <div className="lg:flex lg:items-start lg:gap-10">
        <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <FilterSidebar filters={filters} onChange={setFilters} products={products} />
        </aside>

        <div className="min-w-0 flex-1">
          <FilterDrawer
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            products={products}
            className="lg:hidden"
          />

          <div className="mt-4 flex items-center justify-between gap-4 lg:mt-0">
            <p aria-live="polite" className="text-body-sm text-muted tabular-nums">
              {visible.length} {visible.length === 1 ? 'product' : 'products'}
            </p>
            <SortSelect value={sort} onChange={setSort} className="hidden lg:flex" />
          </div>

          {hasActiveFilters && (
            <ActiveFilterChips filters={filters} onChange={setFilters} className="mt-4" />
          )}

          <div className="mt-6 md:mt-8">
            {visible.length === 0 ? (
              <EmptyState
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                }
                title="No products match those filters"
                description="Try loosening a filter or two — the catalogue is bigger than this view suggests."
              />
            ) : (
              <ProductGrid>
                {visible.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i, MAX_STAGGER_STEPS) * 60}>
                    <ProductCard
                      product={product}
                      artistName={getArtistById(product.artistId)?.name ?? ''}
                      priority={i < PRIORITY_CARDS}
                    />
                  </Reveal>
                ))}
              </ProductGrid>
            )}
          </div>

          {visible.length === 0 && hasActiveFilters && (
            <div className="-mt-12 flex justify-center">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-pill border border-border px-5 py-2.5 text-body-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export default ShopView

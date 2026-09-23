'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import {
  countActiveFilters,
  filterProducts,
  SORT_OPTIONS,
  type ProductFilters,
  type SortKey,
} from '@/lib/filters'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

/**
 * Mobile filter + sort bar — designsys.md §27: `[ FILTER ]  [ SORT ]` opening a
 * bottom sheet. Hidden on desktop by the caller (the sidebar takes over there).
 */
export interface FilterDrawerProps {
  filters: ProductFilters
  onChange: (f: ProductFilters) => void
  sort: SortKey
  onSortChange: (k: SortKey) => void
  products: Product[]
  className?: string
}

type Sheet = 'filter' | 'sort' | null

function BarButton({
  onClick,
  children,
  badge,
}: {
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-lg bg-background py-2.5 text-body-sm font-medium',
        'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-2',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98]',
        'motion-reduce:transition-none motion-reduce:active:scale-100',
      )}
    >
      {children}
      {badge !== undefined && badge > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-accent px-1.5 text-micro text-white tabular-nums">
          {badge}
        </span>
      ) : null}
    </button>
  )
}

export function FilterDrawer({
  filters,
  onChange,
  sort,
  onSortChange,
  products,
  className,
}: FilterDrawerProps) {
  const [sheet, setSheet] = useState<Sheet>(null)
  // Draft state: edits inside the sheet only commit on "Apply", so a mobile
  // user is not watching the grid churn behind the backdrop on every tap.
  const [draft, setDraft] = useState<ProductFilters>(filters)

  const activeCount = countActiveFilters(filters)
  const resultCount = filterProducts(products, draft).length

  function openFilter() {
    setDraft(filters)
    setSheet('filter')
  }

  function apply() {
    onChange(draft)
    setSheet(null)
  }

  return (
    <>
      {/* Double bezel: outer shell wrapping the two inner cores. */}
      <div className={cn('rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5', className)}>
        <div className="flex items-stretch gap-1.5">
          <BarButton onClick={openFilter} badge={activeCount}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter
          </BarButton>

          <span aria-hidden="true" className="my-1 w-px bg-border" />

          <BarButton onClick={() => setSheet('sort')}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />
            </svg>
            Sort
          </BarButton>
        </div>
      </div>

      <Drawer
        open={sheet === 'filter'}
        onClose={() => setSheet(null)}
        side="bottom"
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              className="shrink-0"
              onClick={() => setDraft({ artists: [], categories: [], availability: [] })}
              disabled={countActiveFilters(draft) === 0}
            >
              Clear
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={apply} withArrow>
              {resultCount === 0
                ? 'No matches'
                : `Show ${resultCount} ${resultCount === 1 ? 'product' : 'products'}`}
            </Button>
          </div>
        }
      >
        <FilterSidebar filters={draft} onChange={setDraft} products={products} />
      </Drawer>

      <Drawer
        open={sheet === 'sort'}
        onClose={() => setSheet(null)}
        side="bottom"
        title="Sort by"
      >
        {/* A radio list, not the <select>: inside a sheet the options are the
            content, and a nested OS picker on top of a sheet is hostile. */}
        <fieldset>
          <legend className="sr-only">Sort products by</legend>
          <ul className="divide-y divide-border">
            {SORT_OPTIONS.map((o) => (
              <li key={o.key}>
                <label className="flex cursor-pointer items-center justify-between gap-3 py-3.5 text-body-sm">
                  <span>{o.label}</span>
                  <input
                    type="radio"
                    name="sort"
                    value={o.key}
                    checked={sort === o.key}
                    onChange={() => {
                      onSortChange(o.key)
                      setSheet(null)
                    }}
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 appearance-none rounded-pill border border-border bg-background',
                      'checked:border-[5px] checked:border-accent',
                      'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
                      'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                    )}
                  />
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </Drawer>
    </>
  )
}

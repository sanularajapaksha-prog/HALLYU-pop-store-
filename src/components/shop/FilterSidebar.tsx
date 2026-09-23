'use client'

import { useId } from 'react'
import { artists } from '@/lib/artists'
import { categories } from '@/lib/categories'
import {
  availabilityOf,
  countActiveFilters,
  type Availability,
  type ProductFilters,
} from '@/lib/filters'
import { cn, formatLKR } from '@/lib/utils'
import type { Product } from '@/types/product'

/**
 * Desktop filter sidebar — designsys.md §27.
 *
 * Counts are "how many products would this option add/keep", computed against
 * the OTHER facets only. That is the standard faceted-search behaviour: ticking
 * a second artist should show how many more products it brings in, not zero.
 */
export interface FilterSidebarProps {
  filters: ProductFilters
  onChange: (f: ProductFilters) => void
  products: Product[]
  className?: string
}

const AVAILABILITY_OPTIONS: Array<{ value: Availability; label: string }> = [
  { value: 'in-stock', label: 'In stock' },
  { value: 'pre-order', label: 'Pre-order' },
  { value: 'sold-out', label: 'Sold out' },
]

/** Toggle a value in a facet without mutating the caller's array. */
function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/**
 * Products surviving every facet EXCEPT `skip`, so each option in `skip` can be
 * counted independently. Deliberately re-derived per group rather than memoised:
 * the catalogue is a few hundred rows and three passes cost nothing.
 * ponytail: O(products x facets). Memoise if the catalogue passes ~5k rows.
 */
function narrow(
  products: Product[],
  f: ProductFilters,
  skip: 'artists' | 'categories' | 'availability',
): Product[] {
  return products.filter((p) => {
    if (skip !== 'artists' && f.artists.length > 0 && !f.artists.includes(p.artistId)) return false
    if (skip !== 'categories' && f.categories.length > 0 && !f.categories.includes(p.categoryId))
      return false
    if (
      skip !== 'availability' &&
      f.availability.length > 0 &&
      !f.availability.includes(availabilityOf(p))
    )
      return false
    if (f.minPrice !== undefined && p.price < f.minPrice) return false
    if (f.maxPrice !== undefined && p.price > f.maxPrice) return false
    return true
  })
}

function countBy(products: Product[], key: (p: Product) => string): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of products) {
    const k = key(p)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-body-sm font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
        {title}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-open:rotate-180 motion-reduce:transition-none"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  )
}

/**
 * Real <input type="checkbox">, visually replaced via peer + appearance-none.
 * The input keeps its own focus ring so keyboard users see the box light up.
 */
function CheckOption({
  checked,
  onToggle,
  label,
  count,
}: {
  checked: boolean
  onToggle: () => void
  label: string
  count: number
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-3 py-1.5">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onToggle}
        className={cn(
          'peer h-[18px] w-[18px] shrink-0 appearance-none rounded-sm border border-border bg-background',
          'checked:border-accent checked:bg-accent',
          'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
        )}
      />
      {/* Tick sits over the input; pointer-events-none so the label/input own the click. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none -ml-[30px] h-[18px] w-[18px] shrink-0 text-white opacity-0 peer-checked:opacity-100"
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      <label
        htmlFor={id}
        className="ml-3 flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-body-sm"
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-caption text-muted tabular-nums">{count}</span>
      </label>
    </div>
  )
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1.5 block text-micro text-muted">
        {label}
      </label>
      <div className="rounded-lg bg-surface p-1 ring-1 ring-foreground/5 transition-[box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:ring-2 focus-within:ring-accent motion-reduce:transition-none">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={value ?? ''}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value
            const n = Number(raw)
            onChange(raw === '' || !Number.isFinite(n) || n < 0 ? undefined : n)
          }}
          className="w-full rounded-sm bg-background px-3 py-2 text-body-sm outline-none placeholder:text-muted"
        />
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, onChange, products, className }: FilterSidebarProps) {
  const activeCount = countActiveFilters(filters)

  const artistCounts = countBy(narrow(products, filters, 'artists'), (p) => p.artistId)
  const categoryCounts = countBy(narrow(products, filters, 'categories'), (p) => p.categoryId)
  const availabilityCounts = countBy(narrow(products, filters, 'availability'), availabilityOf)

  // Only offer facet values the catalogue in view can actually produce, so a
  // category page never lists nine artists with a zero beside eight of them.
  const presentArtistIds = new Set(products.map((p) => p.artistId))
  const presentCategoryIds = new Set(products.map((p) => p.categoryId))
  const visibleArtists = artists.filter(
    (a) => presentArtistIds.has(a.id) || filters.artists.includes(a.id),
  )
  const visibleCategories = categories.filter(
    (c) => presentCategoryIds.has(c.id) || filters.categories.includes(c.id),
  )

  const priceBoundsInvalid =
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice

  return (
    // Craft rule 1 — double bezel: outer shell 20r, inner core 14r.
    <div className={cn('rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5', className)}>
      <div className="rounded-lg bg-background px-5 py-4">
        <div className="flex items-center justify-between gap-3 pb-1">
          <h2 className="text-caption tracking-[0.08em] text-muted uppercase">Filters</h2>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => onChange({ artists: [], categories: [], availability: [] })}
              className="rounded-pill px-2 py-1 text-caption text-accent transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {visibleArtists.length > 0 ? (
          <FilterGroup title="Artist">
            {visibleArtists.map((a) => (
              <CheckOption
                key={a.id}
                label={a.name}
                count={artistCounts.get(a.id) ?? 0}
                checked={filters.artists.includes(a.id)}
                onToggle={() => onChange({ ...filters, artists: toggle(filters.artists, a.id) })}
              />
            ))}
          </FilterGroup>
        ) : null}

        {visibleCategories.length > 0 ? (
          <FilterGroup title="Category">
            {visibleCategories.map((c) => (
              <CheckOption
                key={c.id}
                label={c.name}
                count={categoryCounts.get(c.id) ?? 0}
                checked={filters.categories.includes(c.id)}
                onToggle={() =>
                  onChange({ ...filters, categories: toggle(filters.categories, c.id) })
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        <FilterGroup title="Availability">
          {AVAILABILITY_OPTIONS.map((o) => (
            <CheckOption
              key={o.value}
              label={o.label}
              count={availabilityCounts.get(o.value) ?? 0}
              checked={filters.availability.includes(o.value)}
              onToggle={() =>
                onChange({
                  ...filters,
                  availability: toggle(filters.availability, o.value) as Availability[],
                })
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="flex items-end gap-3">
            <PriceInput
              label="Min (LKR)"
              value={filters.minPrice}
              onChange={(v) => onChange({ ...filters, minPrice: v })}
            />
            <PriceInput
              label="Max (LKR)"
              value={filters.maxPrice}
              onChange={(v) => onChange({ ...filters, maxPrice: v })}
            />
          </div>
          {priceBoundsInvalid ? (
            <p role="status" className="mt-2 text-caption text-error">
              Min is above max — no products can match.
            </p>
          ) : (
            <p className="mt-2 text-micro text-muted">
              {filters.minPrice !== undefined || filters.maxPrice !== undefined
                ? `${filters.minPrice !== undefined ? formatLKR(filters.minPrice) : 'Any'} – ${
                    filters.maxPrice !== undefined ? formatLKR(filters.maxPrice) : 'Any'
                  }`
                : 'Leave blank for no limit.'}
            </p>
          )}
        </FilterGroup>
      </div>
    </div>
  )
}

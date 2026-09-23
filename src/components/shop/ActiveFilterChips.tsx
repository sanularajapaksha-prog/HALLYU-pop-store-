'use client'

import { getArtistById } from '@/lib/artists'
import { categories } from '@/lib/categories'
import { countActiveFilters, type Availability, type ProductFilters } from '@/lib/filters'
import { cn, formatLKR } from '@/lib/utils'

/**
 * Removable pills for every active filter value — designsys.md §27.
 * Renders nothing when no filter is set, so callers need no guard.
 */
export interface ActiveFilterChipsProps {
  filters: ProductFilters
  onChange: (f: ProductFilters) => void
  className?: string
}

const AVAILABILITY_LABELS: Record<Availability, string> = {
  'in-stock': 'In stock',
  'pre-order': 'Pre-order',
  'sold-out': 'Sold out',
}

interface Chip {
  /** Unique across facets — ids could otherwise collide between facets. */
  key: string
  /** Used in the aria-label: "Remove <facet> filter <value>". */
  facet: string
  value: string
  remove: () => void
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function ActiveFilterChips({ filters, onChange, className }: ActiveFilterChipsProps) {
  if (countActiveFilters(filters) === 0) return null

  const chips: Chip[] = []

  for (const id of filters.artists) {
    chips.push({
      key: `artist:${id}`,
      facet: 'artist',
      // Unknown id (stale URL) still renders — it must stay removable.
      value: getArtistById(id)?.name ?? id,
      remove: () => onChange({ ...filters, artists: filters.artists.filter((v) => v !== id) }),
    })
  }

  for (const id of filters.categories) {
    chips.push({
      key: `category:${id}`,
      facet: 'category',
      value: categories.find((c) => c.id === id)?.name ?? id,
      remove: () =>
        onChange({ ...filters, categories: filters.categories.filter((v) => v !== id) }),
    })
  }

  for (const v of filters.availability) {
    chips.push({
      key: `availability:${v}`,
      facet: 'availability',
      value: AVAILABILITY_LABELS[v],
      remove: () =>
        onChange({ ...filters, availability: filters.availability.filter((x) => x !== v) }),
    })
  }

  if (filters.minPrice !== undefined) {
    chips.push({
      key: 'minPrice',
      facet: 'minimum price',
      value: `From ${formatLKR(filters.minPrice)}`,
      remove: () => onChange({ ...filters, minPrice: undefined }),
    })
  }

  if (filters.maxPrice !== undefined) {
    chips.push({
      key: 'maxPrice',
      facet: 'maximum price',
      value: `Up to ${formatLKR(filters.maxPrice)}`,
      remove: () => onChange({ ...filters, maxPrice: undefined }),
    })
  }

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.remove}
            aria-label={`Remove ${chip.facet} filter ${chip.value}`}
            className={cn(
              'group inline-flex items-center gap-2 rounded-pill bg-surface py-1.5 pr-2.5 pl-3.5 text-caption ring-1 ring-foreground/5',
              'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-2',
              'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98]',
              'motion-reduce:transition-none motion-reduce:active:scale-100',
            )}
          >
            <span className="truncate">{chip.value}</span>
            <span className="text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-foreground motion-reduce:transition-none">
              <XIcon />
            </span>
          </button>
        </li>
      ))}

      <li>
        <button
          type="button"
          onClick={() => onChange({ artists: [], categories: [], availability: [] })}
          className="rounded-pill px-3 py-1.5 text-caption text-accent transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none"
        >
          Clear all
        </button>
      </li>
    </ul>
  )
}

'use client'

import { useId } from 'react'
import { isSortKey, SORT_OPTIONS, type SortKey } from '@/lib/filters'
import { cn } from '@/lib/utils'

/**
 * Sort control — designsys.md §27 (mobile [SORT], desktop toolbar).
 *
 * ponytail: a native <select>. The OS picker is already accessible, keyboard
 * operable and free of JS. A custom listbox would be ~150 lines of ARIA to
 * reach the same place. Styled to match Input's double bezel.
 */
export interface SortSelectProps {
  value: SortKey
  onChange: (k: SortKey) => void
  className?: string
  /** Hide the visible label (the select keeps an accessible name). */
  hideLabel?: boolean
}

export function SortSelect({ value, onChange, className, hideLabel }: SortSelectProps) {
  const id = useId()

  return (
    <div className={cn('min-w-0', className)}>
      <label
        htmlFor={id}
        className={hideLabel ? 'sr-only' : 'mb-2 block text-caption text-muted'}
      >
        Sort by
      </label>

      {/* Outer shell — focus lives here so the whole assembly lights up. */}
      <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5 transition-[box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:ring-2 focus-within:ring-accent motion-reduce:transition-none">
        {/* Inner core — concentric radius: 20 - 6 = 14. */}
        <div className="relative flex items-center rounded-lg bg-background">
          <select
            id={id}
            value={value}
            onChange={(e) => {
              const next = e.target.value
              if (isSortKey(next)) onChange(next)
            }}
            className="w-full appearance-none bg-transparent py-2.5 pr-10 pl-4 text-body-sm outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 h-4 w-4 text-muted"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/IconButton'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  // ponytail: clamp lives here, not in every caller — also guards an out-of-range `value` prop
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div
      className={cn(
        'inline-block rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5',
        className
      )}
    >
      {/* inner core — concentric radius: 20 - 6 = 14 */}
      <div className="flex items-center gap-1 rounded-lg bg-background px-1 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
        <IconButton
          label="Decrease quantity"
          size="sm"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          // a stepper is not a toggle — undo IconButton's default aria-pressed
          aria-pressed={undefined}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3.5 8h9" />
          </svg>
        </IconButton>

        <span aria-live="polite" className="min-w-8 text-center text-body-sm tabular-nums">
          {value}
        </span>

        <IconButton
          label="Increase quantity"
          size="sm"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-pressed={undefined}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
        </IconButton>
      </div>
    </div>
  )
}

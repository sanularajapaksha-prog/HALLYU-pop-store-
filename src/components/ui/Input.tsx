'use client'

import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string
  error?: string
  icon?: ReactNode
  containerClassName?: string
}

export default function Input({
  label,
  error,
  icon,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-caption text-muted">
          {label}
        </label>
      )}

      {/* outer shell — focus lives here so the whole assembly lights up */}
      <div
        className={cn(
          'rounded-xl bg-surface p-1.5 ring-1 transition-[box-shadow,--tw-ring-color]',
          'duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
          error
            ? 'ring-2 ring-error focus-within:ring-accent'
            : 'ring-foreground/5 focus-within:ring-2 focus-within:ring-accent'
        )}
      >
        {/* inner core — concentric radius: 20 - 6 = 14 */}
        <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
          {icon && (
            <span className="flex shrink-0 items-center text-muted" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            {...props}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : props['aria-describedby']}
            className={cn(
              'w-full bg-transparent text-body-sm outline-none placeholder:text-muted',
              className
            )}
          />
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-caption text-error">
          {error}
        </p>
      )}
    </div>
  )
}

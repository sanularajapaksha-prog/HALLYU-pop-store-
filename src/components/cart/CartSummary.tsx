'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { FREE_SHIPPING_THRESHOLD, shippingFor } from '@/lib/cart'
import { cn, formatLKR } from '@/lib/utils'

export interface CartSummaryProps {
  subtotal: number
  /** Item count, for the "Subtotal (3 items)" label. */
  count: number
  /** Delivery surcharge on top of shipping. /checkout passes the chosen method's. */
  surcharge?: number
  /** False on /checkout, where the submit button lives in the form instead. */
  showCheckout?: boolean
  /** Extra content under the total, e.g. the checkout submit + reassurance line. */
  children?: ReactNode
  className?: string
  /** Heading level content — the page owns the <h1>, so this is an <h2>. */
  title?: string
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: ReactNode
  value: ReactNode
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4',
        emphasis ? 'text-body font-semibold' : 'text-body-sm text-muted',
      )}
    >
      <span>{label}</span>
      <span className={cn('tabular-nums', emphasis ? 'text-foreground' : 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}

/**
 * §31 — the totals panel. Sticky beside the line items on lg.
 *
 * Shipping is a MOCK: flat LKR 500, waived over LKR 15,000. There is no carrier
 * integration and no address-based rating; the note under the row says so in
 * the UI rather than only in this comment.
 */
export function CartSummary({
  subtotal,
  count,
  surcharge = 0,
  showCheckout = true,
  children,
  className,
  title = 'Order summary',
}: CartSummaryProps) {
  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping + surcharge
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
  const qualifiesFree = subtotal > 0 && shipping === 0

  return (
    /* Craft rule 1: DOUBLE-BEZEL. Outer 20px radius, p-1.5 (6px) → inner 14px. */
    <div
      className={cn(
        'rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5 lg:sticky lg:top-24',
        className,
      )}
    >
      <div className="rounded-lg bg-background p-6">
        <h2 className="text-heading-sm">{title}</h2>

        <div className="mt-6 space-y-3">
          <Row
            label={`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`}
            value={formatLKR(subtotal)}
          />
          <Row label="Shipping" value={shipping === 0 ? 'Free' : formatLKR(shipping)} />
          {surcharge > 0 ? <Row label="Express delivery" value={formatLKR(surcharge)} /> : null}
        </div>

        <p className="mt-3 text-caption text-muted">
          {qualifiesFree
            ? 'Free shipping applied.'
            : subtotal > 0
              ? `Add ${formatLKR(remainingForFreeShipping)} more for free shipping.`
              : `Flat ${formatLKR(500)} shipping, free over ${formatLKR(FREE_SHIPPING_THRESHOLD)}.`}{' '}
          <span className="text-muted/80">Estimated — shipping is not yet calculated by address.</span>
        </p>

        <hr className="my-6 border-0 border-t border-border" />

        <Row label="Total" value={formatLKR(total)} emphasis />

        {showCheckout ? (
          <Button href="/checkout" withArrow className="mt-6 w-full">
            CHECKOUT
          </Button>
        ) : null}

        {children}
      </div>
    </div>
  )
}

export default CartSummary

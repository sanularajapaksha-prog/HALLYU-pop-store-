'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/layout/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCart } from '@/context/CartContext'
import { resolveCartLines } from '@/lib/cart'

function BagIcon() {
  return (
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
      <path d="M6 8h12l-1 12H7L6 8ZM9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

function CartSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-4 py-6 sm:gap-6">
            <Skeleton className="aspect-square w-20 shrink-0 md:w-28" />
            <div className="flex-1 space-y-3 py-1">
              <Skeleton className="h-3 w-24 rounded-sm" />
              <Skeleton className="h-4 w-2/3 rounded-sm" />
              <Skeleton className="h-4 w-28 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="mt-10 h-72 w-full rounded-xl lg:mt-0" />
    </div>
  )
}

/**
 * /cart body. §31's drawer is the compact sibling of this page.
 *
 * Hydration: `hydrated` is false on the server render AND on the first client
 * render, so both emit the same skeleton — the bag then appears once
 * useSyncExternalStore swaps in the stored snapshot. Rendering the real (empty)
 * bag first would flash "Your bag is empty" at every returning customer.
 */
export function CartView() {
  // Not `subtotal`/`count` from context: they include lines whose product has
  // left the catalogue, which are not rendered. Both totals are derived from
  // the RESOLVED lines instead, so what is shown always matches what is priced.
  const { items, clear, hydrated } = useCart()
  const [confirmingClear, setConfirmingClear] = useState(false)

  if (!hydrated) {
    return (
      <Container className="pb-20 md:pb-28">
        <CartSkeleton />
      </Container>
    )
  }

  // Lines whose product left the catalogue are dropped, so this can be empty
  // while `items` is not — the empty state has to key off the RESOLVED lines.
  const lines = resolveCartLines(items)

  if (lines.length === 0) {
    return (
      <Container className="pb-20 md:pb-28">
        <EmptyState
          icon={<BagIcon />}
          title="Your bag is empty"
          description="Nothing here yet. Find an album, a photocard or a lightstick worth waiting by the door for."
          action={{ label: 'SHOP ALL', href: '/shop' }}
        />
      </Container>
    )
  }

  // Resolved lines only — an unresolvable line contributes nothing to show and
  // nothing to pay, so the panel must not price the raw context subtotal.
  const resolvedSubtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const resolvedCount = lines.reduce((sum, line) => sum + line.item.quantity, 0)

  return (
    <Container className="pb-20 md:pb-28">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
        <section aria-label="Items in your bag" className="min-w-0">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <CartLineItem
                key={`${line.item.productId}:${line.item.variantId ?? ''}`}
                item={line.item}
                product={line.product}
                artistName={line.artistName}
              />
            ))}
          </ul>

          {/* Two-step destructive action: the first click only arms it. No
              window.confirm() — it is unstyleable and blocks the main thread. */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {confirmingClear ? (
              <>
                <p className="text-body-sm text-muted">Remove all {resolvedCount} items?</p>
                <button
                  type="button"
                  onClick={() => {
                    clear()
                    setConfirmingClear(false)
                  }}
                  className="rounded-pill px-3 py-1.5 text-body-sm font-medium text-error transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98] motion-reduce:transition-none"
                >
                  Yes, clear bag
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="rounded-pill px-3 py-1.5 text-body-sm text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98] motion-reduce:transition-none"
                >
                  Keep them
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="rounded-pill px-3 py-1.5 text-body-sm text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98] motion-reduce:transition-none"
              >
                Clear bag
              </button>
            )}
          </div>
        </section>

        <div className="mt-10 lg:mt-0">
          <CartSummary subtotal={resolvedSubtotal} count={resolvedCount} />
        </div>
      </div>
    </Container>
  )
}

export default CartView

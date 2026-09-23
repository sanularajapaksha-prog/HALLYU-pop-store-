'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { IconButton } from '@/components/ui/IconButton'
import QuantitySelector from '@/components/ui/QuantitySelector'
import { useCart } from '@/context/CartContext'
import { resolveCartLines, type CartLine } from '@/lib/cart'
import { formatLKR } from '@/lib/utils'

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12M10 11v5M14 11v5" />
    </svg>
  )
}

/**
 * Compact row. NOT <CartLineItem>: at 448px the page row's two-column
 * name/price/stepper layout wraps into a mess, and the drawer drops the
 * artist line and the line total to keep four items visible without scrolling.
 */
function DrawerLine({ line, onNavigate }: { line: CartLine; onNavigate: () => void }) {
  const { updateQuantity, removeItem } = useCart()
  const { item, product, variant, unitPrice } = line
  const max = Math.max(1, variant?.stock ?? product.stock)
  const image = variant?.images[0] ?? product.images[0]

  return (
    <li className="flex gap-3 py-4">
      <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
        {image ? (
          <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-body-sm font-medium">
              <Link
                href={`/product/${product.slug}`}
                onClick={onNavigate}
                className="rounded-sm transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {product.name}
              </Link>
            </h3>
            {variant ? <p className="truncate text-caption text-muted">{variant.name}</p> : null}
          </div>
          <IconButton
            label={`Remove ${product.name} from bag`}
            size="sm"
            onClick={() => removeItem(item.productId, item.variantId)}
            aria-pressed={undefined}
            className="-mr-2 -mt-1 text-muted hover:text-error"
          >
            <TrashIcon />
          </IconButton>
        </div>

        <div className="flex items-center justify-between gap-2">
          <QuantitySelector
            value={Math.min(item.quantity, max)}
            onChange={(next) => updateQuantity(item.productId, next, item.variantId)}
            min={1}
            max={max}
          />
          <p className="text-body-sm font-semibold tabular-nums">
            {formatLKR(unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}

/**
 * §31 — the side drawer. Mounted ONCE in <AppProviders>, so any component that
 * calls useCart().openCart() gets it; never mount it per page.
 *
 * `hydrated` is not gated here the way /cart gates it: the drawer only renders
 * at all once `isOpen` is true, and isOpen can only become true from a click,
 * which is necessarily after hydration.
 */
export function CartDrawer() {
  const { items, isOpen, closeCart } = useCart()
  const lines = resolveCartLines(items)

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const count = lines.reduce((sum, line) => sum + line.item.quantity, 0)

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      side="right"
      title="Your Bag"
      footer={
        lines.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-body-sm text-muted">
                Subtotal ({count} {count === 1 ? 'item' : 'items'})
              </span>
              <span className="text-body font-semibold tabular-nums">{formatLKR(subtotal)}</span>
            </div>
            <p className="text-caption text-muted">Shipping calculated at checkout.</p>
            <Button href="/checkout" withArrow onClick={closeCart} className="w-full">
              CHECKOUT
            </Button>
            <Button
              href="/cart"
              variant="tertiary"
              onClick={closeCart}
              className="w-full justify-center"
            >
              View full bag
            </Button>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <p className="text-heading-sm">Your bag is empty</p>
          <p className="mt-2 text-body-sm text-muted">
            Add something worth waiting by the door for.
          </p>
          <Button href="/shop" withArrow onClick={closeCart} className="mt-8">
            SHOP ALL
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {lines.map((line) => (
            <DrawerLine
              key={`${line.item.productId}:${line.item.variantId ?? ''}`}
              line={line}
              onNavigate={closeCart}
            />
          ))}
        </ul>
      )}
    </Drawer>
  )
}

export default CartDrawer

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IconButton } from '@/components/ui/IconButton'
import QuantitySelector from '@/components/ui/QuantitySelector'
import { ProductPrice } from '@/components/product/ProductPrice'
import { useCart, type CartItem } from '@/context/CartContext'
import { cn, formatLKR } from '@/lib/utils'
import type { Product } from '@/types/product'

export interface CartLineItemProps {
  item: CartItem
  product: Product
  artistName: string
  className?: string
}

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
 * §31 — one row of the bag. Used by /cart; the drawer renders its own compact
 * variant because a 28px thumbnail plus a stepper does not fit a 448px panel.
 *
 * Reads the cart itself rather than taking onChange/onRemove props: every call
 * site would wire the identical three-arg passthrough, and the item already
 * carries the productId+variantId key the mutators need.
 */
export function CartLineItem({ item, product, artistName, className }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const variant = item.variantId
    ? product.variants.find((v) => v.id === item.variantId)
    : undefined
  const unitPrice = variant?.price ?? product.price
  // Stock follows the selected variant; floor the cap at 1 so QuantitySelector's
  // clamp never inverts (min 1 > max 0) on a line that went out of stock.
  const max = Math.max(1, variant?.stock ?? product.stock)
  const image = variant?.images[0] ?? product.images[0]

  return (
    <li
      className={cn(
        'flex gap-4 py-6 sm:gap-6',
        className,
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative aspect-square w-20 overflow-hidden rounded-lg bg-surface md:w-28">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 768px) 112px, 80px"
              className="object-cover"
            />
          ) : null}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-micro uppercase tracking-[0.2em] text-muted">{artistName}</p>
          <h3 className="mt-1 text-body-sm font-medium">
            <Link
              href={`/product/${product.slug}`}
              className="rounded-sm transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {product.name}
            </Link>
          </h3>
          {variant ? <p className="mt-1 text-caption text-muted">{variant.name}</p> : null}
          <ProductPrice
            price={unitPrice}
            compareAtPrice={variant ? undefined : product.compareAtPrice}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
          <QuantitySelector
            value={Math.min(item.quantity, max)}
            onChange={(next) => updateQuantity(item.productId, next, item.variantId)}
            min={1}
            max={max}
          />

          <div className="flex items-center gap-2 sm:mt-1 sm:flex-row-reverse">
            <IconButton
              label={`Remove ${product.name} from bag`}
              size="sm"
              onClick={() => removeItem(item.productId, item.variantId)}
              aria-pressed={undefined}
              className="text-muted hover:text-error"
            >
              <TrashIcon />
            </IconButton>
            <p className="text-body-sm font-semibold tabular-nums">
              <span className="sr-only">Line total: </span>
              {formatLKR(unitPrice * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}

export default CartLineItem

/**
 * Pure cart helpers shared by /cart, the cart drawer and /checkout.
 *
 * No React, no DOM, no clock, no randomness — safe on both sides of the
 * hydration boundary, which is the whole point of `orderNumber` below.
 */
import { getArtistById } from '@/lib/artists'
import { products } from '@/lib/products'
import type { CartItem } from '@/context/CartContext'
import type { Product, ProductVariant } from '@/types/product'

export interface CartLine {
  item: CartItem
  product: Product
  variant?: ProductVariant
  artistName: string
  /** Variant price when a variant is selected, else the base price. */
  unitPrice: number
  lineTotal: number
}

/** Flat mock shipping — §46 phase 1 has no carrier integration. */
export const SHIPPING_FLAT = 500
export const FREE_SHIPPING_THRESHOLD = 15_000

/** Delivery options for /checkout. Prices are surcharges on top of shipping. */
export const DELIVERY_METHODS = [
  { id: 'standard', label: 'Standard', detail: '3–5 business days', surcharge: 0 },
  { id: 'express', label: 'Express', detail: '1–2 business days', surcharge: 750 },
] as const

export type DeliveryMethodId = (typeof DELIVERY_METHODS)[number]['id']

export const isDeliveryMethodId = (v: string): v is DeliveryMethodId =>
  DELIVERY_METHODS.some((m) => m.id === v)

/**
 * `productId` matches Product.id first, then Product.slug — CartContext accepts
 * either, so the resolver has to as well. Unresolvable ids are DROPPED, not
 * rendered as a broken row: stored carts outlive catalogue changes.
 */
export function resolveCartLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId || p.slug === item.productId)
    if (!product) continue

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : undefined
    const unitPrice = variant?.price ?? product.price

    lines.push({
      item,
      product,
      variant,
      artistName: getArtistById(product.artistId)?.name ?? 'Unknown artist',
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    })
  }

  return lines
}

/** Free over the threshold, flat below it, and nothing to ship on an empty bag. */
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
}

/**
 * Deterministic mock order number derived from the bag's contents.
 *
 * NOT Math.random() / Date.now(): both differ between the server render and the
 * hydrating one, and this string is rendered. A 32-bit FNV-1a over the sorted
 * lines gives a stable "KPM-XXXXXX" for the same bag on both sides.
 *
 * ponytail: display-only, never an identifier — collisions are irrelevant until
 * a real orders backend exists, and then it issues the number instead.
 */
export function orderNumber(items: CartItem[]): string {
  const seed = items
    .map((i) => `${i.productId}:${i.variantId ?? ''}:${i.quantity}`)
    .sort()
    .join('|')

  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    // FNV prime, via shifts so the whole thing stays in 32-bit integer land.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0
  }

  return `KPM-${hash.toString(36).toUpperCase().padStart(7, '0').slice(-7)}`
}

/** Trimmed-non-empty. Used for every required text field on /checkout. */
export const isFilled = (value: string): boolean => value.trim().length > 0

/**
 * Pragmatic email shape check: something, one @, something, one dot, something —
 * no whitespace anywhere. Deliberately NOT RFC 5322: the full grammar accepts
 * addresses no mail provider issues and rejecting a real address is worse than
 * accepting a fake one the (nonexistent) backend would bounce.
 */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

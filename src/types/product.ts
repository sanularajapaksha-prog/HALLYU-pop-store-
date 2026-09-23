/**
 * Product domain types.
 * Spec: designsys.md §44 (Data Model Foundation), §16 (Product Card), §17 (Product Badges).
 *
 * Conventions used across the whole domain layer:
 * - Money is an INTEGER amount of LKR. No cents, no floats, no currency objects.
 * - Dates are ISO 8601 strings ("2026-03-14" or full timestamps), never `Date`
 *   objects — `Date` is not serializable across the RSC boundary and reading the
 *   clock during render causes hydration mismatches.
 */

/** Sellable state of a product. Drives the availability dot on the card (§16). */
export type ProductStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'SOLD_OUT'
  | 'ARCHIVED';

/**
 * §17 — at most one or two badges per product, kept small.
 * Values are the literal display strings so cards never need a lookup map.
 */
export type ProductBadge =
  | 'NEW'
  | 'LIMITED'
  | 'PRE-ORDER'
  | 'LOW-STOCK'
  | 'EXCLUSIVE';

/** One image in a product or variant gallery. §16 expects a 1:1 aspect ratio. */
export interface ProductImage {
  id: string;
  /** Absolute or root-relative URL passed straight to next/image. */
  url: string;
  /** Required, non-empty: a11y is non-negotiable. Empty string only for pure decoration. */
  alt: string;
  width: number;
  height: number;
}

/**
 * §44 — a purchasable variation (version / member / edition / size / color).
 * `attributes` holds those axes as plain string pairs, e.g. { version: 'Estimated', member: 'Jimin' }.
 */
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  /** Integer LKR. Absolute price for this variant, not a delta from the parent. */
  price: number;
  /** Units on hand. 0 means sold out. Never negative. */
  stock: number;
  images: ProductImage[];
  attributes: Record<string, string>;
}

/** §44 — the core catalogue entity. */
export interface Product {
  id: string;
  name: string;
  /** URL segment, also the deterministic picsum seed. Unique across the catalogue. */
  slug: string;
  artistId: string;
  categoryId: string;
  description: string;
  /** Integer LKR. */
  price: number;
  /** Integer LKR. Present only when discounted; must be greater than `price`. */
  compareAtPrice?: number;
  /** Aggregate stock across variants when variants exist. */
  stock: number;
  status: ProductStatus;
  images: ProductImage[];
  /** Empty array when the product has no variation axes. */
  variants: ProductVariant[];
  /** ISO date string. For pre-orders this is the future ship/release date. */
  releaseDate: string;
  isPreorder: boolean;
  isFeatured: boolean;
  isLimited: boolean;
  /** ISO date string. Drives the NEW badge and default catalogue sort. */
  createdAt: string;
}

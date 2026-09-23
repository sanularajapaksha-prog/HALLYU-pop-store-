"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Badge } from "@/components/ui/Badge";
import Divider from "@/components/ui/Divider";
import type { Product, ProductBadge } from "@/types/product";

export interface ProductInfoProps {
  product: Product;
  artistName: string;
  artistHref: string;
  /** Rendered inside the sticky column under the price block. */
  shippingNote: string;
}

/** Craft rule 8 — stroke 1.25, currentColor, aria-hidden. */
function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-1 h-3.5 w-3.5 shrink-0 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

/**
 * §17 — at most two badges. Derived here rather than stored so it can never
 * disagree with stock.
 */
function badgesFor(product: Product, stock: number): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (product.isPreorder) badges.push("PRE-ORDER");
  if (product.isLimited) badges.push("LIMITED");
  if (badges.length < 2 && stock > 0 && stock <= 5) badges.push("LOW-STOCK");
  return badges.slice(0, 2);
}

/**
 * §28 — the whole interactive half of the product page.
 *
 * WHY THE GALLERY LIVES HERE AND NOT IN page.tsx: §24 says a variant changes
 * images and price. Variant state is client state, so the gallery has to read
 * it. Keeping the gallery in the server page would mean lifting the same state
 * into a second client wrapper — this component is that wrapper, and it renders
 * both columns of the §28 two-column layout.
 *
 * The product object is fully serializable (plain strings/numbers/arrays), so
 * passing it across the RSC boundary is cheap and legal.
 */
export function ProductInfo({ product, artistName, artistHref, shippingNote }: ProductInfoProps) {
  const { variants } = product;

  /*
   * Default to the first IN-STOCK variant, not simply the first: opening a page
   * with a sold-out version preselected shows a disabled buy button on a product
   * that is actually purchasable. Falls back to the first variant when every
   * version is gone, so the selector still reflects a real option.
   */
  const [selectedId, setSelectedId] = useState<string>(
    () => (variants.find((variant) => variant.stock > 0) ?? variants[0])?.id ?? "",
  );

  const selectedVariant = variants.find((variant) => variant.id === selectedId);

  // A product without variants falls back to its own price/stock/images. The
  // selector renders nothing in that case, so nothing can change these.
  const price = selectedVariant?.price ?? product.price;
  const stock = selectedVariant?.stock ?? product.stock;
  const images =
    selectedVariant !== undefined && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images;

  /*
   * compareAtPrice belongs to the base product. Showing it beside a DIFFERENT
   * variant's price would invent a discount that does not exist (e.g. the 8,400
   * Compact struck through against the Standard's 15,500). Only show it when the
   * displayed price is the one it was quoted against.
   */
  const compareAtPrice = price === product.price ? product.compareAtPrice : undefined;

  const badges = badgesFor(product, stock);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
      {/* ── Left: gallery. Scrolls normally while the right column sticks. ── */}
      <ProductGallery images={images} productName={product.name} priority />

      {/* ── Right: info. §28 sticky column. ── */}
      <div className="lg:sticky lg:top-24">
        {badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant={badge} />
            ))}
          </div>
        )}

        <Link
          href={artistHref}
          className="inline-block rounded-sm text-caption uppercase tracking-[0.18em] text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {artistName}
        </Link>

        <h1 className="mt-2 font-display text-display-md text-foreground">{product.name}</h1>

        <ProductPrice price={price} compareAtPrice={compareAtPrice} size="lg" className="mt-4" />

        <p className="mt-4 text-body text-muted">{product.description}</p>

        {variants.length > 0 && (
          <ProductVariantSelector
            variants={variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="mt-8"
          />
        )}

        {/* Stock line: a number, not a vague "in stock", because scarcity is the
            whole purchase driver for collectibles (§1). */}
        <p className="mt-6 text-caption text-muted" aria-live="polite">
          {stock <= 0
            ? "Currently sold out"
            : stock <= 5
              ? `Only ${stock} left`
              : `${stock} in stock`}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AddToCart
            productId={product.id}
            variantId={selectedVariant?.id}
            stock={stock}
            className="min-w-0 flex-1"
          />
          <WishlistButton slug={product.slug} productName={product.name} className="h-12 w-12 shrink-0" />
        </div>

        <Divider className="my-8" />

        <div className="space-y-6">
          <section aria-labelledby="product-details-heading">
            <h2
              id="product-details-heading"
              className="text-caption uppercase tracking-[0.18em] text-muted"
            >
              Details
            </h2>
            <dl className="mt-3 space-y-2 text-body-sm">
              {selectedVariant !== undefined && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted">SKU</dt>
                  <dd className="text-foreground">{selectedVariant.sku}</dd>
                </div>
              )}
              {selectedVariant !== undefined &&
                Object.entries(selectedVariant.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <dt className="w-24 shrink-0 capitalize text-muted">{key}</dt>
                    <dd className="text-foreground">{value}</dd>
                  </div>
                ))}
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted">Release</dt>
                {/* Sliced, not Date-formatted: parsing to a Date and formatting
                    would render differently per locale on server vs client. */}
                <dd className="tabular-nums text-foreground">
                  {product.releaseDate.slice(0, 10)}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="text-caption uppercase tracking-[0.18em] text-muted">
              Shipping
            </h2>
            <ul className="mt-3 space-y-2 text-body-sm text-muted">
              <li className="flex gap-2">
                <CheckIcon />
                <span>{shippingNote}</span>
              </li>
              <li className="flex gap-2">
                <CheckIcon />
                <span>Tracked island-wide delivery across Sri Lanka.</span>
              </li>
              <li className="flex gap-2">
                <CheckIcon />
                <span>Collector-safe packing — sleeved, boxed and corner-protected.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;

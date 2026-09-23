"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { SPRING_ENTER, SPRING_STATE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Product, ProductBadge } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { ProductPrice } from "./ProductPrice";
import { WishlistButton } from "./WishlistButton";

/** At or below this, a product reads as "LOW STOCK" rather than "IN STOCK" (§16). */
const LOW_STOCK_THRESHOLD = 5;

/**
 * "New" is a property of the DATA, not of the current time. Reading the clock
 * here would render one thing on the server and another on the client and blow
 * up hydration, so `createdAt` is compared against a fixed catalogue cutoff.
 */
const NEW_SINCE = "2026-08-01";

function isNew(product: Product): boolean {
  // Both sides are ISO date strings, so lexicographic compare IS date compare.
  return product.createdAt >= NEW_SINCE;
}

/**
 * §17 — at most two badges, kept small so they never overpower the image.
 * Priority is explicit and ordered: the two most decision-relevant facts win.
 * SOLD_OUT is deliberately absent — it gets the overlay treatment instead, so a
 * sold-out card never spends a badge slot restating what the overlay says.
 */
function pickBadges(product: Product): ProductBadge[] {
  const candidates: Array<ProductBadge | false> = [
    product.isPreorder && "PRE-ORDER",
    product.isLimited && "LIMITED",
    product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && "LOW-STOCK",
    isNew(product) && "NEW",
    product.isFeatured && "EXCLUSIVE",
  ];

  return candidates
    .filter((badge): badge is ProductBadge => Boolean(badge))
    .slice(0, 2);
}

interface Availability {
  label: string;
  dot: string;
}

function availability(product: Product): Availability {
  if (product.stock === 0) return { label: "SOLD OUT", dot: "bg-muted" };
  if (product.isPreorder) return { label: "PRE-ORDER", dot: "bg-info" };
  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return { label: "LOW STOCK", dot: "bg-warning" };
  }
  return { label: "IN STOCK", dot: "bg-success" };
}

/** Matches the 2-col mobile / 4-col desktop / 5-col xl grid in ProductGrid. */
const IMAGE_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw";

export interface ProductCardProps {
  product: Product;
  artistName: string;
  /** True for above-the-fold cards only — it disables lazy loading. */
  priority?: boolean;
}

export function ProductCard({
  product,
  artistName,
  priority = false,
}: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const primary = product.images[0];
  const secondary = product.images[1];
  const soldOut = product.stock === 0;
  const badges = pickBadges(product);
  const { label, dot } = availability(product);

  // A product with one image (or none) must not flash blank on hover: the swap
  // layer is simply never rendered and the primary image keeps its opacity.
  const hasSwap = secondary !== undefined;

  // A product with a variation axis cannot be added blind — picking for the
  // user would drop a variant-less line into the bag. Those cards keep the link
  // only; quick add is for single-SKU products.
  const quickAddable = !soldOut && product.variants.length === 0;

  // Guard an empty gallery rather than crashing on images[0].url. Bad data
  // should cost one card, not the whole page.
  if (primary === undefined) return null;

  return (
    <article
      className={cn(
        // ── DOUBLE-BEZEL — outer shell ─────────────────────────────────
        "group relative rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5",
        `transition-[transform,box-shadow] duration-300 ${SPRING_STATE}`,
        "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        // focus-within so keyboarding into the card lifts it exactly like hover.
        "focus-within:-translate-y-0.5 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "motion-reduce:focus-within:translate-y-0",
      )}
    >
      {/* ── inner core — concentric radius: 20 − 6 = 14 ─────────────────── */}
      <div className="overflow-hidden rounded-lg bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
        {/* ── image area ───────────────────────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden bg-surface">
          <Image
            src={primary.url}
            alt={primary.alt}
            fill
            priority={priority}
            sizes={IMAGE_SIZES}
            className={cn(
              "object-cover",
              `transition-[transform,opacity] duration-300 ${SPRING_STATE}`,
              "group-hover:scale-105",
              hasSwap && !soldOut && "group-hover:opacity-0",
              soldOut && "opacity-50 grayscale",
              "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              // Without this, reduced motion hid BOTH layers on hover: image 1
              // faded out while image 2 was held at opacity-0, leaving an empty
              // grey square. Reduced motion keeps image 1 and skips the swap.
              !soldOut && "motion-reduce:group-hover:opacity-100",
            )}
          />

          {/* Image 2 — decorative: image 1 already carries the alt text, so
              announcing the same product twice would be noise. */}
          {hasSwap && !soldOut ? (
            <Image
              src={secondary.url}
              alt=""
              aria-hidden="true"
              fill
              sizes={IMAGE_SIZES}
              className={cn(
                "object-cover opacity-0",
                `transition-[transform,opacity] duration-300 ${SPRING_STATE}`,
                "group-hover:scale-105 group-hover:opacity-100",
                "motion-reduce:transition-none motion-reduce:group-hover:opacity-0",
              )}
            />
          ) : null}

          {/* ── badges — max 2, §17 ───────────────────────────────────── */}
          {badges.length > 0 && !soldOut ? (
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1.5">
              {badges.map((badge) => (
                <Badge key={badge} variant={badge} />
              ))}
            </div>
          ) : null}

          {/* ── sold-out overlay ──────────────────────────────────────── */}
          {soldOut ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <span className="rounded-pill bg-background/90 px-4 py-1.5 text-micro font-medium uppercase tracking-[0.2em] text-foreground ring-1 ring-foreground/10 backdrop-blur-sm">
                Sold out
              </span>
            </div>
          ) : null}

          {/* ── LINK OVERLAY ──────────────────────────────────────────────
              The <a> is a SIBLING of the wishlist and quick-add buttons, never
              their parent: a <button> inside an <a> is invalid HTML and breaks
              keyboard activation. The link carries the accessible name, so the
              visible title below is aria-hidden to avoid a double announcement. */}
          <Link
            href={`/product/${product.slug}`}
            className={cn(
              "absolute inset-0 z-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
          >
            <span className="sr-only">
              {artistName} — {product.name}
              {soldOut ? " (sold out)" : ""}
            </span>
          </Link>

          {/* ── wishlist — sibling of the link, stacked above it ───────────
              ALWAYS visible on touch (there is no hover there); on pointer
              devices it fades in with the card. A bare
              `opacity-0 group-hover:opacity-100` would hide it on mobile. */}
          <div
            className={cn(
              "absolute right-3 top-3 z-20",
              "opacity-100",
              "[@media(hover:hover)]:opacity-0",
              "[@media(hover:hover)]:group-hover:opacity-100",
              // Without this a keyboard user on desktop could focus an
              // invisible button.
              "[@media(hover:hover)]:group-focus-within:opacity-100",
              `transition-opacity duration-300 ${SPRING_STATE}`,
              "motion-reduce:transition-none",
            )}
          >
            <WishlistButton slug={product.slug} productName={product.name} />
          </div>

          {/* ── QUICK ADD — pointer devices only, single-SKU only ───────── */}
          {quickAddable ? (
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 hidden p-2",
                "[@media(hover:hover)]:block",
                "translate-y-full opacity-0",
                `transition-[transform,opacity] duration-500 ${SPRING_ENTER}`,
                "group-hover:translate-y-0 group-hover:opacity-100",
                "group-focus-within:translate-y-0 group-focus-within:opacity-100",
                // Reduced motion: no slide. It appears in place instead of
                // being permanently unreachable.
                "motion-reduce:translate-y-0 motion-reduce:transition-none",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  addItem(product.id, 1);
                  openCart();
                }}
                className={cn(
                  "w-full rounded-md bg-background/90 px-3 py-2",
                  "text-micro font-medium uppercase tracking-[0.15em] text-foreground",
                  "ring-1 ring-foreground/10 backdrop-blur-sm",
                  `transition-transform duration-200 ${SPRING_STATE}`,
                  "hover:bg-background active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                )}
              >
                Quick add
                {/* The visible label repeats across every card; this names the
                    product so a screen-reader list of buttons is unambiguous. */}
                <span className="sr-only"> — {product.name}</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* ── info block — §16 hierarchy ──────────────────────────────────── */}
        <div className="px-3 pb-3 pt-3">
          <p className="text-caption uppercase tracking-wide text-muted">
            {artistName}
          </p>

          {/* aria-hidden: the link overlay already announces artist + name. */}
          <h3
            aria-hidden="true"
            className="mt-1 line-clamp-2 text-body-sm font-medium text-foreground"
          >
            {product.name}
          </h3>

          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            className="mt-2"
          />

          <p className="mt-2 flex items-center gap-1.5 text-caption text-muted">
            <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-pill", dot)} />
            {label}
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

"use client";

import { useState } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProductBySlug } from "@/lib/products";
import { getArtistById } from "@/lib/artists";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

/**
 * Shared guts of /wishlist and /collection (§25). Both pages are entirely
 * localStorage-driven, so both need the exact same three things: resolve slugs
 * to products, show a stable skeleton until `hydrated`, and never delete
 * everything on a single click.
 *
 * ponytail: one file, not three. Split it the day the two pages disagree.
 */

export interface ResolvedProduct {
  product: Product;
  artistName: string;
}

/**
 * Stale localStorage is normal — a slug can outlive the product it names (a
 * delisted item, a renamed slug, a user editing the key by hand). Unresolvable
 * slugs are DROPPED, never rendered as a hole and never allowed to throw.
 *
 * The artist is resolved here too so callers can group and label without
 * re-walking the catalogue.
 */
export function resolveSlugs(slugs: readonly string[]): ResolvedProduct[] {
  const out: ResolvedProduct[] = [];
  for (const slug of slugs) {
    const product = getProductBySlug(slug);
    if (!product) continue;
    out.push({
      product,
      artistName: getArtistById(product.artistId)?.name ?? "Unknown artist",
    });
  }
  return out;
}

/**
 * Rendered on the server AND on the first client render, because localStorage
 * does not exist on the server and reading it during render would mismatch.
 * A fixed count keeps the server and client markup byte-identical.
 */
export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <ProductGrid>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </ProductGrid>
    </div>
  );
}

/**
 * Two-step destructive action. Click once to arm, again to confirm — a wishlist
 * with no undo must not be one stray click from gone. The armed state is local
 * and resets on Cancel; Escape cancels too, since an armed button that only
 * un-arms by mouse is a trap for keyboard users.
 *
 * ponytail: no modal. Two buttons inline say the same thing with no focus trap
 * to get wrong.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  const base = cn(
    "inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-body-sm",
    "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
    "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  );

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={cn(base, "border-border text-muted hover:text-foreground", className)}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setArmed(false);
      }}
    >
      <span className="text-body-sm text-muted">{confirmLabel}</span>
      <button
        type="button"
        autoFocus
        onClick={() => {
          onConfirm();
          setArmed(false);
        }}
        className={cn(base, "border-error/40 text-error hover:bg-error/5")}
      >
        Yes, clear
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className={cn(base, "border-border text-foreground hover:bg-surface")}
      >
        Cancel
      </button>
    </div>
  );
}

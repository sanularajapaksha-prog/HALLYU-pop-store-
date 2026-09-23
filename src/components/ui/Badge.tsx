import type { ProductBadge } from "@/types/product";
import { cn } from "@/lib/cn";

/**
 * §17 — five badges, one or two per product maximum, kept small so they never
 * overpower the product image. backdrop-blur keeps them legible over photography.
 *
 * LIMITED and EXCLUSIVE deliberately share the inverted treatment: §17 caps the
 * palette, and accent violet stays rare (reserved for NEW + primary CTAs).
 */
const VARIANT: Record<ProductBadge, string> = {
  NEW: "bg-accent text-white",
  LIMITED: "bg-foreground text-background",
  "PRE-ORDER": "bg-info text-white",
  // text-background (white), not text-foreground: #0a0a0a on #b45309 measures
  // 3.94:1, and this is 10px text, so AA needs 4.5:1. White gives 5.02:1.
  // It was the only variant inverting to dark-on-amber; the other four already
  // pair a mid/dark background with white and land at 5.17-19.8:1.
  "LOW-STOCK": "bg-warning text-background",
  EXCLUSIVE: "bg-foreground text-background",
};

export interface BadgeProps {
  variant: ProductBadge;
  className?: string;
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-micro font-medium uppercase tracking-wide backdrop-blur-sm",
        VARIANT[variant],
        className,
      )}
    >
      {/* "LOW-STOCK" is the type's literal; §17 displays it as two words. */}
      {variant === "LOW-STOCK" ? "LOW STOCK" : variant}
    </span>
  );
}

import { cn, formatLKR } from "@/lib/utils";

export interface ProductPriceProps {
  /** Integer LKR. */
  price: number;
  /** Integer LKR, greater than `price`. Omit when not discounted. */
  compareAtPrice?: number;
  className?: string;
  size?: "sm" | "lg";
}

/**
 * §16 — price is the strongest line in the info block (14–16px / 600).
 * When discounted, the old price sits BESIDE the current one, struck through and
 * muted, so the payable amount stays visually dominant.
 */
export function ProductPrice({
  price,
  compareAtPrice,
  className,
  size = "sm",
}: ProductPriceProps) {
  // Guard bad data rather than rendering a "discount" that is really a markup:
  // a compareAtPrice at or below price would show a struck-through number the
  // customer would have preferred to pay.
  const hasDiscount =
    typeof compareAtPrice === "number" &&
    Number.isFinite(compareAtPrice) &&
    compareAtPrice > price;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums text-foreground",
          size === "lg" ? "text-heading-sm" : "text-body-sm",
        )}
      >
        {formatLKR(price)}
      </span>

      {hasDiscount ? (
        // line-through alone is announced as plain text by most screen readers,
        // so the old price would read as a second, cheaper price. <s> carries
        // the semantic, and the sr-only label names what it is.
        <s className="text-caption tabular-nums text-muted decoration-muted/60">
          <span className="sr-only">Original price: </span>
          {formatLKR(compareAtPrice)}
        </s>
      ) : null}
    </p>
  );
}

export default ProductPrice;

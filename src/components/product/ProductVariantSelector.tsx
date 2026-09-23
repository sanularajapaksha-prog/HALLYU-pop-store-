"use client";

import { useRef } from "react";
import { SPRING_STATE } from "@/lib/motion";
import { cn, formatLKR } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

export interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * §24 — versions are one product, not several. The label is the `version`
 * attribute (STANDARD / COMPACT / SET), falling back to the variant name so a
 * variant without that axis still renders something meaningful.
 */
function labelOf(variant: ProductVariant): string {
  return variant.attributes.version ?? variant.attributes.edition ?? variant.name;
}

/** The secondary line: what you actually get. Omitted when it would repeat the label. */
function subLabelOf(variant: ProductVariant): string | null {
  const edition = variant.attributes.edition;
  if (edition === undefined || edition === labelOf(variant)) return null;
  return edition;
}

/**
 * §24 — album version selector, as a real ARIA radiogroup.
 *
 * Radiogroup rather than a listbox or a row of toggles: exactly one version is
 * always chosen, which is the radio contract. Each option is a <button
 * role="radio"> so a sold-out one can be genuinely `disabled` (a native <input
 * type="radio"> cannot be both disabled and still announce its price).
 */
export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
  className,
}: ProductVariantSelectorProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Nothing to choose between — §24 explicitly warns against inventing a picker
  // where there is no variation axis.
  if (variants.length === 0) return null;

  const selectedIndex = variants.findIndex((variant) => variant.id === selectedId);

  /**
   * Arrow keys move between options, skipping sold-out ones.
   *
   * Skipping is the right call here and not a11y sloppiness: a disabled radio is
   * not focusable, so landing on one would trap the roving tabindex. Sold-out
   * options stay visible and screen-reader-readable via the group, they are just
   * not landing spots. If EVERY option is sold out the loop terminates on its own
   * (see the `attempts` guard) rather than spinning.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0) return;
    event.preventDefault();

    const count = variants.length;
    let next = index;
    for (let attempts = 0; attempts < count; attempts += 1) {
      next = (next + delta + count) % count;
      const candidate = variants[next];
      if (candidate !== undefined && candidate.stock > 0) {
        onSelect(candidate.id);
        optionRefs.current[next]?.focus();
        return;
      }
    }
  };

  return (
    <div className={className}>
      <p id="variant-group-label" className="text-caption uppercase tracking-[0.18em] text-muted">
        Choose Version
      </p>

      <div
        role="radiogroup"
        aria-labelledby="variant-group-label"
        className="mt-3 flex flex-wrap gap-2"
      >
        {variants.map((variant, index) => {
          const isSelected = variant.id === selectedId;
          const soldOut = variant.stock <= 0;
          const subLabel = subLabelOf(variant);

          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={soldOut}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              onClick={() => onSelect(variant.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              /*
               * Roving tabindex. When `selectedId` matches nothing (bad prop), no
               * option is focusable — so fall back to making the first one the
               * tab stop, keeping the group reachable.
               */
              tabIndex={isSelected || (selectedIndex === -1 && index === 0) ? 0 : -1}
              className={cn(
                "min-w-[7.5rem] rounded-lg border px-4 py-3 text-left",
                // Named properties, not `transition-all`. `all` was sweeping
                // `border-color` and `background-color` together with the press
                // transform on one timing, and would pick up any property added
                // later. These three are exactly what the states below change.
                `transition-[transform,border-color,background-color] duration-200 ${SPRING_STATE}`,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "motion-reduce:transition-none",
                soldOut
                  ? "cursor-not-allowed border-border bg-transparent text-muted opacity-60"
                  : "active:scale-[0.98] motion-reduce:active:scale-100",
                isSelected && !soldOut
                  // The chosen option sits a hair proud of the row. This is the
                  // acknowledgement the component was missing: previously only
                  // border and background changed, which on a light surface is
                  // easy to miss when the price line below silently updates too.
                  //
                  // A transition, not a keyframe, and deliberately so: selection
                  // MOVES between options, so the outgoing option must animate
                  // back down at the same time the incoming one rises. Two
                  // elements retargeting from their current computed scale is
                  // exactly what transitions do and what keyframes cannot —
                  // spamming arrow keys through the group stays smooth instead
                  // of restarting each option from zero. It also rides the same
                  // `transform` transition as the press above, so click-and-hold
                  // then release resolves to the selected scale with no fight.
                  ? "border-foreground bg-surface scale-[1.02] motion-reduce:scale-100"
                  // Hover gated behind a real pointer: on touch, tapping an
                  // option leaves a sticky :hover on it, so after switching
                  // away the previously-tapped option keeps a darkened border
                  // and reads as half-selected beside the real selection.
                  : !soldOut &&
                    "border-border [@media(hover:hover)]:hover:border-foreground/40 [@media(hover:hover)]:hover:bg-surface/60",
              )}
            >
              <span
                className={cn(
                  "block text-body-sm font-medium",
                  soldOut ? "text-muted line-through" : "text-foreground",
                )}
              >
                {labelOf(variant)}
              </span>

              {subLabel !== null && (
                <span className="mt-0.5 block text-micro text-muted">{subLabel}</span>
              )}

              <span className="mt-1.5 block text-caption tabular-nums text-muted">
                {soldOut ? "Sold out" : formatLKR(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductVariantSelector;

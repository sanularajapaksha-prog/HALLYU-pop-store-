"use client";

import { useEffect, useRef, useState } from "react";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

/** §39 — confirmation holds long enough to register, short enough not to block a second add. */
const CONFIRM_MS = 2000;

export interface AddToCartProps {
  productId: string;
  /** Undefined for products with no variation axis. */
  variantId?: string;
  /** Units available for the CURRENT selection (variant stock, else product stock). */
  stock: number;
  className?: string;
}

export function AddToCart({ productId, variantId, stock, className }: AddToCartProps) {
  const { addItem } = useCart();
  const [requestedQuantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const soldOut = stock <= 0;
  // Never offer a quantity that cannot be fulfilled. `max` of 0 would make
  // QuantitySelector's clamp invert (min 1 > max 0), so floor it at 1 — the
  // control is unreachable when sold out anyway.
  const max = Math.max(1, stock);

  /*
   * Derived during render, not synced in an effect. Switching to a variant with
   * less stock must not leave a quantity above it, and clamping here means the
   * number the user SEES is always the number that gets added — an effect would
   * render the stale, too-high value for one frame first.
   */
  const quantity = Math.min(requestedQuantity, max);

  /*
   * THE unmount bug this guards: the 2s timer outlives the component whenever
   * the user navigates away right after adding, and its setState would fire on a
   * dead component. One effect, cleanup only — it never runs on mount-by-value,
   * so it cannot cancel a live timer.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAdd = () => {
    if (soldOut) return;
    addItem(productId, quantity, variantId);

    // Re-adding before the first confirmation expires must RESTART the window,
    // not stack a second timer that clears the state early.
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setAdded(true);
    timeoutRef.current = setTimeout(() => {
      setAdded(false);
      timeoutRef.current = null;
    }, CONFIRM_MS);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {!soldOut && (
        <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={max} />
      )}

      <Button
        variant="primary"
        size="lg"
        // The arrow circle would contradict the "✓ ADDED" confirmation, so it is
        // dropped for the duration of the confirmed state rather than fighting it.
        withArrow={!added && !soldOut}
        disabled={soldOut}
        onClick={handleAdd}
        className="flex-1 sm:flex-none"
      >
        {soldOut ? "SOLD OUT" : added ? "✓ ADDED" : "ADD TO BAG"}
      </Button>

      {/*
        The button's own label change is invisible to a screen reader that has
        already moved on, and `aria-live` on the button itself would re-announce
        the whole control. A dedicated polite region announces only the outcome.
      */}
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `Added ${quantity} to bag` : ""}
      </span>
    </div>
  );
}

export default AddToCart;

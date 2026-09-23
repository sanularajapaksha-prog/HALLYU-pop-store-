"use client";

import { useEffect, useRef, useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export interface WishlistButtonProps {
  /** Product slug — the identity the wishlist store persists. */
  slug: string;
  /** Product name, used to disambiguate the label when many buttons share a page. */
  productName: string;
  className?: string;
}

/**
 * §39 — ♡ → ♥. Reads and writes the shared wishlist store, so every instance of
 * the same product agrees and /wishlist reflects what was filled.
 * ponytail: no local state at all — the store already owns persistence,
 * validation and cross-tab sync (src/context/createSlugStore.tsx).
 */
export function WishlistButton({ slug, productName, className }: WishlistButtonProps) {
  const { has, toggle, hydrated } = useWishlist();
  const pressed = has(slug);

  // Pop plays only on the OFF->ON transition (adding), never on mount/hydration
  // and never on remove — an overshoot reads as "added!", not as an ambient tic.
  // A counter (not a boolean) so a rapid remove+re-add within one animation's
  // 350ms restarts it: bumping the key always changes the React key below,
  // forcing a fresh element/animation even though `popping` would otherwise
  // already read true.
  const [popKey, setPopKey] = useState(0);
  const wasPressed = useRef(pressed);
  useEffect(() => {
    if (pressed && !wasPressed.current) setPopKey((k) => k + 1);
    wasPressed.current = pressed;
  }, [pressed]);

  return (
    <button
      type="button"
      // Before hydration the store is empty by definition, so asserting
      // aria-pressed="false" would announce a state we have not read yet.
      aria-pressed={hydrated ? pressed : undefined}
      aria-label={
        pressed
          ? `Remove ${productName} from wishlist`
          : `Add ${productName} to wishlist`
      }
      onClick={() => toggle(slug)}
      className={cn(
        "group/heart inline-flex h-9 w-9 items-center justify-center rounded-pill",
        // Frosted chip so the heart stays legible over any photograph.
        "bg-background/80 backdrop-blur-sm ring-1 ring-foreground/5",
        "transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        // currentColor on the button drives BOTH the svg stroke and its fill.
        pressed ? "text-accent" : "text-foreground",
        className,
      )}
    >
      <svg
        key={popKey}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn(
          "h-[18px] w-[18px]",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          // Resting scale is still state-driven (GPU-safe, reversible on
          // untoggle); the keyframe only plays transiently on top of it for
          // the add-to-wishlist "pop", per emil-design-eng's textbook
          // overshoot-then-settle micro-interaction. Keyed on popKey (not
          // gated by a boolean) so a rapid remove+re-add restarts the
          // animation instead of a no-op class re-render silently skipping it.
          pressed ? "scale-110" : "scale-100 group-hover/heart:scale-105",
          popKey > 0 && pressed && "animate-heart-pop",
          "motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:animate-none",
        )}
        // Filled state is one of the few sanctioned accent uses.
        fill={pressed ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.25c-.3 0-.6-.1-.84-.32C7.02 16.2 4.5 13.9 4.5 10.9c0-2.4 1.86-4.15 4.05-4.15 1.32 0 2.58.62 3.45 1.72.87-1.1 2.13-1.72 3.45-1.72 2.19 0 4.05 1.75 4.05 4.15 0 3-2.52 5.3-6.66 9.03-.24.22-.54.32-.84.32Z" />
      </svg>
    </button>
  );
}

export default WishlistButton;

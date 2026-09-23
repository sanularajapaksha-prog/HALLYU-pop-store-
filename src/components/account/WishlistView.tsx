"use client";

import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { useCollection } from "@/context/CollectionContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import { ConfirmButton, SkeletonGrid, resolveSlugs } from "./savedProducts";

/** Matches ProductSection's stagger cap so the last tile never waits ~1s. */
const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;

function HeartOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.25c-.3 0-.6-.1-.84-.32C7.02 16.2 4.5 13.9 4.5 10.9c0-2.4 1.86-4.15 4.05-4.15 1.32 0 2.58.62 3.45 1.72.87-1.1 2.13-1.72 3.45-1.72 2.19 0 4.05 1.75 4.05 4.15 0 3-2.52 5.3-6.66 9.03-.24.22-.54.32-.84.32Z" />
    </svg>
  );
}

const actionClasses = cn(
  "inline-flex w-full items-center justify-center gap-2 rounded-pill border px-3 py-2 text-caption",
  "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
);

/**
 * §25 — the WANT list. Everything here comes from localStorage, so the whole
 * body is gated on `hydrated`: a stable skeleton renders on the server and on
 * the first client render, and the real grid swaps in after mount. Nothing
 * reads storage during render.
 */
export function WishlistView() {
  const wishlist = useWishlist();
  const collection = useCollection();

  // Both stores must be ready: "Move to collection" flips its label based on
  // whether the item is already owned, and an un-hydrated collection would
  // briefly claim nothing is.
  const ready = wishlist.hydrated && collection.hydrated;
  const items = resolveSlugs(wishlist.slugs);

  return (
    <Container className="pb-20 md:pb-28">
      {/* Count + clear. aria-live so a removal is announced, not just seen. */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <p className="text-body-sm text-muted" aria-live="polite">
          {ready
            ? `${items.length} ${items.length === 1 ? "item" : "items"} saved`
            : "Loading your wishlist\u2026"}
        </p>

        {ready && items.length > 0 && (
          <ConfirmButton
            label="Clear wishlist"
            confirmLabel="Remove every saved item?"
            onConfirm={() => wishlist.clear()}
          />
        )}
      </div>

      {!ready ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<HeartOffIcon />}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here while you decide. Your wishlist is what you might buy \u2014 My Collection is what you already own."
          action={{ label: "Browse products", href: "/shop" }}
        />
      ) : (
        <ProductGrid>
          {items.map(({ product, artistName }, index) => {
            const owned = collection.has(product.slug);

            return (
              <Reveal
                key={product.slug}
                delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                className="flex h-full flex-col gap-3"
              >
                <ProductCard product={product} artistName={artistName} priority={index < 4} />

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    aria-label={
                      owned
                        ? `Remove ${product.name} from wishlist — already in your collection`
                        : `Move ${product.name} to my collection`
                    }
                    onClick={() => {
                      // Move, not copy: owning it means it is no longer a want.
                      if (!owned) collection.toggle(product.slug);
                      wishlist.remove(product.slug);
                    }}
                    className={cn(actionClasses, "border-border text-foreground hover:bg-surface")}
                  >
                    {owned ? "Already owned \u2014 remove from wishlist" : "Move to collection"}
                  </button>

                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from wishlist`}
                    onClick={() => wishlist.remove(product.slug)}
                    className={cn(actionClasses, "border-transparent text-muted hover:text-foreground")}
                  >
                    Remove
                  </button>
                </div>
              </Reveal>
            );
          })}
        </ProductGrid>
      )}
    </Container>
  );
}

export default WishlistView;

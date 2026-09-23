"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SPRING_STATE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

export interface ProductGalleryProps {
  images: ProductImage[];
  /** Product name — used to build thumbnail labels that make sense out of context. */
  productName: string;
  /** First image of the first gallery on the page is LCP. */
  priority?: boolean;
  className?: string;
}

/**
 * §29 — large primary image + thumbnail rail.
 *
 * Cross-fade is done by stacking ALL images absolutely and animating opacity,
 * rather than swapping one <Image src>. Swapping the src would show the browser's
 * decode gap as a white flash on every click; stacking means each image is already
 * decoded after its first view and the transition is pure opacity (GPU-safe,
 * craft rule 10). The cost is N decoded images, which is fine at the 2–4 the
 * catalogue actually ships.
 */
export function ProductGallery({
  images,
  productName,
  priority = false,
  className,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Defensive: a product with no photography renders a labelled placeholder
  // rather than a collapsed zero-height box.
  if (images.length === 0) {
    return (
      <div className={cn("rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5", className)}>
        <div className="flex aspect-square items-center justify-center rounded-lg bg-background text-body-sm text-muted">
          No image available
        </div>
      </div>
    );
  }

  /*
   * Derived during render, not synced in an effect. Variant switching (§24) can
   * swap in a SHORTER gallery while `activeIndex` still points past its end,
   * which would blank the stage. Clamping at read time fixes that in the same
   * render — an effect would leave one frame showing nothing, and React's own
   * guidance ("you might not need an effect") calls this the correct shape.
   */
  const safeIndex = Math.min(activeIndex, images.length - 1);

  /** Arrow keys move focus AND selection — the rail is a single tab stop. */
  const onThumbKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = images.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    thumbRefs.current[next]?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row-reverse lg:gap-4", className)}>
      {/* ── Stage: outer shell 20 − 6 = 14 inner. Craft rule 1. ── */}
      <div className="min-w-0 flex-1 rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
          {images.map((image, index) => (
            <Image
              key={image.id}
              src={image.url}
              alt={image.alt}
              fill
              // Stage is roughly half the 1440 container on desktop, full-bleed below lg.
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority={priority && index === 0}
              className={cn(
                "object-cover",
                // 200ms / SPRING_STATE, not the 500ms entrance curve. This is
                // a state change the user triggered and is actively waiting on
                // (they clicked a thumb to SEE the product), not an entrance.
                // Both skills cap UI motion under 300ms; a half-second
                // cross-fade reads as the page being slow to answer. It also
                // stays a transition, so clicking through the rail fast
                // retargets from the current opacity instead of restarting.
                `transition-opacity duration-200 ${SPRING_STATE}`,
                "motion-reduce:transition-none",
                index === safeIndex ? "opacity-100" : "opacity-0",
              )}
              // Hidden frames must not be announced or reachable; only the
              // visible one carries meaning.
              aria-hidden={index === safeIndex ? undefined : "true"}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnail rail: below on mobile, left column on lg. ──
          Single image = no rail. A one-item picker is decoration, not a control. */}
      {images.length > 1 && (
        <div
          role="group"
          aria-label={`${productName} gallery thumbnails`}
          className={cn(
            "flex shrink-0 gap-2 overflow-x-auto pb-1",
            "lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0",
            // Hide the horizontal scrollbar chrome on mobile without hiding overflow.
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {images.map((image, index) => {
            const isActive = index === safeIndex;
            return (
              <button
                key={image.id}
                type="button"
                ref={(node) => {
                  thumbRefs.current[index] = node;
                }}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => onThumbKeyDown(event, index)}
                // Roving tabindex: the rail is one stop, arrows move within it.
                tabIndex={isActive ? 0 : -1}
                aria-label={`View image ${index + 1} of ${images.length} of ${productName}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-surface lg:w-full",
                  // Named properties, not `transition-all`. `all` was also
                  // interpolating the ring between `ring-1` and `ring-2` —
                  // animating a paint property, and it made the selection ring
                  // arrive late instead of landing with the click. The ring now
                  // snaps (selection should read as instantaneous) while the
                  // dim-to-full opacity and the press still transition.
                  `transition-[transform,opacity] duration-200 ${SPRING_STATE}`,
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                  isActive
                    ? "ring-2 ring-accent"
                    // Hover gated behind a real pointer. A tap on a touch
                    // device fires a sticky :hover that leaves the tapped
                    // thumb at full opacity until something else is tapped —
                    // a second, lying "selected" affordance next to the real
                    // accent ring. Matches the [@media(hover:hover)] idiom
                    // already used in ProductCard.
                    : "opacity-70 ring-1 ring-foreground/10 [@media(hover:hover)]:hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;

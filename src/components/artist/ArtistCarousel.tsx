"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArtistCard, type ArtistCardArtist } from "./ArtistCard";
import { IconButton } from "@/components/ui/IconButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export interface ArtistCarouselProps {
  artists: ArtistCardArtist[];
  className?: string;
  /** Labels the scroll region for screen readers. */
  label?: string;
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
      <path
        d={direction === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * §19 — horizontal scroll on mobile, arrow-driven on desktop. No carousel
 * library: a scroll container with CSS snap IS the carousel, and it stays
 * keyboard- and touch-scrollable for free.
 */
export function ArtistCarousel({ artists, className, label = "Shop by artist" }: ArtistCarouselProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const syncBoundaries = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // 1px slack: scrollLeft is fractional under zoom / on HiDPI, so an exact
    // comparison leaves the "next" arrow enabled forever at the true end.
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    syncBoundaries();

    el.addEventListener("scroll", syncBoundaries, { passive: true });
    // Boundaries also move when the container resizes (rotation, breakpoint
    // change) without any scroll event firing. ResizeObserver is missing in
    // older engines — the listeners above still keep it correct after a scroll.
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(syncBoundaries) : null;
    observer?.observe(el);

    return () => {
      el.removeEventListener("scroll", syncBoundaries);
      observer?.disconnect();
    };
  }, [syncBoundaries]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth,
      // Honour the OS motion setting — "smooth" is an animation.
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={scrollerRef}
        // Not role="region": a plain labelled group avoids adding a landmark
        // for every rail on the page. tabIndex makes it keyboard-scrollable in
        // browsers that do not focus overflow containers automatically.
        aria-label={label}
        tabIndex={0}
        className={cn(
          "flex list-none snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:gap-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        )}
      >
        {artists.map((artist, index) => (
          <li
            key={artist.slug}
            className="w-[45%] shrink-0 snap-start md:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
          >
            <ArtistCard artist={artist} priority={index < 2} />
          </li>
        ))}
      </ul>

      {/* Arrows are a desktop-only convenience; touch users swipe. They are
          NOT the only way to reach content, so hiding them under md costs
          nothing in accessibility terms. */}
      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <IconButton
          label="Previous artists"
          variant="solid"
          disabled={atStart}
          onClick={() => scrollByPage(-1)}
        >
          <Chevron direction="prev" />
        </IconButton>
        <IconButton
          label="Next artists"
          variant="solid"
          disabled={atEnd}
          onClick={() => scrollByPage(1)}
        >
          <Chevron direction="next" />
        </IconButton>
      </div>
    </div>
  );
}

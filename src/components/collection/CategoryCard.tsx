"use client";

import Image from "next/image";
import Link from "next/link";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { PARALLAX_SPEED, SPRING_STATE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Structural, for the same reason as ArtistCardArtist — see that file. */
export interface CategoryCardCategory {
  name: string;
  slug: string;
  image: string;
}

export interface CategoryCardProps {
  category: CategoryCardCategory;
  className?: string;
  priority?: boolean;
}

/**
 * §22 — deliberately more TYPOGRAPHIC than ArtistCard. An artist tile sells a
 * face; a category tile sells a word, so the image is pushed back (muted +
 * heavier scrim) and the name carries the tile.
 */
export function CategoryCard({ category, className, priority = false }: CategoryCardProps) {
  return (
    // Was `/shop?category=<slug>`, which silently did nothing: the §27 filter
    // parser reads `categories` (plural) and matches on category ID, not slug,
    // so the param was dropped and every tile landed on an unfiltered /shop.
    // /collections/<slug> is slug-addressed and is the real destination.
    <Link
      href={`/collections/${encodeURIComponent(category.slug)}`}
      className={cn(
        "group block rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5",
        `transition-[transform,box-shadow] duration-300 ${SPRING_STATE}`,
        "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        "focus-visible:-translate-y-0.5 focus-visible:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        "motion-reduce:transition-none motion-reduce:hover:transform-none",
        "motion-reduce:focus-visible:transform-none",
        className,
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
        {/* Subtle parallax on the image; hover-scale stays on the Image itself
            via group-hover — same non-conflicting split as ArtistCard. */}
        <ParallaxLayer speed={PARALLAX_SPEED.subtle} className="absolute inset-0">
          <Image
            src={category.image}
            // Decorative: the heading beside it already names the category, and
            // this link's accessible name comes from that heading. Empty alt
            // keeps a screen reader from announcing the word twice.
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 768px) 33vw, 50vw"
            className={cn(
              // Desaturated so type wins over photo — the §22 tile is a label.
              "object-cover opacity-70 saturate-50",
              `transition-[transform,opacity] duration-300 ${SPRING_STATE}`,
              "group-hover:scale-105",
              "motion-reduce:transition-none motion-reduce:group-hover:transform-none",
            )}
          />
        </ParallaxLayer>

        {/* Legibility scrim only (§10). Heavier than the artist tile's because
            the type here is larger and must hold over any image. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/10"
        />

        {/* Machined top edge of the double-bezel — own layer, above the
            image, for the same reason as ArtistCard. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
        />

        <div className="absolute inset-0 flex items-end p-4 md:p-5">
          <h3 className="text-heading-md font-display text-white">{category.name}</h3>
        </div>
      </div>
    </Link>
  );
}

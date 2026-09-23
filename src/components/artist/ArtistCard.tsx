"use client";

import Image from "next/image";
import Link from "next/link";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { PARALLAX_SPEED, SPRING_STATE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Structural prop type, NOT an import of `@/types/artist`.
 *
 * The repo currently holds two incompatible Artist shapes: `@/types/artist`
 * requires a `logo` field that the seed data in `@/lib/artists` does not have.
 * Typing this card against the fields it actually renders means it accepts
 * BOTH shapes today and keeps accepting them after whichever way the
 * orchestrator resolves that conflict. It also cannot silently start depending
 * on a field it does not draw.
 */
export interface ArtistCardArtist {
  name: string;
  slug: string;
  coverImage: string;
  productCount: number;
}

export interface ArtistCardProps {
  artist: ArtistCardArtist;
  className?: string;
  /** Set on the first row only — above-the-fold tiles should not lazy-load. */
  priority?: boolean;
}

/**
 * §19 — a VISUAL artist tile, not a text button.
 * Craft rule 1: double-bezel. Outer shell p-1.5 rounded-xl, inner core
 * rounded-lg (20 - 6 = 14, so the radii stay concentric).
 */
export function ArtistCard({ artist, className, priority = false }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
        {/*
          Parallax (subtle) on the image, hover-scale on the same element — the
          two compose fine: parallax drives translateY on a wrapper, hover-scale
          drives `scale` on the Image itself via `group-hover`, so they animate
          different properties on different layers and never fight.
        */}
        <ParallaxLayer speed={PARALLAX_SPEED.subtle} className="absolute inset-0">
          <Image
            src={artist.coverImage}
            // The tile IS the link to the artist, so the name alone is the
            // accessible name. Describing the photo ("a photo of X") would make
            // a screen reader read the artist twice.
            alt={artist.name}
            fill
            priority={priority}
            // 2 cols under md, 4 up to xl, 5 above — mirrors ArtistGrid so the
            // browser never downloads a 1200px file for a 180px tile.
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className={cn(
              "object-cover",
              `transition-[transform,opacity] duration-300 ${SPRING_STATE}`,
              "group-hover:scale-105",
              "motion-reduce:transition-none motion-reduce:group-hover:transform-none",
            )}
          />
        </ParallaxLayer>

        {/*
          The ONLY sanctioned gradient (§10 bans decorative ones): it exists so
          white type stays legible over an unknown photograph. aria-hidden — it
          carries no meaning.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
        />

        {/*
          Craft rule 1: the machined top edge of the double-bezel. Sits ABOVE
          the object-cover image as its own layer, otherwise the photo paints
          over an inset shadow on the core itself.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
        />

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <h3 className="text-heading-sm font-display text-white">{artist.name}</h3>
          <p className="text-caption text-white/70">
            {/* Pluralised: "1 product", never "1 products". */}
            {artist.productCount} {artist.productCount === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
    </Link>
  );
}

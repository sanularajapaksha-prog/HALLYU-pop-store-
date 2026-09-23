import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { Artist } from "@/lib/artists";

export interface ArtistHeaderProps {
  artist: Artist;
  productCount: number;
  className?: string;
}

/**
 * §18 artist page header. Server Component — it is a picture and three strings.
 *
 * It owns the page's single <h1>, so an artist page must NOT also render
 * <PageHeader> (which owns the h1 everywhere else).
 *
 * Typed against `@/lib/artists`'s Artist (the seed shape), not `@/types/artist`
 * — the two disagree about a `logo` field the seed data does not have and this
 * header does not draw. Same call ArtistCard already made.
 */
export function ArtistHeader({ artist, productCount, className }: ArtistHeaderProps) {
  return (
    <Container className={cn("pt-2", className)}>
      {/* Craft rule 1: DOUBLE-BEZEL. Outer 20px shell, p-1.5 (6px) → 14px core. */}
      <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg md:aspect-[21/9]">
          <Image
            src={artist.coverImage}
            // Decorative relative to the <h1> stacked on top of it: the artist
            // name is already the first thing a screen reader hits. Describing
            // the photo would read the name twice.
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-center"
          />

          {/*
            The ONLY sanctioned gradient (§10 bans decorative ones): white type
            over an unknown photograph needs a legibility floor.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent"
          />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-10">
            <h1 className="text-display-lg font-display text-white">{artist.name}</h1>

            {artist.description && (
              <p className="mt-3 max-w-2xl text-body text-white/80">{artist.description}</p>
            )}

            <p className="mt-5 inline-flex items-center rounded-pill bg-white/15 px-3 py-1 text-caption text-white ring-1 ring-white/25">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default ArtistHeader;

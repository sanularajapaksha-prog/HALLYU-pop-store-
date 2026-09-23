import { ArtistCard, type ArtistCardArtist } from "./ArtistCard";
import { cn } from "@/lib/utils";

export interface ArtistGridProps {
  artists: ArtistCardArtist[];
  className?: string;
  /** How many leading tiles get priority image loading. 0 when below the fold. */
  priorityCount?: number;
}

/** §19 — 4–6 visible on desktop, 2 up on mobile. */
export function ArtistGrid({ artists, className, priorityCount = 0 }: ArtistGridProps) {
  return (
    <ul className={cn("grid list-none grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5", className)}>
      {artists.map((artist, index) => (
        <li key={artist.slug}>
          <ArtistCard artist={artist} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

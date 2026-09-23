import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtistCard } from "@/components/artist/ArtistCard";
import { Reveal } from "@/components/ui/Reveal";
import { artists } from "@/lib/artists";

/** Matches ProductSection's stagger cap: the last tile never waits ~1s. */
const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;

/** First row on desktop (xl is 5-up) loads eagerly; the brief asks for 4. */
const PRIORITY_COUNT = 4;

export const metadata: Metadata = {
  title: "Artists",
  description: `Browse all ${artists.length} artists on the marketplace. K-pop collectors think artist first, then release, then product — so start with the group you stan and work down to the photocard.`,
};

/**
 * /artists — §18. The list half of artist-first discovery.
 *
 * ponytail: the per-card <Reveal> is inlined rather than pushed into
 * <ArtistGrid>, because ArtistGrid is also used on the homepage rail where an
 * extra reveal layer would double-animate. Same reason ProductSection wraps its
 * own cards instead of ProductGrid doing it.
 */
export default function ArtistsPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Artists", href: "/artists" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="DISCOVER"
        title="Artists"
        description="Fans do not shop by category, they shop by group. Pick an artist and see every album, photocard, lightstick and piece of official merch we carry for them in one place."
      />

      <Container className="pb-20 md:pb-28">
        {artists.length === 0 ? (
          <EmptyState
            title="No artists yet"
            description="The roster is being set up. Browse the full catalogue in the meantime."
            action={{ label: "Shop all products", href: "/shop" }}
          />
        ) : (
          <ul className="grid list-none grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
            {artists.map((artist, index) => (
              <li key={artist.slug}>
                <Reveal
                  delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                  className="h-full"
                >
                  <ArtistCard artist={artist} priority={index < PRIORITY_COUNT} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

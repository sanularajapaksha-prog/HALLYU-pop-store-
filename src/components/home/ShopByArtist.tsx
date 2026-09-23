import { ArtistCarousel } from "@/components/artist/ArtistCarousel";
import type { ArtistCardArtist } from "@/components/artist/ArtistCard";
import { Section } from "@/components/layout/Section";
import { featuredArtists } from "@/lib/artists";
import { products } from "@/lib/products";

/**
 * REAL per-artist product counts, computed once at module scope.
 *
 * `Artist.productCount` in the seed data is decorative — an earlier agent
 * flagged that it does NOT equal the number of products that actually exist for
 * that artist, and §19 tiles put that number on screen. Shipping the seed value
 * would print "148 products" on a tile whose link lands on a grid of three.
 *
 * Counting here rather than editing the seed keeps this fix inside my own
 * boundary: the seed field stays whatever it is, and the tile shows the truth.
 * It is O(products) once per process, not per render — `products` is a static
 * module-level array, so this evaluates at import and never again.
 */
const REAL_COUNTS: ReadonlyMap<string, number> = products.reduce(
  (acc, product) => acc.set(product.artistId, (acc.get(product.artistId) ?? 0) + 1),
  new Map<string, number>(),
);

/**
 * §19 — "Do not use only plain text buttons. Use visual tiles."
 *
 * Carousel rather than a grid because §19 asks for 4–6 visible cards on desktop
 * and a horizontal scroller on mobile, which is exactly ArtistCarousel's
 * contract. It is a Server Component wrapping a client carousel: the artist
 * list is static, only the scroll-boundary state is interactive.
 */
export function ShopByArtist() {
  const artists: ArtistCardArtist[] = featuredArtists.map((artist) => ({
    name: artist.name,
    slug: artist.slug,
    coverImage: artist.coverImage,
    // Fall back to 0 rather than the seed value: an artist with no products
    // should read "0 products", not a decorative number.
    productCount: REAL_COUNTS.get(artist.id) ?? 0,
  }));

  if (artists.length === 0) return null;

  return (
    <Section
      id="artists"
      eyebrow="Artists"
      title="Shop By Artist"
      action={{ label: "View all", href: "/artists" }}
    >
      {/*
        No <Reveal> per tile here. The carousel scrolls horizontally, so tiles
        past the fold are off to the RIGHT, not below — an IntersectionObserver
        fade-up would either fire all at once (they are all in the viewport
        vertically) or leave off-screen tiles permanently blank. Section already
        reveals the header; the scroller enters as one object.
      */}
      <ArtistCarousel artists={artists} label="Shop by artist" />
    </Section>
  );
}

export default ShopByArtist;

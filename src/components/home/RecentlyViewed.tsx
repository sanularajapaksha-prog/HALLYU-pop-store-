"use client";

import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getArtistById } from "@/lib/artists";
import { getProductBySlug } from "@/lib/products";
import type { Product } from "@/types/product";

const STAGGER_MS = 60;

/**
 * §34 — a returning-visitor section. Client Component, and it has to be: its
 * content lives in localStorage, which does not exist during SSR.
 *
 * RENDERING NOTHING IS THE CORRECT OUTPUT, NOT A BUG. On the server and on the
 * first client render `items` is empty, so this returns null and the server
 * HTML contains no trace of the section. The row appears on the render after
 * hydration. That ordering is deliberate: emitting a skeleton server-side would
 * mean every first-time visitor — who has no history at all — gets a shell that
 * then vanishes, which is a worse artefact than a section that simply arrives.
 *
 * Because server and first-client renders agree (both null), there is no
 * hydration mismatch.
 */
export function RecentlyViewed() {
  const { items } = useRecentlyViewed();

  /*
   * Slugs are resolved against the live catalogue, and unresolved ones are
   * DROPPED rather than rendered as a gap. A stored slug can outlive its
   * product (delisted, renamed, or written by an older build), and
   * getProductBySlug returns undefined for those.
   */
  const products: Product[] = items
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => product !== undefined);

  // Covers both "no history yet" and "history that no longer resolves".
  if (products.length === 0) return null;

  return (
    <Section id="recently-viewed" eyebrow="Pick up where you left off" title="Recently Viewed">
      <ProductGrid>
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * STAGGER_MS} className="h-full">
            <ProductCard
              product={product}
              artistName={getArtistById(product.artistId)?.name ?? "Unknown artist"}
              // Never above the fold — §34 sits low on the page by design.
              priority={false}
            />
          </Reveal>
        ))}
      </ProductGrid>
    </Section>
  );
}

export default RecentlyViewed;

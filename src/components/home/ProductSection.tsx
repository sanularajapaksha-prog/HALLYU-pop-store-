import { Section, type SectionAction } from "@/components/layout/Section";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { getArtistById } from "@/lib/artists";
import type { Product } from "@/types/product";

/**
 * Cap on the reveal stagger index.
 *
 * The grid is up to 5 columns, so an uncapped `index * 60` would give card 15 a
 * 900ms delay — by the time it fired the user would already be looking at a
 * blank tile. Capping at 7 means the longest delay is 420ms, which still reads
 * as a wave across the first two rows and never lags behind the scroll.
 */
const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;

/** Only the first row of a first-fold section should skip lazy-loading. */
const PRIORITY_COUNT = 2;

export interface ProductSectionProps {
  eyebrow?: string;
  title: string;
  action?: SectionAction;
  products: Product[];
  className?: string;
  tone?: "default" | "surface";
  /**
   * Set false on sections that are never above the fold (Fan Favorites,
   * Recently Viewed) so they do not compete with the hero for bandwidth.
   */
  prioritizeImages?: boolean;
  id?: string;
}

/**
 * §15 — the ONE product-grid section, used by Trending, Fan Favorites and any
 * later "New Drops"/"More like this" band. §43 asks for independently reusable
 * sections; writing this twice with a changed title would mean every future
 * grid tweak has to be made in N places and would drift after the first one.
 *
 * Server Component: the data layer is static and pure. Only ProductCard (hover
 * + wishlist state) and Reveal (IntersectionObserver) cross the client
 * boundary, and they do so on their own.
 */
export function ProductSection({
  eyebrow,
  title,
  action,
  products,
  className,
  tone = "default",
  prioritizeImages = true,
  id,
}: ProductSectionProps) {
  // A section with nothing to show is not an empty grid — it is no section.
  // Rendering the header over a void would look broken, not minimal.
  if (products.length === 0) return null;

  return (
    <Section
      id={id}
      eyebrow={eyebrow}
      title={title}
      action={action}
      tone={tone}
      className={className}
    >
      <ProductGrid>
        {products.map((product, index) => (
          <Reveal
            key={product.id}
            delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
            // h-full so a short card still fills its grid row and the reveal
            // wrapper never collapses the card's own stretch.
            className="h-full"
          >
            <ProductCard
              product={product}
              /*
               * Joined HERE, once per card, in a Server Component. Doing it
               * inside ProductCard would drag the whole artists module across
               * the client boundary for one string.
               */
              artistName={getArtistById(product.artistId)?.name ?? "Unknown artist"}
              priority={prioritizeImages && index < PRIORITY_COUNT}
            />
          </Reveal>
        ))}
      </ProductGrid>
    </Section>
  );
}

export default ProductSection;

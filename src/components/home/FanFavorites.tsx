import { ProductSection } from "./ProductSection";
import { fanFavorites } from "@/lib/products";

/**
 * The second editorial cut of the catalogue, same machinery as §15's Trending.
 * `tone="surface"` alternates the band against the white product sections so
 * the page reads as distinct chapters rather than one endless grid — §9 prefers
 * background and spacing over shadows to separate regions.
 */
export function FanFavorites() {
  return (
    <ProductSection
      id="fan-favorites"
      eyebrow="Loved by collectors"
      title="Fan Favorites"
      action={{ label: "View all", href: "/shop" }}
      products={fanFavorites}
      tone="surface"
      // Never above the fold — let these lazy-load behind the hero and Trending.
      prioritizeImages={false}
    />
  );
}

export default FanFavorites;

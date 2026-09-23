import { ProductSection } from "./ProductSection";
import { trendingProducts } from "@/lib/products";

/**
 * §15 — "should feel like discovery rather than an overwhelming catalog".
 *
 * That line is why this passes the 8-item `trendingProducts` slice straight
 * through instead of `products`: 8 fills exactly two rows at the desktop
 * 4-column grid and stops. The VIEW ALL action is what carries anyone who
 * wants the actual catalogue — the section's job is to tempt, not to list.
 */
export function TrendingProducts() {
  return (
    <ProductSection
      id="trending"
      eyebrow="Discover"
      title="Trending Now"
      action={{ label: "View all", href: "/shop" }}
      products={trendingProducts}
      // First product band on the page — its opening row IS the fold.
      prioritizeImages
    />
  );
}

export default TrendingProducts;

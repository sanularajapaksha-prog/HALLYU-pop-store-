import Categories from "@/components/home/Categories";
import EditorialBanner from "@/components/home/EditorialBanner";
import Hero from "@/components/home/Hero";
import NewDrop from "@/components/home/NewDrop";
import ComebackRadar from "@/components/home/ComebackRadar";
import FanFavorites from "@/components/home/FanFavorites";
import Newsletter from "@/components/home/Newsletter";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import ShopByArtist from "@/components/home/ShopByArtist";
import TrendingProducts from "@/components/home/TrendingProducts";

/**
 * Homepage composition. Server Component — every section owns its own data and
 * its own client boundary, so this file is pure ordering (§43).
 *
 * Order is §13's homepage architecture verbatim: Hero, TrendingProducts,
 * ShopByArtist, NewDrop, Categories, FanFavorites, ComebackRadar,
 * EditorialBanner, RecentlyViewed, Newsletter. (Comeback Radar previously sat
 * at position 4; that was an undocumented deviation and is now corrected.)
 *
 * Tone, reading down:
 *   Hero(image) Trending(white) Artists(white) NewDrop(white)
 *   Collections(white) FanFavorites(SURFACE) ComebackRadar(SURFACE)
 *   EditorialBanner(white) RecentlyViewed(white) Newsletter(white panel)
 *
 * That gives the page one dark opening, one toned chapter in the middle, and
 * white either side of it. The earlier draft had three toned bands touching,
 * which merged into a single grey slab; EditorialBanner now paints the page
 * background and separates by composition instead (see its own header comment).
 */
export default function Home() {
  return (
    // NOTE: <main> (with the BottomNav pb-20 clearance) lives in layout.tsx.
    // Rendering a second one here nested an invalid <main> inside <main>.
    <>
      <Hero />
      <TrendingProducts />
      <ShopByArtist />
      <NewDrop />
      <Categories />
      <FanFavorites />
      <ComebackRadar />
      <EditorialBanner />
      <RecentlyViewed />
      <Newsletter />
    </>
  );
}

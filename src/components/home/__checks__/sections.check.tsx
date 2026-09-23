/**
 * Assert-based render check for the homepage sections (no test runner in repo).
 * Run: npx tsx src/components/home/__checks__/sections.check.tsx
 */
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import type { ReactElement } from "react";

import Categories from "../Categories";
import ComebackRadar from "../ComebackRadar";
import FanFavorites from "../FanFavorites";
import Newsletter from "../Newsletter";
import RecentlyViewed from "../RecentlyViewed";
import ShopByArtist from "../ShopByArtist";
import TrendingProducts from "../TrendingProducts";
import { ProductSection } from "../ProductSection";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CollectionProvider } from "@/context/CollectionContext";

import { artists, getArtistById } from "@/lib/artists";
import { categories } from "@/lib/categories";
import { comebacks } from "@/lib/comebacks";
import { ROUTES } from "@/lib/routes";
import { fanFavorites, products, trendingProducts } from "@/lib/products";

// next/image needs the host allow-list, which only a real build injects.
// The sections render ProductCards, which call useCart()/useWishlist(), so the
// stores are wrapped too. AppProviders itself is NOT used: it also mounts
// <CartDrawer/>, whose markup would be counted by the assertions below.
function render(node: ReactElement): string {
  return renderToStaticMarkup(
    <ImageConfigContext.Provider value={{ ...imageConfigDefault, unoptimized: true }}>
      <CartProvider>
        <WishlistProvider>
          <CollectionProvider>{node}</CollectionProvider>
        </WishlistProvider>
      </CartProvider>
    </ImageConfigContext.Provider>,
  );
}

const count = (h: string, re: RegExp) => h.match(re)?.length ?? 0;

/* -- 1. ProductSection: one card per product, with real artist names -- */
{
  const html = render(<TrendingProducts />);
  assert.equal(count(html, /<article/g), trendingProducts.length, "one article per trending product");
  assert.ok(html.includes("Trending Now"), "title renders");
  assert.ok(html.includes("View all"), "action renders");

  // The artist JOIN is the thing most likely to silently break.
  assert.ok(!html.includes("Unknown artist"), "every trending product resolved an artist name");
  for (const p of trendingProducts) {
    const name = getArtistById(p.artistId)?.name;
    assert.ok(name && html.includes(name), `artist name "${String(name)}" present`);
  }
}

/* -- 2. Fan Favorites reuses the SAME component with different data -- */
{
  const html = render(<FanFavorites />);
  assert.equal(count(html, /<article/g), fanFavorites.length, "one article per fan favorite");
  assert.ok(html.includes("Fan Favorites"), "fan favorites title");
  assert.ok(html.includes("bg-surface"), "surface tone applied");
  assert.ok(!html.includes("Unknown artist"), "artists resolved");
}

/* -- 3. Empty products => the whole section disappears, not an empty grid -- */
{
  const html = render(<ProductSection title="Nothing" products={[]} />);
  assert.equal(html, "", "empty ProductSection renders nothing at all");
}

/* -- 4. Stagger delay is CAPPED (regression guard) -- */
{
  const html = render(<ProductSection title="Capped" products={products} />);
  const delays = [...html.matchAll(/transition-delay:\s*(\d+)ms/g)].map((m) => Number(m[1]));
  assert.ok(delays.length > 0, "delays are emitted");
  const max = Math.max(...delays);
  assert.ok(max <= 7 * 60, `max delay ${max}ms must be <= 420ms`);
  // 30 products: uncapped this would be 1740ms. Proves the cap does real work.
  assert.ok(products.length > 8, "fixture large enough for the cap to matter");
}

/* -- 5. ShopByArtist shows REAL counts, not the decorative seed value -- */
{
  const html = render(<ShopByArtist />);
  assert.ok(html.includes("Shop By Artist"), "title renders");

  const featured = artists.filter((a) => a.featured);
  assert.ok(featured.length > 0, "there are featured artists");
  for (const a of featured) {
    const real = products.filter((p) => p.artistId === a.id).length;
    assert.ok(html.includes(`${real} product`), `real count ${real} rendered for ${a.name}`);
    if (a.productCount !== real) {
      // The decorative number must be absent as a product count.
      assert.ok(
        !html.includes(`${a.productCount} product`),
        `decorative count ${a.productCount} must NOT render for ${a.name}`,
      );
    }
  }
}

/* -- 6. ComebackRadar joins artistName and emits no clock-derived digit -- */
{
  const html = render(<ComebackRadar />);
  assert.equal(count(html, /<article/g), comebacks.length, "one card per comeback");
  assert.ok(html.includes("Comeback Radar"), "title renders");
  assert.ok(html.includes("bg-surface"), "surface band applied");
  assert.ok(!html.includes("Unknown artist"), "every comeback resolved its artist name");

  for (const cb of comebacks) {
    const name = getArtistById(cb.artistId)?.name;
    assert.ok(name && html.includes(name), `comeback artist "${String(name)}" joined`);
  }

  // SSR must emit the placeholder, never a computed day count -- otherwise the
  // server clock is baked into HTML and hydration mismatches.
  assert.ok(html.includes("&#x2014;") || html.includes("—"), "SSR emits em-dash placeholder");
  assert.ok(html.includes("Release countdown loading"), "sr-only placeholder text present");
  assert.ok(!/>\s*\d+\s*<\/p>\s*<p[^>]*>\s*Days?/i.test(html), "no computed day number in SSR");

  // Action derivation must be truthful: a slug-less comeback cannot pre-order.
  const withSlug = comebacks.filter((c) => c.productSlug !== undefined).length;
  const withoutSlug = comebacks.length - withSlug;
  // Match the CTA SPAN, not the word anywhere. A bare /Pre-order/ also matched
  // this section's own subtitle prose and reported 3 CTAs where 2 render.
  assert.equal(
    count(html, /<span>Pre-order<\/span>/g),
    withSlug,
    "pre-order CTA only where a product exists",
  );
  assert.equal(count(html, /<span>Notify me<\/span>/g), withoutSlug, "notify where no product exists");
  // Every pre-order CTA must actually point at a product URL. This asserted the
  // PLURAL /products/ and so silently passed 0===0 only while the CTA count
  // assertion above was also wrong; the real route is singular. Built from
  // ROUTES.product() rather than a literal so the canonical helper stays the
  // single source of truth and this cannot drift back.
  for (const cb of comebacks) {
    if (cb.productSlug === undefined) continue;
    const href = ROUTES.product(cb.productSlug);
    assert.ok(
      html.includes(`href="${href}"`),
      `pre-order CTA links to ${href}`,
    );
  }
}

/* -- 7. Categories renders all six -- */
{
  const html = render(<Categories />);
  assert.equal(count(html, /<li>/g), categories.length, "one li per category");
  assert.ok(html.includes("Shop Collections"), "title renders");
  for (const c of categories) assert.ok(html.includes(c.name), `category ${c.name} present`);
}

/* -- 8. RecentlyViewed renders NOTHING on the server (no localStorage) -- */
{
  const html = render(<RecentlyViewed />);
  assert.equal(html, "", "RecentlyViewed must emit nothing during SSR");
}

/* -- 9. Newsletter: form, a11y wiring, no premature success state -- */
{
  const html = render(<Newsletter />);
  assert.ok(html.includes("Join The Fandom"), "heading renders");
  assert.ok(html.includes("Newsletter"), "eyebrow renders");
  assert.ok(html.includes("<form"), "form renders in idle state");
  assert.ok(html.includes('type="email"'), "email input");
  assert.ok(html.includes('aria-live="polite"'), "permanent live region present");
  assert.ok(html.includes('aria-labelledby="newsletter-heading"'), "section labelled by heading");
  assert.ok(!html.includes("on the list"), "no premature success state");

  // Double-bezel: outer shell + inner concentric core.
  assert.ok(html.includes("rounded-xl") && html.includes("p-1.5"), "outer shell");
  assert.ok(html.includes("rounded-lg") && html.includes("inset_0_1px_1px"), "inner core");

  // No aria-invalid before the user has done anything wrong.
  assert.ok(!/aria-invalid="true"/.test(html), "clean input carries no aria-invalid");
}

/* -- 10. No raw hex colors leaked into any section -- */
{
  const all = [
    render(<TrendingProducts />),
    render(<ComebackRadar />),
    render(<Categories />),
    render(<Newsletter />),
  ].join("");
  // rgba() inside shadow tokens is fine; a bare #rrggbb in a class is not.
  const hex = all.match(/class="[^"]*#[0-9a-fA-F]{6}/g);
  assert.equal(hex, null, `no hardcoded hex in classes, found: ${String(hex?.join(", "))}`);
}

console.log(
  `sections.check OK: ${trendingProducts.length} trending, ${fanFavorites.length} favorites, ` +
    `${comebacks.length} comebacks, ${categories.length} categories`,
);

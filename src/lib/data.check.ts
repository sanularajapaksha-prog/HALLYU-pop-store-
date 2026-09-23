// ponytail: one runnable integrity check for the mock data layer.
// Run: npx tsx src/lib/data.check.ts  (or import from a test later)
import { artists, featuredArtists, getArtistById } from "./artists";
import { categories, getCategoryBySlug } from "./categories";
import { products, trendingProducts, fanFavorites, newDropProducts, featuredProducts } from "./products";
import { comebacks } from "./comebacks";
import assert from "node:assert/strict";

const artistIds = new Set(artists.map((a) => a.id));
const categoryIds = new Set(categories.map((c) => c.id));

assert.equal(artists.length, 10);
assert.equal(featuredArtists.length, 5);
assert.equal(categories.length, 6);
assert.ok(products.length >= 24, "need >= 24 products");
assert.ok(featuredProducts.length >= 8, "need >= 8 featured");

for (const p of products) {
  assert.ok(artistIds.has(p.artistId), `dangling artistId ${p.artistId} on ${p.slug}`);
  assert.ok(categoryIds.has(p.categoryId), `dangling categoryId ${p.categoryId} on ${p.slug}`);
  assert.equal(p.images.length, 2, `${p.slug} needs exactly 2 images`);
  assert.ok(p.compareAtPrice === undefined || p.compareAtPrice > p.price, `${p.slug} bad sale price`);
  assert.ok(p.price >= 1200 && p.price <= 28000, `${p.slug} price out of range`);
}
for (const c of comebacks) {
  assert.ok(artistIds.has(c.artistId), `dangling comeback artistId ${c.artistId}`);
}
// every artist and every category has at least one product
for (const a of artists) assert.ok(products.some((p) => p.artistId === a.id), `no products for ${a.slug}`);
for (const c of categories) assert.ok(products.some((p) => p.categoryId === c.id), `no products for ${c.slug}`);

// unique slugs / ids
assert.equal(new Set(products.map((p) => p.slug)).size, products.length);
assert.equal(new Set(products.map((p) => p.id)).size, products.length);

// The three slices are 8 long, resolved, and PAIRWISE DISJOINT. Disjoint, not
// merely "not identical": the homepage renders all three rails on one scroll, so
// a single shared slug shows the same product card twice. Stronger than the old
// key-inequality check, which passed happily on a 7-of-8 overlap.
const slices = { trendingProducts, fanFavorites, newDropProducts };
for (const [name, s] of Object.entries(slices)) assert.equal(s.length, 8, `${name} must resolve to 8`);
const entries = Object.entries(slices);
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    const [aName, a] = entries[i];
    const [bName, b] = entries[j];
    const bSlugs = new Set(b.map((p) => p.slug));
    const shared = a.filter((p) => bSlugs.has(p.slug)).map((p) => p.slug);
    assert.deepEqual(shared, [], `${aName} and ${bName} share ${shared.join(", ")}`);
  }
}
// no rail repeats a product within itself either
for (const [name, s] of entries) {
  assert.equal(new Set(s.map((p) => p.slug)).size, s.length, `${name} has a duplicate slug`);
}

assert.ok(products.filter((p) => p.variants.length > 0).length >= 3, "need >= 3 products with variants");
assert.ok(products.some((p) => p.stock === 0) && products.some((p) => p.isPreorder) && products.some((p) => p.isLimited));
assert.ok(getArtistById("art-bts") && getCategoryBySlug("albums"));

console.log("data.check OK:", products.length, "products,", artists.length, "artists");

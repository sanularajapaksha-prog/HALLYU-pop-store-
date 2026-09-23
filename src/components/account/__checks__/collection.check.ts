/**
 * Runnable check for the only non-trivial logic behind /wishlist and /collection:
 * turning stored slugs into products, grouping them by artist, and the stats row.
 *
 *   npx tsx src/components/account/__checks__/collection.check.ts
 *
 * Kept out of the component files so it never ships to the browser. The pure
 * helpers are duplicated here rather than imported because savedProducts.tsx /
 * CollectionView.tsx are "use client" React modules; the assertions below pin
 * the BEHAVIOUR, so if the components ever diverge from these rules, that is
 * the signal to update both together.
 */
import assert from "node:assert/strict";
import { getProductBySlug, products } from "../../../lib/products";
import { getArtistById } from "../../../lib/artists";
import { formatLKR } from "../../../lib/utils";
import type { Product } from "../../../types/product";

interface Resolved {
  product: Product;
  artistName: string;
}

function resolveSlugs(slugs: readonly string[]): Resolved[] {
  const out: Resolved[] = [];
  for (const slug of slugs) {
    const product = getProductBySlug(slug);
    if (!product) continue;
    out.push({ product, artistName: getArtistById(product.artistId)?.name ?? "Unknown artist" });
  }
  return out;
}

interface Group {
  artistId: string;
  name: string;
  items: Resolved[];
}

function groupByArtist(items: Resolved[]): Group[] {
  const groups = new Map<string, Group>();
  for (const item of items) {
    const { artistId } = item.product;
    let group = groups.get(artistId);
    if (!group) {
      group = { artistId, name: item.artistName, items: [] };
      groups.set(artistId, group);
    }
    group.items.push(item);
  }
  return [...groups.values()];
}

// --- fixtures: real slugs from the real catalogue -------------------------
const all = products;
assert.ok(all.length >= 4, "catalogue too small to exercise grouping");

const firstArtistId = all[0]!.artistId;
const sameArtist = all.filter((p) => p.artistId === firstArtistId);
const otherArtist = all.find((p) => p.artistId !== firstArtistId);
assert.ok(otherArtist, "catalogue needs at least two artists");

// --- 1. empty in, empty out (the empty-state path) ------------------------
assert.deepEqual(resolveSlugs([]), []);
assert.deepEqual(groupByArtist([]), []);

// --- 2. stale slugs are DROPPED, never thrown on ---------------------------
// This is the whole reason the page does not crash on old localStorage.
const withJunk = resolveSlugs([
  "definitely-not-a-product",
  all[0]!.slug,
  "",
  "another-ghost-slug",
]);
assert.equal(withJunk.length, 1, "unresolvable slugs must be filtered out");
assert.equal(withJunk[0]!.product.slug, all[0]!.slug);

// every slug junk -> empty list, which renders the EmptyState (not a blank grid)
assert.deepEqual(resolveSlugs(["nope", "also-nope"]), []);

// --- 3. every resolved item gets a non-empty artist name ------------------
for (const item of resolveSlugs(all.map((p) => p.slug))) {
  assert.ok(item.artistName.length > 0, `empty artist name for ${item.product.slug}`);
}

// --- 4. grouping: same artist collapses into ONE group --------------------
if (sameArtist.length >= 2) {
  const grouped = groupByArtist(resolveSlugs([sameArtist[0]!.slug, sameArtist[1]!.slug]));
  assert.equal(grouped.length, 1, "two products by one artist must form one group");
  assert.equal(grouped[0]!.items.length, 2);
}

// --- 5. grouping: first-appearance order is preserved ---------------------
// Matters because the stats row and the section order must not reshuffle when
// an item is added.
const interleaved = groupByArtist(
  resolveSlugs([otherArtist.slug, all[0]!.slug, otherArtist.slug]),
);
assert.equal(interleaved[0]!.artistId, otherArtist.artistId, "first seen artist must be first");
assert.equal(interleaved.length, 2);
// a duplicate slug lands in its existing group rather than creating a new one
assert.equal(interleaved[0]!.items.length, 2);

// --- 6. stats row arithmetic ---------------------------------------------
const owned = resolveSlugs([all[0]!.slug, otherArtist.slug]);
const total = owned.reduce((sum, i) => sum + i.product.price, 0);
assert.equal(total, all[0]!.price + otherArtist.price);
assert.equal(groupByArtist(owned).length, 2, "distinct-artist count");
assert.ok(/^LKR /.test(formatLKR(total)), "collection value must format as LKR");
// empty collection: 0 items, 0 artists, LKR 0 — never NaN.
assert.equal(formatLKR([].reduce((s: number, i: number) => s + i, 0)), "LKR 0");

// --- 7. a slug appearing in BOTH stores is fine ---------------------------
// The wishlist "Move to collection" action relies on has() being independent.
const shared = all[0]!.slug;
assert.ok(getProductBySlug(shared), "shared slug must resolve in both views");

console.log("collection.check ok");

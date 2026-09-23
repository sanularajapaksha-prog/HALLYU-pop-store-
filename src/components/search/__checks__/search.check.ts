/**
 * Runnable check for the /search matching rules.
 *   npx tsx src/components/search/__checks__/search.check.ts
 *
 * The search function itself lives inside a "use client" module, so it is
 * re-stated here against the SAME data. If the rules in SearchResults.tsx
 * change, change them here too — this asserts the behaviour, not the wiring.
 */
import assert from "node:assert/strict";
import { artists, getArtistById } from "@/lib/artists";
import { categories } from "@/lib/categories";
import { products } from "@/lib/products";

function matches(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q);
}

function runSearch(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { artists: [], products: [], categories: [], total: 0 };

  const artistHits = artists.filter(
    (a) => matches(a.name, q) || matches(a.description, q),
  );
  const productHits = products.filter((p) => {
    const artistName = getArtistById(p.artistId)?.name ?? "";
    return matches(p.name, q) || matches(p.description, q) || matches(artistName, q);
  });
  const categoryHits = categories.filter(
    (c) => matches(c.name, q) || matches(c.description, q),
  );

  return {
    artists: artistHits,
    products: productHits,
    categories: categoryHits,
    total: artistHits.length + productHits.length + categoryHits.length,
  };
}

// Empty and whitespace-only queries are the initial state, never "0 results".
for (const blank of ["", "   ", "\t\n"]) {
  const r = runSearch(blank);
  assert.equal(r.total, 0, `blank query ${JSON.stringify(blank)} must return nothing`);
  assert.deepEqual(r.artists, []);
  assert.deepEqual(r.products, []);
  assert.deepEqual(r.categories, []);
}

// Case-insensitive, and an artist query surfaces that artist's PRODUCTS too.
const bts = runSearch("bts");
assert.ok(bts.artists.length >= 1, "bts matches at least the BTS artist");
assert.ok(bts.products.length >= 1, "bts matches BTS products via the artist join");
assert.deepEqual(
  runSearch("BTS").products.map((p) => p.id),
  bts.products.map((p) => p.id),
  "search must be case-insensitive",
);

// Every product attributed to a matched artist is present — the join is not lossy.
const btsArtist = artists.find((a) => a.name.toLowerCase() === "bts");
assert.ok(btsArtist, "seed data must contain BTS");
for (const p of products.filter((p) => p.artistId === btsArtist.id)) {
  assert.ok(
    bts.products.some((hit) => hit.id === p.id),
    `product ${p.slug} belongs to BTS and must appear in a "bts" search`,
  );
}

// Surrounding whitespace is trimmed, not treated as part of the term.
assert.equal(runSearch("  bts  ").total, bts.total, "query must be trimmed");

// Collections are searchable by name.
const photocards = runSearch("photocard");
assert.ok(photocards.categories.length >= 1, "photocard matches the Photocards collection");

// A miss is a real zero across all three groups -> drives the EmptyState branch.
const miss = runSearch("zzzzqqqq-no-such-thing");
assert.equal(miss.total, 0);
assert.equal(miss.artists.length + miss.products.length + miss.categories.length, 0);

// total is the sum of the three groups, for every probe.
for (const q of ["bts", "photocard", "light", "a", "limited"]) {
  const r = runSearch(q);
  assert.equal(
    r.total,
    r.artists.length + r.products.length + r.categories.length,
    `total must equal the sum of the groups for "${q}"`,
  );
}

// Regex metacharacters are inert — this is substring matching, not a pattern.
// ".*" would match everything if it were compiled as a regex; as a literal it
// matches nothing, because no description contains the two characters ".*".
assert.equal(runSearch(".*").total, 0, "'.*' must be a literal, not a wildcard");
// An unbalanced paren must not throw. It legitimately HITS, because "(" really
// does occur in product copy — the point is that it is matched literally.
const paren = runSearch("(");
assert.ok(
  paren.products.every(
    (p) =>
      p.description.includes("(") ||
      p.name.includes("(") ||
      (getArtistById(p.artistId)?.name ?? "").includes("("),
  ),
  "every '(' hit must literally contain the character in a searched field",
);

console.log("search.check ok");

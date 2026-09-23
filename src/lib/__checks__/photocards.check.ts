// Run: npx tsx src/lib/__checks__/photocards.check.ts
// The §23 ladder is the only non-trivial logic on these three pages, so it is
// the one thing that gets a check: name derivation, parent-scoped counts, the
// clear-below rule, and URL round-trip.

import assert from "node:assert/strict";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory, products } from "@/lib/products";
import { artists, getArtistById } from "@/lib/artists";
import {
  EMPTY_SELECTION,
  countSelected,
  facetsOf,
  filterPhotocards,
  optionsFor,
  parseSelectionFromParams,
  selectStep,
  selectionToParams,
  type PhotocardSelection,
} from "@/lib/photocards";
import type { Product } from "@/types/product";

const category = getCategoryBySlug("photocards");
assert.ok(category, "the photocards category exists");
const photocards = getProductsByCategory(category.id);
assert.ok(photocards.length > 0, "the seed catalogue has photocards");

const artistLabel = (id: string) => getArtistById(id)?.name ?? id;
const identity = (v: string) => v;

// --- derivation: the three real facets, from the real seed names ---
const byName = (name: string): Product => {
  const hit = photocards.find((p) => p.name === name);
  assert.ok(hit, `seed photocard "${name}" still exists`);
  return hit;
};

const proof = facetsOf(byName("Proof Photocard Set — Full Member"));
assert.equal(proof.album, "Proof", "album is the head, marker word stripped");
assert.equal(proof.member, "", '"Full Member" describes the set, not a person');
assert.equal(proof.type, "Full Set");

const winter = facetsOf(byName("aespa POB Photocard — Winter"));
assert.equal(winter.album, "aespa POB");
assert.equal(winter.member, "Winter", "a short proper-noun suffix IS a member");
assert.equal(winter.type, "POB Exclusive", "POB beats Set in the type ranking");

const bornPink = facetsOf(byName("BORN PINK Photocard Set"));
assert.equal(bornPink.album, "BORN PINK");
assert.equal(bornPink.member, "", "no em dash -> no member");
assert.equal(bornPink.type, "Full Set");

// Every photocard derives a NON-EMPTY album and type, or the ladder strands it.
for (const p of photocards) {
  const f = facetsOf(p);
  assert.ok(f.album.length > 0, `${p.name} derives an album`);
  assert.ok(f.type.length > 0, `${p.name} derives a type`);
}

// A long descriptive suffix is NOT mistaken for a member name.
const fake: Product = { ...photocards[0], name: "X Photocard — Limited Fan Club Edition Set" };
assert.equal(facetsOf(fake).member, "", "a 5-word suffix is a description, not a person");

// --- no empty filter groups: every rendered option has a real value ---
for (const step of ["artist", "album", "type", "member"] as const) {
  for (const opt of optionsFor(photocards, EMPTY_SELECTION, step, identity)) {
    assert.notEqual(opt.value, "", `${step} never offers a blank option`);
  }
}

// --- the ladder: counts are scoped to PARENTS only ---
const bts = artists.find((a) => a.name === "BTS");
assert.ok(bts, "BTS is in the seed catalogue");
const btsOnly = selectStep(EMPTY_SELECTION, "artist", bts.id);
const btsAlbums = optionsFor(photocards, btsOnly, "album", identity);
assert.ok(btsAlbums.length > 0, "picking an artist reveals that artist's albums");
for (const opt of btsAlbums) {
  assert.ok(opt.count > 0, `album "${opt.label}" is reachable, never a dead 0`);
}
assert.ok(
  btsAlbums.every((o) => o.label !== "BORN PINK"),
  "another artist's album is NOT offered under BTS",
);

// Every option on every rung leads to at least one product — the whole point
// of a guided drill-down is that you cannot build an empty combination.
for (const artistOpt of optionsFor(photocards, EMPTY_SELECTION, "artist", artistLabel)) {
  const s1 = selectStep(EMPTY_SELECTION, "artist", artistOpt.value);
  assert.ok(filterPhotocards(photocards, s1).length > 0, `${artistOpt.label} yields results`);
  for (const albumOpt of optionsFor(photocards, s1, "album", identity)) {
    const s2 = selectStep(s1, "album", albumOpt.value);
    assert.ok(filterPhotocards(photocards, s2).length > 0, `${albumOpt.label} yields results`);
    for (const typeOpt of optionsFor(photocards, s2, "type", identity)) {
      const s3 = selectStep(s2, "type", typeOpt.value);
      assert.ok(filterPhotocards(photocards, s3).length > 0, `${typeOpt.label} yields results`);
    }
  }
}

// --- selectStep clears BELOW, keeps ABOVE ---
const deep: PhotocardSelection = { artist: "a", album: "b", type: "c", member: "d" };
assert.deepEqual(
  selectStep(deep, "album", "z"),
  { artist: "a", album: "z", type: "", member: "" },
  "setting a rung clears every rung below it",
);
assert.deepEqual(
  selectStep(deep, "artist", ""),
  EMPTY_SELECTION,
  "clearing the top rung clears the whole ladder",
);
assert.deepEqual(selectStep(deep, "member", "z"), { ...deep, member: "z" }, "last rung is a leaf");
assert.equal(countSelected(deep), 4);
assert.equal(countSelected(EMPTY_SELECTION), 0);

// --- a selected-but-unreachable value stays visible so it stays removable ---
const stale = selectStep(EMPTY_SELECTION, "artist", "art-does-not-exist");
const staleOpts = optionsFor(photocards, stale, "artist", artistLabel);
assert.ok(
  staleOpts.some((o) => o.value === "art-does-not-exist" && o.count === 0),
  "a stale URL value is still offered (at 0) so the user can un-pick it",
);
assert.deepEqual(filterPhotocards(photocards, stale), [], "...and it genuinely filters to nothing");

// --- URL round-trip + hardening ---
assert.deepEqual(parseSelectionFromParams(selectionToParams(deep)), deep, "exact round-trip");
assert.deepEqual(parseSelectionFromParams({}), EMPTY_SELECTION, "no params -> nothing selected");
assert.deepEqual(
  parseSelectionFromParams({ album: "Proof" }),
  EMPTY_SELECTION,
  "an album with no artist is dropped: no invisible active filter",
);
assert.deepEqual(
  parseSelectionFromParams({ artist: ["art-bts", "art-ive"] }),
  { ...EMPTY_SELECTION, artist: "art-bts" },
  "a repeated query key takes the first value",
);
assert.equal(
  parseSelectionFromParams({ artist: "x".repeat(500) }).artist.length,
  80,
  "an oversized param is clamped",
);
assert.deepEqual(
  parseSelectionFromParams({ artist: "   " }),
  EMPTY_SELECTION,
  "a whitespace-only param is treated as unset",
);

// --- empty catalogue degrades, never throws ---
assert.deepEqual(filterPhotocards([], deep), []);
assert.deepEqual(optionsFor([], EMPTY_SELECTION, "artist", identity), []);

// --- filterPhotocards never mutates and never widens ---
const before = photocards.length;
filterPhotocards(photocards, deep);
assert.equal(photocards.length, before, "filtering does not mutate the input");
assert.deepEqual(
  filterPhotocards(photocards, EMPTY_SELECTION),
  photocards,
  "an empty selection is a pass-through",
);
assert.ok(
  filterPhotocards(products, EMPTY_SELECTION).length === products.length,
  "the module itself does no category filtering - the page supplies the dataset",
);

console.log("photocards.check OK");

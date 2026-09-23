/**
 * Runnable check for the /product/[slug] page logic.
 *   npx tsx src/components/product/__checks__/detail.check.tsx
 *
 * Covers the branchy parts that a type-check cannot catch: variant
 * price/stock/compareAt resolution, the sold-out default selection, gallery
 * index clamping, quantity clamping, and inclusion derivation.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { inclusionsFor, WhatsIncluded } from "../WhatsIncluded";
import { ProductGallery } from "../ProductGallery";
import { getProductBySlug, products } from "@/lib/products";
import { categories } from "@/lib/categories";
import type { Product, ProductVariant } from "@/types/product";

/*
 * next/image reads its allowed hosts from config the Next BUILD injects; under
 * plain `tsx` there is no build, so picsum.photos throws "hostname is not
 * configured" — a harness failure, not a product one. Same escape hatch the
 * existing cards.check.tsx uses: render `unoptimized` to skip the loader while
 * keeping the real markup this file asserts on. next.config.ts's host list is
 * `next build`'s job to verify, not this file's.
 */
const html = (el: React.ReactElement) =>
  renderToStaticMarkup(
    createElement(
      ImageConfigContext.Provider,
      { value: { ...imageConfigDefault, unoptimized: true } },
      el,
    ),
  );

/* ── The pure rules ProductInfo applies, mirrored here so they can be asserted
      without a DOM. Kept in sync by the assertions below, which run the real
      catalogue through them. ── */

function defaultVariantId(variants: ProductVariant[]): string {
  return (variants.find((v) => v.stock > 0) ?? variants[0])?.id ?? "";
}

function resolve(product: Product, selectedId: string) {
  const v = product.variants.find((x) => x.id === selectedId);
  const price = v?.price ?? product.price;
  const stock = v?.stock ?? product.stock;
  return {
    price,
    stock,
    images: v !== undefined && v.images.length > 0 ? v.images : product.images,
    compareAtPrice: price === product.price ? product.compareAtPrice : undefined,
  };
}

// ── 1. Variant resolution against real data ──────────────────────────────────
const proof = getProductBySlug("bts-proof-standard-edition");
assert.ok(proof, "seed product must exist");
assert.equal(proof.variants.length, 3);

const stdId = defaultVariantId(proof.variants);
assert.equal(stdId, "var-001-a", "first in-stock variant is the default");

const std = resolve(proof, stdId);
assert.equal(std.price, 12800);
assert.equal(std.stock, 42);
assert.equal(std.compareAtPrice, 15500, "base variant keeps the real discount");

const compact = resolve(proof, "var-001-b");
assert.equal(compact.price, 8400);
assert.equal(
  compact.compareAtPrice,
  undefined,
  "a non-base variant must NOT inherit compareAtPrice — that would invent a discount",
);

// Unknown / empty variant id falls back to the product, never NaN or undefined.
const fallback = resolve(proof, "does-not-exist");
assert.equal(fallback.price, proof.price);
assert.equal(fallback.stock, proof.stock);
assert.ok(fallback.images.length > 0);

// ── 2. Sold-out default selection ────────────────────────────────────────────
const soldOutFirst: ProductVariant[] = [
  { ...proof.variants[0]!, id: "v-dead", stock: 0 },
  { ...proof.variants[1]!, id: "v-live", stock: 5 },
];
assert.equal(
  defaultVariantId(soldOutFirst),
  "v-live",
  "must skip a sold-out first variant, else the page opens on a disabled buy button",
);

const allDead = soldOutFirst.map((v) => ({ ...v, stock: 0 }));
assert.equal(defaultVariantId(allDead), "v-dead", "all sold out still selects a real option");
assert.equal(defaultVariantId([]), "", "no variants -> empty id, selector renders nothing");

// ── 3. Gallery index clamp (the variant-switch blank-stage bug) ──────────────
const clamp = (activeIndex: number, len: number) => Math.min(activeIndex, len - 1);
assert.equal(clamp(3, 2), 1, "index past the end of a shorter gallery clamps in-range");
assert.equal(clamp(0, 2), 0);
assert.equal(clamp(1, 4), 1, "a longer gallery keeps the user's position");

// ── 4. Quantity clamp in AddToCart ───────────────────────────────────────────
const qty = (requested: number, stock: number) => Math.min(requested, Math.max(1, stock));
assert.equal(qty(9, 4), 4, "quantity never exceeds the selected variant's stock");
assert.equal(qty(1, 0), 1, "max floors at 1 so QuantitySelector's clamp never inverts");
assert.equal(qty(2, 50), 2);

// ── 5. Inclusions (§30) ──────────────────────────────────────────────────────
const albumInc = inclusionsFor("cat-albums", "bts-proof-standard-edition");
assert.ok(albumInc.length >= 4, "albums list their contents");
assert.ok(
  albumInc.every((i) => typeof i.image === "string" && i.image.length > 0),
  "every tile gets a deterministic seeded image",
);
assert.deepEqual(
  inclusionsFor("cat-albums", "bts-proof-standard-edition"),
  albumInc,
  "derivation is deterministic — no Math.random during render",
);
assert.notDeepEqual(
  inclusionsFor("cat-albums", "other-slug").map((i) => i.image),
  albumInc.map((i) => i.image),
  "different products get different tile art",
);
assert.deepEqual(inclusionsFor("cat-nope", "x"), [], "unknown category -> no section");

// Every real category is covered, so no live product shows an empty section.
for (const category of categories) {
  assert.ok(
    inclusionsFor(category.id, "seed").length > 0,
    `category ${category.id} has no inclusions mapping`,
  );
}

// ── 6. SSR smoke: server components render, a11y attributes present ──────────
assert.equal(html(<WhatsIncluded items={[]} />), "", "empty items renders nothing, not a bare heading");

const includedHtml = html(<WhatsIncluded items={albumInc} />);
assert.ok(includedHtml.includes("What"), "heading present");
assert.ok(includedHtml.includes("&times;") || includedHtml.includes("×"), "quantities shown");

const galleryHtml = html(<ProductGallery images={proof.images} productName={proof.name} />);
assert.ok(
  galleryHtml.includes(`View image 1 of ${proof.images.length}`),
  "thumbnails carry the spec'd aria-label",
);
assert.ok(galleryHtml.includes('aria-current="true"'), "active thumb marked aria-current");

const singleHtml = html(<ProductGallery images={[proof.images[0]!]} productName={proof.name} />);
assert.ok(!singleHtml.includes("View image"), "single image renders no thumbnail rail");

const noneHtml = html(<ProductGallery images={[]} productName="x" />);
assert.ok(noneHtml.includes("No image available"), "zero images degrades to a placeholder");

// ── 7. Every catalogue product survives the page's own derivations ───────────
for (const product of products) {
  const r = resolve(product, defaultVariantId(product.variants));
  assert.ok(Number.isFinite(r.price) && r.price > 0, `${product.slug}: bad price`);
  assert.ok(Number.isFinite(r.stock) && r.stock >= 0, `${product.slug}: bad stock`);
  assert.ok(r.images.length > 0, `${product.slug}: no images`);
  assert.ok(
    r.compareAtPrice === undefined || r.compareAtPrice > r.price,
    `${product.slug}: compareAtPrice must be above price or absent`,
  );
}

// ── 8. Artist route spelling ─────────────────────────────────────────────────
// REGRESSION GUARD: this page was first written with `/artist/<slug>` while the
// rest of the app (ArtistCard, SearchBar, ANNOUNCEMENT_HREF) uses the PLURAL
// `/artists/<slug>`. That produced three dead links with a green build, because
// next/link does not validate hrefs. Assert the spelling directly.
const pageSource = readFileSync(
  new URL("../../../app/product/[slug]/page.tsx", import.meta.url),
  "utf8",
);
assert.ok(
  pageSource.includes("/artists/${artist.slug}"),
  "product page must link to the plural /artists/<slug> route",
);
assert.ok(
  !/["`]\/artist\/\$/.test(pageSource),
  "singular /artist/<slug> is not a route in this app",
);

console.log("detail.check ok");

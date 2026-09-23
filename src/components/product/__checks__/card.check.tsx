/**
 * ponytail: one runnable check for the only non-trivial logic on the card —
 * badge priority/cap, availability, the discount guard, and the degradation
 * paths (one image, zero images, sold out). Renders through react-dom/server
 * and asserts on the real HTML, so it also proves the link-overlay pattern
 * emits no <button> inside an <a>.
 *
 * next/image reads next.config at BUILD time, so a bare `tsx` run has no config
 * and hard-throws "hostname is not configured". ImageConfigContext is next's
 * own supported override for exactly this, so the check wraps every render in
 * it rather than touching the components. `next build` still enforces
 * images.remotePatterns — this affects this file only.
 *
 * Run: npx tsx src/components/product/__checks__/card.check.tsx
 */
import assert from "node:assert/strict";

import { renderToStaticMarkup } from "react-dom/server";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import type React from "react";
import type { Product, ProductImage } from "@/types/product";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CollectionProvider } from "@/context/CollectionContext";
import { ProductCard } from "../ProductCard";
import { ProductPrice } from "../ProductPrice";

const img = (n: number): ProductImage => ({
  id: `i${n}`,
  url: `https://picsum.photos/seed/x-${n}/800/800`,
  alt: `Alt text ${n}`,
  width: 800,
  height: 800,
});

function make(over: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Proof (Standard Edition)",
    slug: "proof-standard",
    artistId: "a1",
    categoryId: "c1",
    description: "d",
    price: 12500,
    stock: 40,
    status: "ACTIVE",
    images: [img(1), img(2)],
    variants: [],
    releaseDate: "2026-01-01",
    isPreorder: false,
    isFeatured: false,
    isLimited: false,
    createdAt: "2026-01-01",
    ...over,
  };
}

// `unoptimized` keeps the loader from building srcsets against a dev server
// that is not running; hostname validation is what we are bypassing here.
const imageConfig = { ...imageConfigDefault, unoptimized: true };

// ProductCard calls useCart() (quick add) and WishlistButton calls the
// wishlist store, so a bare render throws "must be used inside <AppProviders>".
// The three stores are wrapped directly rather than importing AppProviders,
// because AppProviders also mounts <CartDrawer/>, whose markup would land in
// the very HTML these assertions count <button> and badge occurrences in.
// All three are SSR-safe (their useStoredState reports hydrated=false here).
const render = (node: React.ReactElement): string =>
  renderToStaticMarkup(
    <ImageConfigContext.Provider value={imageConfig}>
      <CartProvider>
        <WishlistProvider>
          <CollectionProvider>{node}</CollectionProvider>
        </WishlistProvider>
      </CartProvider>
    </ImageConfigContext.Provider>,
  );

const html = (p: Product): string =>
  render(<ProductCard product={p} artistName="BTS" />);

// ── §17: never more than two badges, even when every flag is on ──────────
const everything = html(
  make({
    isPreorder: true,
    isLimited: true,
    isFeatured: true,
    stock: 2,
    createdAt: "2026-09-01",
  }),
);
const badgeCount = (everything.match(/rounded-pill px-2\.5/g) ?? []).length;
assert.equal(badgeCount, 2, `§17 caps badges at 2, rendered ${badgeCount}`);
assert.ok(everything.includes("PRE-ORDER"), "PRE-ORDER outranks the rest");
assert.ok(everything.includes("LIMITED"), "LIMITED is second");
assert.ok(!everything.includes("EXCLUSIVE"), "EXCLUSIVE is priority 5, must be cut");

// ── availability ladder ──────────────────────────────────────────────────
assert.ok(html(make()).includes("IN STOCK"));
assert.ok(html(make({ stock: 3 })).includes("LOW STOCK"));
assert.ok(html(make({ isPreorder: true })).includes("PRE-ORDER"));
// Boundary: stock 5 is LOW, stock 6 is IN STOCK (off-by-one on <=).
assert.ok(html(make({ stock: 5 })).includes("LOW STOCK"), "5 is low");
assert.ok(html(make({ stock: 6 })).includes("IN STOCK"), "6 is not low");

// ── sold out: dimmed, overlay, NO quick add, still a link ────────────────
const dead = html(make({ stock: 0, status: "SOLD_OUT" }));
assert.ok(dead.includes("Sold out"), "overlay present");
assert.ok(dead.includes("grayscale"), "image dimmed");
assert.ok(!dead.includes("Quick add"), "no quick add when sold out");
assert.ok(dead.includes('href="/product/proof-standard"'), "card is still a link");
assert.ok(dead.includes("(sold out)"), "state is in the accessible name");

// ── degradation: one image must not crash and must not render a swap ─────
const single = html(make({ images: [img(1)] }));
assert.ok(single.includes("Alt text 1"), "primary still renders");
assert.equal(
  (single.match(/<img/g) ?? []).length,
  1,
  "exactly one <img> when there is no second image",
);
// ── degradation: zero images costs one card, not the page ────────────────
assert.equal(
  html(make({ images: [] })).replace(/<!--[\s\S]*?-->/g, ""),
  "",
  "empty gallery renders nothing",
);

// ── a11y: the reason the link-overlay pattern exists ─────────────────────
const live = html(make());
// This is THE structural rule of the card. Naive regexes get it wrong: a lazy
// `<a...>[\s\S]*?<button` also matches a button that comes AFTER the closing
// </a>, so it reports a nesting bug that does not exist — it did exactly that
// on the first run here. Slice the real span between <a> and its </a> instead.
const anchorStart = live.indexOf("<a ");
const anchorEnd = live.indexOf("</a>", anchorStart);
assert.ok(anchorStart !== -1 && anchorEnd !== -1, "card renders an anchor");
assert.ok(
  !live.slice(anchorStart, anchorEnd).includes("<button"),
  "INVALID HTML: a <button> is nested inside the <a> — breaks keyboard nav",
);
// ...and prove the buttons exist at all, so the assertion above cannot pass
// merely because nothing rendered.
assert.equal(
  (live.match(/<button/g) ?? []).length,
  2,
  "wishlist + quick add both render, as siblings of the link",
);
assert.ok(live.includes("BTS — Proof (Standard Edition)"), "link has an accessible name");
assert.ok(live.includes('aria-label="Add Proof (Standard Edition) to wishlist"'));
// SSR deliberately OMITS aria-pressed: pre-hydration the wishlist store is
// empty by definition, so emitting aria-pressed="false" would announce a state
// that has not been read yet (see WishlistButton's `hydrated ? pressed :
// undefined`). Assert the omission, not a value — a server-rendered "false"
// here would be the bug.
assert.ok(
  !live.includes("aria-pressed"),
  "wishlist must not announce a toggle state it has not hydrated yet",
);
// Image 2 is decorative — it must not repeat the product name to a screen reader.
assert.ok(live.includes('alt=""'), "swap image is decorative");
assert.equal(
  (live.match(/Alt text 1/g) ?? []).length,
  1,
  "primary alt appears once, not duplicated by the swap",
);
// REGRESSION: reduced motion once hid BOTH image layers on hover — image 1
// faded out while image 2 was pinned at opacity-0, leaving an empty grey
// square. Image 1 must be restored whenever the swap is suppressed.
assert.ok(
  live.includes("motion-reduce:group-hover:opacity-100"),
  "reduced motion must keep image 1 visible on hover, not blank the card",
);

// The wishlist must survive on touch: a bare opacity-0 would hide it there.
assert.ok(
  live.includes("[@media(hover:hover)]:opacity-0"),
  "wishlist hides only where hover exists",
);

// ── price: the discount guard ────────────────────────────────────────────
const price = (p: number, c?: number): string =>
  render(<ProductPrice price={p} compareAtPrice={c} />);
assert.ok(price(12500).includes("LKR 12,500"));
assert.ok(price(12500, 15500).includes("LKR 15,500"), "discount shows the old price");
// `.includes("<s")` would be a false positive — it also matches "<span",
// which every price renders. Match the <s> tag itself.
const struck = (html: string): boolean => /<s[>\s]/.test(html);
assert.ok(struck(price(12500, 15500)), "old price is struck through semantically");
// A compareAtPrice at or below price is bad data, not a discount.
assert.ok(!struck(price(12500, 12500)), "equal compareAtPrice is not a discount");
assert.ok(!struck(price(12500, 9000)), "lower compareAtPrice is not a discount");
assert.ok(!struck(price(12500, Number.NaN)), "NaN compareAtPrice is ignored");

console.log("card.check OK");

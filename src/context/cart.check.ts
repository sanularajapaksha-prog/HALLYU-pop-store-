// ponytail: one runnable check for the cart's non-trivial logic — the add/update
// reducers and price resolution. Pure functions mirrored from CartContext; if the
// provider's reducers change, change these with them.
// Run: npx tsx src/context/cart.check.ts
import assert from "node:assert/strict";
import { products } from "../lib/products";
import type { CartItem } from "./CartContext";

const isCartItem = (v: unknown): v is CartItem => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.quantity === "number" &&
    Number.isFinite(o.quantity) &&
    o.quantity > 0 &&
    (o.variantId === undefined || typeof o.variantId === "string")
  );
};
const isCartItems = (v: unknown): v is CartItem[] => Array.isArray(v) && v.every(isCartItem);

const same = (i: CartItem, productId: string, variantId?: string) =>
  i.productId === productId && i.variantId === variantId;

const add = (prev: CartItem[], productId: string, quantity = 1, variantId?: string): CartItem[] => {
  if (!Number.isFinite(quantity) || quantity <= 0) return prev;
  const at = prev.findIndex((i) => same(i, productId, variantId));
  if (at === -1) return [...prev, { productId, variantId, quantity }];
  return prev.map((i, idx) => (idx === at ? { ...i, quantity: i.quantity + quantity } : i));
};

const update = (prev: CartItem[], productId: string, quantity: number, variantId?: string) =>
  quantity <= 0 || !Number.isFinite(quantity)
    ? prev.filter((i) => !same(i, productId, variantId))
    : prev.map((i) => (same(i, productId, variantId) ? { ...i, quantity } : i));

const lineTotal = (item: CartItem): number => {
  const p = products.find((x) => x.id === item.productId || x.slug === item.productId);
  if (!p) return 0;
  const v = item.variantId ? p.variants.find((x) => x.id === item.variantId) : undefined;
  return (v?.price ?? p.price) * item.quantity;
};

// Re-adding the same product+variant increments, never duplicates.
let cart = add([], "prd-001", 2);
cart = add(cart, "prd-001", 3);
assert.equal(cart.length, 1, "same product+variant must merge");
assert.equal(cart[0].quantity, 5);

// Same product, DIFFERENT variant is a separate line.
cart = add(cart, "prd-001", 1, "var-001-b");
assert.equal(cart.length, 2, "variant must key the line");

// Nasty path: quantity 0 / negative / NaN.
assert.equal(add(cart, "prd-002", 0).length, 2, "qty 0 add is a no-op");
assert.equal(add(cart, "prd-002", Number.NaN).length, 2, "NaN add is a no-op");
assert.equal(update(cart, "prd-001", 0).length, 1, "qty 0 removes the line, no ghost");

// Price resolution: base price, variant price, slug lookup, unknown id.
assert.equal(lineTotal({ productId: "prd-001", quantity: 2 }), 12800 * 2);
assert.equal(lineTotal({ productId: "prd-001", variantId: "var-001-b", quantity: 2 }), 8400 * 2);
assert.equal(lineTotal({ productId: "bts-proof-standard-edition", quantity: 1 }), 12800);
assert.equal(lineTotal({ productId: "nope", quantity: 3 }), 0, "unknown id is 0, never NaN");

// Empty cart totals are 0, not NaN.
const totals = (items: CartItem[]) => ({
  count: items.reduce((s, i) => s + i.quantity, 0),
  subtotal: items.reduce((s, i) => s + lineTotal(i), 0),
});
assert.deepEqual(totals([]), { count: 0, subtotal: 0 });
assert.equal(totals(cart).count, 6);

console.log("cart.check OK");

// Round-trip through JSON: `variantId: undefined` is dropped by stringify, so a
// no-variant line must still match itself after a reload (otherwise re-adding a
// product post-reload would create a duplicate line instead of incrementing).
const roundTrip = (items: CartItem[]): CartItem[] => JSON.parse(JSON.stringify(items));
const noVariant: CartItem[] = [{ productId: "prd-002", variantId: undefined, quantity: 1 }];
const reloaded = roundTrip(noVariant);
assert.ok(!("variantId" in reloaded[0]), "stringify drops undefined variantId");
assert.equal(add(reloaded, "prd-002", 1).length, 1, "post-reload re-add must increment");
assert.equal(add(reloaded, "prd-002", 1)[0].quantity, 2);

// A line with a variant survives the round trip keyed correctly.
const withVariant = roundTrip([{ productId: "prd-001", variantId: "var-001-b", quantity: 1 }]);
assert.equal(add(withVariant, "prd-001", 1, "var-001-b")[0].quantity, 2);
assert.equal(add(withVariant, "prd-001", 1).length, 2, "base line is separate from variant line");

// Stored garbage must be rejected wholesale, not partially trusted.
const badShapes: unknown[] = [
  null, 42, "cart", [{ productId: 1, quantity: 1 }], [{ productId: "x" }],
  [{ productId: "x", quantity: 0 }], [{ productId: "x", quantity: -3 }],
  [{ productId: "x", quantity: Number.NaN }],
];
for (const bad of badShapes) {
  assert.equal(isCartItems(bad), false, `must reject ${JSON.stringify(bad)}`);
}
assert.equal(isCartItems([]), true, "empty cart is valid");
assert.equal(isCartItems([{ productId: "x", quantity: 2 }]), true);

console.log("cart.check round-trip + validation OK");

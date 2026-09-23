/**
 * Runnable check for the /cart + /checkout logic.
 *   npx tsx src/lib/__checks__/cart.check.ts
 * Fails loudly if a reducer, the shipping rule, the deterministic order number
 * or the checkout validation ever changes behaviour.
 */
import assert from 'node:assert/strict'
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  isEmail,
  isFilled,
  isDeliveryMethodId,
  orderNumber,
  resolveCartLines,
  shippingFor,
} from '@/lib/cart'
import {
  firstInvalidField,
  validateCheckout,
  type CheckoutValues,
} from '@/components/checkout/CheckoutView'
import { products } from '@/lib/products'
import type { CartItem } from '@/context/CartContext'

const product = products[0]
const withVariants = products.find((p) => p.variants.length > 0)
assert.ok(product && withVariants, 'fixture: need a product and one with variants')

// --- resolveCartLines -------------------------------------------------------
assert.equal(resolveCartLines([]).length, 0, 'empty cart resolves to no lines')

// id and slug both resolve — CartContext accepts either.
assert.equal(resolveCartLines([{ productId: product.id, quantity: 1 }]).length, 1, 'by id')
assert.equal(resolveCartLines([{ productId: product.slug, quantity: 1 }]).length, 1, 'by slug')

// Unresolvable ids are DROPPED, not rendered as a broken row.
assert.equal(
  resolveCartLines([{ productId: 'ghost-product', quantity: 3 }]).length,
  0,
  'unknown product id drops the line',
)
assert.equal(
  resolveCartLines([
    { productId: 'ghost-product', quantity: 3 },
    { productId: product.id, quantity: 1 },
  ]).length,
  1,
  'a bad line does not take the good ones with it',
)

// Line total uses quantity.
const qty3 = resolveCartLines([{ productId: product.id, quantity: 3 }])[0]
assert.equal(qty3.lineTotal, product.price * 3, 'lineTotal = unitPrice * quantity')
assert.equal(qty3.unitPrice, product.price, 'no variant -> base price')
assert.ok(qty3.artistName.length > 0, 'artist name resolved')

// Variant price wins when a variant is selected.
const variant = withVariants.variants[0]
const variantLine = resolveCartLines([
  { productId: withVariants.id, variantId: variant.id, quantity: 2 },
])[0]
assert.equal(variantLine.unitPrice, variant.price, 'variant price wins')
assert.equal(variantLine.lineTotal, variant.price * 2, 'variant lineTotal')
assert.equal(variantLine.variant?.id, variant.id, 'variant is carried on the line')

// An unknown variantId falls back to the base price rather than dropping the
// line — the product is still real, only the chosen option has gone.
const staleVariant = resolveCartLines([
  { productId: withVariants.id, variantId: 'ghost-variant', quantity: 1 },
])[0]
assert.equal(staleVariant.unitPrice, withVariants.price, 'stale variantId -> base price')
assert.equal(staleVariant.variant, undefined, 'stale variantId -> no variant')

// --- shippingFor ------------------------------------------------------------
assert.equal(shippingFor(0), 0, 'empty bag ships nothing')
assert.equal(shippingFor(1), SHIPPING_FLAT, 'below threshold -> flat')
assert.equal(
  shippingFor(FREE_SHIPPING_THRESHOLD - 1),
  SHIPPING_FLAT,
  'just below threshold -> flat',
)
// Boundary is INCLUSIVE: exactly the threshold is free.
assert.equal(shippingFor(FREE_SHIPPING_THRESHOLD), 0, 'exactly at threshold -> free')
assert.equal(shippingFor(FREE_SHIPPING_THRESHOLD + 1), 0, 'above threshold -> free')

// --- orderNumber: deterministic, hydration-safe -----------------------------
const bag: CartItem[] = [
  { productId: 'a', quantity: 2 },
  { productId: 'b', variantId: 'v1', quantity: 1 },
]
assert.equal(orderNumber(bag), orderNumber(bag), 'same bag -> same number (twice)')
assert.equal(
  orderNumber(bag),
  orderNumber([...bag].reverse()),
  'order of items does not change the number (sorted seed)',
)
assert.notEqual(
  orderNumber(bag),
  orderNumber([{ productId: 'a', quantity: 3 }, bag[1]]),
  'changing a quantity changes the number',
)
assert.notEqual(
  orderNumber([{ productId: 'a', quantity: 1 }]),
  orderNumber([{ productId: 'a', variantId: 'v1', quantity: 1 }]),
  'variant is part of the seed',
)
assert.match(orderNumber([]), /^KPM-[0-9A-Z]{7}$/, 'empty bag still formats')
for (const n of [bag, [], [{ productId: 'z', quantity: 99 }]].map(orderNumber)) {
  assert.match(n, /^KPM-[0-9A-Z]{7}$/, `format: ${n}`)
}

// --- isFilled / isEmail -----------------------------------------------------
assert.equal(isFilled(''), false)
assert.equal(isFilled('   '), false, 'whitespace-only is not filled')
assert.equal(isFilled(' a '), true)

for (const good of ['a@b.co', 'first.last@mail.example.lk', 'x+tag@y.io']) {
  assert.equal(isEmail(good), true, `valid: ${good}`)
}
for (const bad of ['', 'plain', 'a@b', 'a@@b.co', 'a b@c.co', '@b.co', 'a@.co', 'a@b.']) {
  assert.equal(isEmail(bad), false, `invalid: ${bad}`)
}
assert.equal(isEmail('  a@b.co  '), true, 'email is trimmed before testing')

// --- isDeliveryMethodId -----------------------------------------------------
assert.equal(isDeliveryMethodId('standard'), true)
assert.equal(isDeliveryMethodId('express'), true)
assert.equal(isDeliveryMethodId('teleport'), false, 'tampered radio value rejected')

// --- validateCheckout + focus order -----------------------------------------
const blank: CheckoutValues = {
  email: '',
  name: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
}
const allErrors = validateCheckout(blank)
assert.equal(Object.keys(allErrors).length, 6, 'every required field errors when blank')
assert.equal(firstInvalidField(allErrors), 'email', 'focus goes to the first field in DOM order')

const valid: CheckoutValues = {
  email: 'fan@example.lk',
  name: 'Nimali Perera',
  address: '221B Galle Road',
  city: 'Colombo',
  postalCode: '00300',
  phone: '0771234567',
}
assert.deepEqual(validateCheckout(valid), {}, 'a complete form has no errors')
assert.equal(firstInvalidField({}), undefined, 'no errors -> nothing to focus')

// Whitespace-only input is NOT a filled field — the classic bypass.
assert.ok(validateCheckout({ ...valid, address: '    ' }).address, 'whitespace address rejected')
assert.ok(validateCheckout({ ...valid, name: '\t\n' }).name, 'whitespace name rejected')

// A present-but-malformed email gets the shape message, not the required one.
assert.equal(
  validateCheckout({ ...valid, email: 'nope' }).email,
  'Enter a valid email address.',
  'malformed email gets the shape message',
)
assert.equal(validateCheckout({ ...valid, email: '' }).email, 'Email is required.')

// Focus order skips valid fields: email fine, name fine, address blank -> address.
assert.equal(
  firstInvalidField(validateCheckout({ ...valid, address: '', phone: '' })),
  'address',
  'first invalid in DOM order, not first in the errors object',
)

console.log('cart.check OK')

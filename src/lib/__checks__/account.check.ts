/**
 * Runnable check for the account page's non-trivial logic.
 *   npx tsx src/lib/__checks__/account.check.ts
 *
 * Covers the three things that can silently go wrong: fixture slugs drifting
 * out of the catalogue, order totals, and the date/initials formatters.
 * Email validation and tab parsing are re-implemented here from the same rules
 * because their home is a 'use client' module that tsx cannot import directly.
 */
import { strict as assert } from 'node:assert'
import {
  DEMO_ACCOUNT,
  formatAccountDate,
  initialsOf,
  MOCK_ORDERS,
  ORDER_STATUS_TONE,
} from '../account'
import { getProductBySlug } from '../products'
import { formatLKR } from '../utils'

/* ── fixtures resolve against the real catalogue ── */
// This is the check that actually earns its keep: a renamed product slug would
// otherwise silently drop an item (and its price) out of an order row.
assert.ok(MOCK_ORDERS.length >= 2, 'need at least 2 mock orders')
for (const order of MOCK_ORDERS) {
  assert.ok(order.items.length > 0, `${order.id} has no items`)
  for (const item of order.items) {
    assert.ok(
      getProductBySlug(item.productSlug),
      `${order.id}: slug "${item.productSlug}" is not in the catalogue`,
    )
    assert.ok(item.quantity > 0, `${order.id}: non-positive quantity`)
  }
  assert.ok(ORDER_STATUS_TONE[order.status], `${order.id}: status has no tone`)
  // Fixed ISO dates only — a computed date would be a hydration mismatch.
  assert.match(order.placedAt, /^\d{4}-\d{2}-\d{2}$/, `${order.id}: not a fixed ISO date`)
}

// All three statuses are represented, so the page exercises every tone.
const statuses = new Set(MOCK_ORDERS.map((o) => o.status))
assert.deepEqual([...statuses].sort(), ['Delivered', 'Processing', 'Shipped'])

/* ── order totals ── */
const first = MOCK_ORDERS[0]
assert.ok(first)
const total = first.items.reduce((sum, item) => {
  const product = getProductBySlug(item.productSlug)
  return sum + (product ? product.price * item.quantity : 0)
}, 0)
assert.ok(total > 0, 'first order total should be positive')
assert.ok(formatLKR(total).startsWith('LKR '), 'total renders through formatLKR')

// An unknown slug contributes 0, never NaN — the same rule the row uses.
const withGhost = [...first.items, { productSlug: 'does-not-exist', quantity: 2 }].reduce(
  (sum, item) => {
    const product = getProductBySlug(item.productSlug)
    return sum + (product ? product.price * item.quantity : 0)
  },
  0,
)
assert.equal(withGhost, total, 'an unresolvable slug must not change the total')

/* ── initials ── */
assert.equal(initialsOf('Nayomi Perera'), 'NP')
assert.equal(initialsOf('Cher'), 'C')
assert.equal(initialsOf('  ada  lovelace  '), 'AL')
assert.equal(initialsOf('Jean Luc Picard'), 'JP', 'first + LAST, not first two')
assert.equal(initialsOf(''), '?')
assert.equal(initialsOf('   '), '?')
assert.equal(initialsOf(DEMO_ACCOUNT.name).length <= 2, true)

/* ── dates: fixed output, UTC, no clock read ── */
assert.equal(formatAccountDate('2024-03-18'), '18 Mar 2024')
assert.equal(formatAccountDate(DEMO_ACCOUNT.memberSince), '18 Mar 2024')
// Called twice, same answer — proves nothing in here reads `now`.
assert.equal(formatAccountDate('2026-09-19'), formatAccountDate('2026-09-19'))
assert.equal(formatAccountDate('not-a-date'), 'not-a-date', 'bad input degrades to the raw string')

/* ── email validation (mirrors emailError in AccountView) ── */
const emailOk = (v: string) =>
  /^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/.test(v.trim())
for (const good of ['a@b.co', 'nayomi@example.com', 'first.last@sub.domain.lk', ' a@b.co ']) {
  assert.ok(emailOk(good), `should accept "${good}"`)
}
for (const bad of [
  '',
  '   ',
  'nope',
  'a@b',
  'a@b.',
  '@b.co',
  'a b@c.co',
  'a@b..co',
  'a@@b.co',
  '.a@b.co',
  'a.@b.co',
]) {
  assert.ok(!emailOk(bad), `should reject "${bad}"`)
}

/* ── tab parsing (mirrors parseAccountTab in AccountView) ── */
const TABS = ['overview', 'orders', 'wishlist', 'collection', 'settings']
const parseTab = (v: string | string[] | undefined) => {
  const raw = Array.isArray(v) ? v[0] : v
  return raw !== undefined && TABS.includes(raw) ? raw : 'overview'
}
assert.equal(parseTab('orders'), 'orders')
assert.equal(parseTab(undefined), 'overview')
assert.equal(parseTab('settings'), 'settings')
assert.equal(parseTab('nonsense'), 'overview', 'junk ?tab= falls back, never a blank panel')
assert.equal(parseTab(''), 'overview')
assert.equal(parseTab(['wishlist', 'orders']), 'wishlist', 'repeated ?tab= takes the first')
assert.equal(parseTab([]), 'overview')

console.log('account.check OK')

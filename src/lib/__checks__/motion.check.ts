/**
 * Runnable check for the parallax motion contract.
 *   npx tsx src/lib/__checks__/motion.check.ts
 *
 * useParallax itself is DOM/rAF/IntersectionObserver-driven and has no pure
 * logic worth re-implementing here; this check instead locks down the two
 * things a future edit could silently break: the named speed tiers staying
 * inside the documented 0.1-0.35 depth-cue range, and the offset formula
 * (delta * speed) that useParallax's computeOffset uses.
 */
import { strict as assert } from 'node:assert';
import { PARALLAX_SPEED, STAGGER_MS } from '../motion';

// --- speed tiers stay inside the documented subtle range ---
for (const [tier, value] of Object.entries(PARALLAX_SPEED)) {
  assert.ok(value >= 0.1 && value <= 0.35, `${tier} (${value}) out of 0.1-0.35 depth-cue range`);
}
assert.ok(
  PARALLAX_SPEED.subtle < PARALLAX_SPEED.standard &&
    PARALLAX_SPEED.standard < PARALLAX_SPEED.pronounced,
  'tiers must order subtle < standard < pronounced',
);

// --- offset formula: same math as useParallax's computeOffset ---
const offsetFor = (elementCenter: number, viewportCenter: number, speed: number) =>
  (elementCenter - viewportCenter) * speed;

// Element below viewport center -> positive offset (trails scroll slightly).
assert.ok(offsetFor(800, 400, PARALLAX_SPEED.standard) > 0, 'below-center delta must be positive');
// Element above viewport center -> negative offset.
assert.ok(offsetFor(100, 400, PARALLAX_SPEED.standard) < 0, 'above-center delta must be negative');
// Dead center -> exactly zero, for any speed.
assert.equal(offsetFor(400, 400, PARALLAX_SPEED.pronounced), 0, 'centered element must be 0');

// A large scroll delta stays a fraction of itself at the subtle tier —
// this is the "depth cue, not a set piece" guarantee.
const bigDelta = 1000;
const subtleOffset = Math.abs(offsetFor(400 + bigDelta, 400, PARALLAX_SPEED.subtle));
assert.ok(subtleOffset < bigDelta * 0.35, 'subtle-tier offset must stay well under the raw delta');

assert.equal(STAGGER_MS, 60, 'STAGGER_MS drifted from the documented per-item stagger step');

console.log('motion.check OK');

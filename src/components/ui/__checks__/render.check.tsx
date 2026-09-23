import assert from 'node:assert'
import { renderToStaticMarkup } from 'react-dom/server'
import Input from '@/components/ui/Input'
import QuantitySelector from '@/components/ui/QuantitySelector'
import Skeleton from '@/components/ui/Skeleton'
import Divider from '@/components/ui/Divider'

const noop = () => {}
const html = (el: React.ReactElement) => renderToStaticMarkup(el)

// --- Input: error wiring ---
const err = html(<Input label="Email" error="Enter a valid email" />)
assert.match(err, /aria-invalid="true"/, 'error sets aria-invalid')
const described = /aria-describedby="([^"]+)"/.exec(err)
assert.ok(described, 'error sets aria-describedby')
assert.ok(
  err.includes(`id="${described[1]}"`),
  'aria-describedby points at a real element id',
)
assert.match(err, /<label for="([^"]+)"/, 'label is a real <label for>')
const lblFor = /<label for="([^"]+)"/.exec(err)![1]
assert.ok(err.includes(`id="${lblFor}"`), 'label.for matches the input id')
assert.match(err, /ring-error/, 'error recolors the shell')

// --- Input: clean state must NOT claim invalid ---
const ok = html(<Input label="Email" />)
assert.doesNotMatch(ok, /aria-invalid="true"/, 'no error => not invalid')
assert.doesNotMatch(ok, /aria-describedby/, 'no error => no dangling describedby')
assert.match(ok, /focus-within:ring-accent/, 'clean state keeps accent focus ring')

// caller-supplied aria-describedby survives when there is no error
const hinted = html(<Input aria-describedby="hint-1" />)
assert.match(hinted, /aria-describedby="hint-1"/, 'caller describedby preserved')

// --- QuantitySelector: boundaries ---
// scope to the exact <button ...> tag: split on '<button' so one button's
// attributes can never leak into the next one's assertion.
const btn = (markup: string, label: string): string => {
  const tag = markup
    .split('<button')
    .map((chunk) => '<button' + chunk.slice(0, chunk.indexOf('>') + 1))
    .find((t) => t.includes(`aria-label="${label}"`))
  assert.ok(tag, `button ${label} rendered`)
  return tag
}

// NOT /disabled/ — that substring also appears in Tailwind classes like
// "disabled:opacity-50". Only the real boolean attribute counts.
const isDisabled = (tag: string): boolean => / disabled(=|\s|>)/.test(tag)

const atMin = html(<QuantitySelector value={1} onChange={noop} />)
assert.ok(isDisabled(btn(atMin, 'Decrease quantity')), 'minus disabled at min')
assert.ok(!isDisabled(btn(atMin, 'Increase quantity')), 'plus enabled at min')

const atMax = html(<QuantitySelector value={99} onChange={noop} />)
assert.ok(isDisabled(btn(atMax, 'Increase quantity')), 'plus disabled at max')
assert.ok(!isDisabled(btn(atMax, 'Decrease quantity')), 'minus enabled at max')

// mid-range: neither end is disabled
const mid = html(<QuantitySelector value={5} onChange={noop} />)
assert.ok(!isDisabled(btn(mid, 'Decrease quantity')))
assert.ok(!isDisabled(btn(mid, 'Increase quantity')))

// degenerate min === max: both ends disabled, no escape hatch
const pinned = html(<QuantitySelector value={1} onChange={noop} min={1} max={1} />)
assert.ok(isDisabled(btn(pinned, 'Decrease quantity')))
assert.ok(isDisabled(btn(pinned, 'Increase quantity')))

// the reason I reused IconButton: a stepper must not announce as a toggle
assert.doesNotMatch(atMin, /aria-pressed/, 'aria-pressed overridden off the steppers')
assert.match(atMin, /aria-live="polite"/, 'value announces politely')

// --- Skeleton / Divider ---
assert.match(html(<Skeleton className="h-10" />), /motion-reduce:animate-none/)
assert.match(html(<Divider />), /<hr/)

console.log('render.check OK')

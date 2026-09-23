import assert from 'node:assert'
import { renderToStaticMarkup } from 'react-dom/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { EmptyState } from '@/components/layout/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'

const html = (el: React.ReactElement) => renderToStaticMarkup(el)
const noop = () => {}

// --- Breadcrumbs: last crumb is never a link, even when given an href ---
const trail = html(
  <Breadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'BTS', href: '/artists/bts' },
      { label: 'Proof', href: '/products/proof' },
    ]}
  />,
)
assert.match(trail, /aria-label="Breadcrumb"/, 'nav is labelled')
assert.strictEqual((trail.match(/<a /g) ?? []).length, 2, 'last crumb has no <a> despite its href')
assert.strictEqual((trail.match(/aria-current="page"/g) ?? []).length, 1, 'exactly one current')
assert.strictEqual((trail.match(/<svg/g) ?? []).length, 2, 'n-1 separators for n crumbs')

assert.strictEqual(html(<Breadcrumbs items={[]} />), '', 'empty renders nothing')
const solo = html(<Breadcrumbs items={[{ label: 'Cart' }]} />)
assert.doesNotMatch(solo, /<svg/, 'single crumb has no separator')
assert.match(solo, /aria-current="page"/, 'single crumb is still current')

// --- PageHeader: exactly one h1 ---
const header = html(
  <PageHeader eyebrow="Shop" title="All products" description="Everything in stock.">
    <span>filters</span>
  </PageHeader>,
)
assert.strictEqual((header.match(/<h1/g) ?? []).length, 1, 'exactly one h1')
assert.match(header, /All products<\/h1>/, 'title is the h1')
assert.match(header, /tracking-\[0\.2em\]/, 'eyebrow pill matches Section')
assert.match(header, /filters/, 'children slot renders')
assert.match(html(<PageHeader title="Not found" align="center" />), /text-center/, 'align=center centres')

// --- EmptyState: double bezel + optional action ---
const empty = html(
  <EmptyState
    title="Nothing saved yet"
    description="Tap the heart."
    action={{ label: 'Browse', href: '/shop' }}
  />,
)
assert.match(empty, /rounded-xl bg-surface p-1\.5/, 'outer shell')
assert.match(empty, /rounded-lg bg-background/, 'inner core — concentric 20-6=14')
assert.match(empty, /href="\/shop"/, 'action links out')
assert.doesNotMatch(html(<EmptyState title="Empty" />), /<a /, 'no action => no stray link')

// --- Tabs: roving tabindex — exactly one tabbable tab ---
const tabs = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'albums', label: 'Albums' },
  { id: 'cards', label: 'Photocards' },
]
const strip = html(<Tabs tabs={tabs} active="albums" onChange={noop} aria-label="Sections" />)
assert.strictEqual((strip.match(/tabindex="0"/g) ?? []).length, 1, 'exactly one tab in tab order')
assert.strictEqual((strip.match(/tabindex="-1"/g) ?? []).length, 2, 'others removed from tab order')
assert.strictEqual((strip.match(/aria-selected="true"/g) ?? []).length, 1, 'one selected tab')
assert.match(strip, /role="tablist"/, 'tablist role')
assert.strictEqual((strip.match(/role="tab"/g) ?? []).length, 3, 'every tab has the role')
assert.match(strip, /aria-controls="panel-albums"/, 'tabs point at their panels')

// unknown `active` must still leave one tabbable tab, not zero
const orphan = html(<Tabs tabs={tabs} active="nope" onChange={noop} />)
assert.strictEqual((orphan.match(/tabindex="0"/g) ?? []).length, 1, 'unknown active falls back to first')
assert.strictEqual((orphan.match(/aria-selected="true"/g) ?? []).length, 0, 'but nothing is selected')
assert.strictEqual(html(<Tabs tabs={[]} active="x" onChange={noop} />), '', 'no tabs => no empty tablist')

console.log('chrome.check ok')

import assert from 'node:assert/strict'
import { artists, getArtistBySlug } from '@/lib/artists'
import { categories } from '@/lib/categories'
import { getProductsByArtist } from '@/lib/products'

const SECTION_ORDER = ['albums','photocards','official-merch','lightsticks','apparel','accessories']
const oi = (slug: string) => { const i = SECTION_ORDER.indexOf(slug); return i === -1 ? SECTION_ORDER.length : i }

// 1. every generateStaticParams slug resolves
for (const a of artists) assert.ok(getArtistBySlug(a.slug), `slug ${a.slug} must resolve`)
assert.equal(getArtistBySlug('nope'), undefined)

// 2. grouping: only non-empty categories, spec order, no product lost/duplicated
const before = categories.map(c => c.id).join(',')
for (const a of artists) {
  const ps = getProductsByArtist(a.id)
  const map = new Map<string, typeof ps>()
  for (const p of ps) { const b = map.get(p.categoryId); if (!b) map.set(p.categoryId,[p]); else b.push(p) }
  const groups = categories.filter(c => map.has(c.id)).sort((x,y)=>oi(x.slug)-oi(y.slug))

  assert.ok(groups.every(g => (map.get(g.id) ?? []).length > 0), 'no empty section')
  const idx = groups.map(g => oi(g.slug))
  assert.deepEqual(idx, [...idx].sort((x,y)=>x-y), `${a.slug}: sections in §18 order`)
  const total = groups.reduce((n,g)=>n+(map.get(g.id) ?? []).length, 0)
  assert.equal(total, ps.length, `${a.slug}: every product lands in exactly one section`)
  // unknown categoryId would be silently dropped -> catch it
  assert.equal(new Set(ps.map(p=>p.categoryId)).size, groups.length, `${a.slug}: no product in an unknown category`)
}
// 3. sort must not mutate the shared module array
assert.equal(categories.map(c=>c.id).join(','), before, 'categories module array not reordered')

// 4. VIEW ALL links must use IDs (filters match on artistId/categoryId)
const a0 = artists[0]
const c0 = categories[0]
assert.ok(a0.id !== a0.slug && c0.id !== c0.slug, 'id and slug differ - slug links would filter to nothing')

console.log('artists.check OK')

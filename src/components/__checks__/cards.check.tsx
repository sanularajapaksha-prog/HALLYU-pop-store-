import assert from 'node:assert'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ImageConfigContext } from 'next/dist/shared/lib/image-config-context.shared-runtime'
import { imageConfigDefault } from 'next/dist/shared/lib/image-config'
import { ArtistCard } from '@/components/artist/ArtistCard'
import { ArtistGrid } from '@/components/artist/ArtistGrid'
import { CategoryCard } from '@/components/collection/CategoryCard'
import { ComebackCard } from '@/components/home/ComebackCard'
import { artists } from '@/lib/artists'
import { categories } from '@/lib/categories'
import { comebacks } from '@/lib/comebacks'
import { getArtistById } from '@/lib/artists'

// next/image resolves allowed hosts from config the Next BUILD injects. This
// file runs under plain `tsx`, with no build, so an <Image> pointing at
// picsum.photos throws "hostname is not configured" — a failure about the
// harness, not about these cards. Rendering inside an ImageConfigContext that
// marks images `unoptimized` skips the host check and the loader entirely,
// leaving the real markup (alt, sizes, classes) intact — which is all this
// file asserts on. The host allow-list itself is next.config.ts's job and is
// verified by `next build`, not here.
const renderImages = (el: React.ReactElement) =>
  createElement(
    ImageConfigContext.Provider,
    { value: { ...imageConfigDefault, unoptimized: true } },
    el,
  )

const html = (el: React.ReactElement) => renderToStaticMarkup(renderImages(el))

// === The point of this file ===
// These cards render REAL seed data. The seed types and @/types/* disagree
// today, so this check is what proves the cards accept the data that actually
// exists — a type error here means the conflict finally bit.

// --- ArtistCard ---
const artist = artists[0]
const ac = html(<ArtistCard artist={artist} />)
assert.match(ac, /href="\/artists\/bts"/, 'links to the artist route')
assert.match(ac, new RegExp(`alt="${artist.name}"`), 'artist name is the alt text')
assert.match(ac, /aspect-\[4\/5\]/, 'portrait ratio per the brief')
// Double-bezel: outer rounded-xl shell AND inner rounded-lg core must both exist.
assert.match(ac, /rounded-xl/, 'outer bezel')
assert.match(ac, /rounded-lg/, 'inner core')
// The scrim is decorative and must never reach the a11y tree.
assert.match(ac, /aria-hidden="true"[^>]*bg-gradient-to-t|bg-gradient-to-t[^>]*"/, 'legibility scrim present')

// --- Pluralisation is real logic, so it gets a real assertion ---
const one = html(<ArtistCard artist={{ ...artist, productCount: 1 }} />)
assert.match(one, /1 product</, '1 -> singular')
assert.ok(!/1 products/.test(one), 'never "1 products"')
const many = html(<ArtistCard artist={{ ...artist, productCount: 2 }} />)
assert.match(many, /2 products</, '2 -> plural')

// --- ArtistGrid: every seed artist renders, priority only on the leaders ---
const grid = html(<ArtistGrid artists={artists} priorityCount={2} />)
for (const a of artists) {
  assert.ok(grid.includes(`/artists/${a.slug}`), `grid renders ${a.slug}`)
}

// --- CategoryCard ---
const cat = categories[0]
const cc = html(<CategoryCard category={cat} />)
assert.ok(
  cc.includes(`href="/collections/${cat.slug}"`),
  'category links to its collection page (NOT /shop?category=, which the §27 parser drops)',
)
assert.match(cc, /alt=""/, 'category image is decorative, empty alt')
assert.match(cc, /aspect-\[3\/2\]/, 'landscape ratio per §22')

// === ComebackCard — the countdown, the part most likely to break ===
// Seed comebacks carry no artistName/action, so the card is fed the same
// derived shape a page would build.
const cb = comebacks[0]
const view = {
  artistName: getArtistById(cb.artistId)?.name ?? 'Unknown',
  title: cb.title,
  releaseDate: cb.releaseDate,
  coverImage: cb.coverImage,
  productSlug: cb.productSlug,
}
const cbHtml = html(<ComebackCard comeback={view} />)

// THE hydration guarantee: the server must emit the placeholder and must NOT
// emit any computed day count. If someone "optimises" the mounted gate away,
// a number appears here and this assertion fails loudly.
assert.match(cbHtml, /&#x2014;|—/, 'SSR renders the em-dash placeholder')
assert.ok(
  !/>\s*\d+\s*</.test(cbHtml.replace(/<svg[\s\S]*?<\/svg>/g, '')),
  'SSR must NOT render a computed day number (hydration mismatch guard)',
)
assert.match(cbHtml, /Release countdown loading/, 'placeholder has an sr-only label')
assert.match(cbHtml, /aria-live="polite"/, 'count is announced when it resolves')
assert.match(cbHtml, new RegExp(view.artistName), 'artist name shown')
assert.match(cbHtml, /Pre-order/, 'productSlug present -> PRE-ORDER action')

// NOTIFY branch: no productSlug means no link to anywhere.
const notify = html(
  <ComebackCard comeback={{ ...view, productSlug: undefined }} />,
)
assert.match(notify, /Notify me/, 'no productSlug -> NOTIFY')
assert.ok(!/href="\/products\//.test(notify), 'NOTIFY has no product link')

console.log(
  `cards.check OK: ${artists.length} artists, ${categories.length} categories, ${comebacks.length} comebacks`,
)

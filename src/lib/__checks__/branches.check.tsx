import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArtistHeader } from '@/components/artist/ArtistHeader'
import type { Artist } from '@/lib/artists'

const base: Artist = {
  id: 'art-x', name: 'Test Group', slug: 'test-group',
  description: 'A description.',
  // Relative src: next/image's remotePatterns allowlist is not loaded by tsx.
  coverImage: '/cover.jpg',
  productCount: 1, featured: false,
}

// singular vs plural vs zero — the branch seed data never reaches
const one = renderToStaticMarkup(<ArtistHeader artist={base} productCount={1} />)
assert.ok(/1(<!-- -->)?\s*(<!-- -->)?product(?!s)/.test(one.replace(/<!-- -->/g,'')), 'singular: "1 product"')
assert.ok(!one.replace(/<!-- -->/g,'').includes('1 products'), 'never "1 products"')

const zero = renderToStaticMarkup(<ArtistHeader artist={base} productCount={0} />)
assert.ok(zero.replace(/<!-- -->/g,'').includes('0 products'), 'zero: "0 products"')

const many = renderToStaticMarkup(<ArtistHeader artist={base} productCount={4} />)
assert.ok(many.replace(/<!-- -->/g,'').includes('4 products'), 'plural')

// exactly one h1, and it is the artist name
assert.equal((one.match(/<h1/g) ?? []).length, 1, 'exactly one h1')
assert.ok(one.includes('Test Group'), 'h1 carries the name')

// missing description must not render an empty <p>
const noDesc = renderToStaticMarkup(<ArtistHeader artist={{ ...base, description: '' }} productCount={2} />)
assert.ok(!noDesc.includes('text-white/80'), 'no empty description paragraph')

// cover image is decorative (alt="") since the h1 already names the artist
assert.ok(one.includes('alt=""'), 'banner image is decorative')

console.log('branches.check OK')

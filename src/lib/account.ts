/**
 * Mock account data. NO AUTH BACKEND EXISTS — this is a static fixture so the
 * account UI has something honest to render. Nothing here is a real user.
 *
 * Every date is a FIXED ISO string. Never computed from `Date`: the account
 * page is a client component and a clock read during render is a hydration
 * mismatch (HARD RULES).
 */

export const DEMO_ACCOUNT = {
  name: 'Nayomi Perera',
  email: 'nayomi@example.com',
  /** ISO. Rendered through a fixed formatter, never diffed against "now". */
  memberSince: '2024-03-18',
} as const

export type OrderStatus = 'Delivered' | 'Shipped' | 'Processing'

export interface MockOrderItem {
  /** Matches a real Product.slug so the thumbnail and name stay in sync. */
  productSlug: string
  quantity: number
}

export interface MockOrder {
  id: string
  /** Fixed ISO date — see the file note. */
  placedAt: string
  status: OrderStatus
  items: MockOrderItem[]
}

/**
 * ponytail: three hand-written orders, not a generator. They exist to show the
 * three status colours and an expandable row; a generator would be more code
 * and less realistic.
 */
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'KPM-10428',
    placedAt: '2026-08-14',
    status: 'Delivered',
    items: [
      { productSlug: 'bts-proof-standard-edition', quantity: 1 },
      { productSlug: 'bts-proof-photocard-set', quantity: 2 },
    ],
  },
  {
    id: 'KPM-10461',
    placedAt: '2026-09-02',
    status: 'Shipped',
    items: [{ productSlug: 'newjeans-get-up-bunny-beach-bag-ver', quantity: 1 }],
  },
  {
    id: 'KPM-10503',
    placedAt: '2026-09-19',
    status: 'Processing',
    items: [
      { productSlug: 'stray-kids-oddinary-scanning', quantity: 1 },
      { productSlug: 'le-sserafim-easy-vibe-ver', quantity: 1 },
    ],
  },
]

/** §17 token colours. Kept beside the statuses so the two can never drift. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  Delivered: 'bg-success/10 text-success ring-success/20',
  Shipped: 'bg-info/10 text-info ring-info/20',
  Processing: 'bg-warning/10 text-warning ring-warning/20',
}

/** Fixed-format date. Explicit UTC so the server and client agree. */
export function formatAccountDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Initials for the avatar. Derived from the name — no Math.random anywhere. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/* ── account tab ids ──
 * Lives here, not in AccountView: AccountView is a "use client" module, and a
 * Server Component may only import Components across that boundary — calling a
 * plain exported function from it throws at request time. The server shell and
 * the client view both import the parser from this neutral module.
 */

export type AccountTab = 'overview' | 'orders' | 'wishlist' | 'collection' | 'settings'

const TAB_IDS: AccountTab[] = ['overview', 'orders', 'wishlist', 'collection', 'settings']

export function isAccountTab(value: string): value is AccountTab {
  return (TAB_IDS as string[]).includes(value)
}

/** Shared with the server shell so a junk ?tab= never renders a blank panel. */
export function parseAccountTab(value: string | string[] | undefined): AccountTab {
  const raw = Array.isArray(value) ? value[0] : value
  return raw !== undefined && isAccountTab(raw) ? raw : 'overview'
}

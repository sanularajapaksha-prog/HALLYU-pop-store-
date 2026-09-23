'use client'

import { useCallback, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/Button'
import Divider from '@/components/ui/Divider'
import Input from '@/components/ui/Input'
import { Reveal } from '@/components/ui/Reveal'
import Skeleton from '@/components/ui/Skeleton'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useCollection } from '@/context/CollectionContext'
import { useWishlist } from '@/context/WishlistContext'
import {
  DEMO_ACCOUNT,
  formatAccountDate,
  initialsOf,
  MOCK_ORDERS,
  isAccountTab,
  ORDER_STATUS_TONE,
  type AccountTab,
  type MockOrder,
} from '@/lib/account'
import { getProductBySlug } from '@/lib/products'
import { writeJSON } from '@/lib/storage'
import { cn, formatLKR } from '@/lib/utils'
import type { Product } from '@/types/product'

/* ── craft rule 1: the double-bezel shell, reused by every panel and tile ── */

function Bezel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
      {/* concentric radius: 20 - 6 = 14 */}
      <div className={cn('rounded-lg bg-background', className)}>{children}</div>
    </div>
  )
}

/* ── craft rule 8: ultra-light icons, stroke 1.25, currentColor, aria-hidden ── */

function IconBox() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z" />
      <path d="m3 8.5 9 4.5 9-4.5M12 13v7" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" />
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'h-4 w-4 shrink-0 text-muted',
        'transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        open && 'rotate-180',
      )}
    >
      <path d="m3.5 6 4.5 5 4.5-5" />
    </svg>
  )
}

/* ── overview ── */

function StatTile({ label, value, hydrated }: { label: string; value: string; hydrated: boolean }) {
  return (
    <Bezel className="px-5 py-6">
      <dt className="text-micro uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-3 font-display text-heading-md tabular-nums text-foreground">
        {/* These counts come from localStorage. Skeleton until hydrated —
            otherwise the first paint states a confident wrong number. */}
        {hydrated ? value : <Skeleton className="h-7 w-16 rounded-sm" />}
      </dd>
    </Bezel>
  )
}

function ActivityRow({ slug, note }: { slug: string; note: string }) {
  const product = getProductBySlug(slug)
  if (!product) return null
  const image = product.images[0]

  return (
    <li>
      <Link
        href={`/product/${product.slug}`}
        className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {image && (
          <Image
            src={image.url}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm text-foreground">{product.name}</span>
          <span className="mt-1 block text-caption text-muted">{note}</span>
        </span>
        <span className="shrink-0 text-body-sm tabular-nums text-muted">
          {formatLKR(product.price)}
        </span>
      </Link>
    </li>
  )
}

/* ── orders ── */

interface OrderLine {
  product: Product
  quantity: number
}

function OrderRow({ order }: { order: MockOrder }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  // A fixture slug that no longer matches the catalogue is dropped rather than
  // rendered as a hole in the row.
  const lines: OrderLine[] = order.items.flatMap((item) => {
    const product = getProductBySlug(item.productSlug)
    return product ? [{ product, quantity: item.quantity }] : []
  })

  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  return (
    <Bezel>
      {/* Expandable, not a link: no order-detail route exists, and a link to a
          404 is worse than no link at all. */}
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-4 rounded-lg px-5 py-5 text-left transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.99] motion-reduce:active:scale-100"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-body-sm tabular-nums text-foreground">{order.id}</span>
              <span
                className={cn(
                  'rounded-pill px-2.5 py-0.5 text-micro uppercase tracking-[0.12em] ring-1',
                  ORDER_STATUS_TONE[order.status],
                )}
              >
                {order.status}
              </span>
            </span>
            <span className="mt-1.5 block text-caption text-muted">
              {formatAccountDate(order.placedAt)} &middot; {lines.length}{' '}
              {lines.length === 1 ? 'item' : 'items'}
            </span>
          </span>

          {/* Thumbnails are the closed-state preview of the contents. */}
          <span className="hidden shrink-0 items-center sm:flex">
            {lines.slice(0, 3).map((line, i) => {
              const image = line.product.images[0]
              if (!image) return null
              return (
                <Image
                  key={line.product.id}
                  src={image.url}
                  alt=""
                  width={40}
                  height={40}
                  className={cn(
                    'h-10 w-10 rounded-md object-cover ring-2 ring-background',
                    i > 0 && '-ml-3',
                  )}
                />
              )
            })}
          </span>

          <span className="shrink-0 text-body-sm tabular-nums text-foreground">
            {formatLKR(total)}
          </span>
          <IconChevron open={open} />
        </button>
      </h3>

      {open && (
        <div id={panelId} className="px-5 pb-5">
          <Divider className="mb-4" />
          <ul className="space-y-3">
            {lines.map((line) => (
              <li key={line.product.id} className="flex items-center gap-4">
                <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">
                  {line.product.name}
                </span>
                <span className="shrink-0 text-caption tabular-nums text-muted">
                  &times;{line.quantity}
                </span>
                <span className="shrink-0 text-body-sm tabular-nums text-muted">
                  {formatLKR(line.product.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bezel>
  )
}

/* ── settings ── */

interface SettingsForm {
  name: string
  email: string
  dropAlerts: boolean
  comebackAlerts: boolean
}

const SETTINGS_KEY = 'account-settings'

/**
 * Strict enough to catch what people actually mistype (missing @, missing dot,
 * a stray space) without pretending to implement RFC 5322.
 */
function emailError(value: string): string | undefined {
  const email = value.trim()
  if (email.length === 0) return 'Enter an email address.'
  // Domain is dot-separated labels with no empty label, so "a@b..co" and
  // "a@b." are rejected — both are real typos, not exotic addresses.
  if (!/^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
    return 'Enter a valid email address.'
  }
  return undefined
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 appearance-none rounded-sm border border-border bg-background transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] checked:border-accent checked:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <label htmlFor={id} className="text-body-sm text-foreground">
        {label}
      </label>
    </div>
  )
}

function SettingsPanel() {
  // ponytail: plain useState, not useStoredState. This is an edit-then-save
  // form, so it must NOT re-render from the store while the user is typing.
  // Defaults come from the demo constant; Save writes to localStorage.
  const [form, setForm] = useState<SettingsForm>({
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    dropAlerts: true,
    comebackAlerts: false,
  })
  const [error, setError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState('')

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const problem = emailError(form.email)
      setError(problem)
      if (problem) {
        setStatus('')
        return
      }
      writeJSON(SETTINGS_KEY, form)
      setStatus('Preferences saved to this browser.')
    },
    [form],
  )

  return (
    <Bezel className="px-5 py-6 sm:px-8 sm:py-8">
      <form onSubmit={onSubmit} noValidate className="max-w-md">
        <div className="space-y-5">
          <Input
            label="Display name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={error}
            onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
            autoComplete="email"
          />
        </div>

        <fieldset className="mt-8">
          <legend className="text-micro uppercase tracking-[0.2em] text-muted">
            Notifications
          </legend>
          <div className="mt-4 space-y-3">
            <Checkbox
              label="Email me about new drops"
              checked={form.dropAlerts}
              onChange={(next) => setForm((f) => ({ ...f, dropAlerts: next }))}
            />
            <Checkbox
              label="Email me about comeback announcements"
              checked={form.comebackAlerts}
              onChange={(next) => setForm((f) => ({ ...f, comebackAlerts: next }))}
            />
          </div>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button type="submit" withArrow>
            Save changes
          </Button>
          {/* min-h reserves the line so saving never shifts the layout. */}
          <p aria-live="polite" className="min-h-5 text-caption text-success">
            {status}
          </p>
        </div>

        <p className="mt-6 text-caption text-muted">
          Saved in this browser only. There is no account backend to sync to.
        </p>
      </form>
    </Bezel>
  )
}

/* ── the wishlist / collection tabs: a pointer, not a second copy of the UI ── */

function LinkPanel({
  count,
  hydrated,
  noun,
  blurb,
  href,
  cta,
}: {
  count: number
  hydrated: boolean
  noun: string
  blurb: string
  href: string
  cta: string
}) {
  if (!hydrated) return <Skeleton className="h-44 w-full rounded-xl" />

  if (count === 0) {
    return (
      <EmptyState
        className="py-12"
        icon={<IconHeart />}
        title={`No ${noun} yet`}
        description={blurb}
        action={{ label: 'Browse the shop', href: '/shop' }}
      />
    )
  }

  return (
    <Bezel className="px-5 py-8 sm:px-8">
      <p className="font-display text-heading-sm tabular-nums text-foreground">
        {count} {count === 1 ? noun.replace(/s$/, '') : noun}
      </p>
      <p className="mt-2 max-w-prose text-body-sm text-muted">{blurb}</p>
      <Button href={href} withArrow className="mt-6">
        {cta}
      </Button>
    </Bezel>
  )
}

/* ── the view ── */

export interface AccountViewProps {
  initialTab: AccountTab
}

export function AccountView({ initialTab }: AccountViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const wishlist = useWishlist()
  const collection = useCollection()

  // The URL is a WRITE-only mirror, matching ShopView. The server seeds the tab
  // from ?tab= once, so a refresh lands back on the same tab; after that this
  // state owns it and no round trip fights the user's next click.
  const [tab, setTab] = useState<AccountTab>(initialTab)

  const onTabChange = useCallback(
    (id: string) => {
      if (!isAccountTab(id)) return
      setTab(id)
      router.replace(id === 'overview' ? pathname : `${pathname}?tab=${id}`, { scroll: false })
    },
    [pathname, router],
  )

  const hydrated = wishlist.hydrated && collection.hydrated

  const collectionValue = useMemo(
    () => collection.slugs.reduce((sum, slug) => sum + (getProductBySlug(slug)?.price ?? 0), 0),
    [collection.slugs],
  )

  const tabs: TabItem[] = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'orders', label: 'Orders', count: MOCK_ORDERS.length },
      // Storage-backed counts are omitted until hydrated rather than shown as
      // 0 and snapped to the real value a frame later.
      { id: 'wishlist', label: 'Wishlist', ...(hydrated ? { count: wishlist.count } : {}) },
      { id: 'collection', label: 'Collection', ...(hydrated ? { count: collection.count } : {}) },
      { id: 'settings', label: 'Settings' },
    ],
    [hydrated, wishlist.count, collection.count],
  )

  // "Recent" means most recently added: the stores keep insertion order, and we
  // must not read the clock to sort by time.
  const activity = useMemo(
    () => [
      ...collection.slugs
        .slice(-3)
        .reverse()
        .map((slug) => ({ slug, note: 'Added to your collection' })),
      ...wishlist.slugs
        .slice(-3)
        .reverse()
        .map((slug) => ({ slug, note: 'Saved to your wishlist' })),
    ],
    [collection.slugs, wishlist.slugs],
  )

  return (
    <Container className="pb-20 md:pb-28">
      {/* mock profile header */}
      <Reveal>
        <Bezel className="flex flex-wrap items-center gap-5 px-5 py-6 sm:px-8 sm:py-8">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-pill bg-accent font-display text-heading-sm text-white"
          >
            {initialsOf(DEMO_ACCOUNT.name)}
          </span>
          <span className="min-w-0">
            <span className="block font-display text-heading-sm text-foreground">
              {DEMO_ACCOUNT.name}
            </span>
            <span className="mt-1 block truncate text-body-sm text-muted">
              {DEMO_ACCOUNT.email}
            </span>
            <span className="mt-1 block text-caption text-muted">
              Member since {formatAccountDate(DEMO_ACCOUNT.memberSince)}
            </span>
          </span>
        </Bezel>
      </Reveal>

      <Reveal delay={60} className="mt-10">
        <Tabs tabs={tabs} active={tab} onChange={onTabChange} aria-label="Account sections" />
      </Reveal>

      <div
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="mt-8 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {tab === 'overview' && (
          <>
            <h2 className="sr-only">Overview</h2>
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {/* Orders are static fixtures, so this tile is never pending. */}
              <StatTile label="Orders" value={String(MOCK_ORDERS.length)} hydrated />
              <StatTile label="Wishlist" value={String(wishlist.count)} hydrated={hydrated} />
              <StatTile label="Collection" value={String(collection.count)} hydrated={hydrated} />
              <StatTile
                label="Collection value"
                value={formatLKR(collectionValue)}
                hydrated={hydrated}
              />
            </dl>

            <h3 className="mt-12 font-display text-heading-sm text-foreground">Recent activity</h3>
            {!hydrated ? (
              <Skeleton className="mt-4 h-40 w-full rounded-xl" />
            ) : activity.length === 0 ? (
              <EmptyState
                className="py-12"
                icon={<IconBox />}
                title="Nothing saved yet"
                description="Products you wishlist or add to your collection show up here."
                action={{ label: 'Browse the shop', href: '/shop' }}
              />
            ) : (
              <Bezel className="mt-4 px-2 py-2">
                <ul>
                  {activity.map((entry) => (
                    <ActivityRow key={`${entry.note}-${entry.slug}`} {...entry} />
                  ))}
                </ul>
              </Bezel>
            )}
          </>
        )}

        {tab === 'orders' && (
          <>
            <h2 className="sr-only">Orders</h2>
            <div className="space-y-4">
              {MOCK_ORDERS.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
            <p className="mt-6 text-caption text-muted">
              Example orders. There is no order backend &mdash; these are fixtures, not purchases.
            </p>
          </>
        )}

        {tab === 'wishlist' && (
          <>
            <h2 className="sr-only">Wishlist</h2>
            <LinkPanel
              count={wishlist.count}
              hydrated={hydrated}
              noun="saved items"
              blurb="Products you are still thinking about. Tap the heart on any product to save it."
              href="/wishlist"
              cta="Go to wishlist"
            />
          </>
        )}

        {tab === 'collection' && (
          <>
            <h2 className="sr-only">Collection</h2>
            <LinkPanel
              count={collection.count}
              hydrated={hydrated}
              noun="owned items"
              blurb="Everything you already own or are tracking, kept separate from your wishlist."
              href="/collection"
              cta="Go to my collection"
            />
          </>
        )}

        {tab === 'settings' && (
          <>
            <h2 className="sr-only">Settings</h2>
            <SettingsPanel />
          </>
        )}
      </div>
    </Container>
  )
}

export default AccountView

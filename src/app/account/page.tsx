import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import { AccountView } from '@/components/account/AccountView'
import { parseAccountTab } from '@/lib/account'

export const metadata: Metadata = {
  title: 'My Account',
  description:
    'Your orders, wishlist, collection and preferences in one place. A demo account — this build has no authentication backend.',
}

function AccountSkeleton() {
  return (
    <Container className="pb-20 md:pb-28">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="mt-10 h-11 w-full rounded-sm" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </Container>
  )
}

/**
 * /account — §36's account area, §25's wishlist-vs-collection split.
 *
 * NO AUTH BACKEND EXISTS. This is a UI-complete mock: the profile is a constant,
 * the orders are fixtures, and the only real state is the wishlist/collection
 * the browser already stores. The page says so on the page itself rather than
 * implying a login happened.
 *
 * Server shell only: it reads ?tab= so a refresh (and the footer's deep links)
 * land on the right tab, then hands the value to the client view. <AccountView>
 * sits behind <Suspense> because it reads the router in a client subtree.
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const initialTab = parseAccountTab(sp.tab)

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Account', href: '/account' },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="ACCOUNT"
        title="My Account"
        description="Orders, saved products and preferences. Everything here lives in this browser."
      >
        {/* Honesty, not decoration: nothing on this page is authenticated. */}
        <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-caption text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-pill bg-warning" />
          Demo account &mdash; not connected to a backend
        </span>
      </PageHeader>

      <Suspense fallback={<AccountSkeleton />}>
        <AccountView initialTab={initialTab} />
      </Suspense>
    </>
  )
}

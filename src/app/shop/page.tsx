import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import Skeleton from '@/components/ui/Skeleton'
import { ShopView } from '@/components/shop/ShopView'
import { products } from '@/lib/products'
import { parseFiltersFromParams, parseSortFromParams } from '@/lib/filters'

export const metadata: Metadata = {
  title: 'Shop All',
  description: `Browse every album, photocard and piece of official merch in the catalogue — ${products.length} products from the artists you collect, filterable by artist, category, price and availability.`,
}

function ShopSkeleton() {
  return (
    <Container className="pb-20 md:pb-28">
      <div className="lg:flex lg:items-start lg:gap-10">
        <Skeleton className="hidden h-[32rem] w-64 shrink-0 rounded-xl lg:block" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-12 w-full rounded-xl lg:hidden" />
          <Skeleton className="mt-4 h-5 w-28 rounded-sm lg:mt-0" />
          <ProductGrid className="mt-6 md:mt-8">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
            ))}
          </ProductGrid>
        </div>
      </div>
    </Container>
  )
}

/**
 * /shop — the main catalogue (§15 grid, §27 filters, §37 mobile grid).
 *
 * Server shell only: it parses the URL once and hands the result to <ShopView>,
 * which owns filter/sort interaction. ShopView sits behind <Suspense> because
 * Next bails out of static rendering for any client subtree that reads the
 * request's search params without one.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const initialFilters = parseFiltersFromParams(sp)
  const initialSort = parseSortFromParams(sp)

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="CATALOGUE"
        title="Shop All"
        description={`Every album, photocard and piece of official merch we carry — ${products.length} products, filterable down to exactly what you are hunting.`}
      />

      <Suspense fallback={<ShopSkeleton />}>
        <ShopView
          products={products}
          initialFilters={initialFilters}
          initialSort={initialSort}
        />
      </Suspense>
    </>
  )
}

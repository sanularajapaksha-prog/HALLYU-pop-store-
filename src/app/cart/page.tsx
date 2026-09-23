import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { CartView } from '@/components/cart/CartView'
import { ProductSection } from '@/components/home/ProductSection'
import { trendingProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Your Bag',
  description:
    'Review the albums, photocards and merch in your bag, adjust quantities and head to checkout.',
}

/** /cart — server shell. All the state lives in <CartView>. */
export default function CartPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Bag' }]} />
      </Container>

      <PageHeader eyebrow="BAG" title="Your Bag" />

      <CartView />

      <ProductSection
        eyebrow="MORE TO COLLECT"
        title="You might also like"
        products={trendingProducts}
        tone="surface"
        prioritizeImages={false}
        action={{ label: 'View all', href: '/shop' }}
      />
    </>
  )
}

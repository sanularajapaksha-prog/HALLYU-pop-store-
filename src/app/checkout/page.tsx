import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { CheckoutView } from '@/components/checkout/CheckoutView'

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Confirm your contact details, shipping address and delivery method to place your order.',
  // Nothing here is worth a search result, and the page is empty without a cart.
  robots: { index: false, follow: false },
}

/** /checkout — server shell. The form and its validation live in <CheckoutView>. */
export default function CheckoutPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Bag', href: '/cart' },
            { label: 'Checkout' },
          ]}
        />
      </Container>

      <PageHeader
        title="Checkout"
        description="Almost there. Confirm where this is going and how fast you want it."
      />

      <CheckoutView />
    </>
  )
}

'use client'

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Reveal } from '@/components/ui/Reveal'
import Skeleton from '@/components/ui/Skeleton'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCart } from '@/context/CartContext'
import {
  DELIVERY_METHODS,
  isDeliveryMethodId,
  isEmail,
  isFilled,
  orderNumber,
  resolveCartLines,
  shippingFor,
  type DeliveryMethodId,
} from '@/lib/cart'
import { cn, formatLKR } from '@/lib/utils'

/** Every text field, in DOM order — the order the first-error focus walks. */
const FIELDS = [
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', section: 'contact' },
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', section: 'shipping' },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    autoComplete: 'street-address',
    section: 'shipping',
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    autoComplete: 'address-level2',
    section: 'shipping',
  },
  {
    name: 'postalCode',
    label: 'Postal code',
    type: 'text',
    autoComplete: 'postal-code',
    section: 'shipping',
  },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', section: 'shipping' },
] as const

type Field = (typeof FIELDS)[number]
type FieldName = Field['name']
export type CheckoutValues = Record<FieldName, string>
export type CheckoutErrors = Partial<Record<FieldName, string>>

const EMPTY_VALUES: CheckoutValues = {
  email: '',
  name: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
}

/**
 * Exported so the runnable check can exercise it without a DOM. Order of the
 * returned keys is irrelevant: the caller walks FIELDS to find the first
 * invalid one, so focus always lands in visual order.
 */
export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {}

  if (!isFilled(values.email)) errors.email = 'Email is required.'
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.'

  if (!isFilled(values.name)) errors.name = 'Name is required.'
  if (!isFilled(values.address)) errors.address = 'Address is required.'
  if (!isFilled(values.city)) errors.city = 'City is required.'
  if (!isFilled(values.postalCode)) errors.postalCode = 'Postal code is required.'
  if (!isFilled(values.phone)) errors.phone = 'Phone number is required.'

  return errors
}

/** First invalid field in DOM order, or undefined when the form is valid. */
export function firstInvalidField(errors: CheckoutErrors): FieldName | undefined {
  return FIELDS.find((field) => errors[field.name])?.name
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <rect x="5" y="10.5" width="14" height="9" rx="2" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-7 w-7"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Double-bezel wrapper for each form section (craft rule 1: 20 - 6 = 14). */
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
      <div className="rounded-lg bg-background p-6">
        <h2 className="text-heading-sm">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}

/**
 * /checkout body.
 *
 * NO PAYMENT BACKEND. Submit runs real client-side validation and then clears
 * the cart locally. Nothing is sent anywhere, no card details are collected and
 * no payment is processed. The "secure checkout" line describes the connection,
 * not a processor we integrate with — no trust badges, no card fields.
 */
export function CheckoutView() {
  const { items, clear, hydrated } = useCart()
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryMethodId>('standard')
  /*
   * The placed order is snapshotted BEFORE clear(), because the success screen
   * still names the order and its total after the cart has been emptied.
   */
  const [placed, setPlaced] = useState<{ number: string; total: number; email: string } | null>(
    null,
  )

  if (!hydrated) {
    return (
      <Container className="pb-20 md:pb-28">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-10 h-80 w-full rounded-xl lg:mt-0" />
        </div>
      </Container>
    )
  }

  if (placed) {
    return (
      <Container className="pb-20 md:pb-28">
        {/* Reveal fires immediately since this panel mounts already in view —
            same fade-up used sitewide for any content appearing on screen,
            here standing in for a form -> success cross-fade (craft rule 10:
            transform+opacity only, motion-reduce falls back to a plain swap). */}
        <Reveal className="mx-auto max-w-xl rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
          <div className="flex flex-col items-center rounded-lg bg-background px-6 py-14 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-pill bg-success/10 text-success"
              aria-hidden="true"
            >
              <CheckIcon />
            </div>

            {/* role=status announces the outcome without stealing focus. */}
            <h2 role="status" className="mt-6 font-display text-heading-lg">
              Order placed
            </h2>
            <p className="mt-3 text-body-sm text-muted">
              A confirmation is on its way to{' '}
              <span className="text-foreground">{placed.email}</span>.
            </p>

            <dl className="mt-8 w-full max-w-xs space-y-3 text-body-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Order number</dt>
                <dd className="font-medium tabular-nums">{placed.number}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Total</dt>
                <dd className="font-medium tabular-nums">{formatLKR(placed.total)}</dd>
              </div>
            </dl>

            <p className="mt-8 text-caption text-muted">
              Demo checkout — no payment was taken and no order was created.
            </p>

            <Button href="/shop" withArrow className="mt-6">
              KEEP SHOPPING
            </Button>
          </div>
        </Reveal>
      </Container>
    )
  }

  const lines = resolveCartLines(items)

  if (lines.length === 0) {
    return (
      <Container className="pb-20 md:pb-28">
        <EmptyState
          title="Nothing to check out"
          description="Your bag is empty, so there is nothing to pay for yet."
          action={{ label: 'SHOP ALL', href: '/shop' }}
        />
      </Container>
    )
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const count = lines.reduce((sum, line) => sum + line.item.quantity, 0)
  const surcharge = DELIVERY_METHODS.find((method) => method.id === delivery)?.surcharge ?? 0

  const setField = (name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Only CLEAR an existing error while typing — never introduce one
    // mid-keystroke, which would flag "j" as an invalid email address.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateCheckout(values)
    setErrors(nextErrors)

    const invalid = firstInvalidField(nextErrors)
    if (invalid) {
      // Focus the first invalid field — the a11y expectation on submit.
      formRef.current?.querySelector<HTMLInputElement>(`input[name="${invalid}"]`)?.focus()
      return
    }

    // No network call at all. Snapshot, then empty the local cart.
    setPlaced({
      number: orderNumber(items),
      total: subtotal + shippingFor(subtotal) + surcharge,
      email: values.email.trim(),
    })
    clear()
  }

  const errorCount = FIELDS.filter((field) => errors[field.name]).length

  const renderField = (field: Field) => (
    <Input
      name={field.name}
      type={field.type}
      label={field.label}
      autoComplete={field.autoComplete}
      value={values[field.name]}
      error={errors[field.name]}
      required
      onChange={(event) => setField(field.name, event.target.value)}
    />
  )

  return (
    <Container className="pb-20 md:pb-28">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
        <form ref={formRef} id={formId} noValidate onSubmit={handleSubmit} className="space-y-6">
          {/* A sighted user sees the inline errors; this gives a screen-reader
              user the count without hunting field by field. */}
          <p role="alert" aria-live="assertive" className="sr-only">
            {submitted && errorCount > 0
              ? `${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention.`
              : ''}
          </p>

          <FormSection title="Contact">
            <div className="space-y-4">
              {FIELDS.filter((field) => field.section === 'contact').map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.filter((field) => field.section === 'shipping').map((field) => (
                <div
                  key={field.name}
                  className={
                    field.name === 'name' || field.name === 'address'
                      ? 'sm:col-span-2'
                      : undefined
                  }
                >
                  {renderField(field)}
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Delivery method">
            {/* Real radios with appearance-none + checked styling, never a div
                pretending to be a radiogroup. Arrow-key navigation is free. */}
            <fieldset>
              <legend className="sr-only">Delivery method</legend>
              <div className="space-y-3">
                {DELIVERY_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-4 rounded-lg border p-4',
                      'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
                      delivery === method.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:bg-surface',
                    )}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={method.id}
                      checked={delivery === method.id}
                      onChange={(event) => {
                        const next = event.target.value
                        if (isDeliveryMethodId(next)) setDelivery(next)
                      }}
                      className="h-4 w-4 shrink-0 appearance-none rounded-pill border border-foreground/30 checked:border-[5px] checked:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                    <span className="flex-1">
                      <span className="block text-body-sm font-medium">{method.label}</span>
                      <span className="block text-caption text-muted">{method.detail}</span>
                    </span>
                    <span className="text-body-sm tabular-nums">
                      {method.surcharge === 0 ? 'Included' : `+${formatLKR(method.surcharge)}`}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </FormSection>
        </form>

        <div className="mt-10 lg:mt-0">
          <CartSummary
            subtotal={subtotal}
            count={count}
            surcharge={surcharge}
            showCheckout={false}
          >
            {/* Outside the <form> element, joined back to it by `form={formId}`
                so the summary can stay in the right-hand column. */}
            <Button type="submit" form={formId} withArrow className="mt-6 w-full">
              PLACE ORDER
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-caption text-muted">
              <LockIcon />
              Secure checkout over an encrypted connection
            </p>
            <p className="mt-2 text-center text-caption text-muted/80">
              Demo only — no card details are collected and no payment is processed.
            </p>
          </CartSummary>
        </div>
      </div>
    </Container>
  )
}

export default CheckoutView

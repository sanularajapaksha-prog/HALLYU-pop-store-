import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Shipping zones, timelines and the free-shipping threshold for orders across Sri Lanka.",
};

// Matches CartSummary's mock shipping rule (flat LKR 500, waived over LKR 15,000)
// so the numbers agree everywhere they're quoted on the site.
const FREE_SHIPPING_THRESHOLD_LKR = 15_000;
const FLAT_RATE_LKR = 500;

const ZONES = [
  {
    zone: "Colombo & suburbs",
    timeline: "1–2 business days",
  },
  {
    zone: "Rest of Western, Central & Southern provinces",
    timeline: "2–4 business days",
  },
  {
    zone: "Northern & Eastern provinces",
    timeline: "3–6 business days",
  },
  {
    zone: "Pre-order items",
    timeline: "Ships within 3 business days of the release date shown on the product page",
  },
];

export default function ShippingPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shipping", href: "/shipping" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="HELP"
        title="Shipping"
        description={`Flat rate of LKR ${FLAT_RATE_LKR.toLocaleString()} island-wide, free automatically once your cart passes LKR ${FREE_SHIPPING_THRESHOLD_LKR.toLocaleString()}.`}
      />

      <Container className="pb-20 md:pb-28">
        <Reveal>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/5">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface text-caption uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Zone</th>
                  <th className="px-5 py-3 font-medium">Estimated delivery</th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((row, i) => (
                  <tr key={row.zone} className={i > 0 ? "border-t border-border" : undefined}>
                    <td className="px-5 py-4 text-foreground">{row.zone}</td>
                    <td className="px-5 py-4 text-muted">{row.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-14 max-w-2xl">
          <h2 className="font-display text-heading-md text-foreground">How shipping cost works</h2>
          <Divider className="mt-4" />
          <ul className="mt-6 space-y-4 text-body text-muted">
            <li>
              Every order ships at a flat LKR {FLAT_RATE_LKR.toLocaleString()}, shown at checkout
              before payment.
            </li>
            <li>
              Spend LKR {FREE_SHIPPING_THRESHOLD_LKR.toLocaleString()} or more and shipping is
              waived automatically — no code needed. Your cart page shows how much more you need
              to add to qualify.
            </li>
            <li>
              Orders that mix an in-stock item with a pre-order ship together once the pre-order
              releases, unless you split them into separate orders at checkout.
            </li>
            <li>
              Timelines above are business days after your order is packed, not calendar days, and
              exclude public holidays.
            </li>
          </ul>
        </Reveal>

        <Reveal delay={200} className="mt-10 max-w-2xl">
          <p className="text-body-sm text-muted">
            Delayed order or wrong address on file? <a href="/contact" className="text-foreground underline underline-offset-2">Contact us</a> with your
            order number and we&rsquo;ll look into it.
          </p>
        </Reveal>
      </Container>
    </>
  );
}

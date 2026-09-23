import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";

export const metadata: Metadata = {
  title: "Returns",
  description: "Our returns window, condition requirements and how to start a return.",
};

const STEPS = [
  {
    title: "Request a return",
    body: "Contact us within 7 days of delivery with your order number and the reason for the return.",
  },
  {
    title: "Get a return authorization",
    body: "We reply within 2 business days with a return authorization number and the return address.",
  },
  {
    title: "Pack it up",
    body: "Seal albums must be unopened. Photocards must be in their original sleeve, unhandled. Include the authorization number on the package.",
  },
  {
    title: "Ship it back",
    body: "Return postage is covered by you unless the item arrived damaged or incorrect, in which case we refund it.",
  },
  {
    title: "Refund issued",
    body: "Once we receive and inspect the item, your refund is issued to the original payment method within 5 business days.",
  },
];

export default function ReturnsPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Returns", href: "/returns" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="HELP"
        title="Returns"
        description="A 7-day return window from delivery, provided the item is unopened and in its original condition."
      />

      <Container className="pb-20 md:pb-28">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-heading-md text-foreground">What can be returned</h2>
          <Divider className="mt-4" />
          <ul className="mt-6 space-y-3 text-body text-muted">
            <li>Sealed albums, unopened, within 7 days of delivery.</li>
            <li>Lightsticks and apparel, unused and with tags/packaging intact, within 7 days.</li>
            <li>
              Photocards and other loose collectibles are final sale once the outer packaging is
              opened — condition can&rsquo;t be verified after that point.
            </li>
            <li>Pre-order and made-to-order items are final sale, except if they arrive damaged or incorrect.</li>
          </ul>
        </Reveal>

        <Reveal delay={100} className="mt-14 max-w-2xl">
          <h2 className="font-display text-heading-md text-foreground">How it works</h2>
          <Divider className="mt-4" />
          <ol className="mt-6 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface text-body-sm font-medium tabular-nums text-foreground ring-1 ring-foreground/5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-body font-medium text-foreground">{step.title}</p>
                  <p className="mt-1 text-body-sm text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={200} className="mt-10 max-w-2xl">
          <p className="text-body-sm text-muted">
            Need to start a return? <a href="/contact" className="text-foreground underline underline-offset-2">Contact us</a> with your
            order number.
          </p>
        </Reveal>
      </Container>
    </>
  );
}

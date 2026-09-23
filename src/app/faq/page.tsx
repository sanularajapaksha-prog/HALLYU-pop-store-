import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about orders, shipping, pre-orders and photocards.",
};

const FAQS = [
  {
    q: "Are the albums and photocards authentic?",
    a: "Yes. Everything we sell is sourced from official distributors and label-authorized sellers — no bootlegs or unofficial reprints.",
  },
  {
    q: "How long does shipping take?",
    a: "1–2 business days within Colombo, 2–6 business days elsewhere in Sri Lanka depending on zone. See the Shipping page for the full breakdown by region.",
  },
  {
    q: "Is shipping free?",
    a: "Shipping is a flat LKR 500 and is waived automatically once your cart total passes LKR 15,000 — no code required.",
  },
  {
    q: "What happens with pre-orders?",
    a: "Pre-order items are charged at checkout and ship within 3 business days of the release date shown on the product page. Mixed carts with pre-order items ship together once the pre-order releases, unless split at checkout.",
  },
  {
    q: "Can I return a photocard if I don't like the pull?",
    a: "No — loose collectibles like photocards are final sale once the outer packaging is opened, since condition can't be verified afterward. Sealed albums can be returned unopened within 7 days.",
  },
  {
    q: "How do I track my order?",
    a: "Order status and tracking live under My Account → Orders once your order ships. You'll also get a shipping confirmation.",
  },
  {
    q: "Do you ship outside Sri Lanka?",
    a: "Not yet — this build currently ships island-wide only. International shipping is on the roadmap.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Cards and mobile wallets supported by our checkout provider. You'll see the full list of options at checkout.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "FAQ", href: "/faq" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="HELP"
        title="Frequently asked questions"
        description="Everything we get asked most, in one place. Still stuck? Contact us."
      />

      <Container className="pb-20 md:pb-28">
        <div className="mx-auto max-w-2xl space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i, 7) * 60}>
              {/* Craft rule 1 double-bezel, adapted for <details>: the summary
                  marker is a rotating chevron rather than the native triangle. */}
              <details className="group rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg bg-background px-5 py-4 text-body font-medium text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  {item.q}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-open:rotate-180 motion-reduce:transition-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                  >
                    <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 pt-2 text-body-sm text-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}

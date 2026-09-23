// Template boilerplate, not legal advice — replace with counsel-reviewed copy before real launch.
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses and protects your information.`,
};

const SECTIONS = [
  {
    heading: "Information we collect",
    body: "We collect information you give us directly — name, email, shipping address and order details — plus basic usage data like pages visited and items viewed, used to run the store and improve it. Wishlist and recently-viewed data is stored only in your browser and is never sent to us.",
  },
  {
    heading: "How we use your information",
    body: "To process and ship orders, respond to support requests, send order updates, and, if you opt in, send newsletter emails about new drops. We do not sell your personal information to third parties.",
  },
  {
    heading: "Cookies and local storage",
    body: "We use your browser's local storage to remember your cart, wishlist and collection between visits. This data stays on your device and is not transmitted to our servers unless you complete a purchase.",
  },
  {
    heading: "Payment information",
    body: "Payments are processed by a third-party payment provider at checkout. We do not store your full card details on our servers.",
  },
  {
    heading: "Data retention",
    body: "We retain order records for as long as needed for accounting, legal and customer-support purposes, and delete account data on request where we're not required to keep it.",
  },
  {
    heading: "Your rights",
    body: "You can request a copy of the personal data we hold about you, or ask us to correct or delete it, by contacting us.",
  },
  {
    heading: "Changes to this policy",
    body: "We may update this policy from time to time. Material changes will be reflected on this page with an updated effective date.",
  },
  {
    heading: "Contact",
    body: "Questions about this policy? Reach us through the Contact page.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy", href: "/privacy" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="LEGAL"
        title="Privacy Policy"
        description="Effective date: template — replace with your real launch date."
      />

      <Container className="pb-20 md:pb-28">
        <div className="mx-auto max-w-2xl space-y-10">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.heading} delay={Math.min(i, 7) * 60}>
              <h2 className="font-display text-heading-sm text-foreground">{section.heading}</h2>
              <p className="mt-3 text-body text-muted">{section.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}

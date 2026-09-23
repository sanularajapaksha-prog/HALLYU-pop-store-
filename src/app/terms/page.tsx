// Template boilerplate, not legal advice — replace with counsel-reviewed copy before real launch.
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern using ${SITE_NAME}.`,
};

const SECTIONS = [
  {
    heading: "Acceptance of terms",
    body: `By using ${SITE_NAME}, you agree to these terms. If you don't agree, please don't use the site.`,
  },
  {
    heading: "Orders and pricing",
    body: "All prices are shown in LKR and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders placed at an incorrect price, with a full refund.",
  },
  {
    heading: "Product authenticity",
    body: "All albums, photocards and merchandise sold are sourced from official distributors and label-authorized sellers.",
  },
  {
    heading: "Pre-orders",
    body: "Pre-order items are charged at the time of order and ship on or shortly after the release date shown on the product page. Release dates are estimates provided by the label and may shift.",
  },
  {
    heading: "Shipping and returns",
    body: "Shipping timelines and the returns policy are described on the Shipping and Returns pages, which form part of these terms.",
  },
  {
    heading: "Account use",
    body: "You're responsible for keeping your account details accurate and for activity that happens under your account.",
  },
  {
    heading: "Limitation of liability",
    body: `${SITE_NAME} is provided "as is". We aren't liable for indirect or incidental damages arising from your use of the site, to the extent permitted by law.`,
  },
  {
    heading: "Changes to these terms",
    body: "We may update these terms from time to time. Continued use of the site after a change means you accept the updated terms.",
  },
  {
    heading: "Contact",
    body: "Questions about these terms? Reach us through the Contact page.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms of Service", href: "/terms" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="LEGAL"
        title="Terms of Service"
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

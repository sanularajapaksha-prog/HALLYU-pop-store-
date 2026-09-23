import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about an order, a product question, or anything else.",
};

export default function ContactPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="HELP"
        title="Contact us"
        description="Order questions, product questions, anything else — send it over and we'll get back to you within 2 business days."
      />

      <Container className="pb-20 md:pb-28">
        <Reveal className="mx-auto max-w-xl">
          <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
            <div className="rounded-lg bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] md:p-8">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}

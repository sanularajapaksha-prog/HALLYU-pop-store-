import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductSection } from "@/components/home/ProductSection";
import { Button } from "@/components/ui/Button";
import { trendingProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page has sold out of existence. Browse trending K-pop albums, photocards and official merch instead.",
};

/**
 * Server Component. A 404 is a discovery surface, not a dead end — the header
 * apologises in one line and the trending rail underneath gives the visitor
 * somewhere to go without a second click.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        align="center"
        eyebrow="404"
        title="Page not found"
        description="This one sold out of existence. The link may be old, or the drop may have moved — everything still in stock is a click away."
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href="/" withArrow>
            BACK TO HOME
          </Button>
          <Button href="/shop" variant="secondary">
            SHOP ALL
          </Button>
        </div>
      </PageHeader>

      {/* ProductSection renders null on an empty array, so a trimmed catalogue
          degrades to just the header rather than an empty titled band. */}
      <ProductSection
        eyebrow="Still in stock"
        title="TRENDING NOW"
        action={{ label: "Shop all", href: "/shop" }}
        products={trendingProducts}
        tone="surface"
        prioritizeImages={false}
      />
    </>
  );
}

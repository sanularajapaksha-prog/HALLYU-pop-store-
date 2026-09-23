import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryCard } from "@/components/collection/CategoryCard";
import { ProductSection } from "@/components/home/ProductSection";
import { Reveal } from "@/components/ui/Reveal";
import { categories } from "@/lib/categories";
import { featuredProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse the marketplace by collection — albums, photocards, lightsticks, apparel, accessories and official merch, all sourced and graded before they ship.",
};

/** §22 — the six collections, 2-up on mobile and 3-up from md. */
export default function CollectionsPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="BROWSE"
        title="Collections"
        description="Six ways into the catalogue. Start from the kind of thing you collect, then narrow by artist, price and availability."
      />

      <Container>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {categories.map((category, index) => (
            // Craft rule 5: 60ms stagger. Six tiles, so no cap is needed —
            // the last one waits 300ms, still inside one wave.
            <Reveal key={category.id} delay={index * 60}>
              <CategoryCard category={category} priority={index < 3} />
            </Reveal>
          ))}
        </div>
      </Container>

      <ProductSection
        eyebrow="PICKED"
        title="FEATURED"
        products={featuredProducts}
        action={{ label: "SHOP ALL", href: "/shop" }}
        prioritizeImages={false}
      />
    </>
  );
}

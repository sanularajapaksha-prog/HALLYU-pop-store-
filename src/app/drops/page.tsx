import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ComebackCard, type ComebackCardComeback } from "@/components/home/ComebackCard";
import { ProductSection } from "@/components/home/ProductSection";
import { Reveal } from "@/components/ui/Reveal";
import { getArtistById } from "@/lib/artists";
import { comebacks } from "@/lib/comebacks";
import { newDropProducts, products } from "@/lib/products";

export const metadata: Metadata = {
  title: "New Drops",
  description:
    "Upcoming comebacks, open pre-orders, new arrivals and limited editions — everything landing next, in one place.",
};

const STAGGER_MS = 60;
/** Card 8 onwards all share a 420ms delay; past that the wave lags the scroll. */
const MAX_STAGGER_STEPS = 7;

const preorderProducts = products.filter((product) => product.isPreorder);
const limitedProducts = products.filter((product) => product.isLimited);

/**
 * /drops — §20 (new drop) + §21 (Comeback Radar, given the full page it earns).
 *
 * ponytail: the radar grid is written here rather than reusing
 * <ComebackRadar />. That component is the HOMEPAGE band — a one-screen
 * snap-scroller capped at a 3-col grid. This page wants the opposite: every
 * comeback, stacked into a real md:2 / xl:3 grid. Parameterising the homepage
 * band to do both would put two layouts behind one flag for two callers.
 *
 * Countdown logic is NOT duplicated: <ComebackCard> already owns it and is
 * already hydration-safe, so this page never touches Date.
 */
export default function DropsPage() {
  const radar: ComebackCardComeback[] = comebacks.map((comeback) => ({
    artistName: getArtistById(comeback.artistId)?.name ?? "Unknown artist",
    title: comeback.title,
    releaseDate: comeback.releaseDate,
    coverImage: comeback.coverImage,
    productSlug: comeback.productSlug,
    // `action` omitted on purpose — ComebackCard derives PRE-ORDER vs NOTIFY
    // from productSlug, so a release with no product never offers a dead link.
  }));

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "New Drops", href: "/drops" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="New"
        title="Drops"
        description="Pre-orders, new releases and limited runs. Everything that has just landed — and everything about to."
      />

      {/* SECTION 1 — the headline act. */}
      <Section
        id="comeback-radar"
        tone="surface"
        eyebrow="Upcoming"
        title="Comeback Radar"
      >
        {/*
          Section has no `subtitle` prop and adding one would mean editing a
          shared primitive for two callers, so the subtitle rides at the top of
          the children and is pulled up under the heading. Same trick as the
          homepage band, deliberately.
        */}
        <Reveal className="-mt-6 mb-10 md:-mt-10 md:mb-14">
          <p className="max-w-prose text-body text-muted">Upcoming releases.</p>
        </Reveal>

        {radar.length === 0 ? (
          <EmptyState
            title="Nothing on the radar"
            description="No comebacks announced yet. New releases show up here the moment they are dated."
            action={{ label: "Shop all", href: "/shop" }}
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {radar.map((comeback, index) => (
              <li key={comebacks[index].id} className="h-full">
                <Reveal
                  delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                  className="h-full"
                >
                  {/* h-full so uneven titles still give a flush row. */}
                  <ComebackCard comeback={comeback} className="h-full" />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* SECTION 2 — pre-orders. ProductSection returns null on an empty array,
          so the empty case gets its own header + EmptyState instead. */}
      {preorderProducts.length > 0 ? (
        <ProductSection
          id="pre-order"
          eyebrow="Pre-order"
          title="Pre-order now"
          products={preorderProducts}
          prioritizeImages={false}
        />
      ) : (
        <Section id="pre-order" eyebrow="Pre-order" title="Pre-order now">
          <EmptyState
            title="No open pre-orders"
            description="Nothing is taking pre-orders right now. The Comeback Radar above shows what opens next."
            action={{ label: "Shop all", href: "/shop" }}
          />
        </Section>
      )}

      {/* SECTION 3 — new arrivals. Curated list; if it is ever empty the
          section simply does not render, which is the honest result. */}
      <ProductSection
        id="new-arrivals"
        eyebrow="Just in"
        title="New arrivals"
        products={newDropProducts}
        tone="surface"
        prioritizeImages={false}
        action={{ label: "Shop all", href: "/shop" }}
      />

      {/* SECTION 4 — limited editions. */}
      {limitedProducts.length > 0 ? (
        <ProductSection
          id="limited"
          eyebrow="Limited"
          title="Limited editions"
          products={limitedProducts}
          prioritizeImages={false}
        />
      ) : (
        <Section id="limited" eyebrow="Limited" title="Limited editions">
          <EmptyState
            title="No limited runs live"
            description="Limited editions sell out fast. When the next one opens it lands here first."
            action={{ label: "Shop all", href: "/shop" }}
          />
        </Section>
      )}
    </>
  );
}

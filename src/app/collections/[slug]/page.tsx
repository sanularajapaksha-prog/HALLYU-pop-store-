import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getArtistById } from "@/lib/artists";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";

/** Craft rule 5 — cap the stagger so a long grid's tail never lags the scroll. */
const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;
/** One desktop row; past that the cards are below the fold. */
const PRIORITY_CARDS = 4;

export function generateStaticParams(): Array<{ slug: string }> {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Collection not found" };

  const count = getProductsByCategory(category.id).length;
  return {
    title: category.name,
    description: `${category.description} ${count} ${count === 1 ? "product" : "products"} in stock and pre-order.`,
  };
}

/** Craft rule 8: ultra-light icon, stroke 1.25, currentColor, aria-hidden. */
function BoxIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" />
      <path d="M3 8.5 12 13l9-4.5M12 13v7" />
    </svg>
  );
}

/**
 * /collections/[slug] — §22.
 *
 * ponytail: deliberately a pure Server Component with NO sort or filter
 * control. Either would force the whole grid into a client subtree behind
 * Suspense to duplicate what /shop already does properly; instead the header
 * links to /shop?categories=<id>, which is the same catalogue with the real
 * §27 filter rig attached.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(category.id);
  // Photocards get their own §23 drill-down; send collectors there instead.
  const filterHref =
    category.slug === "photocards" ? "/photocards" : `/shop?categories=${category.id}`;
  const filterLabel = category.slug === "photocards" ? "OPEN PHOTOCARD FINDER" : "FILTER & SORT";

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: category.name },
          ]}
        />
      </Container>

      <Container className="pt-8">
        {/* Craft rule 1: DOUBLE-BEZEL. Outer 20px radius, p-1.5 (6px) → inner 14px. */}
        <Reveal>
          <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg md:aspect-[21/7]">
              <Image
                src={category.image}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover opacity-70 saturate-50"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/35 to-foreground/10"
              />
            </div>
          </div>
        </Reveal>
      </Container>

      <PageHeader
        eyebrow="COLLECTION"
        title={category.name}
        description={category.description}
      >
        <Button href={filterHref} variant="secondary" withArrow>
          {filterLabel}
        </Button>
      </PageHeader>

      <Container className="pb-20 md:pb-28">
        {categoryProducts.length === 0 ? (
          <EmptyState
            icon={<BoxIcon />}
            title={`No ${category.name.toLowerCase()} right now`}
            description="This collection is between drops. Browse the full catalogue while we restock it."
            action={{ label: "SHOP ALL", href: "/shop" }}
          />
        ) : (
          <>
            <p className="text-body-sm text-muted tabular-nums">
              {categoryProducts.length}{" "}
              {categoryProducts.length === 1 ? "product" : "products"}
            </p>

            <ProductGrid className="mt-6 md:mt-8">
              {categoryProducts.map((product, index) => {
                // getArtistById can miss on malformed seed data — never render
                // the string "undefined" into a card.
                const artist = getArtistById(product.artistId);
                return (
                  <Reveal
                    key={product.id}
                    delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                  >
                    <ProductCard
                      product={product}
                      artistName={artist?.name ?? "Unknown artist"}
                      priority={index < PRIORITY_CARDS}
                    />
                  </Reveal>
                );
              })}
            </ProductGrid>
          </>
        )}
      </Container>
    </>
  );
}

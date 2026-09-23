import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import Skeleton from "@/components/ui/Skeleton";
import { PhotocardView } from "@/components/photocards/PhotocardView";
import { artists } from "@/lib/artists";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { parseSelectionFromParams } from "@/lib/photocards";

const photocardCategory = getCategoryBySlug("photocards");
const photocards = photocardCategory ? getProductsByCategory(photocardCategory.id) : [];

export const metadata: Metadata = {
  title: "Photocards",
  description:
    "Hunt the card you are missing. Drill down by artist, album, type and member across every official pull, POB exclusive and full member set in the marketplace.",
};

function PhotocardSkeleton() {
  return (
    <Container className="pb-20 md:pb-28">
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="mt-8 h-5 w-32 rounded-sm" />
      <ProductGrid className="mt-6 md:mt-8">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </ProductGrid>
    </Container>
  );
}

/**
 * /photocards — §23. The spec calls this out as one of the marketplace's
 * strongest differentiators, so it gets a guided Artist -> Album -> Type ->
 * Member ladder rather than the flat §27 filter wall that /shop uses.
 *
 * Server shell only: it parses the URL once and resolves artist names, then
 * hands both to <PhotocardView>. The view sits behind <Suspense> because Next
 * bails out of static rendering for a client subtree reading search params
 * without one.
 */
export default async function PhotocardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialSelection = parseSelectionFromParams(await searchParams);

  // Resolved here so the client leaf never imports the artist catalogue.
  const artistNames = Object.fromEntries(artists.map((a) => [a.id, a.name]));

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: "Photocards" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="COLLECT"
        title="Photocards"
        description="Complete your collection one pull at a time. Start with an artist, then work down through album, type and member until you are looking at exactly the card you are missing."
      />

      <Suspense fallback={<PhotocardSkeleton />}>
        <PhotocardView
          photocards={photocards}
          artistNames={artistNames}
          initialSelection={initialSelection}
        />
      </Suspense>
    </>
  );
}

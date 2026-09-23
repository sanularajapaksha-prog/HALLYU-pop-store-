import { Container } from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Product detail skeleton — gallery on the left, info column on the right,
 * stacking to one column below lg exactly as the real page does.
 *
 * Sits beside the real page at app/product/[slug]/page.tsx.
 *
 * ⚠ KNOWN REPO CONFLICT (not introduced here, flagged for whoever owns links):
 * the page route is SINGULAR `/product/[slug]`, but ProductCard, SearchBar and
 * ComebackCard all link to PLURAL `/products/<slug>`, which has no page and
 * 404s. One side has to move; this skeleton follows the page.
 */
export default function Loading() {
  return (
    <Container className="py-8 md:py-12" aria-busy="true" aria-label="Loading product">
      {/* Breadcrumbs */}
      <Skeleton className="h-4 w-64 rounded-sm" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery: main frame + thumbnail strip. */}
        <div>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info column. */}
        <div className="lg:pt-4">
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className="mt-4 h-9 w-full rounded-md md:h-11" />
          <Skeleton className="mt-3 h-9 w-2/3 rounded-md md:h-11" />

          <Skeleton className="mt-6 h-7 w-36 rounded-md" />
          <Skeleton className="mt-4 h-5 w-24 rounded-pill" />

          {/* Variant row. */}
          <Skeleton className="mt-10 h-4 w-20 rounded-sm" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-28 rounded-pill" />
            ))}
          </div>

          {/* Quantity + add to cart. */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Skeleton className="h-12 w-32 rounded-pill" />
            <Skeleton className="h-12 w-48 rounded-pill" />
            <Skeleton className="h-12 w-12 rounded-pill" />
          </div>

          {/* Description. */}
          <div className="mt-12 flex flex-col gap-3">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-4/5 rounded-sm" />
          </div>
        </div>
      </div>
    </Container>
  );
}

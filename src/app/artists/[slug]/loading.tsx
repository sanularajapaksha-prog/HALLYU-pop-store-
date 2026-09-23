import { Container } from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Artist page skeleton. Proportions copy the real page so the swap-in is a fill,
 * not a jump: the banner uses ArtistHeader's exact aspect ratios and bezel, and
 * the bands below use Section's py-20 md:py-28 rhythm and ProductGrid's columns.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading artist">
      {/* Breadcrumb row — Container pt-6, same as the page. */}
      <Container className="pt-6">
        <Skeleton className="h-4 w-56 rounded-sm" />
      </Container>

      {/* Banner — ArtistHeader's double-bezel and aspect ratios. */}
      <Container className="pt-2">
        <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg md:aspect-[21/9]">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </Container>

      {/* Two product bands — that is what most artists resolve to. */}
      {[0, 1].map((band) => (
        <Container key={band} className="py-20 md:py-28">
          <Skeleton className="h-6 w-24 rounded-pill" />
          <div className="mt-4 mb-10 flex items-end justify-between gap-4 md:mb-14">
            <Skeleton className="h-9 w-56 rounded-md md:h-11" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index}>
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="mt-3 h-3 w-1/3 rounded-sm" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-sm" />
                <Skeleton className="mt-2 h-4 w-1/4 rounded-sm" />
              </div>
            ))}
          </div>
        </Container>
      ))}
    </div>
  );
}

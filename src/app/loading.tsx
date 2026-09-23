import { Container } from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Root loading skeleton. Proportions are copied from the real homepage so the
 * swap-in is a fill, not a jump: the hero is full-bleed at the same min-heights
 * as Hero.tsx, and the grid below matches ProductGrid's column counts and gaps.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* Hero — full-bleed, min-h-[620px] md:min-h-[720px] exactly as Hero.tsx. */}
      <div className="relative flex min-h-[620px] items-end overflow-hidden bg-surface md:min-h-[720px]">
        <Container className="pb-20 pt-32 md:pb-24 md:pt-40">
          <div className="max-w-2xl">
            <Skeleton className="h-6 w-28 rounded-pill" />
            <Skeleton className="mt-6 h-14 w-full rounded-lg md:h-20" />
            <Skeleton className="mt-3 h-14 w-4/5 rounded-lg md:h-20" />
            <Skeleton className="mt-6 h-5 w-3/5 rounded-md" />
            <div className="mt-10 flex gap-3">
              <Skeleton className="h-12 w-40 rounded-pill" />
              <Skeleton className="h-12 w-32 rounded-pill" />
            </div>
          </div>
        </Container>
      </div>

      {/* First product band — Section's py-20 md:py-28 rhythm. */}
      <Container className="py-20 md:py-28">
        <Skeleton className="h-6 w-24 rounded-pill" />
        <div className="mt-4 mb-10 flex items-end justify-between gap-4 md:mb-14">
          <Skeleton className="h-9 w-64 rounded-md md:h-11" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
          {/* 10 = two full rows at the xl column count. */}
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="mt-3 h-3 w-1/3 rounded-sm" />
              <Skeleton className="mt-2 h-4 w-4/5 rounded-sm" />
              <Skeleton className="mt-2 h-4 w-1/4 rounded-sm" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

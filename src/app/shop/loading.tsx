import { Container } from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

/**
 * /shop skeleton — mirrors the shop layout: PageHeader, a toolbar row, then a
 * `hidden lg:block` filter sidebar beside the product grid. The sidebar is
 * hidden below lg for the same reason the real one is, so the mobile skeleton
 * is a grid only and nothing reflows at the breakpoint.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      {/* PageHeader rhythm: py-12 md:py-16. */}
      <Container className="py-12 md:py-16">
        <Skeleton className="h-6 w-24 rounded-pill" />
        <Skeleton className="mt-4 h-10 w-72 rounded-md md:h-12" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl rounded-md" />
      </Container>

      <Container className="pb-24">
        <div className="flex gap-10">
          <aside className="hidden w-64 shrink-0 lg:block">
            {/* Four filter groups: Artist, Category, Price, Availability. */}
            {Array.from({ length: 4 }, (_, group) => (
              <div key={group} className="mb-10">
                <Skeleton className="h-4 w-24 rounded-sm" />
                <div className="mt-4 flex flex-col gap-3">
                  {Array.from({ length: 4 }, (_, row) => (
                    <Skeleton key={row} className="h-4 w-full rounded-sm" />
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="min-w-0 flex-1">
            {/* Toolbar: result count on the left, sort control on the right. */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-10 w-44 rounded-pill" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index}>
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="mt-3 h-3 w-1/3 rounded-sm" />
                  <Skeleton className="mt-2 h-4 w-4/5 rounded-sm" />
                  <Skeleton className="mt-2 h-4 w-1/4 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

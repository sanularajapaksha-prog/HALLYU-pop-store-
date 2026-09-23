import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the catalogue for artists, albums, photocards, lightsticks and official merch.",
};

/**
 * §26. Server shell: it owns the <h1> and the metadata, then hands the query to
 * a Client view. `q` is read here AND the view reads useSearchParams, which is
 * why the view sits under <Suspense> — without it, Next bails the whole route
 * out of static rendering.
 */
export default async function SearchPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.q;
  // A repeated ?q= arrives as string[]; take the first rather than rendering "a,b".
  const q = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q.trim() ? `Results for “${q.trim()}”` : "Search"}
        description="Albums, photocards, lightsticks, merch — and the artists behind them."
      />

      {/* `key` remounts the view on a new query so the input's uncontrolled-ish
          state and the aria-live region both restart cleanly. */}
      <Suspense key={q} fallback={<SearchFallback />}>
        <SearchResults initialQuery={q} />
      </Suspense>
    </>
  );
}

function SearchFallback() {
  return (
    <Container className="pb-24">
      <Skeleton className="h-[68px] w-full max-w-[640px] rounded-xl" />
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
        ))}
      </div>
    </Container>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { Section } from "@/components/layout/Section";
import { ArtistGrid } from "@/components/artist/ArtistGrid";
import { CategoryCard } from "@/components/collection/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import Input from "@/components/ui/Input";
import { SearchIcon } from "@/components/navigation/icons";
import { artists, getArtistById } from "@/lib/artists";
import { categories } from "@/lib/categories";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Artist } from "@/lib/artists";
import type { Category } from "@/lib/categories";
import type { Product } from "@/types/product";

const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;

export interface SearchResultsProps {
  /** From the server shell's `?q=`. The URL stays the source of truth. */
  initialQuery: string;
}

interface SearchHits {
  artists: Artist[];
  products: Product[];
  categories: Category[];
  total: number;
}

/**
 * ponytail: case-insensitive substring scan over ~40 static records, matching
 * the existing SearchBar. No index, no fuzzy ranking, no debounce — there is no
 * network call to debounce. Swap in a real index when the catalogue is
 * server-backed and this starts scanning thousands of rows.
 */
function matches(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q);
}

function runSearch(query: string): SearchHits {
  const q = query.trim().toLowerCase();
  if (!q) return { artists: [], products: [], categories: [], total: 0 };

  const artistHits = artists.filter(
    (a) => matches(a.name, q) || matches(a.description, q),
  );

  const productHits = products.filter((p) => {
    // A product matches its artist's name too — searching "BTS" should surface
    // BTS merchandise, not only the artist tile.
    const artistName = getArtistById(p.artistId)?.name ?? "";
    return matches(p.name, q) || matches(p.description, q) || matches(artistName, q);
  });

  const categoryHits = categories.filter(
    (c) => matches(c.name, q) || matches(c.description, q),
  );

  return {
    artists: artistHits,
    products: productHits,
    categories: categoryHits,
    total: artistHits.length + productHits.length + categoryHits.length,
  };
}

/** Avoids three near-identical ternaries in the eyebrows. */
function plural(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function SearchResults({ initialQuery }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the truth for RESULTS; this holds only the in-flight input text.
  // Seeded from the server-provided value so the field is filled on first paint.
  const [draft, setDraft] = useState(initialQuery);

  const committed = searchParams.get("q") ?? initialQuery;
  const results = useMemo(() => runSearch(committed), [committed]);

  const trimmed = committed.trim();
  const hasQuery = trimmed !== "";

  function go(term: string) {
    const next = term.trim();
    setDraft(next);
    // Clearing the box returns to the initial state rather than leaving ?q= behind.
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(draft);
  }

  return (
    <Container className="pb-24">
      <form role="search" onSubmit={submit} className="max-w-[640px]">
        <Input
          type="search"
          name="q"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Search albums, artists, merch"
          placeholder="Search albums, artists, merch..."
          icon={<SearchIcon className="h-5 w-5" />}
        />
        {/* Enter submits the field. A visible button would be a second control
            for one action; the form still exposes its search role. */}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* The result count is the one thing a screen reader must hear change. */}
      <p aria-live="polite" className="mt-6 text-caption text-muted">
        {hasQuery ? `${plural(results.total, "result")} for “${trimmed}”` : ""}
      </p>

      {!hasQuery ? (
        <TrendingPills onPick={go} />
      ) : results.total === 0 ? (
        <>
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="No matches"
            description={`Nothing in the catalogue matches “${trimmed}”. Try a trending search below, or browse everything.`}
            action={{ label: "Browse all", href: "/shop" }}
          />
          <TrendingPills onPick={go} className="!pt-0" />
        </>
      ) : (
        <div>
          {results.artists.length > 0 && (
            <Section eyebrow={plural(results.artists.length, "artist")} title="ARTISTS">
              <ArtistGrid artists={results.artists} priorityCount={2} />
            </Section>
          )}

          {results.products.length > 0 && (
            <Section eyebrow={plural(results.products.length, "product")} title="PRODUCTS">
              <ProductGrid>
                {results.products.map((product, index) => (
                  <Reveal
                    key={product.id}
                    delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      artistName={getArtistById(product.artistId)?.name ?? "Unknown artist"}
                      priority={index < 2}
                    />
                  </Reveal>
                ))}
              </ProductGrid>
            </Section>
          )}

          {results.categories.length > 0 && (
            <Section
              eyebrow={plural(results.categories.length, "collection")}
              title="COLLECTIONS"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {results.categories.map((category, index) => (
                  <Reveal
                    key={category.id}
                    delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                  >
                    <CategoryCard category={category} />
                  </Reveal>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </Container>
  );
}

/** §26 initial state — trending searches as clickable pills. */
function TrendingPills({
  onPick,
  className,
}: {
  onPick: (term: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("py-12", className)}>
      <p className="text-micro uppercase tracking-[0.2em] text-muted">Trending searches</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {TRENDING_SEARCHES.map((term) => (
          <li key={term}>
            <button
              type="button"
              onClick={() => onPick(term)}
              className={cn(
                "rounded-pill border border-border px-4 py-2 text-body-sm text-foreground",
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:border-accent hover:text-accent active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                "motion-reduce:transition-none",
              )}
            >
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResults;

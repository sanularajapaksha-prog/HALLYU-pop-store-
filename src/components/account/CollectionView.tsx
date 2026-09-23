"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { useCollection } from "@/context/CollectionContext";
import { useWishlist } from "@/context/WishlistContext";
import { getArtistById } from "@/lib/artists";
import { cn, formatLKR } from "@/lib/utils";
import { ConfirmButton, SkeletonGrid, resolveSlugs, type ResolvedProduct } from "./savedProducts";

const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;

type TabId = "owned" | "wishlist";

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.75 7.5 12 3.75l8.25 3.75v9L12 20.25 3.75 16.5v-9Z" />
      <path d="M3.75 7.5 12 11.25l8.25-3.75M12 11.25v9" />
    </svg>
  );
}

interface ArtistGroup {
  artistId: string;
  name: string;
  slug?: string;
  items: ResolvedProduct[];
}

/**
 * §25's "BTS > Albums / Photocards / Merch" shape, one level up: group by
 * artist. First-appearance order is kept, so the list does not reshuffle when
 * an item is added.
 *
 * ponytail: grouped by artist only, not artist > category. §25 draws the
 * category tier, but with a handful of owned items per artist it is three
 * headings over two cards each. Add the second tier when a real collection
 * makes an artist group long enough to need it.
 */
function groupByArtist(items: ResolvedProduct[]): ArtistGroup[] {
  const groups = new Map<string, ArtistGroup>();

  for (const item of items) {
    const { artistId } = item.product;
    let group = groups.get(artistId);
    if (!group) {
      group = {
        artistId,
        name: item.artistName,
        slug: getArtistById(artistId)?.slug,
        items: [],
      };
      groups.set(artistId, group);
    }
    group.items.push(item);
  }

  return [...groups.values()];
}

/** Craft rule 1: double-bezel. Outer 20px radius, p-1.5 (6px) -> inner 14px. */
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
      <div className="rounded-lg bg-background px-5 py-6">
        <dt className="text-micro uppercase tracking-[0.2em] text-muted">{label}</dt>
        <dd className="mt-2 font-display text-heading-md tabular-nums text-foreground">{value}</dd>
      </div>
    </div>
  );
}

/**
 * §25 — what the user OWNS. Grouped by artist so it reads as a collection
 * rather than a flat list, with a stats row that makes the shelf feel real.
 *
 * Tabs switch between the owned grid and the wishlist, because §25 nests the
 * wishlist inside the collection structure. Both stores are localStorage-backed,
 * so the whole body waits on `hydrated` and nothing reads storage in render.
 */
export function CollectionView() {
  const collection = useCollection();
  const wishlist = useWishlist();
  const [tab, setTab] = useState<TabId>("owned");

  const ready = collection.hydrated && wishlist.hydrated;
  const owned = resolveSlugs(collection.slugs);
  const wanted = resolveSlugs(wishlist.slugs);

  const groups = groupByArtist(owned);
  const totalValue = owned.reduce((sum, item) => sum + item.product.price, 0);

  const active = tab === "owned" ? owned : wanted;

  return (
    <Container className="pb-20 md:pb-28">
      {/* Stats render only once hydrated: a "0 items / LKR 0" flash would read
          as an empty collection to someone who actually has one. */}
      {ready && owned.length > 0 && (
        <Reveal>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-6">
            <StatTile label="Items owned" value={String(owned.length)} />
            <StatTile label="Artists" value={String(groups.length)} />
            <StatTile label="Collection value" value={formatLKR(totalValue)} />
          </dl>
        </Reveal>
      )}

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <Tabs
          aria-label="Collection sections"
          active={tab}
          onChange={(id) => setTab(id === "wishlist" ? "wishlist" : "owned")}
          tabs={[
            { id: "owned", label: "Owned", count: ready ? owned.length : undefined },
            { id: "wishlist", label: "Wishlist", count: ready ? wanted.length : undefined },
          ]}
          className="flex-1"
        />

        {ready && tab === "owned" && owned.length > 0 && (
          <ConfirmButton
            label="Clear collection"
            confirmLabel="Remove everything you own?"
            onConfirm={() => collection.clear()}
            className="pb-2"
          />
        )}
      </div>

      <div
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="mt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <p className="sr-only" aria-live="polite">
          {ready
            ? `${active.length} ${active.length === 1 ? "item" : "items"} in ${
                tab === "owned" ? "your collection" : "your wishlist"
              }`
            : "Loading"}
        </p>

        {!ready ? (
          <SkeletonGrid />
        ) : tab === "wishlist" ? (
          wanted.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              description="The wishlist tracks what you might buy. Save something and it shows up here alongside what you already own."
              action={{ label: "Browse products", href: "/shop" }}
            />
          ) : (
            <>
              <ProductGrid>
                {wanted.map(({ product, artistName }, index) => (
                  <Reveal
                    key={product.slug}
                    delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                    className="h-full"
                  >
                    <ProductCard product={product} artistName={artistName} priority={index < 4} />
                  </Reveal>
                ))}
              </ProductGrid>
              <p className="mt-8 text-body-sm text-muted">
                Manage saved items on the{" "}
                <Link
                  href="/wishlist"
                  className="text-foreground underline underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  wishlist page
                </Link>
                .
              </p>
            </>
          )
        ) : owned.length === 0 ? (
          <EmptyState
            icon={<BoxIcon />}
            title="Your collection is empty"
            description="My Collection is what you already own — albums on the shelf, photocards in the binder. Your wishlist is separate: that one tracks what you still want. Move something over from the wishlist to start."
            action={{ label: "Browse products", href: "/shop" }}
          />
        ) : (
          <div className="flex flex-col gap-14">
            {groups.map((group, groupIndex) => (
              <section key={group.artistId} aria-labelledby={`group-${group.artistId}`}>
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                  <h2
                    id={`group-${group.artistId}`}
                    className="font-display text-heading-sm text-foreground"
                  >
                    {group.name}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-caption tabular-nums text-muted">
                      {group.items.length} {group.items.length === 1 ? "item" : "items"}
                    </span>
                    {group.slug && (
                      <Link
                        href={`/artists/${group.slug}`}
                        className={cn(
                          "text-caption text-muted hover:text-foreground",
                          "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        )}
                      >
                        Shop {group.name}
                      </Link>
                    )}
                  </div>
                </div>

                <ProductGrid>
                  {group.items.map(({ product, artistName }, index) => (
                    <Reveal
                      key={product.slug}
                      delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}
                      className="flex h-full flex-col gap-3"
                    >
                      <ProductCard
                        product={product}
                        artistName={artistName}
                        priority={groupIndex === 0 && index < 4}
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${product.name} from my collection`}
                        onClick={() => collection.remove(product.slug)}
                        className={cn(
                          "inline-flex w-full items-center justify-center rounded-pill border border-transparent px-3 py-2 text-caption text-muted",
                          "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                          "hover:border-border hover:text-foreground active:scale-[0.98]",
                          "motion-reduce:transition-none motion-reduce:active:scale-100",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        )}
                      >
                        Remove
                      </button>
                    </Reveal>
                  ))}
                </ProductGrid>
              </section>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

export default CollectionView;

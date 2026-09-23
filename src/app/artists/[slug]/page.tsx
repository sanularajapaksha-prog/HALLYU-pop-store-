import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { ArtistHeader } from "@/components/artist/ArtistHeader";
import ProductSection from "@/components/home/ProductSection";
import { artists, getArtistBySlug } from "@/lib/artists";
import { categories } from "@/lib/categories";
import { getProductsByArtist } from "@/lib/products";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * §18's artist page order: Albums, Photocards, Merch, Lightsticks, Apparel,
 * Accessories. The catalogue calls the "Merch" bucket "official-merch", so the
 * order is expressed in category SLUGS and resolved against real categories —
 * a renamed or removed category degrades to "sorted last", never to a crash.
 */
const SECTION_ORDER = [
  "albums",
  "photocards",
  "official-merch",
  "lightsticks",
  "apparel",
  "accessories",
] as const;

function orderIndex(category: Category): number {
  const index = SECTION_ORDER.indexOf(category.slug as (typeof SECTION_ORDER)[number]);
  // Unlisted categories sort after the spec'd ones instead of disappearing.
  return index === -1 ? SECTION_ORDER.length : index;
}

/** The roster is static, so every artist page is known at build time. */
export function generateStaticParams(): Array<{ slug: string }> {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  // Metadata runs before the page body, so it handles the 404 case itself.
  if (artist === undefined) return { title: "Artist not found" };

  const count = getProductsByArtist(artist.id).length;
  const description =
    artist.description ||
    `Shop ${count} official ${artist.name} ${count === 1 ? "item" : "items"} — albums, photocards, lightsticks and merch.`;

  return {
    title: artist.name,
    description,
    openGraph: {
      title: artist.name,
      description,
      type: "website",
      images: [{ url: artist.coverImage, alt: artist.name }],
    },
  };
}

/**
 * /artists/[slug] — §18. Artist → Release → Product, in that order.
 *
 * Server Component: every read below is synchronous seed data. Only the cards'
 * own hover/wishlist state crosses the client boundary.
 */
export default async function ArtistPage({ params }: PageProps) {
  // Next 16: params is a Promise.
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (artist === undefined) notFound();

  const artistProducts = getProductsByArtist(artist.id);

  // Group ONCE, then render only the non-empty groups. An empty "Lightsticks"
  // header over nothing reads as a broken page, not as a minimal one.
  const byCategory = new Map<string, Product[]>();
  for (const product of artistProducts) {
    const bucket = byCategory.get(product.categoryId);
    if (bucket === undefined) byCategory.set(product.categoryId, [product]);
    else bucket.push(product);
  }

  // `.filter` already copies, so the `.sort` below never mutates the imported
  // `categories` module array (which would reorder it for every other page).
  const groups = categories
    .filter((category) => byCategory.has(category.id))
    .sort((a, b) => orderIndex(a) - orderIndex(b))
    .map((category) => ({
      category,
      // Non-null: `filter` above kept only ids the map holds.
      products: byCategory.get(category.id) as Product[],
    }));

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Artists", href: "/artists" },
            { label: artist.name },
          ]}
        />
      </Container>

      {/* Owns the page's single <h1>. */}
      <ArtistHeader artist={artist} productCount={artistProducts.length} />

      {artistProducts.length === 0 ? (
        <Container>
          <EmptyState
            title={`Nothing from ${artist.name} yet`}
            description="We have not stocked this artist yet. Browse the rest of the catalogue, or check back after the next comeback."
            action={{ label: "Shop all products", href: "/shop" }}
          />
        </Container>
      ) : (
        <>
          {groups.map(({ category, products: categoryProducts }, index) => (
            <ProductSection
              key={category.id}
              id={category.slug}
              eyebrow={index === 0 ? artist.name.toUpperCase() : undefined}
              title={category.name}
              products={categoryProducts}
              /*
               * /shop filters on IDs, not slugs — `filterProducts` compares
               * against `product.artistId` / `product.categoryId`. Linking with
               * slugs here would land on an empty grid.
               */
              action={{
                label: "VIEW ALL",
                href: `/shop?artists=${artist.id}&categories=${category.id}`,
              }}
              tone={index % 2 === 1 ? "surface" : "default"}
              prioritizeImages={index === 0}
            />
          ))}

          {/*
            Only worth a second pass when it is not just the one group repeated.
          */}
          {groups.length > 1 && (
            <ProductSection
              id="all-products"
              title="All Products"
              products={artistProducts}
              action={{ label: "VIEW ALL", href: `/shop?artists=${artist.id}` }}
              tone={groups.length % 2 === 1 ? "surface" : "default"}
              prioritizeImages={false}
            />
          )}
        </>
      )}
    </>
  );
}

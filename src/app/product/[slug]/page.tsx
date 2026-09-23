import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import ProductSection from "@/components/home/ProductSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import { ProductInfo } from "@/components/product/ProductInfo";
import RecordRecentlyViewed from "@/components/product/RecordRecentlyViewed";
import { WhatsIncluded, inclusionsFor } from "@/components/product/WhatsIncluded";
import { getArtistById } from "@/lib/artists";
import { categories } from "@/lib/categories";
import { getProductBySlug, getProductsByArtist, products } from "@/lib/products";

/** §28 related rail — one row, never a second grid competing with the page. */
const RELATED_LIMIT = 4;

type PageProps = { params: Promise<{ slug: string }> };

/** The catalogue is static, so every product page is known at build time. */
export function generateStaticParams(): Array<{ slug: string }> {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Metadata runs before the page body, so it must handle the 404 case itself
  // rather than assuming the product exists.
  if (product === undefined) {
    return { title: "Product not found" };
  }

  const artistName = getArtistById(product.artistId)?.name;
  const title = artistName === undefined ? product.name : `${product.name} — ${artistName}`;

  return {
    title,
    description: product.description,
    openGraph: {
      title,
      description: product.description,
      type: "website",
      images: product.images.slice(0, 1).map((image) => ({
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt,
      })),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  // Next 16: params is a Promise.
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (product === undefined) notFound();

  const artist = getArtistById(product.artistId);
  // Category is looked up by id here; getCategoryBySlug is slug-keyed, so match
  // on id directly rather than assuming id === slug.
  const category = categories.find((entry) => entry.id === product.categoryId);

  const related = getProductsByArtist(product.artistId)
    .filter((entry) => entry.id !== product.id)
    .slice(0, RELATED_LIMIT);

  const inclusions = inclusionsFor(product.categoryId, product.slug);

  return (
    <>
      {/* Client, renders null — writes this slug into the §34 store. */}
      <RecordRecentlyViewed slug={product.slug} />

      <Container className="pt-6 md:pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(artist === undefined
              ? []
              : [{ label: artist.name, href: `/artists/${artist.slug}` }]),
            { label: product.name },
          ]}
        />
      </Container>

      {/* §28 two-column layout. ProductInfo owns BOTH columns because the
          gallery has to react to variant selection (§24). */}
      <Container className="py-8 md:py-12">
        <ProductInfo
          product={product}
          artistName={artist?.name ?? "Unknown artist"}
          artistHref={artist === undefined ? "/artists" : `/artists/${artist.slug}`}
          shippingNote={
            product.isPreorder
              ? `Pre-order — ships on or after ${product.releaseDate.slice(0, 10)}.`
              : "In stock and dispatched within 2 business days."
          }
        />
      </Container>

      {inclusions.length > 0 && (
        <Section tone="surface">
          <WhatsIncluded items={inclusions} />
        </Section>
      )}

      {/* Renders null when the artist has no other products — no empty band. */}
      <ProductSection
        eyebrow={category?.name ?? "More to collect"}
        title={artist === undefined ? "You may also like" : `More from ${artist.name}`}
        action={
          artist === undefined ? undefined : { label: "View all", href: `/artists/${artist.slug}` }
        }
        products={related}
        prioritizeImages={false}
      />

      {/* Client; renders null until hydration and when there is no history. */}
      <RecentlyViewed />
    </>
  );
}

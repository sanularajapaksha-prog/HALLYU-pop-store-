import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionView } from "@/components/account/CollectionView";

export const metadata: Metadata = {
  title: "My Collection",
  description:
    "Track what you own — albums, photocards and merch, grouped by artist, with the total value of your shelf. Separate from your wishlist, which tracks what you still want.",
};

/**
 * /collection — §25. Server shell only; the owned list is localStorage-backed
 * and rendered by the client view.
 */
export default function CollectionPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "My Collection", href: "/collection" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="COLLECT"
        title="My Collection"
        description="A shelf, not a shopping list. Track the albums, photocards and merch you already own — grouped by artist, counted and valued — so you know what you have before the next comeback drops."
      />

      <CollectionView />
    </>
  );
}

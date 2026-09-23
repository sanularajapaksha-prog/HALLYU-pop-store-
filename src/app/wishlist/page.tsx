import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { WishlistView } from "@/components/account/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Everything you have saved to think about. Your wishlist tracks what you might buy — My Collection tracks what you already own.",
};

/**
 * /wishlist — §25. Server shell: breadcrumbs, header and metadata render on the
 * server; the list itself is localStorage-backed and lives in the client view.
 */
export default function WishlistPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Wishlist", href: "/wishlist" },
          ]}
        />
      </Container>

      <PageHeader
        eyebrow="SAVED"
        title="Wishlist"
        description="Products you might buy, kept in one place while you decide. Once something is actually yours, move it across to My Collection."
      />

      <WishlistView />
    </>
  );
}

import Link from "next/link";

// Placeholder root page for change 001-frontend-foundation.
// Real homepage sections (Hero, TrendingProducts, ShopByArtist, etc. —
// doc §13/§47) land in a later change once ProductCard/Navbar exist.

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center space-y-6">
      <h1 className="text-display-md">K-pop Marketplace</h1>
      <p className="text-body text-muted">
        Frontend foundation (change 001) is in place: Next.js, TypeScript,
        Tailwind, and the design token system are wired up.
      </p>
      <Link
        href="/design-tokens"
        className="inline-block text-body-sm font-medium text-accent underline underline-offset-4"
      >
        View design tokens
      </Link>
    </main>
  );
}

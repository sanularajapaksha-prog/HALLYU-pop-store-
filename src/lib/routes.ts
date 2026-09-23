/**
 * Single source of truth for every internal route path.
 *
 * Why this exists: eight broken hrefs reached production because route paths
 * were spelled as string literals in five different files, which drifted from
 * the real `src/app` tree (`/products/:slug` vs the real `/product/:slug`,
 * `/legal/privacy` vs `/privacy`, `/new-drops` vs `/drops`, and so on). Two of
 * them were live homepage 404s.
 *
 * Every nav surface, footer group and CTA default must reference these values
 * rather than a literal, so a route can only be spelled in one place.
 * `src/lib/__checks__/routes.check.ts` asserts each of these resolves to a real
 * page under `src/app`, which turns this class of bug into a gate failure
 * instead of something a user finds.
 */

export const ROUTES = {
  home: "/",
  shop: "/shop",
  artists: "/artists",
  drops: "/drops",
  collections: "/collections",
  photocards: "/photocards",
  wishlist: "/wishlist",
  /** The "things I own" view (§25), distinct from `wishlist`. */
  collection: "/collection",
  cart: "/cart",
  checkout: "/checkout",
  account: "/account",
  search: "/search",
  editorial: "/editorial",
  orders: "/orders",
  designTokens: "/design-tokens",

  // Informational pages linked from the footer (doc §36).
  shipping: "/shipping",
  returns: "/returns",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",

  // Dynamic segments. Builders rather than literals so a caller cannot
  // pluralise the prefix by hand — the original `/products/${slug}` bug.
  product: (slug: string) => `/product/${slug}`,
  artist: (slug: string) => `/artists/${slug}`,
  category: (slug: string) => `/collections/${slug}`,
} as const;

/**
 * Static route values only — the check file iterates these against the
 * filesystem. Function builders are excluded because their targets are dynamic
 * segments (`[slug]`) and are asserted separately.
 */
export const STATIC_ROUTES: readonly string[] = Object.values(ROUTES).filter(
  (value): value is string => typeof value === "string",
);

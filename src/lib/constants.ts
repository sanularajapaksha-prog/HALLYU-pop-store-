// Site chrome copy — designsys.md §11 (nav + announcement), §26 (search), §36 (footer).
//
// ponytail: every href below is checked against a real route in src/app.
// Links to unbuilt pages are DROPPED, not stubbed — a short footer beats a
// footer of 404s. Re-add a group's entry when its route lands.

import { ROUTES } from "@/lib/routes";

export const SITE_NAME = "HALLYU";

export const ANNOUNCEMENT = "NEW DROP — STRAY KIDS COLLECTION NOW AVAILABLE";
export const ANNOUNCEMENT_HREF = ROUTES.artist("stray-kids");

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Shop", href: ROUTES.shop },
  { label: "Artists", href: ROUTES.artists },
  { label: "New Drops", href: ROUTES.drops },
  { label: "Collections", href: ROUTES.collections },
];

export type FooterGroup = { title: string; links: NavLink[] };

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Shop",
    // Category slugs come from src/lib/categories.ts — /collections/<slug> is
    // the same slug-addressed route CategoryCard links to.
    links: [
      { label: "Albums", href: ROUTES.category("albums") },
      { label: "Photocards", href: ROUTES.photocards },
      { label: "Official Merch", href: ROUTES.category("official-merch") },
      { label: "Lightsticks", href: ROUTES.category("lightsticks") },
      { label: "Apparel", href: ROUTES.category("apparel") },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Artists", href: ROUTES.artists },
      { label: "New Drops", href: ROUTES.drops },
      { label: "Collections", href: ROUTES.collections },
      // The radar lives as a section on /drops (id="comeback-radar").
      { label: "Comeback Radar", href: `${ROUTES.drops}#comeback-radar` },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", href: ROUTES.account },
      { label: "My Collection", href: ROUTES.collection },
      { label: "Wishlist", href: ROUTES.wishlist },
      { label: "Cart", href: ROUTES.cart },
    ],
  },
];

export const SOCIAL_LINKS: NavLink[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export const TRENDING_SEARCHES: string[] = [
  "BTS",
  "Photocards",
  "Lightsticks",
  "New releases",
];

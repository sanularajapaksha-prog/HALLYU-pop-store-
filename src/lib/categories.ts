// Category catalogue — designsys.md §22, §44 (data model).

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

const image = (slug: string) => `https://picsum.photos/seed/cat-${slug}/800/800`;

export const categories: Category[] = [
  {
    id: "cat-albums",
    name: "Albums",
    slug: "albums",
    description: "Standard, deluxe and limited pressings — sealed, with inclusions intact.",
    image: image("albums"),
  },
  {
    id: "cat-photocards",
    name: "Photocards",
    slug: "photocards",
    description: "Official pulls, POB exclusives and full member sets, graded for condition.",
    image: image("photocards"),
  },
  {
    id: "cat-lightsticks",
    name: "Lightsticks",
    slug: "lightsticks",
    description: "Official fandom lightsticks with Bluetooth sync and concert-ready batteries.",
    image: image("lightsticks"),
  },
  {
    id: "cat-apparel",
    name: "Apparel",
    slug: "apparel",
    description: "Tour tees, hoodies and outerwear from official concert and pop-up runs.",
    image: image("apparel"),
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Keyrings, bags, phone cases and collector storage built to survive daily use.",
    image: image("accessories"),
  },
  {
    id: "cat-official-merch",
    name: "Official Merch",
    slug: "official-merch",
    description: "Season's greetings, photobooks and fanmeeting goods straight from the label.",
    image: image("official-merch"),
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

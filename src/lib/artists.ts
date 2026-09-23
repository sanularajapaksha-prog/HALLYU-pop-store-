// Artist catalogue — designsys.md §18 (artist-first discovery), §44 (data model).

export type Artist = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  productCount: number;
  featured: boolean;
};

const cover = (slug: string) => `https://picsum.photos/seed/${slug}/800/1000`;

export const artists: Artist[] = [
  {
    id: "art-bts",
    name: "BTS",
    slug: "bts",
    description:
      "The seven-member group that turned Korean pop into a global stadium language, and ARMY into the world's most organised fandom.",
    coverImage: cover("bts"),
    productCount: 148,
    featured: true,
  },
  {
    id: "art-blackpink",
    name: "BLACKPINK",
    slug: "blackpink",
    description:
      "Four members, a hard-edged pop-rap signature and a front-row presence at every fashion week that matters.",
    coverImage: cover("blackpink"),
    productCount: 126,
    featured: true,
  },
  {
    id: "art-stray-kids",
    name: "Stray Kids",
    slug: "stray-kids",
    description:
      "Self-producing eight-piece known for abrasive, maximalist \"noise music\" that they write, arrange and perform themselves.",
    coverImage: cover("stray-kids"),
    productCount: 134,
    featured: true,
  },
  {
    id: "art-seventeen",
    name: "SEVENTEEN",
    slug: "seventeen",
    description:
      "Thirteen members across three units, famous for choreography so synchronised it reads as a single moving object.",
    coverImage: cover("seventeen"),
    productCount: 119,
    featured: true,
  },
  {
    id: "art-twice",
    name: "TWICE",
    slug: "twice",
    description:
      "Nine vocalists who defined the bright, hook-driven era of the late 2010s and have never left the charts since.",
    coverImage: cover("twice"),
    productCount: 112,
    featured: true,
  },
  {
    id: "art-aespa",
    name: "aespa",
    slug: "aespa",
    description:
      "A four-member group built around a metaverse concept, pairing avatar lore with some of the sharpest production in pop.",
    coverImage: cover("aespa"),
    productCount: 94,
    featured: false,
  },
  {
    id: "art-ive",
    name: "IVE",
    slug: "ive",
    description:
      "Six members whose confident, self-assured pop has produced a run of debut-to-now hits with almost no misses.",
    coverImage: cover("ive"),
    productCount: 88,
    featured: false,
  },
  {
    id: "art-le-sserafim",
    name: "LE SSERAFIM",
    slug: "le-sserafim",
    description:
      "Five members with a fearless, sport-adjacent visual identity and a catalogue of clipped, percussive singles.",
    coverImage: cover("le-sserafim"),
    productCount: 81,
    featured: false,
  },
  {
    id: "art-newjeans",
    name: "NewJeans",
    slug: "newjeans",
    description:
      "Five members who rebuilt the Y2K sound around Baltimore club rhythms and an uncommonly restrained visual direction.",
    coverImage: cover("newjeans"),
    productCount: 103,
    featured: false,
  },
  {
    id: "art-nmixx",
    name: "NMIXX",
    slug: "nmixx",
    description:
      "Six members performing \"mixx pop\" — songs that switch genre mid-track and demand a vocal line that can follow.",
    coverImage: cover("nmixx"),
    productCount: 67,
    featured: false,
  },
];

export const featuredArtists: Artist[] = artists.filter((a) => a.featured);

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

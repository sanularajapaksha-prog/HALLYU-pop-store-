// Comeback Radar — designsys.md §21. releaseDate is a FIXED future ISO string;
// the day countdown is computed at render time, never here.

export type Comeback = {
  id: string;
  artistId: string;
  title: string;
  label: string;
  releaseDate: string;
  coverImage: string;
  productSlug?: string;
};

export const comebacks: Comeback[] = [
  {
    id: "cmb-001",
    artistId: "art-nmixx",
    title: "Fe3O4: BREAK",
    label: "NEW EP",
    releaseDate: "2026-10-30T00:00:00.000Z",
    coverImage: "https://picsum.photos/seed/comeback-nmixx/800/1000",
    productSlug: "nmixx-fe3o4-break-standard",
  },
  {
    id: "cmb-002",
    artistId: "art-bts",
    title: "Untitled Ninth Album",
    label: "NEW ALBUM",
    releaseDate: "2026-11-14T00:00:00.000Z",
    coverImage: "https://picsum.photos/seed/comeback-bts/800/1000",
  },
  {
    id: "cmb-003",
    artistId: "art-seventeen",
    title: "CARAT Bong Ver. 3",
    label: "LIGHTSTICK",
    releaseDate: "2026-11-28T00:00:00.000Z",
    coverImage: "https://picsum.photos/seed/comeback-seventeen/800/1000",
    productSlug: "seventeen-carat-bong-ver-3",
  },
  {
    id: "cmb-004",
    artistId: "art-ive",
    title: "IVE SECRET",
    label: "NEW SINGLE",
    releaseDate: "2026-12-02T00:00:00.000Z",
    coverImage: "https://picsum.photos/seed/comeback-ive/800/1000",
  },
  {
    id: "cmb-005",
    artistId: "art-aespa",
    title: "SYNK: PARALLEL LINE",
    label: "NEW ALBUM",
    releaseDate: "2026-12-19T00:00:00.000Z",
    coverImage: "https://picsum.photos/seed/comeback-aespa/800/1000",
  },
];

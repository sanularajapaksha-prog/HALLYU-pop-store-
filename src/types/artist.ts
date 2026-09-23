/**
 * Artist domain type.
 * Spec: designsys.md §44 (Data Model Foundation), §18/§19 (artist-first discovery + tiles).
 */

export interface Artist {
  id: string;
  name: string;
  /** URL segment and deterministic picsum seed. */
  slug: string;
  /** Small square mark used in nav rows and card meta. */
  logo: string;
  /** Wide image behind the artist tile (§19) and the artist page header. */
  coverImage: string;
  description: string;
  /** Surfaces the artist in the "Shop by Artist" rail. */
  featured: boolean;
  /**
   * §19 — artist tiles show the number of products.
   * Denormalised on read so a tile never has to count a product list client-side.
   */
  productCount: number;
}

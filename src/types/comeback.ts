/**
 * Comeback Radar domain type.
 * Spec: designsys.md §21 (Comeback Radar) with §44 naming conventions.
 */

/** What the radar row's CTA does. */
export type ComebackAction = 'PRE-ORDER' | 'NOTIFY' | 'VIEW';

export interface Comeback {
  id: string;
  artistId: string;
  /** Denormalised so a radar row renders without joining the artist table. */
  artistName: string;
  title: string;
  /** ISO date string. Feed it to `daysUntil` with an explicit `now` — never read the clock in render. */
  releaseDate: string;
  coverImage: string;
  action: ComebackAction;
  /** Target product for 'PRE-ORDER' / 'VIEW'. Absent for 'NOTIFY' (nothing to link to yet). */
  productSlug?: string;
}

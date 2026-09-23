/**
 * Category domain type.
 * Spec: designsys.md §44 (Data Model Foundation).
 */

export interface Category {
  id: string;
  name: string;
  /** URL segment and deterministic picsum seed. */
  slug: string;
  image: string;
  description: string;
}

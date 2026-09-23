/**
 * Collection domain type.
 * Spec: designsys.md §44 (Data Model Foundation), §6 (campaign colour pairing).
 */

import type { Product } from '@/types/product';

export interface Collection {
  id: string;
  name: string;
  /** URL segment and deterministic picsum seed. */
  slug: string;
  description: string;
  coverImage: string;
  /**
   * §6 — campaign blocks may carry their own colour trio.
   * CSS colour strings applied inline to that block ONLY (a campaign is the one
   * sanctioned exception to the token-only rule); the rest of the UI keeps using
   * the Tailwind token classes.
   */
  accent: string;
  background: string;
  foreground: string;
  products: Product[];
}

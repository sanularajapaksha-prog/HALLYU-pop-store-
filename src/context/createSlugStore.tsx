"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { isStringArray, useStoredState } from "@/lib/useStoredState";

export type SlugStore = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  hydrated: boolean;
};

const EMPTY: string[] = [];

/**
 * Wishlist and Collection are the same store — a deduped list of product slugs —
 * with different keys and meanings (want vs own). ponytail: one factory instead
 * of two near-identical files. Split them the day their APIs actually diverge.
 */
export function createSlugStore(storageKey: string, hookName: string) {
  const Ctx = createContext<SlugStore | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [slugs, setSlugs, hydrated] = useStoredState(storageKey, EMPTY, isStringArray);

    const toggle = useCallback(
      (slug: string) =>
        setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])),
      [setSlugs],
    );

    const remove = useCallback(
      (slug: string) => setSlugs((prev) => prev.filter((s) => s !== slug)),
      [setSlugs],
    );

    const clear = useCallback(() => setSlugs([]), [setSlugs]);

    const value = useMemo<SlugStore>(
      () => ({
        slugs,
        toggle,
        has: (slug: string) => slugs.includes(slug),
        remove,
        clear,
        count: slugs.length,
        hydrated,
      }),
      [slugs, toggle, remove, clear, hydrated],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useStore(): SlugStore {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`${hookName} must be used inside <AppProviders>`);
    return ctx;
  }

  return { Provider, useStore };
}

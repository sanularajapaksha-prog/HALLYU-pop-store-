"use client";

import { useCallback, useSyncExternalStore } from "react";

export const RECENTLY_VIEWED_KEY = "kpm:recently-viewed";

/** §34 shows a single row; keeping more than this just bloats the entry. */
const MAX_ITEMS = 8;

const EMPTY: readonly string[] = Object.freeze([]);

/**
 * SNAPSHOT CACHING IS NOT AN OPTIMISATION — IT IS REQUIRED FOR CORRECTNESS.
 *
 * `useSyncExternalStore` bails out of a re-render by comparing snapshots with
 * Object.is. A getSnapshot that ran JSON.parse on every call would return a
 * brand-new array reference each time, Object.is would be false forever, and
 * React would re-render in an infinite loop ("getSnapshot should be cached").
 *
 * So we parse only when the underlying raw string has actually changed, and
 * hand back the SAME array reference until it does.
 */
let cachedRaw: string | null = null;
let cachedValue: readonly string[] = EMPTY;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * Every localStorage access is wrapped. Reading `window.localStorage` THROWS
 * outright (not returns null) in Safari private mode and when site data is
 * blocked by policy — an unguarded read takes the whole page down, not just
 * this section.
 */
function readRaw(): string | null {
  try {
    return window.localStorage.getItem(RECENTLY_VIEWED_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): readonly string[] {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    // The value is attacker-editable (it is just a devtools edit away) and may
    // also be stale data from an older shape, so every entry is validated
    // rather than trusted. Anything non-string is dropped, not coerced.
    const slugs = parsed.filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    );
    return slugs.length === 0 ? EMPTY : slugs.slice(0, MAX_ITEMS);
  } catch {
    // Corrupt JSON — treat as empty rather than throwing during render.
    return EMPTY;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

/**
 * The server has no localStorage. Returning a FROZEN SHARED constant (not a new
 * []) keeps the reference stable across calls, which getServerSnapshot also
 * requires. The section renders nothing on the server and fills in after
 * hydration — see RecentlyViewed for why that is correct rather than a flash.
 */
function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // `storage` fires only for OTHER tabs, never the one that wrote. That is
  // exactly what we want here: same-tab writes go through `add()`, which
  // notifies directly. Together they cover both cases with no double-render.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === RECENTLY_VIEWED_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export interface UseRecentlyViewedResult {
  /** Most-recently-viewed slug first. Empty during SSR and first client render. */
  items: readonly string[];
  /** Record a product view. Safe to call from an effect on a product page. */
  add: (slug: string) => void;
}

/**
 * §34 — recently viewed slugs, persisted per browser.
 *
 * Stores SLUGS, not product objects: the catalogue is the source of truth for
 * name/price/image, so caching a whole product would serve a stale price after
 * the next deploy. A slug that no longer resolves is simply dropped at render.
 */
export function useRecentlyViewed(): UseRecentlyViewedResult {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((slug: string) => {
    if (slug.length === 0) return;
    // Dedupe by removing an existing entry before unshifting, so re-viewing a
    // product MOVES it to the front instead of creating a duplicate tile.
    const next = [slug, ...parse(readRaw()).filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    try {
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      // Quota exceeded, or storage disabled. Recently-viewed is a convenience;
      // failing to persist it must never surface as an error to the user.
      return;
    }
    // Invalidate before notifying — otherwise subscribers re-read the cache and
    // get the PREVIOUS value, and the row would lag one view behind.
    cachedRaw = null;
    emit();
  }, []);

  return { items, add };
}

export default useRecentlyViewed;

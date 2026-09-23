"use client";

import { useSyncExternalStore } from "react";

/**
 * The clock, read as the external store it actually is.
 *
 * Why not the obvious spellings — both are ESLint ERRORS in this repo, and both
 * are genuinely wrong, not merely disallowed:
 *   - `useState(null)` + `useEffect(() => setDays(...))`
 *     -> react-hooks/set-state-in-effect (cascading render).
 *   - `mounted ? Date.now() : null` inline in render
 *     -> react-hooks/purity. Date.now() is impure: the value would silently
 *        change on any unrelated re-render, so two renders of the same props
 *        could disagree.
 *
 * useSyncExternalStore is the sanctioned primitive for exactly this: a value
 * the server cannot know and the client reads after mount.
 *
 * The snapshot is frozen at module load, NOT Date.now() per call: getSnapshot
 * must be idempotent — returning a fresh timestamp each call makes React see an
 * endlessly-changing store and re-render forever.
 *
 * ponytail: one timestamp for the page's lifetime. A day boundary crossed while
 * the tab sits open will not tick over. That is correct for a day-granularity
 * countdown; if this ever needs live seconds, add a setInterval inside
 * `subscribe` that bumps a mutable snapshot.
 */
const CLIENT_NOW = Date.now();

const subscribe = () => () => {};
const getSnapshot = () => CLIENT_NOW;
// null on the server AND on the first client render, so both emit identical
// HTML and hydration cannot mismatch.
const getServerSnapshot = (): number | null => null;

/** Client-side timestamp, or `null` during SSR and first paint. */
export function useClientNow(): number | null {
  return useSyncExternalStore<number | null>(subscribe, getSnapshot, getServerSnapshot);
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage";

/**
 * State backed by localStorage, with the hydration discipline the three client
 * stores need.
 *
 * localStorage IS an external store, so this is useSyncExternalStore rather
 * than useState + a load effect:
 *   - the SERVER snapshot is always `initial`, so the server HTML and the first
 *     client render match — no hydration mismatch;
 *   - the CLIENT snapshot reads storage, and React swaps it in right after
 *     hydration;
 *   - writes go straight to storage and notify subscribers, so there is no
 *     "effect overwrites stored data with the empty initial state" window at
 *     all — the failure mode the useState version had to guard against simply
 *     cannot happen here;
 *   - `storage` events keep two open tabs in sync for free.
 *
 * `hydrated` is exposed so consumers can avoid flashing a 0 cart count during
 * the first paint.
 *
 * ponytail: one hook instead of the same 25 lines in Cart, Wishlist and
 * Collection. Parsed snapshots are cached because useSyncExternalStore compares
 * snapshots by identity — returning a fresh array each call would loop forever.
 */

// Module-level cache: raw string -> parsed value, per key. Keeps getSnapshot
// referentially stable between renders when storage has not changed.
const cache = new Map<string, { raw: string | null; parsed: unknown }>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

function subscribe(key: string, onChange: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onChange);

  // Another tab wrote this key.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === `kpm:${key}`) {
      cache.delete(key);
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function snapshot<T>(key: string, initial: T, validate: (v: unknown) => v is T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(`kpm:${key}`);
  } catch {
    return initial;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.parsed as T;

  const parsedUnknown = readJSON<unknown>(key, null);
  const parsed = validate(parsedUnknown) ? parsedUnknown : initial;
  cache.set(key, { raw, parsed });
  return parsed;
}

const emptySubscribe = () => () => {};
const clientTrue = () => true;
const serverFalse = () => false;

export function useStoredState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
): [T, (update: T | ((prev: T) => T)) => void, boolean] {
  const hydrated = useSyncExternalStore(emptySubscribe, clientTrue, serverFalse);

  const value = useSyncExternalStore(
    useCallback((onChange: () => void) => subscribe(key, onChange), [key]),
    useCallback(() => snapshot(key, initial, validate), [key, initial, validate]),
    useCallback(() => initial, [initial]),
  );

  const setValue = useCallback(
    (update: T | ((prev: T) => T)) => {
      const next =
        typeof update === "function"
          ? (update as (prev: T) => T)(snapshot(key, initial, validate))
          : update;
      writeJSON(key, next);
      cache.delete(key); // force the next snapshot to re-read and re-parse
      emit(key);
    },
    [key, initial, validate],
  );

  return [value, setValue, hydrated];
}

/** Shared validator for the two slug-list stores. */
export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((s) => typeof s === "string");

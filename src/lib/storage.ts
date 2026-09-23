// SSR-safe localStorage. Every accessor can throw: Safari private mode throws on
// write, blocked site-data throws on read. Both paths fall back rather than crash.

const PREFIX = "kpm:";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    // ponytail: no schema validation. JSON.parse of a hand-edited key can yield the
    // wrong shape; callers guard with Array.isArray where it matters. Add zod when
    // stored shapes get deep enough that a bad key can't be spotted by one check.
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked — the in-memory state is still correct,
    // it just won't survive a reload. Nothing useful to do here.
  }
}

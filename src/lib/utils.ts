/**
 * Shared pure helpers. No React, no DOM, no clock, no randomness —
 * everything here is safe to call from a Server Component and from a Client
 * Component and produce byte-identical output on both sides.
 */

/** Anything a conditional className expression can evaluate to. */
export type ClassValue = string | false | null | undefined;

/**
 * Join truthy class strings with a single space.
 * Deliberately not `clsx` — no new dependency, and we never need object/array
 * syntax. Conflicting Tailwind utilities are not merged (no `tailwind-merge`);
 * put the overriding class last, as Tailwind's own cascade already requires.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter((value): value is string => Boolean(value)).join(' ');
}

/**
 * Format an integer LKR amount as "LKR 12,500" (the exact format in §16).
 *
 * Manual grouping on purpose — NOT `Intl.NumberFormat`:
 * `Intl` output depends on the ICU locale data compiled into the runtime. A
 * slim Node build (`small-icu`) groups differently from the browser's full ICU,
 * so the server HTML and the client hydration pass can disagree on the very
 * same number and React throws a hydration mismatch. A regex has no such
 * dependency: identical string everywhere, forever.
 *
 * Prices are integers (no cents), so any fraction is a caller bug — we truncate
 * toward zero rather than render "LKR 12,500.4". Non-finite input degrades to
 * "LKR 0" instead of printing "LKR NaN" into the page.
 */
export function formatLKR(amount: number): string {
  if (!Number.isFinite(amount)) return 'LKR 0';

  // Math.trunc, not Math.round: 12500.9 is bad data, not a price of 12,501.
  // Clamped to the safe-integer range first: at 1e21 String() switches to
  // exponential notation ("1e+21"), which has no digit run for the regex to
  // group and would leak "LKR 1e+21" into the page.
  const whole = Math.trunc(
    Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, amount)),
  );
  const isNegative = whole < 0;
  // Math.abs AFTER trunc so the sign is handled once, and so "-0" prints as "0".
  const digits = String(Math.abs(whole));

  // Insert a comma at every position that has a multiple of 3 digits to its
  // right. The lookahead is non-consuming, so it never eats a digit, and
  // `(?=\d)` stops it firing before the first character of the string.
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return isNegative ? `LKR -${grouped}` : `LKR ${grouped}`;
}

/**
 * Whole days from `now` until `isoDate`, floored at 0.
 *
 * `now` is a PARAMETER, never `Date.now()` inside: a function that reads the
 * clock renders differently on the server than on the client (hydration
 * mismatch) and cannot be unit-tested. The caller — a Server Component or a
 * client effect — supplies the timestamp once and passes it down.
 *
 * `Math.ceil` so a release 0.2 days away still reads "1 day", never "0 days";
 * a date already past clamps to 0 rather than going negative.
 * An unparseable `isoDate` returns 0 (renders as "today"/"out now") instead of NaN.
 */
export function daysUntil(isoDate: string, now: number): number {
  const target = Date.parse(isoDate);
  if (Number.isNaN(target) || !Number.isFinite(now)) return 0;

  const MS_PER_DAY = 86_400_000;
  const days = Math.ceil((target - now) / MS_PER_DAY);
  return days > 0 ? days : 0;
}

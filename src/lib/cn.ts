/**
 * Compatibility re-export.
 *
 * `cn` now has a single implementation in `@/lib/utils` (per the domain-utils
 * change, which specifies cn + formatLKR + daysUntil living together). This
 * module stays so existing `@/lib/cn` imports keep working; it deliberately
 * holds no second copy of the logic — two `cn`s that drift is a real bug source.
 *
 * Prefer importing from `@/lib/utils` in new code.
 */
export type { ClassValue } from '@/lib/utils';
export { cn } from '@/lib/utils';

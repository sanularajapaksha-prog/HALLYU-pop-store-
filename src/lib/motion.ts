/**
 * Shared motion constants. Every animated component this phase pulls from
 * here instead of re-deriving durations/curves/speeds — keeps easing and
 * depth consistent across the site instead of every component inventing its
 * own numbers.
 */

/** Entrance easing (reveals, mount transitions) — matches Reveal.tsx today. */
export const SPRING_ENTER = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

/** State-change easing (hover, active, toggles) — snappier, no overshoot. */
export const SPRING_STATE = 'ease-[cubic-bezier(0.4,0,0.2,1)]';

/**
 * Named parallax speed tiers, as a multiplier on scroll delta. Components
 * pick a tier — never a raw number — so depth reads consistently everywhere
 * a ParallaxLayer is used. Values are deliberately subtle: this is a depth
 * cue, not a set piece. Keep additions inside 0.1–0.35.
 */
export const PARALLAX_SPEED = {
  subtle: 0.12,
  standard: 0.18,
  pronounced: 0.28,
} as const;

/** Per-item stagger step (ms) for grids/lists using Reveal's `delay` prop. */
export const STAGGER_MS = 60;

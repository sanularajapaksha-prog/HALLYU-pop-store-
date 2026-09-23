'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface UseParallaxOptions {
  /**
   * Multiplier applied to how far the element sits from viewport center.
   * This is a DEPTH CUE, not a set piece — keep it subtle. Conceptually
   * stay within 0.1–0.35 (see PARALLAX_SPEED tiers in @/lib/motion).
   * Default 0.15.
   */
  speed?: number;
  /** Skip all work and always return offset 0. Default false. */
  disabled?: boolean;
  /**
   * Allow parallax below the 768px breakpoint. Off by default: scroll-linked
   * transforms on touch scroll are a known jank/nausea source on phones.
   */
  mobile?: boolean;
}

export interface UseParallaxResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  /** translateY offset in px. 0 when idle, off-screen, disabled, or PRM. */
  offset: number;
}

const MOBILE_BREAKPOINT_PX = 768;

/**
 * Subtle, scroll-linked translateY offset for depth cues (hero art, banner
 * imagery, tile media). GPU-safe: returns a number only, the caller applies
 * it via `transform: translateY()`, never a layout property.
 *
 * Performance contract:
 * - No raw scroll listener runs while the element is far from the viewport.
 *   An IntersectionObserver (rootMargin 200px) gates a window scroll listener
 *   on/off.
 * - While gated on, the scroll listener never does work synchronously — it
 *   only flips a pending-rAF flag, so at most one offset computation happens
 *   per animation frame no matter how many scroll events fire.
 * - prefers-reduced-motion or `disabled: true` skips creating any observer or
 *   listener at all (not just skips applying the value) and pins offset 0.
 * - Below 768px width, parallax is off unless `mobile: true` is passed.
 * - SSR-safe: offset starts at 0, no window/DOM read during render.
 */
export function useParallax<T extends HTMLElement>(
  options: UseParallaxOptions = {},
): UseParallaxResult<T> {
  const { speed = 0.15, disabled = false, mobile = false } = options;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const skip = disabled || reducedMotion;

  // Keep the latest speed/mobile in refs so the effect below doesn't need to
  // tear down and rebuild the observer/listener when a caller passes a new
  // (but equal-in-spirit) options object on every render. Refs are synced in
  // their own effect (not during render) to satisfy react-hooks/refs.
  const speedRef = useRef(speed);
  const mobileRef = useRef(mobile);
  useEffect(() => {
    speedRef.current = speed;
    mobileRef.current = mobile;
  }, [speed, mobile]);

  useEffect(() => {
    // No observer/listener work while skipped. The returned `offset` is
    // already forced to 0 below whenever `skip` is true, so there is no
    // need to also push a setState from here — that would just be a second,
    // effect-driven write of a value the render output already derives.
    if (skip) return;

    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let scrollListenerAttached = false;
    let pendingFrame = false;
    let rafId = 0;

    const computeOffset = () => {
      pendingFrame = false;

      if (!mobileRef.current && window.innerWidth < MOBILE_BREAKPOINT_PX) {
        setOffset(0);
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      // Positive when the element is below viewport center, negative above —
      // the sign is what makes this read as depth (content trails/leads the
      // scroll slightly) rather than random jitter.
      const delta = elementCenter - viewportCenter;
      setOffset(delta * speedRef.current);
    };

    const onScroll = () => {
      if (pendingFrame) return;
      pendingFrame = true;
      rafId = window.requestAnimationFrame(computeOffset);
    };

    const attachScroll = () => {
      if (scrollListenerAttached) return;
      scrollListenerAttached = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      // Prime the offset immediately instead of waiting for the first
      // scroll/resize event once we know the element is near the viewport.
      onScroll();
    };

    const detachScroll = () => {
      if (!scrollListenerAttached) return;
      scrollListenerAttached = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (pendingFrame) {
        window.cancelAnimationFrame(rafId);
        pendingFrame = false;
      }
      setOffset(0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          attachScroll();
        } else {
          detachScroll();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      detachScroll();
    };
  }, [skip]);

  return { ref, offset: skip ? 0 : offset };
}

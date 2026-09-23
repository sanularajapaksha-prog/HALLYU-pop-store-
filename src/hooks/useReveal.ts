"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface UseRevealOptions {
  /** IntersectionObserver threshold. Default 0.15. */
  threshold?: number;
  /** Stop observing after the first reveal. Default true. */
  once?: boolean;
}

export interface UseRevealResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  isVisible: boolean;
}

/**
 * Scroll reveal driven purely by IntersectionObserver (never a scroll listener).
 * With prefers-reduced-motion set, isVisible is true immediately and no
 * observer is created at all.
 */
export function useReveal<T extends HTMLElement>(
  options: UseRevealOptions = {},
): UseRevealResult<T> {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const element = ref.current;
    if (!element) return;

    // No IntersectionObserver (very old browser / jsdom): the derived
    // `isVisible` below already falls back to visible, so bail out.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEntered(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setHasEntered(false);
          }
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, reducedMotion]);

  const canObserve = typeof IntersectionObserver !== "undefined";
  const isVisible = reducedMotion || !canObserve || hasEntered;

  return { ref, isVisible };
}

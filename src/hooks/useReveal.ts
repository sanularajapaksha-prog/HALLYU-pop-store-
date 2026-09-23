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

    // No IntersectionObserver (very old browser / jsdom): reveal rather than
    // leaving content stuck at opacity-0 forever. Deferred to a microtask
    // instead of set synchronously here, so it does not trip
    // react-hooks/set-state-in-effect (a synchronous effect-body setState can
    // cascade renders). Still client-only, so SSR and hydration stay in sync.
    if (typeof IntersectionObserver === "undefined") {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setHasEntered(true);
      });
      return () => {
        cancelled = true;
      };
    }

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

  // HYDRATION: this must not read anything that differs between server and
  // client. An earlier version derived `typeof IntersectionObserver !==
  // "undefined"` here, which made the server emit the revealed classes and the
  // client's first render emit the hidden ones — a mismatch on all 30 callers.
  // The no-IntersectionObserver fallback now lives in the effect above instead.
  const isVisible = reducedMotion || hasEntered;

  return { ref, isVisible };
}

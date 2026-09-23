"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";
import { SPRING_ENTER } from "@/lib/motion";

export interface RevealProps {
  children: ReactNode;
  /** Stagger delay in milliseconds. Default 0. */
  delay?: number;
  className?: string;
  as?: "div" | "section";
}

/**
 * Fade-up on viewport entry. GPU-safe: animates transform + opacity only.
 * Under prefers-reduced-motion nothing is transformed or transitioned.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={cn(
        // Named, not `transition-all`: these two are the only properties this
        // component ever drives, and `all` would also sweep up whatever the
        // `className` passthrough happens to transition on the same 700ms
        // entrance curve — a long duration that is right for a scroll reveal
        // and wrong for anything else.
        // SPRING_ENTER from the shared tokens, not a re-typed curve.
        //
        // No `motion-reduce:` classes here on purpose: the early return above
        // means this branch never renders under reduced motion, so those
        // utilities were unreachable. They also could not have worked — the
        // `transitionDelay` below is an inline style, which outranks any
        // class, so a reduced-motion user hitting this path would still have
        // waited out the stagger delay. Fully inert is handled by not
        // rendering the motion at all.
        `transition-[transform,opacity] duration-700 ${SPRING_ENTER}`,
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

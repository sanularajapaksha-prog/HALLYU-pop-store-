'use client';

import type { ReactNode } from 'react';
import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/lib/utils';

export interface ParallaxLayerProps {
  children: ReactNode;
  /** Multiplier on scroll delta. Prefer a PARALLAX_SPEED tier from @/lib/motion. */
  speed?: number;
  className?: string;
  /** Allow parallax below 768px width. Off by default (see useParallax). */
  mobile?: boolean;
}

/**
 * Declarative wrapper around useParallax. Renders a plain div at offset 0
 * (no transform, no will-change) whenever the offset is zero — idle,
 * off-screen, disabled, or prefers-reduced-motion — so no element carries a
 * needless compositor layer at rest.
 */
export function ParallaxLayer({ children, speed, className, mobile }: ParallaxLayerProps) {
  const { ref, offset } = useParallax<HTMLDivElement>({ speed, mobile });

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={
        offset
          ? { transform: `translateY(${offset}px)`, willChange: 'transform' }
          : undefined
      }
    >
      {children}
    </div>
  );
}

"use client";

import Image from "next/image";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { PARALLAX_SPEED } from "@/lib/motion";

export interface HeroBackgroundProps {
  imageSeed: string;
}

/**
 * Client-only split from Hero.tsx: ParallaxLayer needs "use client" for its
 * scroll tracking, but the rest of Hero (headline, CTA, Reveal entrances)
 * stays a Server Component. Only the background image layer moves — the
 * text content is untouched here and rendered separately by Hero.
 *
 * OVERSCAN — 8%, lighter than the two mid-page layers because this runs at the
 * `subtle` tier (0.12) AND starts at the top of the document, so it only ever
 * travels in one direction. Without it the translated layer pulls a band in at
 * the hero's bottom edge. The section has bg-foreground behind it so the band
 * would read dark rather than transparent, but it would still sit OUTSIDE the
 * scrim gradients (which are pinned to the section, not to this layer), so the
 * seam would be visible against the photograph.
 */
export function HeroBackground({ imageSeed }: HeroBackgroundProps) {
  return (
    <ParallaxLayer
      speed={PARALLAX_SPEED.subtle}
      className="absolute -inset-y-[8%] inset-x-0"
    >
      {/*
        LCP element: priority + sizes="100vw". Lazy-loading it would tank the
        metric. alt="" — the headline carries the meaning; narrating a
        decorative campaign crop would only add noise for a screen reader.
      */}
      <Image
        src={`https://picsum.photos/seed/${imageSeed}/1920/1200`}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </ParallaxLayer>
  );
}

export default HeroBackground;

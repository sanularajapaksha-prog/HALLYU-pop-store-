"use client";

import Image from "next/image";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { PARALLAX_SPEED } from "@/lib/motion";

export interface NewDropBackgroundProps {
  imageSeed: string;
}

/**
 * Client-only split from NewDrop.tsx, same reasoning as HeroBackground: only
 * the campaign image gets scroll-linked parallax; the overlaid copy/CTA stay
 * server-rendered and static.
 *
 * OVERSCAN — same correctness fix as EditorialBannerImage. At speed 0.18 a
 * mid-page element's offset passes 100px as it crosses the viewport, and a
 * layer pinned at inset-0 has no spare height to translate into, so it pulls a
 * transparent band in at one edge. Here the band would appear INSIDE the
 * double-bezel frame, which is the one place on the page where a stray edge is
 * most obvious. 12% vertical overscan, clipped by the frame's overflow-hidden.
 */
export function NewDropBackground({ imageSeed }: NewDropBackgroundProps) {
  return (
    <ParallaxLayer
      speed={PARALLAX_SPEED.standard}
      className="absolute -inset-y-[12%] inset-x-0"
    >
      <Image
        src={`https://picsum.photos/seed/${imageSeed}/1600/686`}
        alt=""
        fill
        sizes="(min-width: 1440px) 1344px, 100vw"
        className="object-cover"
      />
    </ParallaxLayer>
  );
}

export default NewDropBackground;

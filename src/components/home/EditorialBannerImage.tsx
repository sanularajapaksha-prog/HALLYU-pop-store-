"use client";

import Image from "next/image";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { PARALLAX_SPEED } from "@/lib/motion";

export interface EditorialBannerImageProps {
  imageSeed: string;
}

/**
 * Client-only split-out from EditorialBanner (a Server Component) so the
 * static copy column stays server-rendered — only the parallax image side
 * needs scroll tracking.
 *
 * OVERSCAN (-inset-y-[12%] rather than inset-0) — this is a correctness fix,
 * not a flourish. useParallax measures from viewport CENTER, so the offset it
 * returns is roughly (elementCenter - viewportCenter) * speed. For a plate this
 * size at speed 0.18, that reaches well over 100px by the time the section has
 * crossed the viewport. A layer pinned at inset-0 is exactly as tall as its
 * frame, so translating it that far pulls a transparent band in at one edge,
 * showing the frame's bg-foreground as a dark stripe across a light section.
 *
 * Extending the layer 12% past the frame top and bottom gives the translation
 * somewhere to travel. The parent already has overflow-hidden and a fixed
 * aspect ratio, so the extra height is clipped and no layout moves. Vertical
 * only — the motion is vertical, so horizontal overscan would just crop the
 * photograph for nothing.
 */
export function EditorialBannerImage({ imageSeed }: EditorialBannerImageProps) {
  return (
    <ParallaxLayer
      speed={PARALLAX_SPEED.standard}
      className="absolute -inset-y-[12%] inset-x-0"
    >
      <Image
        src={`https://picsum.photos/seed/${imageSeed}/800/1000`}
        alt=""
        fill
        sizes="(min-width: 768px) 40vw, 100vw"
        className="object-cover"
      />
    </ParallaxLayer>
  );
}

export default EditorialBannerImage;

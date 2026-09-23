import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialBannerImage } from "@/components/home/EditorialBannerImage";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export interface EditorialBannerProps {
  eyebrow?: string;
  title?: string;
  copy?: string;
  href?: string;
  imageSeed?: string;
  className?: string;
}

/**
 * §33 — Editorial / Collector. A text-led break between product grids.
 *
 * SPLIT layout, not an overlay: a portrait plate on one side, large display type
 * on the other. That is what makes it read as a magazine spread rather than an ad
 * banner — text over a darkened photo is the banner idiom §33 is meant to break up.
 *
 * bg-surface separates it from the white product sections either side. §9 prefers
 * background + spacing + borders over shadows for separation, so no drop shadow.
 */
export function EditorialBanner({
  eyebrow = "Editorial",
  title = "The Collector",
  copy = "Behind the album. Inclusion guides, pressing differences, and how to tell a real pull from a reprint.",
  href = ROUTES.editorial,
  imageSeed = "editorial-the-collector",
  className,
}: EditorialBannerProps) {
  return (
    <section
      aria-labelledby="editorial-heading"
      className={cn("bg-surface py-20 md:py-28", className)}
    >
      <Container>
        {/*
          Mobile: one column, image FIRST — a spread opens on the photograph, and
          it gives the eye an anchor before the type.
          Desktop: 12-col, image 5 / type 7. The asymmetry is deliberate; a 50/50
          split reads as a comparison table, not a spread.
          items-center optically centers the short type column against the tall
          4:5 plate instead of letting it hang off the top edge.
        */}
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          <Reveal className="md:col-span-5">
            {/* Craft rule 1 — DOUBLE-BEZEL. Outer p-1.5 (6px) inside rounded-xl (20px)
                leaves the inner core at rounded-lg (14px): 20 - 6 = 14, so the radii
                are genuinely concentric. That exactness is what reads as machined. */}
            <div className="rounded-xl bg-foreground/[0.03] p-1.5 ring-1 ring-foreground/5">
              {/* aspect-[4/5] is a real ratio box, so `fill` always has a sized
                  parent — the image can never collapse or depend on copy length. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                <EditorialBannerImage imageSeed={imageSeed} />
              </div>
            </div>
          </Reveal>

          {/* Staggered children: eyebrow -> heading -> copy -> CTA, 100ms apart.
              lg:pl-8 is the gutter of the spread — type does not start flush
              against the plate's edge. */}
          <div className="md:col-span-7 lg:pl-8">
            <Reveal delay={100}>
              <span className="inline-block rounded-pill border border-border px-3 py-1 text-micro uppercase tracking-[0.2em] text-muted">
                {eyebrow}
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h2
                id="editorial-heading"
                className="mt-6 max-w-[14ch] font-display text-display-md leading-[0.95] tracking-tight text-foreground"
              >
                {title}
              </h2>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-6 max-w-[38ch] text-body-lg text-muted">{copy}</p>
            </Reveal>

            {/* Secondary variant: §32's tertiary tier has no box, and this is an
                editorial aside — the violet primary belongs to the hero and the
                campaign block, per the "accent is RARE" direction. */}
            <Reveal delay={400}>
              <div className="mt-10">
                <Button href={href} variant="secondary" size="lg" withArrow>
                  Explore
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default EditorialBanner;

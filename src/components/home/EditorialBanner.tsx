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
 * TONE — this band is now the page background, not bg-surface, and that is the
 * fix for a real defect rather than a preference. The homepage runs
 * FanFavorites(surface) -> ComebackRadar(surface) -> EditorialBanner, and when
 * this section also painted surface the three merged into one undifferentiated
 * grey slab roughly a third of the page tall. Alternation that does not
 * alternate is not separation.
 *
 * Flipping THIS one (rather than one of the other two, whose tone lives in
 * files outside this change) is also the better call on the merits: the two
 * product-led bands above belong together as one chapter, and the editorial
 * break should be the thing that interrupts them. It now separates by content
 * and composition — a portrait plate, a 5/7 split, display type — instead of by
 * a background tint, which is the stronger separator anyway.
 *
 * §9 prefers background + spacing + borders over shadows, so still no drop shadow.
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
      className={cn("py-20 md:py-28", className)}
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
            {/*
              This is the ONE eyebrow left standing on the homepage, and it is
              the one that earns the space: it is the only signal that tells a
              scrolling visitor this band is a piece of writing rather than
              another product rail. Hero's and New Drop's were cut because their
              headlines already said it.

              It is a bare label, not a bordered pill. The pill treatment is what
              made eight identical stamps read as a template; stripped to a rule
              plus tracked caps it reads as a masthead kicker, which is what an
              editorial break actually wants. The hairline above it does the
              separating work the pill's border used to do, without boxing.
            */}
            <Reveal delay={100}>
              <span className="block border-t border-foreground/15 pt-4 text-micro uppercase tracking-[0.2em] text-muted">
                {eyebrow}
              </span>
            </Reveal>

            {/*
              max-w-[14ch] is removed: "The Collector" is 13 characters, so the
              measure never applied and was misleading to whoever edits the
              `title` prop next. The column width already governs the wrap.
            */}
            <Reveal delay={200}>
              <h2
                id="editorial-heading"
                className="mt-6 font-display text-display-md leading-[0.95] tracking-tight text-foreground"
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

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { NewDropBackground } from "@/components/home/NewDropBackground";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export interface NewDropProps {
  /** Collection name — the display-scale line inside the block. */
  title?: string;
  /** One line of supporting copy. Keep it to one line; §20 is a campaign, not a paragraph. */
  copy?: string;
  /**
   * CTA label. Names THIS block's destination — it must not repeat the hero's
   * "Shop now", or the page ships two identically-worded buttons pointing at
   * two different places.
   */
  cta?: string;
  href?: string;
  imageSeed?: string;
  className?: string;
}

/**
 * §20 — New Drop. A major campaign block, deliberately more editorial than a
 * product grid: one image, one name, one CTA, and a lot of air around it.
 *
 * py-24 md:py-28 — §7's major-campaign gap (96–120px). Wider than the standard
 * Section rhythm so this block separates the two product grids either side of it.
 */
export function NewDrop({
  title = "Nightfall Edition",
  copy = "A limited pressing, numbered by hand. Once it is gone, it is gone.",
  cta = "See the drop",
  href = ROUTES.category("albums"),
  imageSeed = "newdrop-nightfall",
  className,
}: NewDropProps) {
  return (
    <section aria-labelledby="newdrop-heading" className={cn("py-24 md:py-28", className)}>
      <Container>
        {/*
          The "NEW DROP" eyebrow pill that used to sit here is GONE, and that is
          a deliberate art-direction call, not an oversight.

          Two reasons. (1) Count: the homepage runs ten sections and was opening
          eight of them with the identical pill — same border, same 0.2em
          tracking, same micro caps. That repetition is what makes a page read as
          templated rather than art-directed; the eye stops seeing a label and
          starts seeing a rubber stamp. (2) Redundancy: this block IS the drop.
          A label announcing "New Drop" above a full-bleed campaign frame with a
          collection name in 56px display type tells the visitor nothing the
          composition has not already said louder.

          What replaces it is position and scale. This is the only section on the
          homepage that breaks the Container's white rhythm with a full-bleed
          cinematic frame — that break is the label.
        */}
        <Reveal>
          {/*
            Craft rule 1 — DOUBLE-BEZEL. Outer shell: faint surface, hairline ring,
            p-1.5 (6px), rounded-xl (20px). Inner core: rounded-lg (14px).
            20 - 6 = 14, so the two radii are truly concentric rather than
            approximately so — that concentricity is what reads as "machined".
          */}
          <div className="rounded-xl bg-foreground/[0.03] p-1.5 ring-1 ring-foreground/5">
            <div className="relative isolate overflow-hidden rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              {/*
                TRACED, not eyeballed — I computed frame height vs content height
                at 375/414/640/768/1024/1280/1440/1920.

                Below `sm` the ratio box LOSES: at 375px a 16/9 frame is only ~195px
                tall while the stack (24px*2 padding + 40px heading + copy + margins
                + 48px CTA) needs ~209px, so the copy escaped the scrim even with a
                ONE-line heading. Phones therefore get an explicit min-h-[360px] and
                no ratio; from `sm` up the ratio box wins and min-h is released.

                21/9 is the cinematic proportion that makes this read as a campaign
                rather than a banner ad — but it is gated at `lg`, NOT `md`, and that
                is load-bearing. At exactly 768px the `md` breakpoint also promotes
                the heading to 56px; a 21/9 frame there is only ~329px tall while the
                content stack (56px heading + copy + margins + 48px CTA + 96px of
                padding) needs ~290px, so a heading that wraps to two lines overflows
                the scrim. At `lg` (1024px+) the frame is ~439px and the stack clears
                comfortably. Tablets keep the taller 16/9 crop.
              */}
              <div className="relative min-h-[360px] w-full sm:min-h-0 sm:aspect-[16/9] lg:aspect-[21/9]">
                {/*
                  §20 parallax: image drifts against scroll, overlaid copy/CTA
                  below stays static. Client sub-component for the same
                  reason as Hero's HeroBackground — ParallaxLayer needs
                  "use client", NewDrop itself stays server-rendered.
                */}
                <NewDropBackground imageSeed={imageSeed} />

                {/* Scrim: heavier at the bottom-left where the copy lands, so the
                    right side of the photograph stays visible. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent"
                />

                {/* Copy block. p-6 -> p-12 so the text never crowds the bezel. */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12">
                  <h2
                    id="newdrop-heading"
                    className="max-w-[18ch] font-display text-display-lg leading-[0.95] tracking-tight text-white"
                  >
                    {title}
                  </h2>
                  <p className="mt-4 max-w-[46ch] text-body text-white/80">{copy}</p>
                  {/*
                    Was `variant="primary"` labelled "Shop now" — identical to the
                    hero's CTA. Two defects in one button. (1) Duplicate intent:
                    two buttons with the same words pointing at two different
                    destinations (/shop vs this collection) is the one case where
                    a repeated label actively misinforms. (2) Accent budget: the
                    direction says violet is RARE and reserved for the primary
                    CTA, and spending it twice above the fold-and-a-half is how
                    "everything purple" starts. The hero keeps the violet because
                    it is the page's single primary action.

                    `cta` names this block's own destination instead. On the dark
                    scrim the secondary variant's border/text both invert to
                    white, so contrast is stronger here than the violet fill was.
                  */}
                  <div className="mt-8">
                    {/*
                      The root override inverts border + label for the dark
                      scrim. The `[&>span]` rule reaches the arrow circle, whose
                      secondary fill is bg-foreground/5 — near-invisible on a
                      photograph. Overriding here rather than adding an "on-dark"
                      variant to Button: §32 caps the system at three variants,
                      and this is the only place on the site that puts a
                      secondary button on an image.
                    */}
                    <Button
                      href={href}
                      variant="secondary"
                      size="md"
                      withArrow
                      className="border-white/40 text-white hover:bg-white/10 [&>span]:bg-white/15"
                    >
                      {cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default NewDrop;

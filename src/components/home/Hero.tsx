import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroBackground } from "@/components/home/HeroBackground";
import { cn } from "@/lib/cn";

export interface HeroProps {
  /** Overrides the default campaign image seed. Deterministic per slug. */
  imageSeed?: string;
  className?: string;
}

/**
 * §14 — Homepage hero. Campaign, not a generic ecommerce banner.
 *
 * Height: §14 says desktop 680–760px, mobile 580–680px -> min-h-[620px] md:min-h-[720px].
 * min-h, never h-screen/100vh: on iOS Safari the URL bar collapse changes vh
 * mid-scroll and the hero visibly jumps. min-h (not a fixed h) also lets the box
 * grow instead of overflowing when a user runs large text zoom.
 *
 * §14's rules are SUBTRACTIVE: one headline, one primary CTA, minimal clutter.
 * No stats row, no secondary CTA, no scroll cue, no badges. Resist adding them —
 * a second CTA here splits the intent §14 exists to focus.
 */
export function Hero({ imageSeed = "hero-new-era", className }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        // bg-foreground under the image so the scrim/text never flash against
        // white in the moment before the photograph paints.
        "relative isolate flex min-h-[620px] items-end overflow-hidden bg-foreground md:min-h-[720px]",
        className,
      )}
    >
      {/*
        Background layer only — parallax (§14): the image drifts slightly
        slower than the page scroll while the text below stays static, a
        classic restrained depth cue. Split into a client sub-component
        because ParallaxLayer needs "use client" for scroll tracking; Hero
        itself stays a Server Component so the headline/CTA still render on
        the server. LCP-critical (priority + sizes="100vw") image lives there.
      */}
      <HeroBackground imageSeed={imageSeed} />

      {/*
        Scrim, two layers each doing one job:
        1. Vertical gradient — legibility for the copy sitting at the bottom.
        2. A dedicated top band — the navbar renders transparent-white OVER this
           hero on "/", so the top ~160px must stay dark no matter how bright the
           photo crops. The main gradient tops out too light to guarantee that on
           a pale image, which is exactly when white nav text becomes unreadable.
        Both aria-hidden and non-interactive, so neither can intercept a click.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/50"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-foreground/60 to-transparent"
      />

      {/*
        Left-aligned reads editorial; centered reads "generic ecommerce banner".
        items-end bottom-weights the copy onto the photo's horizon rather than
        floating it mid-frame.
      */}
      {/*
        pt-32 / md:pt-40 reads like it breaks the "hero top padding caps at
        pt-24" rule, and it does not. That rule exists to stop hero COPY from
        floating halfway down the viewport. This hero is items-end: the copy is
        anchored to the bottom edge, and the top padding is purely clearance for
        the sticky navbar (h-16 + mt-4 = 80px) and the announcement bar above
        it, which render transparent OVER this section on "/". Cutting it to
        pt-24 would not move the copy at all on any viewport tall enough to hit
        min-h; on a short viewport it would let the headline slide under the nav.
        Verified against the nav's own measurements, not assumed.
      */}
      <Container className="relative z-10 pb-20 pt-32 md:pb-24 md:pt-40">
        <div className="max-w-[46rem]">
          {/*
            The "New era" eyebrow pill that sat above this headline is GONE.

            It was saying the same thing as the headline in a quieter voice.
            "New era" above "The comeback is here." is one idea printed twice,
            and the pill version is the weaker of the two. Cutting it does three
            things: the headline lands first with nothing softening it, the whole
            stack drops to three elements so the copy sits lower on the
            photograph's horizon, and the homepage loses the eighth instance of a
            border-pill micro-label that had become the page's default gesture.

            The stagger re-times to 0/100/200 accordingly.
          */}

          {/*
            max-w-[16ch] forces a deliberate 2–3 line block instead of one long
            ribbon on a wide monitor; leading-[0.95] tightens the display stack so
            those lines read as a single typographic mass. No hard <br/> — the
            measure does the breaking, so it stays correct at every viewport.
          */}
          <Reveal>
            <h1
              id="hero-heading"
              className="max-w-[16ch] font-display text-display-xl leading-[0.95] tracking-tight text-white"
            >
              The comeback is here.
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-6 max-w-[42ch] text-body-lg text-white/80">
              New albums. New memories. Official releases and collector-grade
              merch, delivered across Sri Lanka.
            </p>
          </Reveal>

          {/* §14: exactly ONE primary CTA. */}
          <Reveal delay={200}>
            <div className="mt-10">
              <Button href="/shop" variant="primary" size="lg" withArrow>
                Shop now
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export default Hero;

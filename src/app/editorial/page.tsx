import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { EditorialBannerImage } from "@/components/home/EditorialBannerImage";

export const metadata: Metadata = {
  title: "The Collector",
  description:
    "Inclusion guides, pressing differences, and how to tell a real pull from a reprint.",
};

/**
 * Each entry carries a `standfirst` — the one-line summary a magazine prints
 * under a headline. It is what lets a reader scan four pieces and pick one
 * without reading four paragraphs, which is the actual job of this page.
 */
const ARTICLES = [
  {
    title: "What's actually inside an album",
    standfirst: "Photobook, photocard, poster. What each tier adds.",
    body: "Standard pressings ship with a photobook, a random member photocard, and a folded poster on request. Deluxe and limited editions add extras: a second photocard, a mini poster, or a numbered certificate. Each one is listed under \"What's Included\" on the product page before you buy.",
  },
  {
    title: "Pressing differences, explained",
    standfirst: "Same album, different version, different contents.",
    body: "The same album can ship in different versions, such as a standard jewel-case pressing versus a boxed limited edition, each with different photobooks, inclusions and sometimes a different track listing. Always check the version name on the product page, since photocards and inclusions differ between them.",
  },
  {
    title: "Spotting a real pull vs. a reprint",
    standfirst: "Print quality, registration, and where to buy.",
    body: "Official photocards have consistent print quality, sharp registration and no color shift versus the source photo. Reprints tend to run slightly duller, with visible dot-matrix texture under close light. The surest way to avoid the question entirely is to buy from official distributors and label-authorized sellers, which is all we stock.",
  },
  {
    title: "Caring for your collection",
    standfirst: "Sleeves, sunlight, and how to shelve a jewel case.",
    body: "Keep photocards in a rigid sleeve, out of direct sunlight, to prevent fading and corner wear. Store albums upright rather than flat to avoid warping the jewel case over time.",
  },
];

/**
 * §33 — The Collector. A reading surface, not a product surface.
 *
 * ART DIRECTION, and why it is not the page that was here before.
 *
 * The incumbent was a centred `max-w-2xl` column holding four identical
 * heading+paragraph pairs under a generic PageHeader with an eyebrow pill. Four
 * identical blocks in a centred column is the shape of a FAQ, and a FAQ is what
 * it read as. The content is genuinely editorial — it is the one place on the
 * site that argues for the brand's "digital home for collectors" positioning
 * rather than selling — so the layout should be the one place that looks like a
 * magazine rather than an interface.
 *
 * Three moves, each of which had to earn itself:
 *
 * 1. MASTHEAD, not PageHeader. PageHeader is the correct component for /shop,
 *    /artists, /drops — it makes interior pages consistent. This page is the
 *    exception the consistency is worth breaking for: it gets a portrait plate
 *    beside the title, so the reader arrives at a spread. It also drops
 *    PageHeader's eyebrow pill, which was the eighth copy of the same stamp
 *    across the site.
 *
 * 2. ASYMMETRIC ROWS, not a centred stack. Each article becomes a 12-column row:
 *    title + standfirst in the left 5, body in the right 6. The hierarchy device
 *    is the title's own scale and the white gutter between the columns — NOT a
 *    number. Numbered entries were considered and rejected: enumerating four
 *    items the reader can count is decoration, and it is a known templated
 *    gesture. A hairline above each row does the separating work instead.
 *
 * 3. STANDFIRSTS. Added one line per article so the page is scannable. This is
 *    new copy describing content that already exists on the page — no new
 *    claims, no invented facts.
 *
 * Deliberately NOT here: per-article thumbnail images (four decorative crops
 * would make this a card grid, which is the thing it is escaping), a reading
 * time, a byline, a date. None are backed by real data in src/lib.
 */
export default function EditorialPage() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "The Collector", href: "/editorial" },
          ]}
        />
      </Container>

      {/* MASTHEAD. bg-surface tints the opening spread against the white of the
          articles below, so the fold reads as a cover rather than as the first
          of five equal bands. §9 separates with background + spacing, not shadow. */}
      <header className="bg-surface py-16 md:py-24">
        <Container>
          {/* Type 7 / plate 5, and the plate is SECOND on desktop — the reverse
              of EditorialBanner's image-left spread, so the homepage teaser and
              the page it opens are not the same composition twice. On mobile the
              plate leads, giving the eye an anchor before the type. */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="md:col-span-7 md:order-1">
              <Reveal>
                <h1 className="font-display text-display-lg leading-[0.95] tracking-tight text-foreground">
                  The Collector
                </h1>
              </Reveal>

              <Reveal delay={100}>
                <p className="mt-6 max-w-[40ch] text-body-lg text-muted">
                  Behind the album. Inclusion guides, pressing differences, and
                  how to tell a real pull from a reprint.
                </p>
              </Reveal>
            </div>

            {/* Double-bezel, matching EditorialBanner exactly: outer p-1.5 (6px)
                inside rounded-xl (20px) leaves the core at rounded-lg (14px), so
                20 - 6 = 14 and the radii are truly concentric. Reusing the
                existing EditorialBannerImage rather than writing a second
                parallax image wrapper — same job, same speed tier. */}
            <Reveal delay={200} className="md:col-span-5 md:order-2">
              <div className="rounded-xl bg-foreground/[0.03] p-1.5 ring-1 ring-foreground/5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                  <EditorialBannerImage imageSeed="editorial-collector-masthead" />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </header>

      <Container className="py-20 md:py-28">
        {/*
          `<article>` per entry, inside a plain div — these are siblings of equal
          rank, so no list semantics are implied that a screen reader would then
          have to enumerate.

          space-y-16 md:space-y-20 sits inside §7's 64–96px band. The hairline is
          `border-t` on each row (not top AND bottom), so the rule reads as a
          separator between pieces rather than as a boxed table row.
        */}
        <div className="mx-auto max-w-5xl space-y-16 md:space-y-20">
          {ARTICLES.map((article, i) => (
            <Reveal key={article.title} delay={Math.min(i, 4) * 60}>
              <article className="grid grid-cols-1 gap-6 border-t border-foreground/10 pt-10 md:grid-cols-12 md:gap-12">
                {/* Left 5: the title carries the hierarchy at heading-lg against
                    the body's text-body. No number, no label, no icon. */}
                <div className="md:col-span-5">
                  <h2 className="font-display text-heading-lg leading-[1.1] tracking-tight text-foreground">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-[32ch] text-body-sm text-muted">
                    {article.standfirst}
                  </p>
                </div>

                {/* Right 6 with a 1-column gutter (col-start-7 spans 6 of 12):
                    the empty column is the spread's gutter, and it is what keeps
                    two text blocks from reading as a comparison table. */}
                <div className="md:col-span-6 md:col-start-7">
                  <p className="max-w-[62ch] text-body text-muted">{article.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Secondary variant: the violet primary belongs to the buying path, and
            this is the exit from a reading page back into the catalogue. */}
        <Reveal delay={280} className="mt-20 flex justify-center">
          <Button href="/shop" variant="secondary" size="lg" withArrow>
            Shop the catalogue
          </Button>
        </Reveal>
      </Container>
    </>
  );
}

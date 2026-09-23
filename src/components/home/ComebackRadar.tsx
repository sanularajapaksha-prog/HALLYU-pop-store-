import { ComebackCard, type ComebackCardComeback } from "./ComebackCard";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getArtistById } from "@/lib/artists";
import { comebacks } from "@/lib/comebacks";

const STAGGER_MS = 80;

/**
 * §21 — the signature feature. "Create urgency without being spammy."
 *
 * PRESENCE comes from the band, not from decoration: `tone="surface"` lifts the
 * whole section off the white product grids above and below it, so the radar
 * reads as its own chapter. §9 explicitly prefers background + spacing +
 * borders over shadows, and the brief's "premium restraint" direction rules out
 * the obvious alternative (an inverted dark band) — inverting would force every
 * child, including ComebackCard's own double-bezel and its accent CTA, to be
 * re-checked for contrast, and any child that missed the memo would fail WCAG
 * silently. bg-surface keeps every existing token contrast-valid unchanged.
 *
 * NOTE FOR WHOEVER EDITS THIS NEXT: the <Section> wrapper is load-bearing, not
 * decoration. A previous revision of this file rendered a bare <div> grid, which
 * silently dropped the surface band, the eyebrow, the §21 title and the
 * subtitle, and left the radar visually identical to the product grids it is
 * supposed to stand apart from. Keep the Section.
 */
export function ComebackRadar() {
  /*
   * The seed `Comeback` record has no `artistName` — only `artistId` — so the
   * join happens here, in a Server Component, exactly once per card.
   * ComebackCard is a client component; making it look the name up itself would
   * pull the artists module across the boundary for one string.
   */
  const items: ComebackCardComeback[] = comebacks.map((comeback) => ({
    artistName: getArtistById(comeback.artistId)?.name ?? "Unknown artist",
    title: comeback.title,
    releaseDate: comeback.releaseDate,
    coverImage: comeback.coverImage,
    productSlug: comeback.productSlug,
    /*
     * `action` is left undefined on purpose. ComebackCard derives it from
     * `productSlug` (present -> PRE-ORDER, absent -> NOTIFY), which is the
     * truthful reading: you cannot pre-order something with no product record.
     * Hardcoding "PRE-ORDER" here would offer a pre-order that links nowhere.
     */
  }));

  if (items.length === 0) return null;

  return (
    <Section id="comeback-radar" tone="surface" eyebrow="Upcoming" title="Comeback Radar">
      {/*
        §21's subtitle. Section has no `subtitle` prop and adding one would mean
        editing a shared primitive for a single caller, so it lives at the top of
        the children with a negative top margin that pulls it up under the
        heading — visually part of the header block, structurally not.
      */}
      <Reveal className="-mt-6 mb-10 md:-mt-10 md:mb-14">
        <p className="max-w-prose text-body text-muted">
          Upcoming releases. Pre-order the moment they open, or get told the second they do.
        </p>
      </Reveal>

      {/*
        Mobile is a snap-scroller, not a stacked column: five full-width cards
        stacked would be a ~5-screen wall of countdowns, which is precisely the
        "spammy" failure §21 warns against. Horizontal keeps the whole radar to
        one screen. From md up it becomes a real 3-column grid.

        `snap-x` + per-item `snap-start` only; no scroll library and no JS.
        -mx-4 px-4 lets cards bleed to the true screen edge while the first card
        still lines up with the Container gutter.
      */}
      <ul
        className={[
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0",
        ].join(" ")}
      >
        {items.map((comeback, index) => (
          <li
            key={comebacks[index].id}
            // Fixed basis on mobile so the next card peeks in and the row is
            // visibly scrollable; auto once it is a grid cell.
            className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto md:shrink"
          >
            <Reveal delay={index * STAGGER_MS} className="h-full">
              {/* h-full so every card in a row matches height regardless of title length. */}
              <ComebackCard comeback={comeback} className="h-full" />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default ComebackRadar;

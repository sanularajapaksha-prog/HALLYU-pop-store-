"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { useClientNow } from "@/hooks/useClientNow";
import { PARALLAX_SPEED, SPRING_STATE } from "@/lib/motion";
import { ROUTES } from "@/lib/routes";
import { cn, daysUntil } from "@/lib/utils";

export type ComebackCardAction = "PRE-ORDER" | "NOTIFY" | "VIEW";

/** Structural — see ArtistCard for why this is not an import of `@/types/comeback`. */
export interface ComebackCardComeback {
  artistName: string;
  title: string;
  /** ISO string. Parsed only once a client timestamp exists — see the countdown below. */
  releaseDate: string;
  coverImage: string;
  productSlug?: string;
  /** Optional: derived from `productSlug` when the seed data omits it. */
  action?: ComebackCardAction;
}

export interface ComebackCardProps {
  comeback: ComebackCardComeback;
  className?: string;
}

const ACTION_LABEL: Record<ComebackCardAction, string> = {
  "PRE-ORDER": "Pre-order",
  NOTIFY: "Notify me",
  VIEW: "View release",
};

export function ComebackCard({ comeback, className }: ComebackCardProps) {
  /**
   * COUNTDOWN CORRECTNESS.
   *
   * Rendering the real count during SSR would bake the SERVER's clock into the
   * HTML; the client then computes a different number at hydration and React
   * throws a mismatch. So `useClientNow()` returns null for the server render AND
   * for the first client render — both emit the same placeholder — and the real
   * count appears on the re-render that follows. `null` therefore means "not
   * measured yet", never "zero days".
   *
   * The clock is read through `useClientNow()` — see that hook for why neither
   * useState+useEffect nor an inline Date.now() is allowed here. This component
   * never touches Date.now() itself, which keeps its render pure: same props +
   * same `now` always produce the same markup.
   */
  const now = useClientNow();
  const days = now === null ? null : daysUntil(comeback.releaseDate, now);

  // daysUntil floors at 0, so 0 means the date has arrived or passed.
  const isOut = days === 0;
  const action: ComebackCardAction =
    comeback.action ?? (comeback.productSlug !== undefined ? "PRE-ORDER" : "NOTIFY");
  const href =
    comeback.productSlug !== undefined ? ROUTES.product(comeback.productSlug) : undefined;

  return (
    // Craft rule 1: double-bezel.
    <article
      className={cn(
        "rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5",
        `transition-[transform,box-shadow] duration-300 ${SPRING_STATE}`,
        "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        // The card is an <article>, not a link: the only focusable thing inside
        // is the action Button, so focus-within is the hook that makes
        // keyboarding into it lift exactly like hover — same pattern as
        // ProductCard, whose interactive parts are also nested.
        "focus-within:-translate-y-0.5 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        "motion-reduce:transition-none motion-reduce:hover:transform-none",
        "motion-reduce:focus-within:transform-none",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-5 rounded-lg bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
            {/* Parallax touches only this decorative thumbnail — the countdown
                number and action button below stay untransformed and stable. */}
            <ParallaxLayer speed={PARALLAX_SPEED.subtle} className="absolute inset-0">
              <Image
                src={comeback.coverImage}
                // Decorative: the title beside it is the real content.
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </ParallaxLayer>
          </div>
          <div className="min-w-0">
            <p className="text-caption text-muted uppercase tracking-[0.2em]">{comeback.artistName}</p>
            <h3 className="text-heading-sm font-display text-foreground">{comeback.title}</h3>
          </div>
        </div>

        {/*
          §21: urgency WITHOUT spam. The number is large because it is the
          information, not because it is shouting — no red, no pulse, no
          "HURRY". Restraint is the brief.

          aria-live="polite" so the count is announced once it resolves, rather
          than a screen reader being stuck on the placeholder em-dash forever.
        */}
        <div className="mt-auto" aria-live="polite">
          {days === null ? (
            // Placeholder occupies the SAME box as the real number (same type
            // class, same two-line stack), so filling it in causes no layout
            // shift. An em-dash reads as "not known yet", not as "0".
            <>
              <p className="text-display-md font-display text-muted" aria-hidden="true">
                &mdash;
              </p>
              <p className="text-caption text-muted uppercase tracking-[0.2em]">Days</p>
              <span className="sr-only">Release countdown loading</span>
            </>
          ) : isOut ? (
            <p className="text-heading-md font-display text-foreground">Out now</p>
          ) : (
            <>
              <p className="text-display-md font-display text-foreground">{days}</p>
              <p className="text-caption text-muted uppercase tracking-[0.2em]">
                {/* "1 DAY", not "1 DAYS". */}
                {days === 1 ? "Day" : "Days"}
              </p>
            </>
          )}
        </div>

        <Button
          variant={action === "PRE-ORDER" ? "primary" : "secondary"}
          size="sm"
          href={href}
          withArrow
          className="w-full"
        >
          {/* Once it is out, "Pre-order" is a lie — fall back to viewing it. */}
          {isOut && action === "PRE-ORDER" ? ACTION_LABEL.VIEW : ACTION_LABEL[action]}
        </Button>
      </div>
    </article>
  );
}

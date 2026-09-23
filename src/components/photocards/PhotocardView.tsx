"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/layout/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import {
  EMPTY_SELECTION,
  PHOTOCARD_STEPS,
  STEP_LABELS,
  countSelected,
  filterPhotocards,
  optionsFor,
  selectStep,
  selectionToParams,
  type FacetOption,
  type PhotocardSelection,
  type PhotocardStep,
} from "@/lib/photocards";
import type { Product } from "@/types/product";

const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 60;
const PRIORITY_CARDS = 4;

export interface PhotocardViewProps {
  photocards: Product[];
  /** artistId -> display name, resolved on the server so this stays a leaf. */
  artistNames: Record<string, string>;
  initialSelection: PhotocardSelection;
}

/** Craft rule 8: ultra-light icon, stroke 1.25, currentColor, aria-hidden. */
function CardsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="4" width="11" height="15" rx="2" />
      <path d="M15 19v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

interface RungProps {
  step: PhotocardStep;
  index: number;
  options: FacetOption[];
  selected: string;
  locked: boolean;
  onSelect: (value: string) => void;
}

/**
 * One rung of the §23 ladder. A locked rung stays VISIBLE but disabled rather
 * than unmounting: a control that appears out of nowhere is disorienting, and
 * the greyed row tells you what answering the rung above will unlock.
 */
function Rung({ step, index, options, selected, locked, onSelect }: RungProps) {
  const groupId = `photocard-rung-${step}`;

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        locked && "pointer-events-none opacity-40",
      )}
    >
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-display text-caption tabular-nums text-muted"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 id={groupId} className="text-caption uppercase tracking-[0.18em] text-muted">
          {STEP_LABELS[step]}
        </h2>
        {locked && (
          <span className="text-micro uppercase tracking-[0.18em] text-muted/70">
            pick {STEP_LABELS[PHOTOCARD_STEPS[index - 1]].toLowerCase()} first
          </span>
        )}
      </div>

      <div
        role="group"
        aria-labelledby={groupId}
        className="mt-3 flex flex-wrap gap-2"
      >
        {options.length === 0 && !locked ? (
          <p className="text-body-sm text-muted">No options at this step.</p>
        ) : (
          options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <button
                key={option.value}
                type="button"
                disabled={locked}
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? "" : option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-body-sm",
                  "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:transform-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isSelected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-background text-foreground hover:border-foreground/25",
                )}
              >
                {isSelected && <CheckIcon />}
                <span>{option.label}</span>
                <span
                  className={cn(
                    "tabular-nums text-micro",
                    isSelected ? "text-white/70" : "text-muted",
                  )}
                >
                  {option.count}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * §23 — the photocard finder. A guided drill-down (Artist -> Album -> Type ->
 * Member), not the flat §27 filter wall: each answer narrows the next rung's
 * options and clears everything below it, so you can never build a combination
 * that returns nothing.
 *
 * ponytail: the URL is a WRITE-only mirror, matching ShopView. Reading
 * useSearchParams back would make every click a round trip and let a stale
 * render fight the next one; the page seeds us once from server-parsed params.
 */
export function PhotocardView({
  photocards,
  artistNames,
  initialSelection,
}: PhotocardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selection, setSelectionState] = useState<PhotocardSelection>(initialSelection);

  const commit = useCallback(
    (next: PhotocardSelection) => {
      setSelectionState(next);
      const query = new URLSearchParams(selectionToParams(next)).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const reset = useCallback(() => commit(EMPTY_SELECTION), [commit]);

  const visible = filterPhotocards(photocards, selection);
  const selectedCount = countSelected(selection);

  const labelFor = (step: PhotocardStep) => (value: string) =>
    step === "artist" ? (artistNames[value] ?? value) : value;

  return (
    <Container className="pb-20 md:pb-28">
      {/* Craft rule 1: DOUBLE-BEZEL. Outer 20px radius, p-1.5 (6px) -> inner 14px. */}
      <Reveal>
        <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
          <div className="rounded-lg bg-background p-5 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="text-caption uppercase tracking-[0.18em] text-muted">
                Narrow it down
              </p>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-sm text-caption uppercase tracking-[0.18em] text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mt-6 space-y-7">
              {PHOTOCARD_STEPS.map((step, index) => {
                // A rung unlocks once every rung above it is answered.
                const locked =
                  index > 0 &&
                  PHOTOCARD_STEPS.slice(0, index).some((parent) => selection[parent] === "");

                return (
                  <Rung
                    key={step}
                    step={step}
                    index={index}
                    options={
                      locked ? [] : optionsFor(photocards, selection, step, labelFor(step))
                    }
                    selected={selection[step]}
                    locked={locked}
                    onSelect={(value) => commit(selectStep(selection, step, value))}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      <p aria-live="polite" className="mt-8 text-body-sm text-muted tabular-nums">
        {visible.length} {visible.length === 1 ? "photocard" : "photocards"}
        {selectedCount > 0 ? " match your drill-down" : " in the marketplace"}
      </p>

      {visible.length === 0 ? (
        // ponytail: EmptyState's action is href-only by design, and a reset
        // here must clear client state without a page load — so the Reset
        // control is rendered below it as a real <Button onClick>.
        <EmptyState
          icon={<CardsIcon />}
          title={
            selectedCount > 0 ? "Nothing at the end of that path" : "No photocards listed yet"
          }
          description={
            selectedCount > 0
              ? "No photocard matches every step you picked. Reset the drill-down and start from a different artist."
              : "The photocard marketplace is restocking. Browse the rest of the catalogue in the meantime."
          }
          action={selectedCount > 0 ? undefined : { label: "SHOP ALL", href: "/shop" }}
        />
      ) : (
        <ProductGrid className="mt-6 md:mt-8">
          {visible.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}>
              <ProductCard
                product={product}
                artistName={artistNames[product.artistId] ?? "Unknown artist"}
                priority={index < PRIORITY_CARDS}
              />
            </Reveal>
          ))}
        </ProductGrid>
      )}

      {/* Only when a drill-down caused the emptiness — with an empty catalogue
          there is nothing to reset TO, and the button would be a dead end. */}
      {visible.length === 0 && selectedCount > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={reset}>
            RESET DRILL-DOWN
          </Button>
        </div>
      )}
    </Container>
  );
}

export default PhotocardView;

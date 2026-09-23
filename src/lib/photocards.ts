// §23 — photocard facet derivation. Pure, no React, no clock, no randomness.
//
// The §23 spec asks for Artist / Group / Member / Era / Album / Version / Type /
// Condition. The mock Product model carries none of those fields, and the four
// seed photocards have no variants at all, so most of that list cannot be
// honestly derived. What IS derivable, from the product NAME:
//
//   Album   — the name's head, before the " Photocard" marker  ("Proof", "BORN PINK")
//   Member  — the em-dash suffix, when it names a person       ("Winter")
//   Type    — Set vs Single, plus the POB marker               ("Full Set", "POB Exclusive")
//
// Deferred (NOT rendered as empty groups — see DEFERRED_FACETS): Group (the
// Artist facet already is the group), Era, Version, Condition. They need real
// product fields; faking them would ship filters that filter nothing.

import type { Product } from "@/types/product";

/** Facets §23 names that this data model genuinely cannot support yet. */
export const DEFERRED_FACETS = ["Group", "Era", "Version", "Condition"] as const;

export interface PhotocardFacets {
  album: string;
  /** Empty when the product is a full set rather than one member's card. */
  member: string;
  type: string;
}

/** The drill-down rungs, in §23 order, minus the ones with no data. */
export type PhotocardStep = "artist" | "album" | "type" | "member";

export const PHOTOCARD_STEPS: readonly PhotocardStep[] = [
  "artist",
  "album",
  "type",
  "member",
] as const;

export const STEP_LABELS: Record<PhotocardStep, string> = {
  artist: "Artist",
  album: "Album",
  type: "Type",
  member: "Member",
};

export type PhotocardSelection = Record<PhotocardStep, string>;

export const EMPTY_SELECTION: PhotocardSelection = {
  artist: "",
  album: "",
  type: "",
  member: "",
};

/**
 * Everything before an em dash is the album/era title; everything after it is
 * the member or set qualifier.
 *
 * "Proof Photocard Set — Full Member"  -> head "Proof Photocard Set", suffix "Full Member"
 * "aespa POB Photocard — Winter"       -> head "aespa POB Photocard",  suffix "Winter"
 * "BORN PINK Photocard Set"            -> head "BORN PINK Photocard Set", suffix ""
 */
function splitName(name: string): { head: string; suffix: string } {
  const [beforeDash, ...rest] = name.split("—");
  return { head: beforeDash.trim(), suffix: rest.join("—").trim() };
}

/**
 * A suffix names a MEMBER only when it is a short proper noun. "Full Member"
 * and "Full Set" describe the set, not a person, so they are excluded by name
 * rather than by guessing at capitalisation.
 */
const NON_MEMBER_SUFFIXES = new Set(["full member", "full set", "all members", "complete set"]);

function memberFrom(suffix: string): string {
  if (suffix === "") return "";
  if (NON_MEMBER_SUFFIXES.has(suffix.toLowerCase())) return "";
  // A member name is 1-3 words; anything longer is a description, not a person.
  if (suffix.split(/\s+/).length > 3) return "";
  return suffix;
}

export function facetsOf(product: Product): PhotocardFacets {
  const { head, suffix } = splitName(product.name);

  // Strip the marker word and anything after it: the album is what precedes it.
  const album = head.replace(/\s*Photocards?\b.*$/i, "").trim() || head;

  const isPob = /\bPOB\b/i.test(product.name);
  const isSet = /\bSet\b/i.test(product.name) || NON_MEMBER_SUFFIXES.has(suffix.toLowerCase());

  let type: string;
  if (isPob) type = "POB Exclusive";
  else if (isSet) type = "Full Set";
  else type = "Single Card";

  return { album, member: memberFrom(suffix), type };
}

function valueOf(product: Product, step: PhotocardStep): string {
  if (step === "artist") return product.artistId;
  return facetsOf(product)[step];
}

/**
 * True when the product satisfies every selection ABOVE `step` on the ladder.
 * Used to count a rung's options against its parents only, so picking an album
 * can never leave you looking at a type that yields nothing.
 */
export function matchesUpTo(
  product: Product,
  selection: PhotocardSelection,
  step: PhotocardStep,
): boolean {
  const rank = PHOTOCARD_STEPS.indexOf(step);
  for (let i = 0; i < rank; i += 1) {
    const parent = PHOTOCARD_STEPS[i];
    const chosen = selection[parent];
    if (chosen === "") continue;
    if (valueOf(product, parent) !== chosen) return false;
  }
  return true;
}

/** Products matching the FULL selection — what the grid renders. */
export function filterPhotocards(
  photocards: Product[],
  selection: PhotocardSelection,
): Product[] {
  return photocards.filter((product) =>
    PHOTOCARD_STEPS.every(
      (step) => selection[step] === "" || valueOf(product, step) === selection[step],
    ),
  );
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Options for one rung, counted against the rungs above it only. Sorted by
 * label so the order is stable across renders. A currently-selected value is
 * always included even at count 0, so a stale URL value stays removable.
 */
export function optionsFor(
  photocards: Product[],
  selection: PhotocardSelection,
  step: PhotocardStep,
  labelOf: (value: string) => string,
): FacetOption[] {
  const counts = new Map<string, number>();
  for (const product of photocards) {
    if (!matchesUpTo(product, selection, step)) continue;
    const value = valueOf(product, step);
    // A full set has no member — it must not become a blank filter chip.
    if (value === "") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const chosen = selection[step];
  if (chosen !== "" && !counts.has(chosen)) counts.set(chosen, 0);

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: labelOf(value), count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Sets one rung and clears every rung BELOW it. Choosing a new artist must not
 * leave the previous artist's album selected — that combination yields zero
 * results and reads as a broken page.
 */
export function selectStep(
  selection: PhotocardSelection,
  step: PhotocardStep,
  value: string,
): PhotocardSelection {
  const next: PhotocardSelection = { ...selection, [step]: value };
  for (let i = PHOTOCARD_STEPS.indexOf(step) + 1; i < PHOTOCARD_STEPS.length; i += 1) {
    next[PHOTOCARD_STEPS[i]] = "";
  }
  return next;
}

export function countSelected(selection: PhotocardSelection): number {
  return PHOTOCARD_STEPS.filter((step) => selection[step] !== "").length;
}

function firstString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

/**
 * Reads the ladder top-down and stops at the first unset rung: a URL naming an
 * album but no artist would otherwise render a drill-down with an active filter
 * the user can see no control for.
 */
export function parseSelectionFromParams(
  params: Record<string, string | string[] | undefined>,
): PhotocardSelection {
  const selection: PhotocardSelection = { ...EMPTY_SELECTION };
  for (const step of PHOTOCARD_STEPS) {
    const value = firstString(params[step]).trim().slice(0, 80);
    if (value === "") break;
    selection[step] = value;
  }
  return selection;
}

export function selectionToParams(selection: PhotocardSelection): Record<string, string> {
  const out: Record<string, string> = {};
  for (const step of PHOTOCARD_STEPS) {
    if (selection[step] !== "") out[step] = selection[step];
  }
  return out;
}

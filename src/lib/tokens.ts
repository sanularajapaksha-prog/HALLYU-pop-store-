// Design tokens as typed data — kpop_marketplace_design_system.md §5-8.
// Source of truth for the CSS values lives in globals.css; this file
// mirrors those same numbers so the /design-tokens verification page
// (and later components) can iterate over them instead of hardcoding
// swatches by hand.

export const coreColors = [
  { name: "background", hex: "#FFFFFF", className: "bg-background" },
  { name: "foreground", hex: "#0A0A0A", className: "bg-foreground" },
  { name: "surface", hex: "#F5F5F5", className: "bg-surface" },
  { name: "surface-2", hex: "#EBEBEB", className: "bg-surface-2" },
  { name: "border", hex: "#E5E5E5", className: "bg-border" },
  { name: "muted", hex: "#737373", className: "bg-muted" },
] as const;

export const accentColor = {
  name: "accent (Electric Violet)",
  hex: "#7C3AED",
  className: "bg-accent",
} as const;

export const semanticColors = [
  { name: "success", hex: "#16A34A", className: "bg-success" },
  { name: "warning", hex: "#F59E0B", className: "bg-warning" },
  { name: "error", hex: "#DC2626", className: "bg-error" },
  { name: "info", hex: "#2563EB", className: "bg-info" },
] as const;

export const typeScale = [
  { token: "display-xl", desktop: 72, mobile: 42, weight: 600, className: "text-display-xl", usage: "Hero" },
  { token: "display-lg", desktop: 56, mobile: 36, weight: 600, className: "text-display-lg", usage: "Major campaign" },
  { token: "display-md", desktop: 44, mobile: 32, weight: 600, className: "text-display-md", usage: "Page heading" },
  { token: "heading-xl", desktop: 36, mobile: 28, weight: 600, className: "text-heading-xl", usage: "Section heading" },
  { token: "heading-lg", desktop: 30, mobile: 24, weight: 600, className: "text-heading-lg", usage: "Subsection" },
  { token: "heading-md", desktop: 24, mobile: 20, weight: 600, className: "text-heading-md", usage: "Card/section" },
  { token: "heading-sm", desktop: 20, mobile: 18, weight: 600, className: "text-heading-sm", usage: "Small headings" },
  { token: "body-lg", desktop: 18, mobile: 17, weight: 400, className: "text-body-lg", usage: "Intro text" },
  { token: "body", desktop: 16, mobile: 16, weight: 400, className: "text-body", usage: "Normal body" },
  { token: "body-sm", desktop: 14, mobile: 14, weight: 400, className: "text-body-sm", usage: "Secondary text" },
  { token: "caption", desktop: 12, mobile: 12, weight: 500, className: "text-caption", usage: "Metadata" },
  { token: "micro", desktop: 10, mobile: 10, weight: 600, className: "text-micro", usage: "Labels" },
] as const;

export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120] as const;

export const radiusScale = [
  { name: "sm", px: 6, className: "rounded-sm" },
  { name: "md", px: 10, className: "rounded-md" },
  { name: "lg", px: 14, className: "rounded-lg" },
  { name: "xl", px: 20, className: "rounded-xl" },
  { name: "pill", px: 999, className: "rounded-pill" },
] as const;

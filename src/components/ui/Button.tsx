import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SPRING_STATE } from "@/lib/motion";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * §32 — exactly three levels. Do not add a fourth variant; §32 explicitly warns
 * against "many visually different button styles".
 *
 * Radius is `rounded-pill` rather than §8's 8–10px "Buttons" note: the craft bar
 * (rule 2) overrides it for CTAs, and §8's own badge/chip row already sanctions pill.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent/90 uppercase tracking-wide",
  secondary:
    "border border-foreground/15 bg-transparent text-foreground hover:bg-surface uppercase tracking-wide",
  tertiary: "text-foreground hover:text-accent",
};

/** Padding scales from the md baseline (px-6 py-3). Tertiary has no box, so no x-padding. */
const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
};

/**
 * Shared class string so non-button elements (a disabled-looking span, a form
 * submit wrapper) can match the button surface exactly.
 * ponytail: no size prop for tertiary padding — text links don't have a box.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
): string {
  return cn(
    // Layout + type. text-body-sm already sets family/weight-bearing size — never pair with font-size.
    "group inline-flex items-center justify-center gap-3 rounded-pill text-body-sm font-medium",
    // Craft rule 4: spring curve for state changes. Never ease-in-out.
    //
    // Named properties, NOT `transition-all`. `all` is an automatic block in
    // both skills' checklists: it silently animates every property anyone adds
    // later (box-shadow, ring width, opacity) on the same timing, and ring
    // width is a paint property we never want interpolated at all.
    // The set is exactly what the variants actually change, plus the press.
    //
    // Still a transition rather than a keyframe, so hover-off or pointer-up
    // mid-flight retargets from the current computed value — enter and exit
    // are the same considered curve by construction, not a reverse-hack.
    // Two timings, deliberately split. Colour settles over 300ms; the press
    // transform gets 150ms, which is the skills' 100-160ms band for press
    // feedback. Sharing one 300ms shorthand made the press-down lag the
    // finger — the one moment the user is watching most closely. Duration is
    // per-property in the longhand, so `active:scale` now lands immediately
    // while the hover colour keeps its slower, calmer fade.
    `[transition-property:transform,background-color,color,border-color] [transition-duration:150ms,300ms,300ms,300ms] ${SPRING_STATE}`,
    // Craft rule 3: magnetic press.
    "active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    variant === "tertiary" ? "" : SIZE[size],
    VARIANT[variant],
  );
}

/**
 * Craft rule 2 — BUTTON-IN-BUTTON. The arrow is never naked beside the label;
 * it lives in its own circle that springs on group-hover.
 */
function ArrowCircle({ variant }: { variant: ButtonVariant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-pill",
        variant === "primary" ? "bg-white/15" : "bg-foreground/5",
        `transition-transform duration-300 ${SPRING_STATE}`,
        // Gated: on touch this is pure decoration that would otherwise stick
        // on after a tap, leaving the arrow permanently nudged off-centre
        // inside its circle until something else is tapped.
        "[@media(hover:hover)]:group-hover:translate-x-1 [@media(hover:hover)]:group-hover:-translate-y-px [@media(hover:hover)]:group-hover:scale-105",
        "motion-reduce:transform-none motion-reduce:transition-none",
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.25}>
        <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When set, renders a next/link instead of a <button> with identical classes. */
  href?: string;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

export type ButtonLinkProps = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps>;

/**
 * Server Component. Holds no state — an `onClick` passed by a Client Component
 * parent flows straight through to the DOM node.
 */
export function Button({
  variant = "primary",
  size = "md",
  href,
  withArrow = false,
  children,
  className,
  ...rest
}: ButtonProps | ButtonLinkProps) {
  // §32 keeps tertiary text-only: a 32px circle beside unboxed text reads broken.
  // Tertiary's affordance is the inline caret in the label ("View all →"), so the
  // button-in-button circle is suppressed rather than rendered box-less.
  const showArrow = withArrow && variant !== "tertiary";

  const classes = cn(
    buttonClasses(variant, size),
    // Craft rule 2: the circle sits flush with the right inner padding.
    showArrow && "pr-1.5",
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {showArrow ? <ArrowCircle variant={variant} /> : null}
    </>
  );

  if (href !== undefined) {
    const anchorProps = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps>;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;
  return (
    <button type={buttonProps.type ?? "button"} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}

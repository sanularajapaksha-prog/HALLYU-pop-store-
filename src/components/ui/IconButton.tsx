"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type IconButtonVariant = "ghost" | "solid" | "glass";
export type IconButtonSize = "sm" | "md";

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent hover:bg-foreground/5",
  solid: "bg-surface hover:bg-surface-2 border border-border",
  /** Craft rule 10: backdrop-blur is fine here — these sit on hero//sticky chrome, not scrolling content. */
  glass: "bg-white/10 backdrop-blur-sm hover:bg-white/20",
};

/**
 * Both sizes clear the 40px minimum touch target; `sm` only shrinks the glyph,
 * never the hit area.
 */
const SIZE: Record<IconButtonSize, string> = {
  sm: "h-10 w-10 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
};

interface IconButtonOwnProps {
  /** Required — becomes aria-label. The icon alone is never an accessible name. */
  label: string;
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Accent-tinted "on" state, e.g. a filled wishlist heart. Also sets aria-pressed. */
  active?: boolean;
  className?: string;
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonOwnProps>;

export function IconButton({
  label,
  children,
  variant = "ghost",
  size = "md",
  active = false,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "active:scale-[0.96]",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        SIZE[size],
        VARIANT[variant],
        active ? "text-accent" : "text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

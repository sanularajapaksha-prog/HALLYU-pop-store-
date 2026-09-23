"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export type DrawerSide = "right" | "bottom" | "left";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  /** Renders a header row and labels the dialog. */
  title?: string;
  /** Required when `title` is omitted — a dialog must always have a name. */
  "aria-label"?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const PANEL_BY_SIDE: Record<DrawerSide, string> = {
  right: "right-0 top-0 h-full w-full max-w-md",
  left: "left-0 top-0 h-full w-full max-w-md",
  bottom: "bottom-0 inset-x-0 max-h-[85vh] rounded-t-xl",
};

const HIDDEN_BY_SIDE: Record<DrawerSide, string> = {
  right: "translate-x-full",
  left: "-translate-x-full",
  bottom: "translate-y-full",
};

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  "aria-label": ariaLabel,
  children,
  footer,
  className,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Mounted closed for one frame so the open transform has a "from" state.
  const [entered, setEntered] = useState(false);

  // Escape to close. Tab trap — hand-rolled, no focus-trap dependency.
  // ponytail: traps Tab only. Background content is not `inert`, so a click on
  // it (or browser chrome) can still move focus out; the backdrop covers the
  // page so a stray click closes the drawer instead. Upgrade to a portal +
  // `inert` on siblings if this ever renders inside a focusable-heavy layout.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        // Nothing to tab to: keep focus on the panel rather than escaping it.
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  // Body scroll lock. Cleanup restores even if unmounted while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Focus in on open, restore to the opener on close/unmount.
  // ponytail: the restore is guarded, not unconditional. A consumer may close
  // the drawer because the route changed (MobileNav does exactly this on a nav
  // link tap), and by cleanup the opener belongs to the outgoing page — calling
  // .focus() on it drops focus to <body> at the top of a fresh page. Two gates:
  // the opener must still be in the live document, and focus must still be
  // inside the panel (if the user already moved it elsewhere, leave it alone).
  useEffect(() => {
    if (!open) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
    return () => {
      if (!opener?.isConnected) return;
      const active = document.activeElement;
      // Focus escaped the drawer already (navigation, a click outside, the
      // browser moving it to <body> on unmount is the one case we DO restore).
      if (active && active !== document.body && !panel?.contains(active)) return;
      opener.focus();
    };
  }, [open]);

  // Enter transition: flip on the next frame so the closed transform is the
  // "from" state. Reset happens in cleanup, not in an `if (!open)` branch —
  // a synchronous setState inside an effect body is a lint error, and without
  // the reset a second open would start already-entered and skip the slide.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(raf);
      setEntered(false);
    };
  }, [open]);

  // ponytail: closed === unmounted, so there is no exit animation. Correct
  // trade — a hidden-but-mounted panel leaves focusable nodes in the DOM.
  if (!open) return null;

  const shown = entered || reducedMotion;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop. Not a <button>: Escape and the header close button already
          give keyboard users a way out, and a full-viewport "Close" control
          would just be a duplicate announcement in the a11y tree. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-foreground/40 backdrop-blur-sm",
          "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-background shadow-[0_8px_40px_rgba(0,0,0,0.12)] outline-none",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:transform-none",
          PANEL_BY_SIDE[side],
          shown ? "translate-x-0 translate-y-0" : HIDDEN_BY_SIDE[side],
          className,
        )}
      >
        {title ? (
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4">
            <h2 id={titleId} className="text-heading-sm">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-foreground/70 transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-border px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

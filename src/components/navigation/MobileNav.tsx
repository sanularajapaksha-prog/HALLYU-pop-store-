"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "./icons";

const SECONDARY = [
  { label: "Account", href: ROUTES.account },
  { label: "Wishlist", href: ROUTES.wishlist },
];

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  // Close on navigation — but not on the first render, or a drawer opened by a
  // click that didn't navigate would close itself. Compare against the pathname
  // captured when the drawer opened.
  const openedAt = useRef(pathname);
  useEffect(() => {
    if (open) openedAt.current = pathname;
  }, [open, pathname]);
  useEffect(() => {
    if (open && pathname !== openedAt.current) onClose();
  }, [open, pathname, onClose]);

  // Staggered mask reveal. Drawer mounts only while open, so `open` alone is
  // enough to drive the "from" state — no extra entered flag needed here.
  const revealed = open;

  // `title` (not aria-label) on purpose: Drawer renders its close button ONLY
  // when title is set — without it the menu would have no visible exit.
  return (
    <Drawer open={open} onClose={onClose} side="left" title="Menu">
      <nav aria-label="Mobile" className="flex h-full flex-col justify-between gap-10">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li
                key={link.href}
                style={reducedMotion ? undefined : { transitionDelay: `${i * 60}ms` }}
                className={cn(
                  "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  "motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
                  revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                )}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-lg py-2 pr-2",
                    "text-heading-md font-display",
                    "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active ? "text-accent" : "text-foreground hover:text-accent",
                  )}
                >
                  {link.label}
                  <ArrowIcon className="h-5 w-5 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transition-none" />
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          style={reducedMotion ? undefined : { transitionDelay: `${NAV_LINKS.length * 60}ms` }}
          className={cn(
            "flex flex-col gap-4 border-t border-border pt-6",
            "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
            revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <ul className="flex flex-col gap-2">
            {SECONDARY.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-body rounded-md text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-caption rounded-md uppercase tracking-[0.18em] text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </Drawer>
  );
}

export default MobileNav;

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "./icons";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";

export interface NavbarProps {
  /**
   * Overrides the pathname-derived default. Only pass this when a non-home
   * route also renders a dark hero behind the nav.
   */
  transparentOnTop?: boolean;
}

// ponytail: static until a cart store exists. Wire to the cart context in the
// cart change; the badge markup is already correct for a live count.
const CART_COUNT = 2;

export function Navbar({ transparentOnTop }: NavbarProps) {
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // layout.tsx is a Server Component and cannot pass route info, so the default
  // comes from the pathname: only "/" has a hero behind the nav.
  const allowTransparent = transparentOnTop ?? pathname === "/";

  // Craft rule: IntersectionObserver sentinel, not a scroll listener — zero
  // per-frame work. The sentinel is a 64px-tall element at the very top of the
  // page; once it scrolls out of view we are past the §11 threshold.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // No observer (old browser / jsdom): fail SOLID, never stuck transparent —
      // white-on-white text would be unreadable.
      setAtTop(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setAtTop(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The single source of truth for the whole colour switch. Every child reads
  // this one boolean — the classic bug in this pattern is a child that keeps
  // its own condition and drifts out of sync.
  const transparent = allowTransparent && atTop && !menuOpen;

  return (
    <>
      {/*
        Scroll sentinel — 64px matches the §11 "past the hero lip" threshold.
        In normal flow (not absolute) on purpose: an absolutely-positioned
        sentinel silently re-anchors if any ancestor later gains `relative`,
        and the shell wraps this in layout containers. In flow it always sits
        at the top of the nav's own position in the document. h-16 with a
        matching -mb-16 gives the observer a real 64px band while contributing
        zero net height, so it cannot push the header down.
      */}
      <div ref={sentinelRef} aria-hidden="true" className="h-16 w-full shrink-0 -mb-16" />

      <header className="sticky top-0 z-40">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <nav
            aria-label="Primary"
            className={cn(
              "mt-4 flex h-16 items-center gap-4 rounded-pill px-4 sm:px-6",
              "transition-[background-color,box-shadow,color,backdrop-filter] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "motion-reduce:transition-none",
              transparent
                ? "bg-transparent text-white"
                : "bg-background/70 text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-foreground/5 backdrop-blur-xl",
            )}
          >
            {/* Mobile: hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="relative h-10 w-10 shrink-0 rounded-pill transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none motion-reduce:transition-none md:hidden"
            >
              {/* Morph, not a swap: the same two bars rotate into the X. */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 bg-current",
                  "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                  menuOpen ? "-translate-y-1/2 rotate-45" : "-translate-y-[5px]",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 bg-current",
                  "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                  menuOpen ? "-translate-y-1/2 -rotate-45" : "translate-y-[4px]",
                )}
              />
            </button>

            <Link
              href="/"
              className="text-heading-sm shrink-0 rounded-md font-display tracking-tight focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {SITE_NAME}
            </Link>

            <ul className="ml-4 hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "text-body-sm relative rounded-md px-3 py-2",
                        "transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                        "motion-reduce:transition-none",
                        // One signal per state: accent text on the solid bar,
                        // full-strength white over the dark hero (accent would
                        // sink there). Never both a colour and a mark.
                        active && !transparent
                          ? "text-accent"
                          : transparent
                            ? active
                              ? "text-white"
                              : "text-white/80 hover:text-white"
                            : "text-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex items-center gap-1">
              <IconButton
                label="Search"
                variant={transparent ? "glass" : "ghost"}
                onClick={() => setSearchOpen(true)}
                aria-expanded={searchOpen}
                // IconButton hardcodes aria-pressed={active}; this is a plain
                // button, not a toggle. Its {...rest} spread lands after that
                // attribute, so undefined strips it.
                aria-pressed={undefined}
                className={cn("hidden sm:inline-flex", transparent && "text-white")}
              >
                <SearchIcon />
              </IconButton>

              <IconButton
                label="Wishlist"
                variant={transparent ? "glass" : "ghost"}
                aria-pressed={undefined}
                className={cn("hidden md:inline-flex", transparent && "text-white")}
              >
                <HeartIcon />
              </IconButton>

              {/* Cart is a link, not a button — it navigates. */}
              <Link
                href="/cart"
                aria-label={`Cart, ${CART_COUNT} items`}
                className={cn(
                  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.96]",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                  transparent
                    ? "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                    : "text-foreground hover:bg-foreground/5",
                )}
              >
                <BagIcon className="h-5 w-5" />
                {CART_COUNT > 0 ? (
                  <span
                    aria-hidden="true"
                    className="text-micro absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-white"
                  >
                    {CART_COUNT}
                  </span>
                ) : null}
              </Link>

              <Link
                href="/account"
                aria-label="Account"
                className={cn(
                  "hidden h-11 w-11 shrink-0 items-center justify-center rounded-pill md:inline-flex",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.96]",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                  transparent
                    ? "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                    : "text-foreground hover:bg-foreground/5",
                )}
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;

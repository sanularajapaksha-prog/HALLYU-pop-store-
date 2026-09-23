"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { artists } from "@/lib/artists";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";
import { SearchIcon } from "./icons";

export interface SearchBarProps {
  open: boolean;
  onClose: () => void;
}

type Result = { key: string; label: string; hint?: string; href: string };
type Group = { title: string; items: Result[] };

const CAP = 5;

/**
 * Flat, case-insensitive substring match.
 * ponytail: no fuzzy ranking — 40 mock records, a substring scan is enough.
 * Swap in a real index when the catalogue is server-backed.
 */
function search(query: string): Group[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const artistHits = artists
    .filter((a) => a.name.toLowerCase().includes(q))
    .slice(0, CAP)
    .map<Result>((a) => ({
      key: `artist-${a.id}`,
      label: a.name,
      hint: `${a.productCount} items`,
      href: `/artists/${a.slug}`,
    }));

  const productHits = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, CAP)
    .map<Result>((p) => ({
      key: `product-${p.id}`,
      label: p.name,
      href: `/products/${p.slug}`,
    }));

  return [
    { title: "Artists", items: artistHits },
    { title: "Products", items: productHits },
  ].filter((g) => g.items.length > 0);
}

export function SearchBar({ open, onClose }: SearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const groups = useMemo(() => search(query), [query]);
  // Keyboard walks the FLAT list; rendering keeps the groups. One index, so the
  // arrow keys can never desync from what is highlighted.
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Clamp rather than reset: a shrinking result list must not leave `active`
  // pointing past the end, or Enter would select undefined.
  const activeIndex = flat.length === 0 ? -1 : Math.min(active, flat.length - 1);

  // Focus on open, restore on close — both in one effect's cleanup, so an
  // unmount while open still restores focus and unlocks scroll.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  function close() {
    setQuery("");
    setActive(0);
    onClose();
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (flat.length === 0) return;
    const current = Math.min(active, flat.length - 1);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter") {
      const hit = flat[current];
      if (hit) {
        event.preventDefault();
        go(hit.href);
      }
    }
  }

  const selectedKey = activeIndex >= 0 ? flat[activeIndex]?.key : undefined;
  const activeId = selectedKey ? `${listId}-${selectedKey}` : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
      {/* ponytail: div, not a button — Escape and the Esc control already cover
          dismissal; a full-viewport button duplicates them in the a11y tree. */}
      <div className="absolute inset-0" aria-hidden="true" onClick={close} />

      <div className="relative mx-auto w-full max-w-[720px] px-4 pt-20 sm:px-6">
        {/* Double-bezel: outer shell + inner core, concentric 20 - 6 = 14. */}
        <div className="rounded-xl bg-foreground/[0.03] p-1.5 ring-1 ring-foreground/5">
          <div className="flex items-center gap-3 rounded-lg bg-background px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              // The whole overlay unmounts when closed, so if this renders the
              // popup is showing — trending, empty-state or results alike.
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              aria-label="Search albums, artists, merch"
              placeholder="Search albums, artists, merch..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              className="text-body h-14 w-full bg-transparent text-foreground placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={close}
              className="text-caption shrink-0 rounded-pill px-3 py-1 uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none motion-reduce:transition-none"
            >
              Esc
            </button>
          </div>
        </div>

        {/* The popup container owns `listId` so aria-controls always resolves,
            whichever of the three states is showing. */}
        <div id={listId} className="mt-6">
          {query.trim() === "" ? (
            <div>
              <p className="text-micro uppercase tracking-[0.2em] text-muted">
                Trending searches
              </p>
              <ul className="mt-3 flex flex-col">
                {TRENDING_SEARCHES.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setActive(0);
                        inputRef.current?.focus();
                      }}
                      className="text-body w-full rounded-md py-2.5 text-left text-foreground transition-colors duration-200 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none motion-reduce:transition-none"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : flat.length === 0 ? (
            <p className="text-body-sm text-muted">
              No matches for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <ul
              role="listbox"
              aria-label="Search results"
              className="flex flex-col gap-6"
            >
              {groups.map((group) => (
                <li key={group.title} role="group" aria-label={group.title}>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted">
                    {group.title}
                  </p>
                  <ul role="none" className="mt-2 flex flex-col">
                    {group.items.map((item) => {
                      const selected = selectedKey === item.key;
                      return (
                        <li
                          key={item.key}
                          id={`${listId}-${item.key}`}
                          role="option"
                          aria-selected={selected}
                          onClick={() => go(item.href)}
                          onMouseEnter={() =>
                            setActive(flat.findIndex((f) => f.key === item.key))
                          }
                          className={cn(
                            "text-body flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5",
                            "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                            selected ? "bg-surface text-accent" : "text-foreground",
                          )}
                        >
                          <span>{item.label}</span>
                          {item.hint ? (
                            <span className="text-caption text-muted">{item.hint}</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;

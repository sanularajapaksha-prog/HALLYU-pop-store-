"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled: the id of the selected tab. */
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** Names the tablist for screen readers, e.g. "Artist sections". */
  "aria-label"?: string;
}

/**
 * §41 primitive. Controlled — the parent owns `active`, so a page can drive it
 * from a URL search param without this component holding a second copy.
 *
 * A11y: roving tabindex. Exactly one tab is in the tab order at a time; Arrow
 * keys move between tabs (wrapping), Home/End jump to the ends. Selection
 * follows focus, which is the ARIA-recommended pattern for tabs whose panels
 * are cheap to render.
 *
 * ponytail: renders the tablist only. Panels stay with the caller — pages need
 * server-rendered panel content, which a client component cannot provide.
 * Callers wire `id`/`aria-controls` on their own panels.
 */
export function Tabs({ tabs, active, onChange, className, "aria-label": ariaLabel }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Index of the tab the roving tabindex sits on. Falls back to the first tab
  // when `active` names a tab that does not exist, so the list is never
  // entirely untabbable.
  const activeIndex = tabs.findIndex((tab) => tab.id === active);
  const focusIndex = activeIndex === -1 ? 0 : activeIndex;

  function focusTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    onChange(tab.id);
    // Query by id rather than holding a ref array: the DOM is the source of
    // truth and the list is small.
    const node = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-id="${CSS.escape(tab.id)}"]`,
    );
    node?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
    if (last < 0) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(focusIndex === last ? 0 : focusIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(focusIndex === 0 ? last : focusIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(last);
        break;
      default:
        break;
    }
  }

  if (tabs.length === 0) return null;

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-stretch gap-2 overflow-x-auto border-b border-border",
        // Scrollbar hidden on the strip itself — the tabs are the affordance.
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            data-tab-id={tab.id}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={tabs[focusIndex]?.id === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "group relative shrink-0 whitespace-nowrap px-1 pb-3 pt-2 text-body-sm",
              "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-sm",
              isActive ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "ml-2 text-caption tabular-nums",
                  isActive ? "text-muted" : "text-muted/70",
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Underline. Craft rule 10: scaleX only — no width/left animation. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 origin-left rounded-pill bg-accent",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                "motion-reduce:transition-none",
                isActive ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

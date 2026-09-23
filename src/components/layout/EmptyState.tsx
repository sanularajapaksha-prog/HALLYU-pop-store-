import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  /** Inline SVG, stroke-width 1.25–1.5, aria-hidden — see craft rule 8. */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/**
 * Server Component. What a wishlist / cart / collection / search result renders
 * when its list is empty. The spec never covers these screens, but a blank page
 * reads as a broken build, so every list page routes through this.
 *
 * ponytail: href-only action. An empty state's job is to send you somewhere;
 * the one case that needs a handler (a "clear filters" button) can pass its own
 * <Button> through `description`'s sibling slot when it shows up.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("py-24", className)}>
      {/* Craft rule 1: DOUBLE-BEZEL. Outer shell 20px radius, p-1.5 (6px) → inner core 14px. */}
      <div className="mx-auto max-w-md rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5">
        <div className="flex flex-col items-center rounded-lg bg-background px-6 py-12 text-center">
          {icon && (
            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-pill bg-surface text-muted"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          <h2 className="font-display text-heading-sm text-foreground">{title}</h2>

          {description && <p className="mt-3 text-body-sm text-muted">{description}</p>}

          {action && (
            <Button href={action.href} withArrow className="mt-8">
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  /** Omitted on the current page. The LAST item is never linked either way. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Craft rule 8: ultra-light icon, stroke 1.25, currentColor, aria-hidden. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 text-muted/60"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
    >
      <path d="m6 3.5 5 4.5-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Server Component. §28 — the trail above the product detail page, reused by
 * every interior page.
 *
 * The last crumb is ALWAYS rendered as plain text with aria-current="page",
 * even if the caller passed an href: a link to the page you are on is a known
 * screen-reader annoyance, and forcing it here means no call site can get it
 * wrong.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  // Nothing to orient with — render nothing rather than an empty <nav>.
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {index > 0 && <Chevron />}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "block max-w-[12ch] truncate sm:max-w-none",
                    isLast && "text-foreground",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="block max-w-[12ch] truncate rounded-sm transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { ArrowIcon } from "@/components/navigation/icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export interface SectionAction {
  label: string;
  href: string;
}

export interface SectionProps {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  action?: SectionAction;
  id?: string;
  tone?: "default" | "surface";
}

/**
 * Vertical rhythm + section header primitive.
 * Padding py-20 md:py-28 sits at the top of §7's 64–96px section-gap range.
 */
export function Section({
  children,
  className,
  eyebrow,
  title,
  action,
  id,
  tone = "default",
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title);

  return (
    <section
      id={id}
      className={cn("py-20 md:py-28", tone === "surface" && "bg-surface", className)}
    >
      <Container>
        {hasHeader && (
          <Reveal className="mb-10 md:mb-14">
            {eyebrow && (
              <span className="inline-block rounded-pill border border-border px-3 py-1 text-micro uppercase tracking-[0.2em] text-muted">
                {eyebrow}
              </span>
            )}
            {title && (
              <div
                className={cn(
                  "flex items-end justify-between gap-4",
                  eyebrow && "mt-4",
                )}
              >
                <h2 className="font-display text-heading-xl text-foreground">{title}</h2>
                {action && (
                  <Link
                    href={action.href}
                    className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm text-body-sm text-muted transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {action.label}
                    <ArrowIcon className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                  </Link>
                )}
              </div>
            )}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}

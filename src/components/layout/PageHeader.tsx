import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Filters / actions. Sits right on `left`, below the copy on `center`. */
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

/**
 * Server Component. The standard header for every interior page — it owns the
 * page's single <h1>, so no other component on the page may render one.
 *
 * The eyebrow pill is copied class-for-class from Section's eyebrow (craft rule
 * 6) rather than extracted into a shared component: two call sites, one line
 * each. ponytail: extract an <Eyebrow> only if a third one appears.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
  align = "left",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header className={cn("py-12 md:py-16", className)}>
      <Container>
        <div className={cn(centered && "flex flex-col items-center text-center")}>
          {eyebrow && (
            <Reveal>
              <span className="inline-block rounded-pill border border-border px-3 py-1 text-micro uppercase tracking-[0.2em] text-muted">
                {eyebrow}
              </span>
            </Reveal>
          )}

          {/* Craft rule 5: staggered entries, 60ms apart, never a scroll listener. */}
          <Reveal
            delay={eyebrow ? 60 : 0}
            className={cn(
              eyebrow && "mt-4",
              // On `left`, title and actions share a baseline row; on `center`
              // the actions stack under the copy instead.
              !centered && children ? "flex flex-wrap items-end justify-between gap-6" : undefined,
            )}
          >
            <h1 className="font-display text-display-md text-foreground">{title}</h1>
            {!centered && children ? <div className="shrink-0">{children}</div> : null}
          </Reveal>

          {description && (
            <Reveal delay={eyebrow ? 120 : 60}>
              <p className={cn("mt-4 max-w-2xl text-body text-muted", centered && "mx-auto")}>
                {description}
              </p>
            </Reveal>
          )}

          {centered && children ? (
            <Reveal delay={description ? 180 : 120} className="mt-8">
              {children}
            </Reveal>
          ) : null}
        </div>
      </Container>
    </header>
  );
}

export default PageHeader;

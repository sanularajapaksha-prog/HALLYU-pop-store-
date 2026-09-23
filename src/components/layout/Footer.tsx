import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { FOOTER_GROUPS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * §36 — four link groups + a social row, with legal information kept separate
 * in a bottom bar. Server Component: nothing here holds state.
 */

// The year is HARDCODED. `new Date().getFullYear()` is evaluated once on the
// server and again on the client; across a New Year boundary (or any machine
// with a skewed clock) the two disagree and React reports a hydration mismatch.
// The workflow also forbids reading the clock during render outright.
const COPYRIGHT_YEAR = 2026;

type SocialIconName = "Instagram" | "TikTok" | "YouTube";

/** Ultra-light inline glyphs — stroke-width 1.25, currentColor, no icon library. */
function SocialIcon({ name }: { name: SocialIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4.5 w-4.5",
    "aria-hidden": true,
  };

  if (name === "Instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "TikTok") {
    return (
      <svg {...common}>
        <path d="M14 3v11.2a3.8 3.8 0 1 1-3.1-3.74" />
        <path d="M14 3c.4 2.4 2 4 4.4 4.2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.6 15 12l-4.8 2.4V9.6Z" />
    </svg>
  );
}

function isSocialIconName(label: string): label is SocialIconName {
  return label === "Instagram" || label === "TikTok" || label === "YouTube";
}

const linkClass = cn(
  "inline-block text-body-sm text-muted",
  "transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
  "hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm",
);

export function Footer() {
  return (
    <footer className="bg-surface pt-20 md:pt-28">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 md:gap-10">
          {/* Brand column — desktop only; on mobile the wordmark lives in the
              bottom bar, so repeating it here would be dead weight above the fold. */}
          <div className="col-span-2 hidden md:block">
            <Link
              href="/"
              className="font-display text-heading-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {SITE_NAME}
            </Link>
            {/* §50 — the core brand statement, verbatim. */}
            <p className="mt-4 max-w-56 text-body-sm text-muted">
              A place to discover the next drop, find your favorite artists, and
              build your collection.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-micro uppercase tracking-[0.2em] text-muted">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* SOCIAL row — §36 lists it as its own group, but as icon links it reads
            better on one line than as a fifth text column. */}
        <div className="mt-14 flex items-center gap-3">
          <h2 className="sr-only">Social</h2>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${SITE_NAME} on ${link.label}`}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-pill",
                "border border-border bg-background text-muted",
                "transition-[color,transform,border-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:text-accent hover:border-accent/40 active:scale-[0.98]",
                "motion-reduce:transition-none motion-reduce:transform-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              )}
            >
              {isSocialIconName(link.label) ? (
                <SocialIcon name={link.label} />
              ) : (
                <span className="text-micro uppercase">{link.label.slice(0, 2)}</span>
              )}
            </a>
          ))}
        </div>
      </Container>

      {/* Legal, kept separate per §36. */}
      <div className="mt-14 border-t border-border">
        <Container>
          <div className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
            <p className="text-caption text-muted">
              <span className="font-display text-foreground">{SITE_NAME}</span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              &copy; {COPYRIGHT_YEAR} All rights reserved.
            </p>
            <ul className="flex items-center gap-6">
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;

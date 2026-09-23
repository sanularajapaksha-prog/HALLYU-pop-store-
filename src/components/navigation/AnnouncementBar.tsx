import Link from "next/link";
import { ANNOUNCEMENT, ANNOUNCEMENT_HREF } from "@/lib/constants";
import { ArrowIcon } from "./icons";

/**
 * §11 announcement bar — Server Component, no state.
 * Deliberately thin (py-2.5 ≈ 36px total): §11 says nav chrome must not
 * permanently occupy screen. Inverted (bg-foreground) so it reads as a rule
 * above the page rather than another surface competing with the hero.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-foreground text-background">
      <Link
        href={ANNOUNCEMENT_HREF}
        className="group flex items-center justify-center gap-2 px-4 py-2.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className="text-caption uppercase tracking-[0.18em]">{ANNOUNCEMENT}</span>
        <ArrowIcon className="h-4 w-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      </Link>
    </div>
  );
}

export default AnnouncementBar;

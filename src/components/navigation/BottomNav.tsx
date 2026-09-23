"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { GridIcon, HeartIcon, HomeIcon, SparkIcon, UserIcon } from "./icons";

type Item = {
  label: string;
  href: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

// Deliberately NOT derived from NAV_LINKS: these are five thumb-reachable
// targets with icons, not the four catalogue sections that nav renders.
const ITEMS: Item[] = [
  { label: "Home", href: ROUTES.home, Icon: HomeIcon },
  { label: "Shop", href: ROUTES.shop, Icon: GridIcon },
  { label: "Drops", href: ROUTES.drops, Icon: SparkIcon },
  { label: "Wishlist", href: ROUTES.wishlist, Icon: HeartIcon },
  { label: "Account", href: ROUTES.account, Icon: UserIcon },
];

/** "/" matches only itself; every other href also matches its subtree. */
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * §12 persistent mobile bottom navigation. md:hidden — desktop uses the navbar.
 * NOTE FOR THE SHELL: this is `fixed`, so the page wrapper needs
 * `pb-20 md:pb-0` or the last section hides behind it.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 rounded-md transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  "motion-reduce:transition-none",
                  active ? "text-accent" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-micro">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;

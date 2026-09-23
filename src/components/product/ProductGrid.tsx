import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * §15 + §37 — 2 columns on mobile (never a shrunk desktop grid), 4 on desktop,
 * 5 on large desktop. The mobile gap stays tight so product images remain large
 * enough to recognise.
 */
export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default ProductGrid;

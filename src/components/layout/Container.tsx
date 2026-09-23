import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Page gutter primitive — §40: max-width 1440, 16 / 24 / 48px padding. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-12", className)}>
      {children}
    </div>
  );
}

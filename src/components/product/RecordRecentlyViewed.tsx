"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

/**
 * §34 — records a product view. Renders nothing.
 *
 * ponytail: the localStorage read/write, JSON validation, dedupe, cap and
 * try/catch all already live in useRecentlyViewed (written for the homepage
 * row). This is the write half of that existing store, not a second one.
 *
 * Effect, not render: `add` writes to localStorage, which does not exist on the
 * server and would be a side effect during render on the client.
 */
export function RecordRecentlyViewed({ slug }: { slug: string }) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add(slug);
  }, [add, slug]);

  return null;
}

export default RecordRecentlyViewed;

"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Route error boundary. Next requires this to be a Client Component.
 *
 * The raw message never reaches the page: it can carry stack paths, ids or
 * upstream detail a shopper should not read. It goes to the console (and, in
 * production, wherever the console is shipped) and the visitor gets a sentence
 * plus two ways out.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // In an effect, not in render: render runs twice under StrictMode and would
  // log the same failure twice.
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <Container className="py-24 md:py-32">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <Reveal>
          <span className="inline-block rounded-pill border border-border px-3 py-1 text-micro uppercase tracking-[0.2em] text-muted">
            Error
          </span>
        </Reveal>

        <Reveal delay={60} className="mt-4">
          {/* The only h1 on this page. */}
          <h1 className="font-display text-display-md text-foreground">
            Something broke
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-4 text-body text-muted">
            This page failed to load. It is on our side, not yours — try again, and
            if it keeps happening the rest of the store is still open.
          </p>
        </Reveal>

        <Reveal delay={180} className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} withArrow>
              TRY AGAIN
            </Button>
            <Button href="/" variant="secondary">
              BACK TO HOME
            </Button>
          </div>
        </Reveal>

        {/* The digest is the one safe handle: it identifies the failure in the
            server logs without revealing anything about it. */}
        {error.digest && (
          <Reveal delay={240}>
            <p className="mt-8 text-micro uppercase tracking-[0.2em] text-muted">
              Reference {error.digest}
            </p>
          </Reveal>
        )}
      </div>
    </Container>
  );
}

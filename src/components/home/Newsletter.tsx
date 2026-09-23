"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Deliberately permissive: something@something.tld with no whitespace.
 *
 * This is NOT trying to be RFC 5322 — that regex is famously ~6kB and still
 * wrong, and a strict pattern's real-world failure mode is rejecting a VALID
 * address, which loses a subscriber for good. The only job here is catching
 * typos like a missing "@" or a trailing ".". Real verification is the
 * confirmation email's job, and that is server-side.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "error" | "success";

/**
 * §35 — "Keep it simple." One heading, one line of copy, one field, one button.
 *
 * Craft rule 1 at its most literal: the whole block is a machined panel rather
 * than a flat coloured band — an outer shell with a hairline ring and 6px of
 * padding, and an inner core at the concentric radius (20 - 6 = 14). The Input
 * inside is itself double-bezelled, so the assembly reads as a component seated
 * in a housing, which is the entire point of the Doppelrand.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // No backend exists, so the default GET navigation would dump the email
    // into the URL and reload the page. Always prevent it.
    event.preventDefault();

    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus("error");
      return;
    }

    // ponytail: no subscribe endpoint exists yet. This is an optimistic local
    // success — nothing is sent anywhere. Replace this branch with the real
    // POST (and a "pending" status for the in-flight state) when the API lands;
    // the markup below already handles idle/error/success and needs no change.
    setStatus("success");
  }

  return (
    <section className="py-20 md:py-28" aria-labelledby="newsletter-heading">
      <Container>
        <Reveal>
          {/* Outer shell */}
          <div className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5 transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] motion-reduce:transition-none">
            {/* Inner core — concentric radius, inset highlight for the machined edge */}
            <div className="rounded-lg bg-background px-6 py-16 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] md:px-12">
              <div className="mx-auto max-w-xl text-center">
                <span className="inline-block rounded-pill border border-border px-3 py-1 text-micro uppercase tracking-[0.2em] text-muted">
                  Newsletter
                </span>

                <h2
                  id="newsletter-heading"
                  className="mt-6 font-display text-heading-xl text-foreground"
                >
                  Join The Fandom
                </h2>

                <p className="mx-auto mt-4 max-w-md text-body text-muted">
                  Get notified about new drops, pre-orders and exclusive releases.
                </p>

                {status === "success" ? (
                  /*
                   * §35: the success state REPLACES the form. Leaving an empty
                   * field under a "you're in" message invites a second submit
                   * and reads as though nothing happened.
                   *
                   * role="status" carries an implicit aria-live="polite", and
                   * because this node is newly mounted the whole message is
                   * announced — a swapped-out form is otherwise silent to a
                   * screen reader.
                   */
                  <p role="status" className="mt-10 text-body text-foreground">
                    <span aria-hidden="true" className="mr-2 text-accent">
                      &#10003;
                    </span>
                    You&rsquo;re on the list. Watch your inbox for the next drop.
                  </p>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="mt-10 flex flex-col items-start gap-3 text-left sm:flex-row"
                  >
                    <Input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        // Clear the error the moment the user starts fixing it.
                        // Leaving red on screen while someone types the correct
                        // address is nagging, not feedback.
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Email address"
                      aria-label="Email address"
                      autoComplete="email"
                      // Inline, specific, and actionable — never just "Invalid".
                      error={
                        status === "error"
                          ? email.trim().length === 0
                            ? "Enter your email address."
                            : "That doesn't look like an email address."
                          : undefined
                      }
                      containerClassName="sm:flex-1"
                    />

                    {/*
                      shrink-0 so the label never compresses beside the field,
                      and full width on mobile where the row stacks.
                    */}
                    <Button type="submit" withArrow className="w-full shrink-0 sm:w-auto">
                      Join
                    </Button>
                  </form>
                )}

                {/*
                  A PERMANENT live region, mounted in every state. An aria-live
                  node only announces changes that happen while it is ALREADY in
                  the DOM, so a region that appears at the same moment as the
                  error text is frequently missed entirely by screen readers.
                  This one is always present and only its contents change.
                */}
                <p aria-live="polite" className="sr-only">
                  {status === "error"
                    ? "The email address entered is not valid."
                    : status === "success"
                      ? "Subscribed successfully."
                      : ""}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default Newsletter;

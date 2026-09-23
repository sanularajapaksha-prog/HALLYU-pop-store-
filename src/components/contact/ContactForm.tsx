"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Same permissive pattern as Newsletter's EMAIL_PATTERN — catches typos, not
// RFC 5322 edge cases. Real verification is server-side, which doesn't exist yet.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "error" | "success";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Client form for /contact. No backend exists — ponytail: submit is an
 * optimistic local success, same deferred-network shape as Newsletter's
 * handleSubmit. Replace with a real POST when a contact endpoint lands; the
 * idle/error/success states below don't need to change.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (name.trim().length === 0) nextErrors.name = "Enter your name.";
    if (email.trim().length === 0) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "That doesn't look like an email address.";
    }
    if (message.trim().length === 0) nextErrors.message = "Enter a message.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    // ponytail: no contact endpoint yet — deferred, see docstring above.
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p role="status" className="text-body text-foreground">
        <span aria-hidden="true" className="mr-2 text-accent">
          &#10003;
        </span>
        Message sent. We typically reply within 2 business days.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={status === "error" ? errors.name : undefined}
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={status === "error" ? errors.email : undefined}
        autoComplete="email"
      />
      <div className="w-full">
        <label htmlFor="contact-message" className="mb-2 block text-caption text-muted">
          Message
        </label>
        <div
          className={
            "rounded-xl bg-surface p-1.5 ring-1 transition-[box-shadow,--tw-ring-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none " +
            (status === "error" && errors.message
              ? "ring-2 ring-error focus-within:ring-accent"
              : "ring-foreground/5 focus-within:ring-2 focus-within:ring-accent")
          }
        >
          <div className="rounded-lg bg-background px-4 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              aria-invalid={status === "error" && Boolean(errors.message)}
              className="w-full resize-none bg-transparent text-body-sm outline-none placeholder:text-muted"
            />
          </div>
        </div>
        {status === "error" && errors.message && (
          <p className="mt-2 text-caption text-error">{errors.message}</p>
        )}
      </div>

      <Button type="submit" withArrow>
        Send message
      </Button>

      <p aria-live="polite" className="sr-only">
        {status === "error" ? "The form has errors. Please review the fields." : ""}
      </p>
    </form>
  );
}

export default ContactForm;

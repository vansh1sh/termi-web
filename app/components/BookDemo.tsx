"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type FormState = { email: string; phone: string; details: string; companyWebsite: string };
type SubmitState = "idle" | "submitting" | "sent";

const INITIAL_FORM: FormState = { email: "", phone: "", details: "", companyWebsite: "" };

type BookDemoProps = {
  label?: string;
  variant?: "nav" | "primary";
};

export default function BookDemo({ label = "Book demo", variant = "nav" }: BookDemoProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => emailRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), a[href]'
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (open && submitState === "sent") successRef.current?.focus();
  }, [open, submitState]);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "submitting") return;
    setSubmitState("submitting");
    setError("");
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (controller.signal.aborted || requestRef.current !== controller) return;
      if (response.ok && result.ok) {
        setSubmitState("sent");
        return;
      }
      setSubmitState("idle");
      setError(result.error || "Unable to send your request. Please try again.");
    } catch {
      if (controller.signal.aborted || requestRef.current !== controller) return;
      setSubmitState("idle");
      setError("Unable to save your request. Please try again.");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const close = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setOpen(false);
    setForm(INITIAL_FORM);
    setError("");
    setSubmitState("idle");
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-demo-title"
        aria-describedby="book-demo-description"
        className="relative w-full max-w-[540px] overflow-y-auto rounded-lg border border-[--color-line-2] bg-[--color-panel] p-6 shadow-2xl sm:p-8 max-h-[calc(100vh-2rem)]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close demo request"
          title="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-[--color-muted] transition hover:bg-white/5 hover:text-[--color-fg]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {submitState === "sent" ? (
          <div className="py-8 text-center" role="status">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-green-500/40 bg-green-500/10 text-green-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <h2 ref={successRef} tabIndex={-1} id="book-demo-title" className="mt-5 text-2xl font-semibold outline-none">Request received</h2>
            <p className="mt-2 text-sm leading-relaxed text-[--color-muted]">We’ll contact you shortly to arrange a focused enterprise demo.</p>
            <button type="button" onClick={close} className="mt-7 rounded-md bg-[--color-coral] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[--color-coral-600]">Done</button>
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[--color-coral]">Enterprise demo</p>
            <h2 id="book-demo-title" className="mt-3 pr-10 text-2xl font-semibold tracking-tight sm:text-3xl">See Termi on your workflows.</h2>
            <p id="book-demo-description" className="mt-3 max-w-md text-sm leading-relaxed text-[--color-muted]">Tell us where to reach you. We’ll tailor the session around your agents, tasks, security needs, and team setup.</p>

            <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
              <div>
                <label htmlFor="demo-email" className="text-sm font-medium">Work email <span className="text-[--color-coral]">*</span></label>
                <input
                  ref={emailRef}
                  id="demo-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-md border border-[--color-line-2] bg-[--color-ink] px-4 py-3 text-sm outline-none transition focus:border-[--color-coral]"
                />
              </div>
              <div>
                <label htmlFor="demo-phone" className="text-sm font-medium">Phone <span className="font-normal text-[--color-faint]">Optional</span></label>
                <input
                  id="demo-phone"
                  type="tel"
                  maxLength={40}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="+1 415 555 0199"
                  className="mt-2 w-full rounded-md border border-[--color-line-2] bg-[--color-ink] px-4 py-3 text-sm outline-none transition focus:border-[--color-coral]"
                />
              </div>
              <div>
                <label htmlFor="demo-details" className="text-sm font-medium">What should we cover? <span className="font-normal text-[--color-faint]">Optional</span></label>
                <textarea
                  id="demo-details"
                  rows={4}
                  maxLength={2000}
                  value={form.details}
                  onChange={(event) => update("details", event.target.value)}
                  placeholder="Team size, current agents, workflows, security requirements…"
                  className="mt-2 w-full resize-y rounded-md border border-[--color-line-2] bg-[--color-ink] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[--color-coral]"
                />
              </div>
              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label htmlFor="company-website">Company website</label>
                <input id="company-website" tabIndex={-1} autoComplete="off" value={form.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} />
              </div>

              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitState === "submitting" || !form.email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[--color-coral] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[--color-coral-600] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitState === "submitting" ? "Sending…" : "Request enterprise demo"}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[--color-faint]">We’ll only use these details to arrange your Termi demo.</p>
            </form>
          </>
        )}
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={variant === "primary"
          ? "whitespace-nowrap rounded-md bg-[--color-coral] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[--color-coral-600]"
          : "whitespace-nowrap rounded-md border border-[--color-coral]/60 px-3 py-1.5 font-medium text-[--color-fg] transition hover:border-[--color-coral] hover:bg-[--color-coral]/10"}
      >
        {label}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

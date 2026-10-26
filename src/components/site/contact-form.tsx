"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { contactSchema } from "@/lib/schemas";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm({ disabled = false }: { disabled?: boolean }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef<number>(0);
  const tsBox = useRef<HTMLDivElement>(null);
  const tsToken = useRef<string>("");
  const tsId = useRef<string | undefined>(undefined);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const renderTurnstile = () => {
    if (!SITE_KEY || !tsBox.current || !window.turnstile || tsId.current) return;
    tsId.current = window.turnstile.render(tsBox.current, {
      sitekey: SITE_KEY,
      callback: (t: string) => (tsToken.current = t),
      "expired-callback": () => (tsToken.current = ""),
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? ""),
      started_at: startedAt.current,
      turnstile_token: tsToken.current || undefined,
    };
    const parsed = contactSchema.safeParse({ ...payload, company: "" });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Errors;
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; fields?: Errors };
      if (!res.ok) {
        if (body.fields) setErrors(body.fields);
        setStatus({ kind: "error", message: body.error ?? "Your message could not be sent. Please try again." });
        if (tsId.current) window.turnstile?.reset(tsId.current);
        return;
      }
      form.reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="flex gap-3 rounded-2xl border border-line bg-surface p-6">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-medium">Message sent</p>
          <p className="mt-1 text-[15px] text-ink-2">Thank you. I&apos;ll reply to the email address you provided.</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
            onClick={() => setStatus({ kind: "idle" })}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const field = (name: keyof Errors) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const err = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className="text-[13px] text-danger">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      {SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderTurnstile} />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input {...field("name")} autoComplete="name" required maxLength={120} />
          {err("name")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input {...field("email")} type="email" autoComplete="email" required maxLength={200} />
          {err("email")}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">
          Subject <span className="font-normal text-muted">(optional)</span>
        </Label>
        <Input {...field("subject")} maxLength={200} />
        {err("subject")}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea {...field("message")} rows={5} required maxLength={5000} />
        {err("message")}
      </div>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {SITE_KEY && <div ref={tsBox} />}
      {status.kind === "error" && (
        <p role="alert" className="flex gap-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {status.message}
        </p>
      )}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted">Your details are only used to reply to you.</p>
        <Button type="submit" variant="primary" size="lg" disabled={disabled || status.kind === "sending"}>
          {status.kind === "sending" && <Loader2 className="animate-spin" aria-hidden />}
          {status.kind === "sending" ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

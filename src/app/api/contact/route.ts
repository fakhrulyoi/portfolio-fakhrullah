import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { contactSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublishedPortfolio } from "@/lib/data";

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // optional extra protection
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  }).catch(() => null);
  const data = (await res?.json().catch(() => null)) as { success?: boolean } | null;
  return Boolean(data?.success);
}

async function notifyOwner(msg: { name: string; email: string; subject: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: msg.email,
      subject: `Portfolio message: ${msg.subject || msg.name}`,
      text: `From: ${msg.name} <${msg.email}>\n\n${msg.message}`,
    }),
  }).catch(() => undefined);
}

export async function POST(req: NextRequest) {
  // Same-origin only.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return json({ error: "Invalid request origin." }, 403);
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) return json({ error: "Message is too large." }, 413);

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot or impossibly fast submissions: pretend success, store nothing.
  const started = Number(raw.started_at ?? 0);
  if ((typeof raw.company === "string" && raw.company.trim() !== "") || (started && Date.now() - started < 2500)) {
    return json({ ok: true });
  }

  const parsed = contactSchema.safeParse({ ...raw, company: "" });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "");
      if (k && !fields[k]) fields[k] = i.message;
    }
    return json({ error: "Please fix the highlighted fields.", fields }, 422);
  }

  const site = await getPublishedPortfolio();
  if (site.status === "ok" && (!site.data.settings.sections.contact || !site.data.settings.contact.form_enabled)) {
    return json({ error: "The contact form is currently closed. Please use email instead." }, 403);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (!(await verifyTurnstile(parsed.data.turnstile_token, ip))) {
    return json({ error: "Please complete the verification check and try again." }, 400);
  }

  const supabase = createServiceClient();
  if (!supabase) return json({ error: "The contact form isn't set up yet. Please use email instead." }, 503);

  const salt = process.env.CONTACT_HASH_SALT || "portfolio";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
  const { name, email, subject, message } = parsed.data;
  const { data, error } = await supabase.rpc("submit_contact_message", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_message: message,
    p_ip_hash: ipHash,
  });
  if (error) return json({ error: "Your message could not be saved. Please try again or use email." }, 500);
  if (data === "rate_limited") {
    return json({ error: "Too many messages in a short time. Please wait a few minutes or use email." }, 429);
  }
  await notifyOwner({ name, email, subject, message });
  return json({ ok: true });
}

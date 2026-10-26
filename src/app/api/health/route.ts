import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL, SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/** Setup check: shows what is misconfigured without revealing any key. */
function keyKind(k: string | undefined) {
  if (!k) return "missing";
  if (k.startsWith("sb_publishable_")) return "publishable key";
  if (k.startsWith("sb_secret_")) return "SECRET key (wrong place!)";
  if (k.split(".").length === 3) {
    try {
      const role = JSON.parse(Buffer.from(k.split(".")[1], "base64url").toString()).role;
      return `legacy JWT key (role: ${role})`;
    } catch {
      return "unrecognised JWT";
    }
  }
  return "unrecognised format";
}

export async function GET() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  let host = "";
  try {
    host = new URL(SUPABASE_URL).host;
  } catch {
    host = SUPABASE_URL ? "INVALID URL" : "missing";
  }
  const checks: Record<string, unknown> = {
    supabase_url_host: host,
    supabase_url_ok: /^[a-z0-9]+\.supabase\.co$/.test(host),
    public_key: keyKind(SUPABASE_PUBLIC_KEY),
    secret_key: secret ? (secret.startsWith("sb_secret_") ? "secret key" : keyKind(secret)) : "missing",
    supabase_url_has_extra_path: (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").pathname.replace(/\/+$/, "") !== "";
      } catch {
        return false;
      }
    })(),
    site_url: SITE_URL,
  };
  if (SUPABASE_URL && SUPABASE_PUBLIC_KEY) {
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, { auth: { persistSession: false } });
      const { data, error } = await sb.rpc("get_published_portfolio");
      checks.database = error
        ? `ERROR: ${error.message}${error.hint ? ` (hint: ${error.hint})` : ""}`
        : data
          ? "ok: published content found"
          : "connected, but nothing published yet";
    } catch (e) {
      checks.database = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return NextResponse.json(checks, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

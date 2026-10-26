// Public values (safe in the browser). Supports both the classic "anon" key
// and Supabase's newer "publishable" key names.
// Only the origin is used, so a pasted ".../rest/v1/" or trailing slash still works.
function originOf(raw: string | undefined) {
  const v = (raw ?? "").trim();
  if (!v) return "";
  try {
    return new URL(v).origin;
  } catch {
    return v.replace(/\/+$/, "");
  }
}
export const SUPABASE_URL = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY);

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

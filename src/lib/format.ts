import { SUPABASE_URL } from "./supabase/env";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return "";
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1] ?? ""} ${y}`.trim();
}

export function formatRange(start: string, end: string, current = false) {
  const s = formatMonth(start);
  const e = current ? "Present" : formatMonth(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

/** Public URL for a file in a public Supabase Storage bucket ("bucket/path"). */
export function storageUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

/** Readable text colour (black or white) for a background hex colour. */
export function contrastText(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.45 ? "#111113" : "#ffffff";
}

export function initials(name: string) {
  const parts = name.replace(/\b(bin|binti|bt|b\.)\b/gi, " ").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "•";
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(iso));
}

/** Process steps are stored as "Label" or "Label: short detail". */
export function parseStep(raw: string) {
  const i = raw.indexOf(":");
  if (i > 0 && i <= 40) return { label: raw.slice(0, i).trim(), detail: raw.slice(i + 1).trim() };
  return { label: raw.trim(), detail: "" };
}

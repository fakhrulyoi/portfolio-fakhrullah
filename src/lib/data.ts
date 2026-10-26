import "server-only";
import { cache } from "react";
import { mergeSettings, type Portfolio } from "./schemas";
import { createPublicClient } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/env";

function normalise(raw: unknown): Portfolio | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  return {
    settings: mergeSettings(r.settings),
    experiences: arr(r.experiences),
    projects: arr(r.projects),
    skill_groups: arr(r.skill_groups),
    education: arr(r.education),
    published_at: typeof r.published_at === "string" ? r.published_at : null,
  };
}

export type PortfolioResult =
  | { status: "ok"; data: Portfolio }
  | { status: "empty" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

/** The latest PUBLISHED version — what visitors see. */
export const getPublishedPortfolio = cache(async (): Promise<PortfolioResult> => {
  if (!isSupabaseConfigured) return { status: "unconfigured" };
  try {
    const { data, error } = await createPublicClient().rpc("get_published_portfolio");
    if (error) return { status: "error", message: error.message };
    const p = normalise(data);
    return p ? { status: "ok", data: p } : { status: "empty" };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
});

export { normalise as normalisePortfolio };

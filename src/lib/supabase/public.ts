import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "./env";

export const PORTFOLIO_TAG = "portfolio";

/**
 * Stateless client for public reads (no cookies, so pages can be cached).
 * Responses are cached under the "portfolio" tag, which Publish expires.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { tags: [PORTFOLIO_TAG], revalidate: 3600 } }),
    },
  });
}

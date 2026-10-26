"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "./env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser client — used only for direct uploads to Storage (RLS-protected). */
export function getSupabaseBrowserClient() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
  return client;
}

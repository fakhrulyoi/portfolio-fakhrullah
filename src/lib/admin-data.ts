import "server-only";
import { requireAdmin } from "./auth";
import { mergeSettings, type CollectionName } from "./schemas";

export async function getDraftSettings() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return mergeSettings(data?.data);
}

export async function getCollection(name: CollectionName) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(name).select("*").order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as ({ id: string; visible: boolean } & Record<string, unknown>)[];
}

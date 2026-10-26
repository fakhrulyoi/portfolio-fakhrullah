"use server";

import { revalidatePath, updateTag } from "next/cache";
import { PORTFOLIO_TAG } from "./supabase/public";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminOrNull } from "./auth";
import { createSupabaseServerClient } from "./supabase/server";
import {
  atsSchema,
  COLLECTIONS,
  isCollection,
  mergeSettings,
  settingsSectionSchemas,
  type CollectionName,
  type SettingsSection,
} from "./schemas";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const NOT_ALLOWED: ActionResult = { ok: false, error: "Your session has ended or you don't have admin access. Sign in again." };

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

function dbError(message: string): ActionResult {
  // Keep database internals out of the UI but stay specific about the cause.
  if (/row-level security|permission denied|Not authorised/i.test(message)) return NOT_ALLOWED;
  if (/check constraint/i.test(message)) return { ok: false, error: "One of the values isn't in the expected format." };
  return { ok: false, error: `Couldn't save: ${message}` };
}

const touchAdmin = () => revalidatePath("/admin", "layout");

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signIn(_: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ email: z.string().trim().email("Enter your email address"), password: z.string().min(1, "Enter your password") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error?.code === "email_not_confirmed") {
    return { ok: false, error: "This account's email isn't confirmed yet. Confirm it in Supabase (Authentication > Users) and try again." };
  }
  if (error?.status === 429) return { ok: false, error: "Too many sign-in attempts. Wait a few minutes and try again." };
  if (error?.code === "invalid_credentials" || (!error && !data.user)) {
    return { ok: false, error: "Email or password is incorrect." };
  }
  if (error) return { ok: false, error: `Sign-in failed: ${error.message}${error.code ? ` (${error.code})` : ""}` };

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account doesn't have admin access to this portfolio." };
  }
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function requestPasswordReset(_: unknown, formData: FormData): Promise<ActionResult> {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: false, error: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address" } };
  const supabase = await createSupabaseServerClient();
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${site}/auth/confirm` });
  // Same reply whether or not the account exists.
  return { ok: true, message: "If that email belongs to the admin account, a reset link is on its way." };
}

export async function changePassword(values: { password: string; confirm: string }): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  const parsed = z
    .object({
      password: z
        .string()
        .min(10, "Use at least 10 characters")
        .max(72, "Use at most 72 characters")
        .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), "Include letters and at least one number"),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
    .safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const { error } = await admin.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Password updated." };
}

// ---------------------------------------------------------------------------
// Settings (profile, about, resume, SEO, theme, sections, contact)
// ---------------------------------------------------------------------------
export async function saveSettings(section: SettingsSection, values: unknown): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  const schema = settingsSectionSchemas[section];
  if (!schema) return { ok: false, error: "Unknown settings section." };
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  const { data: row, error: readErr } = await admin.supabase.from("site_settings").select("data").eq("id", 1).single();
  if (readErr) return dbError(readErr.message);
  const next = { ...mergeSettings(row?.data), [section]: parsed.data };
  const { error } = await admin.supabase.from("site_settings").update({ data: next }).eq("id", 1);
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true, message: "Draft saved." };
}

// ---------------------------------------------------------------------------
// ATS resume builder (private: never published)
// ---------------------------------------------------------------------------
export async function saveAts(values: unknown): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  const parsed = atsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const { data: row, error: readErr } = await admin.supabase.from("private_settings").select("data").eq("id", 1).maybeSingle();
  if (readErr) {
    if (/private_settings|schema cache|does not exist/i.test(readErr.message)) {
      return { ok: false, error: "Run supabase/migrations/0002_private_resume_settings.sql in Supabase first (see README)." };
    }
    return dbError(readErr.message);
  }
  const data = { ...((row?.data as object) ?? {}), ats: parsed.data };
  const { error } = await admin.supabase.from("private_settings").upsert({ id: 1, data });
  if (error) return dbError(error.message);
  revalidatePath("/admin/ats-resume");
  return { ok: true, message: "Resume settings saved." };
}

// ---------------------------------------------------------------------------
// Collections (experience, projects, skills, education)
// ---------------------------------------------------------------------------
export async function saveItem(collection: CollectionName, id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!isCollection(collection)) return { ok: false, error: "Unknown content type." };
  const parsed = COLLECTIONS[collection].safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  if (id) {
    if (!z.uuid().safeParse(id).success) return { ok: false, error: "Invalid item." };
    const { error } = await admin.supabase.from(collection).update(parsed.data).eq("id", id);
    if (error) return dbError(error.message);
    touchAdmin();
    return { ok: true, data: { id }, message: "Draft saved." };
  }
  const { data: last } = await admin.supabase.from(collection).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 1;
  const { data, error } = await admin.supabase.from(collection).insert({ ...parsed.data, sort_order }).select("id").single();
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true, data: { id: data.id as string }, message: "Added as a draft." };
}

export async function deleteItem(collection: CollectionName, id: string): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!isCollection(collection) || !z.uuid().safeParse(id).success) return { ok: false, error: "Invalid item." };
  const { error, count } = await admin.supabase.from(collection).delete({ count: "exact" }).eq("id", id);
  if (error) return dbError(error.message);
  if (!count) return { ok: false, error: "That item no longer exists." };
  touchAdmin();
  return { ok: true, message: "Deleted. Publish to remove it from the live site." };
}

export async function setItemVisible(collection: CollectionName, id: string, visible: boolean): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!isCollection(collection) || !z.uuid().safeParse(id).success) return { ok: false, error: "Invalid item." };
  const { error } = await admin.supabase.from(collection).update({ visible: Boolean(visible) }).eq("id", id);
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true, message: visible ? "Will show after you publish." : "Will be hidden after you publish." };
}

export async function reorderItems(collection: CollectionName, ids: string[]): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!isCollection(collection) || !z.array(z.uuid()).max(200).safeParse(ids).success) return { ok: false, error: "Invalid order." };
  const { error } = await admin.supabase.rpc("reorder_items", { p_table: collection, p_ids: ids });
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true, message: "Order saved." };
}

// ---------------------------------------------------------------------------
// Publishing
// ---------------------------------------------------------------------------
function refreshPublicSite() {
  updateTag(PORTFOLIO_TAG);
  revalidatePath("/", "layout");
}

export async function publishSite(note: string): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  const { error } = await admin.supabase.rpc("publish_site", { p_note: String(note ?? "").slice(0, 200) });
  if (error) return dbError(error.message);
  refreshPublicSite();
  return { ok: true, message: "Published. Your live site now shows these changes." };
}

export async function restoreVersion(id: number): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!Number.isInteger(id) || id < 1) return { ok: false, error: "Invalid version." };
  const { error } = await admin.supabase.rpc("restore_publication", { p_id: id });
  if (error) return dbError(error.message);
  refreshPublicSite();
  return { ok: true, message: `Version #${id} restored and published.` };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Invalid message." };
  const { error } = await admin.supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Invalid message." };
  const { error } = await admin.supabase.from("contact_messages").delete().eq("id", id);
  if (error) return dbError(error.message);
  touchAdmin();
  return { ok: true, message: "Message deleted." };
}

// ---------------------------------------------------------------------------
// Storage housekeeping
// ---------------------------------------------------------------------------
export async function deleteStorageFile(path: string): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_ALLOWED;
  const m = /^(images|documents)\/([\w\-./]+)$/.exec(path);
  if (!m || path.includes("..")) return { ok: false, error: "Invalid file." };
  // Never delete a file the live site or the draft still uses.
  const [{ data: live }, { data: settings }, { data: projects }] = await Promise.all([
    admin.supabase.from("publications").select("content").order("id", { ascending: false }).limit(1).maybeSingle(),
    admin.supabase.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    admin.supabase.from("projects").select("image_path"),
  ]);
  const inUse = JSON.stringify([live?.content ?? {}, settings?.data ?? {}, projects ?? []]);
  if (inUse.includes(`"${path}"`)) {
    return { ok: false, error: "This file is still used by the draft or the live site." };
  }
  const { error } = await admin.supabase.storage.from(m[1]).remove([m[2]]);
  if (error) return { ok: false, error: error.message };
  touchAdmin();
  return { ok: true, message: "File deleted." };
}

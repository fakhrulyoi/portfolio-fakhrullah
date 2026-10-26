// Usage (against a TEST Supabase project only):
//   SB_URL=https://xxx.supabase.co SB_ANON=<publishable key> node scripts/security-test.mjs
// Requires an admin user yoifakrul@gmail.com and a non-admin user stranger@example.com,
// both with password "Test-Passw0rd!" (create them only in a throwaway project).
// Security checks against the database/storage policies (run with node).
import { createClient } from "@supabase/supabase-js";
const URL = process.env.SB_URL, ANON = process.env.SB_ANON;
const results = [];
const check = (n, c, d = "") => { results.push(c); console.log((c ? "PASS " : "FAIL ") + n + (c ? "" : `  [${d}]`)); };
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

let r = await anon.from("projects").select("*");
check("anon cannot read draft projects", r.error || (r.data ?? []).length === 0, JSON.stringify(r.data?.slice(0,1)));
r = await anon.from("projects").insert({ title: "hack" });
check("anon cannot insert projects", !!r.error);
r = await anon.from("site_settings").update({ data: {} }).eq("id", 1);
check("anon cannot change settings", !!r.error || r.count === 0);
r = await anon.from("contact_messages").select("*");
check("anon cannot read messages", !!r.error || (r.data ?? []).length === 0);
r = await anon.from("publications").select("*");
check("anon cannot list all versions", !!r.error || (r.data ?? []).length === 0);
r = await anon.rpc("publish_site", { p_note: "x" });
check("anon cannot publish", !!r.error);
r = await anon.rpc("get_draft_portfolio");
check("anon cannot read draft via rpc", !!r.error);
r = await anon.rpc("submit_contact_message", { p_name: "a", p_email: "a@b.co", p_subject: "", p_message: "0123456789", p_ip_hash: "x" });
check("anon cannot bypass contact route", !!r.error);
r = await anon.rpc("grant_admin", { p_email: "stranger@example.com" });
check("anon cannot grant admin", !!r.error);
r = await anon.storage.from("images").upload(`projects/hack-${Date.now()}.png`, new Blob(["x"], { type: "image/png" }));
check("anon cannot upload files", !!r.error);
r = await anon.rpc("get_published_portfolio");
check("anon CAN read published portfolio", !r.error && r.data?.settings);

const user = createClient(URL, ANON, { auth: { persistSession: false } });
const s = await user.auth.signInWithPassword({ email: "stranger@example.com", password: "Test-Passw0rd!" });
check("non-admin can sign in to auth (but nothing else)", !s.error);
r = await user.from("projects").insert({ title: "hack" }).select();
check("non-admin cannot insert projects", !!r.error);
r = await user.from("projects").update({ title: "hack" }).neq("title", "").select();
check("non-admin cannot update projects", !!r.error || (r.data ?? []).length === 0);
r = await user.from("projects").delete().neq("title", "").select();
check("non-admin cannot delete projects", !!r.error || (r.data ?? []).length === 0);
r = await user.from("admins").insert({ user_id: s.data.user.id });
check("non-admin cannot add self as admin", !!r.error);
r = await user.rpc("publish_site", { p_note: "x" });
check("non-admin cannot publish", !!r.error);
r = await user.rpc("restore_publication", { p_id: 1 });
check("non-admin cannot restore", !!r.error);
r = await user.rpc("reorder_items", { p_table: "projects", p_ids: [] });
check("non-admin cannot reorder", !!r.error);
r = await user.rpc("grant_admin", { p_email: "stranger@example.com" });
check("non-admin cannot grant admin", !!r.error);
r = await user.from("contact_messages").select("*");
check("non-admin cannot read messages", !!r.error || (r.data ?? []).length === 0);
r = await user.storage.from("images").upload(`projects/hack-${Date.now()}.png`, new Blob(["x"], { type: "image/png" }));
check("non-admin cannot upload", !!r.error);

const admin = createClient(URL, ANON, { auth: { persistSession: false } });
await admin.auth.signInWithPassword({ email: "yoifakrul@gmail.com", password: "Test-Passw0rd!" });
r = await admin.storage.from("images").upload(`projects/evil-${Date.now()}.html`, new Blob(["<script>alert(1)</script>"], { type: "text/html" }));
check("bucket rejects disallowed file types", !!r.error, JSON.stringify(r));
r = await admin.storage.from("documents").upload(`resume/big-${Date.now()}.pdf`, new Blob([new Uint8Array(11 * 1024 * 1024)], { type: "application/pdf" }));
check("bucket rejects oversized files", !!r.error, JSON.stringify(r));
r = await admin.from("projects").insert({ title: "x", live_url: "javascript:alert(1)" });
check("database rejects javascript: links", !!r.error);
r = await admin.rpc("reorder_items", { p_table: "admins", p_ids: [] });
check("reorder rejects other tables", !!r.error);

console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);

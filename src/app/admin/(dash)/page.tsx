import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { mergeSettings } from "@/lib/schemas";
import { PageHeader } from "@/components/admin/page-header";
import { VersionHistory } from "@/components/admin/version-history";

export const metadata: Metadata = { title: "Overview" };

export default async function Overview() {
  const { supabase } = await requireAdmin();
  const [settingsRes, pubs, exp, proj, msgs] = await Promise.all([
    supabase.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    supabase.from("publications").select("id,note,published_at").order("id", { ascending: false }).limit(15),
    supabase.from("experiences").select("id,employment_type", { count: "exact" }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  const s = mergeSettings(settingsRes.data?.data);
  const checklist = [
    { done: Boolean(s.resume.path), label: "Upload your resume PDF", href: "/admin/resume" },
    { done: Boolean(s.profile.photo_path) || !s.profile.show_photo, label: "Add a profile photo (or turn the photo off)", href: "/admin/profile" },
    { done: Boolean(s.profile.linkedin_url), label: "Add your LinkedIn profile link", href: "/admin/profile" },
    { done: Boolean(s.profile.github_url), label: "Add your GitHub profile link (optional)", href: "/admin/profile" },
    {
      done: (exp.data ?? []).every((e) => e.employment_type),
      label: "Confirm employment type for every job (e.g. Full-time)",
      href: "/admin/experience",
    },
  ];
  const stats = [
    { label: "Experience entries", value: exp.count ?? 0, href: "/admin/experience" },
    { label: "Projects", value: proj.count ?? 0, href: "/admin/projects" },
    { label: "Unread messages", value: msgs.count ?? 0, href: "/admin/messages" },
  ];
  return (
    <>
      <PageHeader
        title="Overview"
        description="Edit anything in the menu, check it with Preview, then press Publish. Visitors only see what you've published."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((x) => (
          <Link key={x.label} href={x.href} className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">{x.value}</p>
            <p className="mt-1 text-sm text-muted">{x.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="todo">
        <h2 id="todo" className="font-semibold">Finish your profile</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
          {checklist.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-sunken/50">
                {c.done ? <CheckCircle2 className="size-4 text-success" aria-label="Done" /> : <Circle className="size-4 text-line-strong" aria-label="To do" />}
                <span className={c.done ? "text-muted line-through decoration-line-strong" : ""}>{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="history">
        <h2 id="history" className="font-semibold">Published versions</h2>
        <p className="mt-1 text-sm text-muted">Every publish is kept as a backup. Restoring replaces your draft with that version and publishes it.</p>
        <VersionHistory versions={pubs.data ?? []} />
      </section>
    </>
  );
}

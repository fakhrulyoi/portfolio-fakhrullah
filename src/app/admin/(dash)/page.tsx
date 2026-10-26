import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Eye, FileCheck2, FolderPlus, Palette, UserPen } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { mergeSettings } from "@/lib/schemas";
import { SITE_URL } from "@/lib/supabase/env";
import { PageHeader } from "@/components/admin/page-header";
import { VersionHistory } from "@/components/admin/version-history";
import { ShareCard } from "@/components/admin/share-card";

export const metadata: Metadata = { title: "Overview" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

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
    { done: (exp.data ?? []).every((e) => e.employment_type), label: "Confirm employment type for every job", href: "/admin/experience" },
  ];
  const done = checklist.filter((c) => c.done).length;
  const pct = Math.round((done / checklist.length) * 100);
  const R = 22;
  const C = 2 * Math.PI * R;

  const actions = [
    { href: "/admin/profile", label: "Edit profile", desc: "Name, headline, photo, links", icon: UserPen },
    { href: "/admin/projects", label: "Add a project", desc: "Screenshots, role, links", icon: FolderPlus },
    { href: "/admin/ats-resume", label: "Tailor a resume", desc: "PDF or Word for a job ad", icon: FileCheck2 },
    { href: "/admin/settings", label: "Change template", desc: "Classic, Document, Side panel", icon: Palette },
    { href: "/admin/preview", label: "Preview draft", desc: "See unpublished changes", icon: Eye },
  ];
  const stats = [
    { label: "Experience entries", value: exp.count ?? 0, href: "/admin/experience" },
    { label: "Projects", value: proj.count ?? 0, href: "/admin/projects" },
    { label: "Unread messages", value: msgs.count ?? 0, href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${s.profile.short_name || s.profile.full_name.split(" ")[0] || "there"}`}
        description="Edit anything, check it with Preview, then press Publish. Visitors only see what you've published."
      />

      <ShareCard url={SITE_URL} live={(pubs.data ?? []).length > 0} />

      <section aria-labelledby="quick" className="mt-10">
        <h2 id="quick" className="mb-3 font-semibold">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.3)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-accent-ink">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block truncate text-[12px] text-muted">{desc}</span>
              </span>
              <ArrowRight className="size-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-labelledby="todo">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="todo" className="font-semibold">Finish your profile</h2>
            <span className="text-[13px] text-muted">
              {done} of {checklist.length} done
            </span>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="group flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-sunken/60">
                  {c.done ? <CheckCircle2 className="size-4 text-success" aria-label="Done" /> : <Circle className="size-4 text-line-strong" aria-label="To do" />}
                  <span className={c.done ? "flex-1 text-muted line-through decoration-line-strong" : "flex-1"}>{c.label}</span>
                  {!c.done && <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
            <svg viewBox="0 0 56 56" className="size-14 -rotate-90" aria-hidden>
              <circle cx="28" cy="28" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
              <circle
                cx="28"
                cy="28"
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct / 100)}
                className="transition-[stroke-dashoffset] duration-700"
              />
            </svg>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{pct}%</p>
              <p className="text-[12px] text-muted">Profile complete</p>
            </div>
          </div>
          {stats.map((x) => (
            <Link key={x.label} href={x.href} className="flex items-baseline justify-between rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong">
              <span className="text-[13px] text-muted">{x.label}</span>
              <span className="text-xl font-semibold tabular-nums">{x.value}</span>
            </Link>
          ))}
        </div>
      </div>

      <section className="mt-10" aria-labelledby="history">
        <h2 id="history" className="font-semibold">Published versions</h2>
        <p className="mt-1 text-sm text-muted">Every publish is kept as a backup. Restoring replaces your draft with that version and publishes it.</p>
        <VersionHistory versions={pubs.data ?? []} />
      </section>
    </>
  );
}

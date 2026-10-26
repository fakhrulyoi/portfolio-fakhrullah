import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ResumeManager } from "@/components/admin/resume-manager";
import { getDraftSettings } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Resume" };

export default async function ResumePage() {
  const s = await getDraftSettings();
  const { supabase } = await requireAdmin();
  const [{ data: files }, { data: live }] = await Promise.all([
    supabase.storage.from("documents").list("resume", { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
    supabase.from("publications").select("content").order("id", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const livePath = (live?.content as { settings?: { resume?: { path?: string } } } | null)?.settings?.resume?.path ?? "";
  return (
    <>
      <PageHeader
        title="Resume"
        description="Upload a new PDF to replace your resume. After you publish, the Download Resume buttons and the link yoursite/resume always serve the newest version."
      />
      <ResumeManager
        resume={s.resume}
        livePath={livePath}
        files={(files ?? [])
          .filter((f) => f.name.endsWith(".pdf"))
          .map((f) => ({ path: `documents/resume/${f.name}`, name: f.name, size: (f.metadata?.size as number | undefined) ?? 0, created_at: f.created_at ?? "" }))}
      />
    </>
  );
}

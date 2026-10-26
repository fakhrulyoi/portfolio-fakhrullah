"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCopy, FileDown, FileText, Loader2, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { Confirm } from "@/components/ui/confirm";
import { atsChecks, atsToText, buildAtsResume, keywordMatch, type AtsResume, type AtsSource } from "@/lib/ats";
import { saveAts, saveSettings } from "@/lib/actions";
import type { AtsSettings } from "@/lib/schemas";
import { AdminForm, type Field, type Values } from "../form";
import { uploadPdf } from "../uploads";
import { ResumePreview } from "./preview";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function AtsBuilder({ source, initial, ready }: { source: AtsSource; initial: AtsSettings; ready: boolean }) {
  const router = useRouter();
  const [ats, setAts] = useState<AtsSettings>(initial);
  const [busy, setBusy] = useState<"" | "pdf" | "docx" | "site">("");
  const [jd, setJd] = useState("");

  const onValuesChange = useCallback((v: Values) => setAts(v as AtsSettings), []);
  const resume: AtsResume = useMemo(() => buildAtsResume(source, ats), [source, ats]);
  const text = useMemo(() => atsToText(resume), [resume]);
  const checks = useMemo(() => atsChecks(resume), [resume]);
  const keywords = useMemo(() => (jd.trim().length > 40 ? keywordMatch(jd, text, 30) : []), [jd, text]);
  const matched = keywords.filter((k) => k.found).length;

  const fields: Field[] = [
    { type: "heading", name: "_top", label: "Header" },
    { type: "text", name: "target_title", label: "Target job title", half: true, maxLength: 120, placeholder: source.settings.profile.title, help: "Match the title in the job ad when it's accurate for you." },
    { type: "text", name: "file_name", label: "File name", half: true, maxLength: 80, placeholder: resume.fileName, help: "Used for the downloaded PDF and Word files." },
    { type: "toggle", name: "show_phone", label: "Include phone number", half: true },
    { type: "toggle", name: "show_location", label: "Include location", half: true },
    { type: "toggle", name: "show_links", label: "Include LinkedIn, GitHub and other links", half: true },
    { type: "heading", name: "_sum", label: "Summary and skills" },
    {
      type: "textarea",
      name: "summary",
      label: "Professional summary",
      rows: 5,
      maxLength: 1500,
      placeholder: source.settings.about.summary[0] ?? "",
      help: "Leave empty to use the first paragraph of About. 2–4 sentences works best.",
    },
    {
      type: "list",
      name: "skills",
      label: "Technical skills lines",
      itemLabel: "Line",
      maxLength: 400,
      multiline: true,
      help: `One line per category, written as "Category: skill, skill, skill" (the category is shown in bold). Leave empty to use your ${source.skill_groups.length} groups from the Skills page. Put the skills named in the job ad first.`,
    },
    { type: "list", name: "certifications", label: "Certifications", itemLabel: "Certification", maxLength: 200, help: "Only certificates you actually hold." },
    {
      type: "list",
      name: "references",
      label: "References",
      itemLabel: "Reference",
      multiline: true,
      maxLength: 300,
      help: "e.g. Name, position, organisation | email. Ask your referee first. Kept private: never shown on your website.",
    },
    { type: "heading", name: "_content", label: "What to include" },
    {
      type: "select",
      name: "max_bullets",
      label: "Bullet points per job",
      half: true,
      options: [
        { value: "all", label: "All" },
        { value: "6", label: "Up to 6" },
        { value: "4", label: "Up to 4" },
        { value: "3", label: "Up to 3" },
      ],
    },
    { type: "toggle", name: "include_projects", label: "Projects section", half: true },
    { type: "toggle", name: "include_languages", label: "Languages line under Technical Skills", half: true },
    { type: "toggle", name: "include_activities", label: "Leadership & Activities section", half: true },
    {
      type: "include",
      name: "excluded",
      label: "Items",
      help: "Untick anything that isn't relevant to this application.",
      options: [
        ...source.experiences.map((e) => ({ value: e.id, label: `${e.role}, ${e.company}`, group: "Experience" })),
        ...source.projects.map((p) => ({ value: p.id, label: p.title, group: "Projects" })),
        ...source.education.map((e) => ({ value: e.id, label: e.qualification, group: "Education" })),
      ],
    },
  ];

  async function makePdf() {
    const { resumePdfBlob } = await import("./pdf");
    return resumePdfBlob(resume);
  }

  async function onPdf() {
    setBusy("pdf");
    try {
      download(await makePdf(), `${resume.fileName}.pdf`);
    } catch (e) {
      toast.error(`Couldn't create the PDF: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setBusy("");
    }
  }
  async function onDocx() {
    setBusy("docx");
    try {
      const { resumeDocxBlob } = await import("./docx");
      download(await resumeDocxBlob(resume), `${resume.fileName}.docx`);
    } catch (e) {
      toast.error(`Couldn't create the Word file: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setBusy("");
    }
  }
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Plain-text resume copied.");
    } catch {
      toast.error("Copy failed. Select the text in the preview and copy it manually.");
    }
  }
  async function onUseOnSite() {
    setBusy("site");
    try {
      const blob = await makePdf();
      const file = new File([blob], `${resume.fileName}.pdf`, { type: "application/pdf" });
      const path = await uploadPdf(file);
      const r = await saveSettings("resume", {
        ...source.settings.resume,
        path,
        file_name: file.name,
        updated_at: new Date().toISOString(),
      });
      if (r.ok) toast.success("Saved as your website resume. Publish to make it live.");
      else toast.error(r.error);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the resume.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div data-wide className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6">
        {!ready && (
          <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed">
            <strong>One-time setup needed.</strong> To save resume settings, run{" "}
            <code className="rounded bg-sunken px-1">supabase/migrations/0002_private_resume_settings.sql</code> in Supabase → SQL Editor. You can
            still preview and download without it.
          </p>
        )}
        <section aria-labelledby="kw" className="rounded-xl border border-line bg-surface p-4">
          <h2 id="kw" className="text-sm font-semibold">Tailor to a job ad</h2>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="jd" className="text-[13px] font-normal text-muted">
              Paste a job ad to see which of its key terms your resume already uses. Nothing is saved.
            </Label>
            <Textarea id="jd" rows={5} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here" />
          </div>
          {keywords.length > 0 && (
            <>
              <p className="mt-4 text-sm">
                <span className="font-semibold">
                  {matched} of {keywords.length}
                </span>{" "}
                key terms found. Add missing ones only where they truthfully describe your experience.
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <li
                    key={k.term}
                    className={
                      k.found
                        ? "rounded-md bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-2 py-0.5 text-[13px] text-success"
                        : "rounded-md border border-dashed border-line-strong px-2 py-0.5 text-[13px] text-muted"
                    }
                  >
                    {k.found ? "✓ " : ""}
                    {k.term}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section aria-labelledby="ats-checks" className="rounded-xl border border-line bg-surface p-4">
          <h2 id="ats-checks" className="text-sm font-semibold">ATS checks</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex gap-2">
                {c.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Pass" />
                ) : (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-label="Check" />
                )}
                <span className={c.ok ? "text-ink-2" : "text-ink"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Already handled: one column, standard section names, real text (no images or tables), standard fonts, dates on every entry.
          </p>
        </section>

        <AdminForm
          fields={fields}
          initial={initial as unknown as Values}
          onSave={(v) => saveAts(v)}
          onValuesChange={onValuesChange}
          submitLabel="Save settings"
        />
      </div>

      <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
        <div className="flex flex-wrap gap-2">
          <Button variant="solid" size="sm" onClick={onPdf} disabled={busy !== ""}>
            {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />} Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onDocx} disabled={busy !== ""}>
            {busy === "docx" ? <Loader2 className="animate-spin" /> : <FileText />} Download Word
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <ClipboardCopy /> Copy as text
          </Button>
          <Confirm
            trigger={
              <Button variant="ghost" size="sm" disabled={busy !== ""}>
                {busy === "site" ? <Loader2 className="animate-spin" /> : <Upload />} Use on my website
              </Button>
            }
            title="Use this as your website resume?"
            description="This PDF replaces the resume visitors download from your site after you publish. Your current file stays in storage."
            confirmLabel="Use this resume"
            destructive={false}
            onConfirm={onUseOnSite}
          />
        </div>

        <ResumePreview r={resume} />

      </div>
    </div>
  );
}

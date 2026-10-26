"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Confirm } from "@/components/ui/confirm";
import { deleteStorageFile, saveSettings } from "@/lib/actions";
import { formatDateTime, storageUrl } from "@/lib/format";
import type { Settings } from "@/lib/schemas";
import { uploadPdf } from "./uploads";

export function ResumeManager({
  resume,
  livePath,
  files,
}: {
  resume: Settings["resume"];
  livePath: string;
  files: { path: string; name: string; size: number; created_at: string }[];
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const path = await uploadPdf(f);
      const r = await saveSettings("resume", { ...resume, path, file_name: f.name.slice(0, 200), updated_at: new Date().toISOString() });
      if (r.ok) toast.success("New resume saved to your draft. Publish to make it live.");
      else toast.error(r.error);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const togglePreview = (show_preview: boolean) =>
    start(async () => {
      const r = await saveSettings("resume", { ...resume, show_preview });
      if (r.ok) toast.success("Draft saved.");
      else toast.error(r.error);
      router.refresh();
    });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-line bg-surface p-5">
        {resume.path ? (
          <div className="flex flex-wrap items-center gap-4">
            <FileText className="size-8 text-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{resume.file_name || "Resume.pdf"}</p>
              <p className="text-[13px] text-muted">
                Uploaded {formatDateTime(resume.updated_at)}
                {resume.path === livePath ? ", live on your site" : ", not published yet"}
              </p>
            </div>
            <a href={storageUrl(resume.path)} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Open PDF
            </a>
          </div>
        ) : (
          <div>
            <p className="font-medium">No resume uploaded yet</p>
            <p className="mt-1 text-sm text-muted">Until you upload one, the Download Resume buttons stay hidden on your site.</p>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" id="resume-file" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="solid" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy ? "Uploading" : resume.path ? "Replace resume" : "Upload resume"}
          </Button>
          <p className="text-[13px] text-muted">PDF only, up to 10 MB.</p>
        </div>
      </div>

      <label className="flex items-start justify-between gap-6 rounded-xl border border-line bg-surface px-4 py-3">
        <span>
          <span className="block text-sm font-medium">Show a preview of the PDF on the site</span>
          <span className="block text-[13px] text-muted">Desktop only. Visitors can always download it.</span>
        </span>
        <Switch checked={resume.show_preview} onCheckedChange={togglePreview} disabled={pending || !resume.path} />
      </label>

      {files.length > 1 && (
        <section aria-labelledby="old-files">
          <h2 id="old-files" className="font-semibold">Stored files</h2>
          <p className="mt-1 text-sm text-muted">Older uploads are kept until you delete them. Files used by your draft or live site can&apos;t be deleted.</p>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {files.map((f) => {
              const inUse = f.path === resume.path || f.path === livePath;
              return (
                <li key={f.path} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 truncate">{f.name.replace(/^\d+-/, "")}</span>
                  <span className="text-[13px] text-muted">{f.created_at ? formatDateTime(f.created_at) : ""}</span>
                  {inUse ? (
                    <span className="w-16 text-right text-[12px] text-muted">In use</span>
                  ) : (
                    <Confirm
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Delete ${f.name}`} disabled={pending}>
                          <Trash2 />
                        </Button>
                      }
                      title="Delete this file?"
                      description="It will be permanently removed from storage. Older published versions that used it will no longer offer a resume download."
                      confirmLabel="Delete file"
                      onConfirm={() =>
                        start(async () => {
                          const r = await deleteStorageFile(f.path);
                          if (r.ok) toast.success(r.message);
                          else toast.error(r.error);
                          router.refresh();
                        })
                      }
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

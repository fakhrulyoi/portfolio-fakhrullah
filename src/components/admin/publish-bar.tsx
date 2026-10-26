"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Loader2, Rocket } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { publishSite } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";

export function PublishBar({ hasChanges, lastPublished, compact = false }: { hasChanges: boolean; lastPublished: string | null; compact?: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const publish = () =>
    start(async () => {
      const r = await publishSite(note);
      if (r.ok) {
        toast.success(r.message);
        setNote("");
        setOpen(false);
      } else toast.error(r.error);
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-2">
      <p className={`mr-auto items-center gap-2 text-[13px] text-muted sm:mr-2 ${compact ? "hidden" : "flex"}`} aria-live="polite">
        <span className={`size-2 shrink-0 rounded-full ${hasChanges ? "bg-amber-500" : "bg-success"}`} aria-hidden />
        <span className="hidden sm:inline">
          {hasChanges ? "Unpublished changes" : lastPublished ? `Live, published ${formatDateTime(lastPublished)}` : "Not published yet"}
        </span>
        <span className="sm:hidden">{hasChanges ? "Unpublished" : lastPublished ? "Live" : "Draft"}</span>
      </p>
      {!compact && (
        <Link href="/admin/preview" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Eye /> Preview
        </Link>
      )}
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger asChild>
          <Button variant="primary" size="sm" disabled={!hasChanges || pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Rocket />}
            Publish
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay data-overlay className="fixed inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <AlertDialog.Title className="text-lg font-semibold">Publish your changes?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">
              Everyone visiting your site will see the current draft. You can check it first with Preview, and restore an earlier version from the Overview page at any time.
            </AlertDialog.Description>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="publish-note">Note for your version history (optional)</Label>
              <Input id="publish-note" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added new project" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialog.Cancel>
              <Button variant="primary" onClick={publish} disabled={pending}>
                {pending && <Loader2 className="animate-spin" />}
                Publish now
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

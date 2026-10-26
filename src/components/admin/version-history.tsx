"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { restoreVersion } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";

export function VersionHistory({ versions }: { versions: { id: number; note: string; published_at: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!versions.length) return <p className="mt-3 rounded-2xl border border-dashed border-line-strong p-6 text-sm text-muted">Nothing published yet.</p>;
  return (
    <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
      {versions.map((v, i) => (
        <li key={v.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Version #{v.id}
              {i === 0 && <span className="ml-2 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-normal text-muted">Live</span>}
            </p>
            <p className="truncate text-[13px] text-muted">
              {formatDateTime(v.published_at)}
              {v.note ? `, ${v.note}` : ""}
            </p>
          </div>
          {i > 0 && (
            <Confirm
              trigger={
                <Button variant="ghost" size="sm" disabled={pending}>
                  <History /> Restore
                </Button>
              }
              title={`Restore version #${v.id}?`}
              description="Your draft will be replaced by this version and published immediately. Any unpublished edits are lost; every published version stays in this history, so you can switch back."
              confirmLabel="Restore and publish"
              destructive={false}
              onConfirm={() =>
                start(async () => {
                  const r = await restoreVersion(v.id);
                  if (r.ok) toast.success(r.message);
                  else toast.error(r.error);
                  router.refresh();
                })
              }
            />
          )}
        </li>
      ))}
    </ul>
  );
}

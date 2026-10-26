"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { deleteMessage, setMessageRead } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Msg = { id: string; name: string; email: string; subject: string; message: string; is_read: boolean; created_at: string };

export function MessageList({ messages }: { messages: Msg[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!messages.length)
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="font-medium">No messages yet</p>
        <p className="mt-1 text-sm text-muted">When someone uses the contact form on your site, their message appears here.</p>
      </div>
    );
  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error(r.error);
      else if (r.message) toast.success(r.message);
      router.refresh();
    });
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {messages.map((m) => {
        const open = openId === m.id;
        return (
          <li key={m.id}>
            <button
              type="button"
              aria-expanded={open}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-sunken/50"
              onClick={() => {
                setOpenId(open ? null : m.id);
                if (!m.is_read) run(() => setMessageRead(m.id, true));
              }}
            >
              <span className={cn("mt-2 size-2 shrink-0 rounded-full", m.is_read ? "bg-transparent" : "bg-accent")} aria-label={m.is_read ? undefined : "Unread"} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={cn("truncate", !m.is_read && "font-semibold")}>{m.name}</span>
                  <span className="shrink-0 text-[12px] text-muted">{formatDateTime(m.created_at)}</span>
                </span>
                <span className="block truncate text-sm text-muted">{m.subject || m.message}</span>
              </span>
            </button>
            {open && (
              <div className="border-t border-line bg-paper px-4 py-4 sm:pl-9">
                <p className="text-sm text-muted">
                  From {m.name} &lt;{m.email}&gt;
                </p>
                {m.subject && <p className="mt-2 font-medium">{m.subject}</p>}
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a className={buttonVariants({ variant: "solid", size: "sm" })} href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message"}`)}`}>
                    <Mail /> Reply by email
                  </a>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => setMessageRead(m.id, !m.is_read))}>
                    Mark as {m.is_read ? "unread" : "read"}
                  </Button>
                  <Confirm
                    trigger={
                      <Button variant="ghost" size="sm" disabled={pending}>
                        <Trash2 /> Delete
                      </Button>
                    }
                    title="Delete this message?"
                    description="This can't be undone."
                    confirmLabel="Delete message"
                    onConfirm={() => run(() => deleteMessage(m.id))}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

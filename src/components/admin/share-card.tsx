"use client";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export function ShareCard({ url, live }: { url: string; live: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the link is still selectable */
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
      <span className="relative flex size-2.5 shrink-0" aria-hidden>
        {live && <span className="absolute inset-0 rounded-full bg-success opacity-40 motion-safe:animate-ping" />}
        <span className={`relative size-2.5 rounded-full ${live ? "bg-success" : "bg-line-strong"}`} />
      </span>
      <div className="min-w-0 flex-1 basis-[calc(100%-2rem)] sm:basis-auto">
        <p className="text-[12px] text-muted">{live ? "Your portfolio is live at" : "Your portfolio address (not published yet)"}</p>
        <p className="truncate font-medium">{url.replace(/^https?:\/\//, "")}</p>
      </div>
      <Button variant="outline" size="sm" onClick={copy} className="press" aria-live="polite">
        {copied ? <Check className="text-success" /> : <Copy />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <a href={url} target="_blank" rel="noopener" className={buttonVariants({ variant: "solid", size: "sm" })}>
        <ExternalLink /> Open site
      </a>
    </div>
  );
}

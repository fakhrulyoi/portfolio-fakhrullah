"use client";
import { Printer } from "lucide-react";
import { useActiveSection } from "../active-section";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string; num: string };

export function DocToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));
  return (
    <nav aria-label="Contents" className="sticky top-24">
      <p className="mb-3 text-[13px] font-medium text-ink">Contents</p>
      <ol className="space-y-0.5 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={cn(
                "-ml-px flex gap-3 border-l py-1.5 pl-4 text-[13px] transition-colors",
                active === i.id ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <span className="w-4 tabular-nums">{i.num}</span>
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted transition-colors hover:bg-sunken hover:text-ink"
    >
      <Printer className="size-4" aria-hidden />
      <span className="hidden sm:inline">Print or save as PDF</span>
      <span className="sm:hidden">Print</span>
    </button>
  );
}

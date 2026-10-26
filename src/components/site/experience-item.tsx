"use client";
import { useId, useState } from "react";
import type { Experience } from "@/lib/schemas";
import { formatRange } from "@/lib/format";

const PREVIEW = 4;

export function ExperienceItem({ e }: { e: Experience }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const items = open ? e.highlights : e.highlights.slice(0, PREVIEW);
  const meta = [e.employment_type, e.work_mode, e.location].filter(Boolean).join(", ");
  return (
    <li className="relative grid grid-cols-1 gap-2 pb-12 pl-7 last:pb-0 md:grid-cols-[13rem_1fr] md:gap-10 md:pl-0">
      <span
        aria-hidden
        className="timeline-dot absolute left-[-5px] top-1.5 z-10 size-[11px] rounded-full border-2 border-line-strong bg-paper md:left-[calc(15.5rem-5px)]"
      />
      <div className="md:pt-0.5">
        <p className="text-sm tabular-nums text-muted">{formatRange(e.start_date, e.end_date, e.is_current)}</p>
        {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
      </div>
      <div className="md:pl-10">
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          {e.role}
          <span className="font-normal text-muted">, {e.company}</span>
        </h3>
        {e.context && <p className="mt-1 text-[15px] text-ink-2">{e.context}</p>}
        {e.summary && !e.highlights.length && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{e.summary}</p>}
        {e.highlights.length > 0 && (
          <ul id={id} className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-line-strong">
            {items.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        {e.highlights.length > PREVIEW && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            {open ? "Show fewer" : `Show all ${e.highlights.length} responsibilities`}
          </button>
        )}
        {e.tools.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tools and methods">
            {e.tools.map((t) => (
              <li key={t} className="rounded-md border border-line px-2 py-0.5 text-xs text-ink-2">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

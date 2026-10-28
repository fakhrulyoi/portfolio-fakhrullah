import type { IconSpec } from "@/lib/skill-icons";
import { SkillIcon } from "./skill-icon";

/** Two rows of tool badges drifting in opposite directions. Pauses on hover; static without motion. */
export function IconMarquee({ items, label }: { items: { name: string; spec: IconSpec }[]; label: string }) {
  if (items.length < 4) return null;
  const half = Math.ceil(items.length / 2);
  const second = items.slice(half);
  const rows = [items.slice(0, half), second.length >= 3 ? second : [...items].reverse()];
  return (
    <section aria-label={label} className="marquee relative overflow-hidden border-y border-line bg-surface/60 py-5">
      <ul className="sr-only">
        {items.map((i) => (
          <li key={i.name}>{i.name}</li>
        ))}
      </ul>
      {rows.map((row, r) => (
        <div key={r} aria-hidden className={`marquee-row flex w-max gap-3 ${r ? "marquee-rev mt-3" : ""}`}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-3 pr-3">
              {(row.length < 9 ? row.concat(row) : row).map((i, k) => (
                <span
                  key={`${copy}-${k}`}
                  className="marquee-item inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-[14px] font-medium text-ink-2"
                >
                  <SkillIcon spec={i.spec} className="size-[18px]" />
                  {i.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

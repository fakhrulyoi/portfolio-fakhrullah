"use client";
import { useActiveSection } from "../active-section";
import { cn } from "@/lib/utils";

export function PanelNav({ items, variant }: { items: { id: string; label: string }[]; variant: "side" | "bar" }) {
  const active = useActiveSection(items.map((i) => i.id));
  if (variant === "bar") {
    return (
      <nav aria-label="Sections" className="flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors",
              active === i.id ? "bg-ink text-paper" : "text-muted hover:text-ink",
            )}
          >
            {i.label}
          </a>
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label="Sections">
      <ul className="space-y-0.5">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active === i.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white",
              )}
            >
              <span
                aria-hidden
                className={cn("h-px transition-all", active === i.id ? "w-6 bg-[var(--accent)]" : "w-3 bg-white/30 group-hover:w-5")}
              />
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";
import { useEffect, useRef } from "react";
import type { IconSpec } from "@/lib/skill-icons";
import { SkillIcon } from "./skill-icon";

const SPOTS = [
  { x: 78, y: 12, d: 0.6, s: 1 },
  { x: 91, y: 24, d: 1, s: 0.85 },
  { x: 86, y: 70, d: 0.8, s: 1.05 },
  { x: 71, y: 84, d: 0.45, s: 0.8 },
  { x: 95, y: 88, d: 1.2, s: 0.9 },
  { x: 62, y: 93, d: 0.7, s: 0.75 },
];

/** Tool logos floating in the empty corners of the hero, drifting with the pointer (large screens only). */
export function HeroFloat({ items }: { items: { name: string; spec: IconSpec }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !document.documentElement.classList.contains("motion-ok") || !matchMedia("(hover: hover)").matches) return;
    const host = el.parentElement!;
    const tiles = [...el.querySelectorAll<HTMLElement>("[data-depth]")];
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      for (const t of tiles) {
        const d = Number(t.dataset.depth);
        t.style.translate = `${(x * d * 28).toFixed(1)}px ${(y * d * 22).toFixed(1)}px`;
      }
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    host.addEventListener("pointermove", move);
    return () => {
      host.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  if (items.length < 3) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {items.slice(0, SPOTS.length).map((it, i) => {
        const s = SPOTS[i];
        return (
          <span key={it.name} data-depth={s.d} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <span
              className="float-tile flex items-center justify-center rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]"
              style={{ "--i": i, width: `${3.5 * s.s}rem`, height: `${3.5 * s.s}rem` } as React.CSSProperties}
              title={it.name}
            >
              <SkillIcon spec={it.spec} className="size-[45%]" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

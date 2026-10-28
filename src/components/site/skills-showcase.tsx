"use client";
import { useEffect, useRef, useState } from "react";
import type { ConceptKey, IconSpec } from "@/lib/skill-icons";
import { SkillIcon, TechChip } from "./skill-icon";
import { cn } from "@/lib/utils";

type Group = { id: string; name: string; icon: ConceptKey; items: { name: string; spec: IconSpec }[] };
type Orb = { name: string; spec: IconSpec; groups: string[] };

/**
 * Skills as a rotating sphere of tool badges next to the grouped list.
 * Pointing at a group lights up its tools on the sphere. The sphere can be
 * dragged; it is decorative, the list carries the content.
 */
export function SkillsShowcase({ groups, orbs }: { groups: Group[]; orbs: Orb[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
      <div className="overflow-x-clip lg:sticky lg:top-24 lg:overflow-visible">
        <IconSphere orbs={orbs} active={active} />
        <p aria-hidden className="mt-2 text-center text-[13px] text-muted">
          {active ? `Showing ${groups.find((g) => g.id === active)?.name ?? ""}` : "Drag to spin. Select a group to light up its tools."}
        </p>
      </div>
      <ul className="gap-3 sm:columns-2 [&>li]:mb-3 [&>li]:break-inside-avoid">
        {groups.map((g, gi) => (
          <li
            key={g.id}
            onPointerEnter={() => setActive(g.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(g.id)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            className={cn(
              "skill-card group relative overflow-hidden rounded-2xl border bg-surface p-5 outline-none transition-[border-color,box-shadow,translate] duration-300 focus-visible:ring-2 focus-visible:ring-accent",
              active === g.id ? "-translate-y-0.5 border-[color-mix(in_oklab,var(--accent)_55%,var(--line))] shadow-[0_18px_40px_-26px_var(--accent)]" : "border-line",
            )}
            style={{ "--i": gi } as React.CSSProperties}
          >
            <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
              <span className="skill-badge flex size-8 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
                <SkillIcon spec={{ c: g.icon }} className="size-4" />
              </span>
              {g.name}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${g.name} skills`}>
              {g.items.map((s, i) => (
                <TechChip key={s.name} name={s.name} spec={s.spec} className="chip-pop" style={{ "--i": i } as React.CSSProperties} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconSphere({ orbs, active }: { orbs: Orb[]; active: string | null }) {
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ ax: -0.35, ay: 0, vx: 0, vy: 0.00028, drag: false, lx: 0, ly: 0 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const N = orbs.length;
    const pts = orbs.map((_, i) => {
      const y = N === 1 ? 0 : 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * 2.399963;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
    const motion = document.documentElement.classList.contains("motion-ok");
    let R = Math.min(el.clientWidth * 0.41, (el.clientWidth - 130) / 2);
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const s = state.current;

    const draw = () => {
      const cx = Math.cos(s.ax), sx = Math.sin(s.ax), cy = Math.cos(s.ay), sy = Math.sin(s.ay);
      pts.forEach((p, i) => {
        const node = items.current[i];
        if (!node) return;
        // rotate around Y, then X
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back .. 1 front
        node.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${(0.62 + depth * 0.48).toFixed(3)})`;
        node.style.setProperty("--depth", depth.toFixed(3));
        node.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!s.drag) {
        s.ay += s.vy * dt;
        s.ax += s.vx * dt;
        s.vy += (0.00028 - s.vy) * 0.02; // ease back to the idle spin
        s.vx *= 0.96;
      }
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (motion && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    draw();
    start();

    const down = (e: PointerEvent) => {
      s.drag = true;
      s.lx = e.clientX;
      s.ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!s.drag) return;
      const dx = e.clientX - s.lx, dy = e.clientY - s.ly;
      s.lx = e.clientX;
      s.ly = e.clientY;
      s.ay += dx * 0.008;
      s.ax = Math.max(-1.2, Math.min(1.2, s.ax - dy * 0.008));
      s.vy = dx * 0.0004;
      s.vx = -dy * 0.0002;
      if (!motion) draw();
    };
    const up = () => (s.drag = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const ro = new ResizeObserver(() => {
      R = Math.min(el.clientWidth * 0.41, (el.clientWidth - 130) / 2);
      draw();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [orbs]);

  return (
    <div ref={wrap} aria-hidden className="sphere relative mx-auto aspect-square w-full max-w-[26rem] cursor-grab touch-pan-y select-none active:cursor-grabbing">
      <span className="sphere-ring sphere-ring-a" />
      <span className="sphere-ring sphere-ring-b" />
      <span className="sphere-core" />
      {orbs.map((o, i) => (
        <span
          key={o.name}
          ref={(n) => {
            items.current[i] = n;
          }}
          data-dim={active && !o.groups.includes(active) ? "" : undefined}
          data-hot={active && o.groups.includes(active) ? "" : undefined}
          className="sphere-item absolute left-1/2 top-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 text-[12px] font-medium text-ink shadow-sm"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-sunken">
            <SkillIcon spec={o.spec} className="size-3.5" />
          </span>
          {o.name}
        </span>
      ))}
    </div>
  );
}

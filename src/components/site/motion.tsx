"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// One shared IntersectionObserver for every [data-reveal] element on the page.
// ---------------------------------------------------------------------------
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).setAttribute("data-shown", "");
          observer?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

/** Fades/slides its content in the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "fade" | "left";
  as?: "div" | "li" | "section" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const obs = getObserver();
    if (!el || !obs) return;
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={variant === "up" ? "" : variant}
      className={className}
      style={delay ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/** Thin accent bar at the top showing how far the page has been read. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? Math.min(1, h.scrollTop / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] print:hidden">
      <div ref={ref} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Button that appears after scrolling down a screen or two. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a
      href="#top"
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn(
        "press fixed bottom-5 right-5 z-40 inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-lg backdrop-blur transition-[opacity,transform] duration-300 hover:border-line-strong print:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-4" aria-hidden />
    </a>
  );
}

/** Tracks the pointer over any [data-spotlight] element (one listener). */
export function SpotlightTracker() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-spotlight]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}

/** Vertical line that fills as the reader moves through a timeline. */
export function TimelineRail({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const rail = ref.current;
    const list = rail?.parentElement;
    if (!rail || !list) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const mark = window.innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, (mark - r.top) / Math.max(1, r.height)));
      rail.style.setProperty("--p", p.toFixed(4));
      list.querySelectorAll<HTMLElement>(".timeline-dot").forEach((dot) => {
        const on = dot.getBoundingClientRect().top < mark;
        if (on) dot.setAttribute("data-on", "");
        else dot.removeAttribute("data-on");
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <span ref={ref} aria-hidden className={cn("pointer-events-none absolute bottom-2 top-2 w-px bg-line", className)}>
      <span className="timeline-fill absolute inset-0 block bg-accent" />
    </span>
  );
}

/** Splits text into words that rise in one after another (hero only). */
export function RiseWords({ text, start = 0, step = 70 }: { text: string; start?: number; step?: number }) {
  const words = text.split(/(\s+)/);
  let i = 0;
  return (
    <>
      {words.map((w, k) =>
        /^\s+$/.test(w) ? (
          w
        ) : (
          <span key={k} className="rise" style={{ "--d": start + step * i++ } as React.CSSProperties}>
            {w}
          </span>
        ),
      )}
    </>
  );
}

/** Drafting-table crosshair that follows the pointer inside its parent. */
export function Crosshair() {
  const h = useRef<HTMLSpanElement>(null);
  const v = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = wrap.current?.parentElement;
    if (!host || !matchMedia("(hover: hover)").matches || !document.documentElement.classList.contains("motion-ok")) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (h.current) h.current.style.transform = `translateY(${y}px)`;
      if (v.current) v.current.style.transform = `translateX(${x}px)`;
      if (dot.current) dot.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!on) {
        x = tx;
        y = ty;
        on = true;
        wrap.current?.style.setProperty("opacity", "1");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      on = false;
      wrap.current?.style.setProperty("opacity", "0");
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={wrap} aria-hidden className="crosshair pointer-events-none absolute inset-0 overflow-hidden opacity-0">
      <span ref={h} className="absolute inset-x-0 top-0 h-px bg-[color-mix(in_oklab,var(--accent)_28%,transparent)]" />
      <span ref={v} className="absolute inset-y-0 left-0 w-px bg-[color-mix(in_oklab,var(--accent)_28%,transparent)]" />
      <span ref={dot} className="absolute left-0 top-0 size-2 rounded-full border border-accent bg-paper" />
    </div>
  );
}

/** Pulls its child slightly toward the pointer. */
export function Magnetic({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover)").matches || !document.documentElement.classList.contains("motion-ok")) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${Math.max(-8, Math.min(8, dx))}px, ${Math.max(-6, Math.min(6, dy))}px)`;
    };
    const leave = () => (el.style.transform = "");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className="inline-flex transition-transform duration-300 ease-out">
      {children}
    </span>
  );
}

/** Oversized email address with a copy button. */
export function BigEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <a href={`mailto:${email}`} className="mega-link break-all pb-1 text-[clamp(1.75rem,5.6vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
        {email}
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* ignore */
          }
        }}
        className="press mb-2 inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy email"}
      </button>
    </div>
  );
}

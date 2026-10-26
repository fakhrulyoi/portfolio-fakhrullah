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

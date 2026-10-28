"use client";
import { useEffect, useRef, useState } from "react";

const motionOk = () => typeof document !== "undefined" && document.documentElement.classList.contains("motion-ok");

/** Decodes its text from random glyphs once, when first shown. Screen readers get the plain text. */
export function Scramble({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!motionOk()) return;
    const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#<>=";
    let raf = 0;
    let start = 0;
    const dur = 900 + text.length * 22;
    const tick = (now: number) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(k * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += i < fixed || ch === " " ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      setOut(s);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [text, delay]);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="tabular-nums">
        {out}
      </span>
    </span>
  );
}

/** Paragraph whose words light up from muted to full colour as it scrolls through the viewport. */
export function ScrollLit({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOk()) return;
    el.classList.add("lit-on");
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph top reaches 85% of the screen, 1 when its bottom reaches 45%.
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const n = Math.round(p * spans.length);
      if (n === last) return;
      for (let i = 0; i < spans.length; i++) spans[i].toggleAttribute("data-lit", i < n);
      last = n;
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
  }, [text]);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} data-w>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/** Circular gauge for a grade out of `max`. Fills and counts up when it scrolls into view. */
export function CountRing({ value, max = 4, label }: { value: number; max?: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(value);
  const [on, setOn] = useState(true);
  const pct = Math.max(0, Math.min(1, value / max));
  const C = 2 * Math.PI * 34;
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOk()) return;
    setOn(false);
    setShown(0);
    let raf = 0;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        setOn(true);
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / 1500);
          setShown(value * (1 - Math.pow(1 - k, 3)));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <div ref={ref} className="relative size-[5.5rem] shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--sunken)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={on ? C * (1 - pct) : C}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[1.2rem] font-semibold leading-none tabular-nums tracking-tight text-ink">{shown.toFixed(2)}</span>
        <span className="mt-1 text-[11px] text-muted">of {max.toFixed(2)}</span>
      </span>
    </div>
  );
}

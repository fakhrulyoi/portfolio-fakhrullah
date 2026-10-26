"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { StepArt } from "./step-art";
import { Reveal } from "./motion";

type Step = { label: string; detail: string };
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "How I work": on large screens the section pins while the reader scrolls
 * and each step takes the stage in turn with its own animated illustration.
 * On small screens it's a simple list that reveals as you scroll.
 */
export function Pipeline({ steps, title = "How I work" }: { steps: Step[]; title?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const n = steps.length;

  useEffect(() => {
    const el = outer.current;
    if (!el || n < 2) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setProgress(p);
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
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
  }, [n]);

  function goTo(i: number) {
    const el = outer.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (total * (i + 0.5)) / n;
    window.scrollTo({ top, behavior: "smooth" });
  }

  if (!n) return null;
  const step = steps[active];

  return (
    <section id="process" aria-labelledby="process-title" className="border-t border-line">
      {/* Screen readers and small screens: the full list */}
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:sr-only">
        <Reveal className="mb-10">
          <h2 id="process-title" className="flex items-center gap-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
            <span aria-hidden className="h-[0.9em] w-1 rounded-full bg-accent" />
            {title}
          </h2>
        </Reveal>
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <Reveal key={i} as="li" className="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-2xl border border-line bg-surface p-3 pr-5 sm:grid-cols-[9rem_1fr]">
              <div className="overflow-hidden rounded-xl bg-sunken">
                <StepArt label={s.label} className="h-auto w-full" />
              </div>
              <div>
                <p className="font-mono text-xs tabular-nums text-accent-ink">{pad(i + 1)}</p>
                <h3 className="mt-0.5 text-lg font-semibold tracking-tight">{s.label}</h3>
                {s.detail && <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{s.detail}</p>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Large screens: pinned stage */}
      <div ref={outer} className="relative hidden lg:block" style={{ height: `${n * 70 + 30}vh` }} aria-hidden>
        <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-16 px-8">
            <div>
              <p className="flex items-center gap-3 text-[1.75rem] font-semibold tracking-[-0.02em]">
                <span className="h-[0.9em] w-1 rounded-full bg-accent" />
                {title}
              </p>
              <div className="mt-14 flex items-end gap-4">
                <span key={`n${active}`} className="rise-b text-[7.5rem] font-semibold leading-[0.8] tracking-[-0.05em] tabular-nums text-ink">
                  {pad(active + 1)}
                </span>
                <span className="pb-2 font-mono text-sm text-muted">/ {pad(n)}</span>
              </div>
              <div key={`t${active}`} className="mt-8 min-h-[8.5rem]">
                <p className="rise-b text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em]">{step.label}</p>
                {step.detail && (
                  <p className="rise-b mt-4 max-w-md text-[17px] leading-relaxed text-ink-2" style={{ "--d": 120 } as React.CSSProperties}>
                    {step.detail}
                  </p>
                )}
              </div>
              <div className="mt-10 flex gap-1.5">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    tabIndex={-1}
                    onClick={() => goTo(i)}
                    title={s.label}
                    className="group relative h-8 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full origin-left rounded-full bg-accent transition-transform duration-300"
                        style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress * n - i))})` }}
                      />
                    </span>
                  </button>
                ))}
              </div>
              <ol className="mt-3 flex gap-1.5 text-[12px] text-muted">
                {steps.map((s, i) => (
                  <li key={i} className={cn("flex-1 truncate transition-colors", i === active && "text-ink")}>
                    {s.label}
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative">
              <div aria-hidden className="blueprint absolute -inset-10 opacity-70 [mask-image:radial-gradient(closest-side,#000,transparent)]" />
              <div className="relative aspect-[36/26] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
                <div key={active} className="art-on rise-b absolute inset-0 p-6">
                  <StepArt label={step.label} className="h-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

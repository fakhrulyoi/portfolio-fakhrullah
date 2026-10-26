/**
 * The hero's signature motion piece: the delivery flow the owner works
 * through. A signal loops from the first step to the last; each step lights
 * up as it passes. Pure CSS, disabled for reduced-motion visitors.
 */
export function DeliveryFlow({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  const n = steps.length;
  const ROW = 3.25; // rem between steps
  const TRAVEL = 4.8; // seconds for the signal to reach the last step
  const cycle = TRAVEL / 0.8; // travel is 80% of the loop
  const at = (i: number) => (n > 1 ? (i / (n - 1)) * TRAVEL : 0);
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-line bg-surface/95 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] backdrop-blur sm:p-8" aria-label="How I work">
      <figcaption className="mb-6 flex items-center justify-between gap-3 text-sm text-muted">
        How I take a requirement to sign-off
        <span aria-hidden className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-accent opacity-40 motion-safe:animate-ping" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
      </figcaption>
      <ol
        className="relative"
        style={{ "--travel": `${(n - 1) * ROW}rem`, "--cycle": `${cycle}s` } as React.CSSProperties}
      >
        <span aria-hidden className="absolute left-[7px] top-2 w-px bg-line-strong" style={{ height: `${(n - 1) * ROW}rem` }}>
          <span className="flow-rail-fill absolute inset-0 block bg-[color-mix(in_oklab,var(--accent)_45%,var(--line-strong))]" />
        </span>
        <span
          aria-hidden
          className="flow-signal absolute left-[2px] top-[3px] size-[11px] rounded-full bg-accent shadow-[0_0_0_5px_color-mix(in_oklab,var(--accent)_22%,transparent),0_0_18px_2px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
        />
        {steps.map((s, i) => (
          <li key={i} className="relative flex items-start gap-4" style={{ height: i === n - 1 ? "auto" : `${ROW}rem` }}>
            <span
              aria-hidden
              className="flow-node relative mt-[3px] size-[15px] shrink-0 rounded-full border-2"
              style={{ "--at": `${at(i)}s` } as React.CSSProperties}
            />
            <span className="flex items-baseline gap-3">
              <span className="w-5 font-mono text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="flow-label text-[15px] font-medium text-ink" style={{ "--at": `${at(i)}s` } as React.CSSProperties}>
                {s}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

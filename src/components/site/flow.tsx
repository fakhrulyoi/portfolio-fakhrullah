/**
 * The hero's signature element: the delivery flow the owner works through,
 * drawn as a vertical sequence. A single "signal" travels down it on load.
 */
export function DeliveryFlow({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  const n = steps.length;
  return (
    <figure className="relative rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-label="How I work">
      <figcaption className="mb-6 text-sm text-muted">How I take a requirement to sign-off</figcaption>
      <ol className="relative" style={{ "--travel": `${(n - 1) * 3.25}rem` } as React.CSSProperties}>
        <span aria-hidden className="absolute left-[7px] top-2 w-px bg-line-strong" style={{ height: `${(n - 1) * 3.25}rem` }} />
        <span
          aria-hidden
          className="flow-signal absolute left-[3px] top-[4px] size-[9px] rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_20%,transparent)]"
        />
        {steps.map((s, i) => (
          <li key={i} className="relative flex h-13 items-start gap-4 last:h-auto" style={{ height: i === n - 1 ? "auto" : "3.25rem" }}>
            <span
              aria-hidden
              className="flow-node relative mt-[3px] size-[15px] shrink-0 rounded-full border-2 border-line-strong bg-surface"
              style={{ "--i": i, "--n": Math.max(n - 1, 1) } as React.CSSProperties}
            />
            <span className="flex items-baseline gap-3">
              <span className="w-5 font-mono text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] font-medium text-ink">{s}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

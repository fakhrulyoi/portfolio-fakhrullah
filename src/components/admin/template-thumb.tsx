/** Small schematic of each template, used in the template picker. */
export function TemplateThumb({ id }: { id: string }) {
  const L = "var(--line-strong)";
  const A = "var(--accent)";
  const S = "var(--surface)";
  const K = "var(--sunken)";
  const bar = (x: number, y: number, w: number, f = L, h = 4) => <rect x={x} y={y} width={w} height={h} rx={2} fill={f} />;
  let body: React.ReactNode;
  if (id === "document") {
    body = (
      <>
        <rect width="160" height="100" fill={K} />
        {[0, 1, 2, 3].map((i) => bar(8, 14 + i * 9, i === 0 ? 18 : 22, i === 0 ? A : L, 3))}
        <rect x="42" y="8" width="104" height="92" rx="2" fill={S} stroke={L} />
        {bar(52, 18, 54, "var(--ink)", 7)}
        {bar(52, 31, 80)}
        {bar(52, 39, 70)}
        {bar(52, 52, 6, A)}
        {bar(61, 52, 34, "var(--ink)")}
        {[0, 1, 2].map((i) => bar(52, 61 + i * 8, 84 - i * 10))}
        {bar(52, 88, 6, A)}
      </>
    );
  } else if (id === "panel") {
    body = (
      <>
        <rect width="160" height="100" fill={S} />
        <rect width="50" height="100" fill="#15171c" />
        <rect x="8" y="10" width="14" height="14" rx="3" fill={A} />
        {bar(8, 30, 34, "#ffffff", 5)}
        {bar(8, 39, 24, "#ffffff66")}
        <rect x="8" y="48" width="20" height="7" rx="3.5" fill={A} />
        {[0, 1, 2, 3].map((i) => bar(8, 64 + i * 7, i === 0 ? 26 : 20, i === 0 ? "#ffffff" : "#ffffff55", 3))}
        {bar(60, 12, 78, "var(--ink)", 6)}
        {bar(60, 22, 56, "var(--ink)", 6)}
        {bar(60, 34, 70)}
        <rect x="60" y="46" width="90" height="24" rx="3" fill={K} stroke={L} />
        <rect x="60" y="74" width="43" height="20" rx="3" fill={K} stroke={L} />
        <rect x="107" y="74" width="43" height="20" rx="3" fill={K} stroke={L} />
      </>
    );
  } else {
    body = (
      <>
        <rect width="160" height="100" fill={S} />
        {bar(10, 8, 20, "var(--ink)", 3)}
        {[0, 1, 2, 3].map((i) => bar(96 + i * 14, 8, 10, L, 3))}
        {bar(10, 26, 70, "var(--ink)", 8)}
        {bar(10, 38, 50, "var(--ink)", 8)}
        {bar(10, 52, 64)}
        {bar(10, 59, 56)}
        <rect x="10" y="70" width="26" height="8" rx="4" fill={A} />
        <rect x="104" y="24" width="46" height="58" rx="3" fill={K} stroke={L} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <circle cx="112" cy={33 + i * 10} r="2.5" fill={A} />
            {bar(118, 31 + i * 10, 24)}
          </g>
        ))}
      </>
    );
  }
  return (
    <svg viewBox="0 0 160 100" className="h-auto w-full rounded-md border border-line" aria-hidden>
      {body}
    </svg>
  );
}

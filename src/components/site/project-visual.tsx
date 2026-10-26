import type { Project } from "@/lib/schemas";

/**
 * Generic, illustrative visuals used when a project has no screenshot
 * (or when the work is confidential). They depict the *kind* of work,
 * never real screens or data.
 */
export function ProjectVisual({ kind }: { kind: Project["visual"] }) {
  const L = "var(--line-strong)";
  const S = "var(--surface)";
  const K = "var(--sunken)";
  const A = "var(--accent)";
  const box = (x: number, y: number, w: number, h: number, fill = S, r = 6) => (
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={L} />
  );
  const bar = (x: number, y: number, w: number, fill = L) => <rect x={x} y={y} width={w} height={6} rx={3} fill={fill} />;

  let body: React.ReactNode;
  switch (kind) {
    case "dashboard":
      body = (
        <>
          {box(24, 24, 352, 192)}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              {box(40 + i * 112, 40, 96, 44, K)}
              {bar(52 + i * 112, 52, 40)}
              {bar(52 + i * 112, 66, 64, i === 0 ? A : L)}
            </g>
          ))}
          {box(40, 98, 208, 102, K)}
          {[30, 52, 40, 70, 58, 82].map((h, i) => (
            <rect key={i} x={56 + i * 30} y={186 - h} width={16} height={h} rx={3} fill={i === 5 ? A : L} className="pv-bar" style={{ "--i": i } as React.CSSProperties} />
          ))}
          {box(260, 98, 100, 102, K)}
          {[0, 1, 2, 3].map((i) => <g key={i}>{bar(272, 114 + i * 20, 76 - i * 10)}</g>)}
        </>
      );
      break;
    case "schedule":
      body = (
        <>
          {box(24, 24, 352, 192)}
          {[0, 1, 2, 3, 4].map((c) => <g key={c}>{bar(92 + c * 56, 40, 32)}</g>)}
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              {bar(40, 70 + r * 36, 36)}
              {[0, 1, 2, 3, 4].map((c) => (
                <rect
                  key={c}
                  x={84 + c * 56}
                  y={60 + r * 36}
                  width={48}
                  height={26}
                  rx={5}
                  fill={(r * 5 + c) % 7 === 2 ? A : (r + c) % 3 === 0 ? K : S}
                  stroke={L}
                  className={(r * 5 + c) % 7 === 2 ? "pv-pulse" : undefined}
                />
              ))}
            </g>
          ))}
        </>
      );
      break;
    case "chart":
      body = (
        <>
          {box(24, 24, 352, 192)}
          {box(40, 40, 200, 30, K)}
          {bar(52, 52, 120)}
          <rect x={250} y={40} width={110} height={30} rx={15} fill={A} />
          {[
            [96, A],
            [54, L],
            [30, L],
          ].map(([w, f], i) => (
            <g key={i}>
              {bar(40, 98 + i * 34, 60)}
              <rect x={112} y={94 + i * 34} width={(w as number) * 2.4} height={14} rx={4} fill={f as string} className="pv-line" style={{ "--i": i } as React.CSSProperties} />
            </g>
          ))}
        </>
      );
      break;
    case "booking":
      body = (
        <>
          {box(24, 24, 352, 192)}
          {box(40, 40, 150, 160, K)}
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect key={`${r}${c}`} x={52 + c * 26} y={56 + r * 27} width={20} height={20} rx={4} fill={r === 2 && c === 3 ? A : S} stroke={L} className={r === 2 && c === 3 ? "pv-pulse" : undefined} />
            )),
          )}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              {box(206, 40 + i * 54, 154, 44, i === 0 ? S : K)}
              {bar(218, 54 + i * 54, 70)}
              {bar(218, 68 + i * 54, 110)}
              <circle cx={340} cy={62 + i * 54} r={6} fill={i === 0 ? A : L} />
            </g>
          ))}
        </>
      );
      break;
    case "learning":
      body = (
        <>
          {box(24, 24, 352, 192)}
          {box(40, 40, 200, 120, K)}
          <path d="M128 84 l28 16 -28 16z" fill={A} className="pv-pulse" />
          {bar(40, 174, 160)}
          {bar(40, 190, 110)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {box(252, 40 + i * 42, 108, 34, i === 1 ? S : K)}
              <circle cx={268} cy={57 + i * 42} r={7} fill={i === 1 ? A : L} />
              {bar(282, 54 + i * 42, 64)}
            </g>
          ))}
        </>
      );
      break;
    case "document":
      body = (
        <>
          {box(110, 20, 180, 200)}
          {bar(130, 44, 90, A)}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={130} y={66 + i * 16} width={i % 3 === 2 ? 90 : 140} height={6} rx={3} fill={L} className="pv-line" style={{ "--i": i } as React.CSSProperties} />
          ))}
          {box(130, 196 - 10, 60, 14, K, 3)}
        </>
      );
      break;
    case "flow":
    default:
      body = (
        <>
          {[
            [32, 98],
            [128, 54],
            [128, 142],
            [236, 98],
          ].map(([x, y], i) => (
            <g key={i}>
              {box(x, y, 84, 40, i === 3 ? S : K)}
              {bar(x + 12, y + 17, i === 3 ? 44 : 56, i === 3 ? A : L)}
            </g>
          ))}
          <path d="M116 118 H122 V74 H128 M122 118 V162 H128 M212 74 H224 V118 H236 M212 162 H224 V118" fill="none" stroke={L} strokeWidth={1.5} />
          <path d="M116 118 H122 V74 H128 M122 118 V162 H128 M212 74 H224 V118 H236 M212 162 H224 V118" fill="none" stroke={A} strokeWidth={1.5} strokeDasharray="4 12" className="pv-dash" opacity={0.9} />
          <circle cx={336} cy={118} r={16} fill="none" stroke={A} strokeWidth={1.5} className="pv-pulse" />
          <path d="M329 118 l5 5 9 -10" fill="none" stroke={A} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
  }

  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" role="img" aria-label="Illustration of the type of work, not an actual screenshot">
      {body}
    </svg>
  );
}

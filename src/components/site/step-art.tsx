/**
 * Minimal animated illustrations for each "How I work" step. The kind is
 * picked from the step's name; animations run when an ancestor has
 * .art-on or [data-shown] (see globals.css, "Step art").
 */
type Kind = "req" | "doc" | "sys" | "wire" | "test" | "sign" | "generic";

export function stepKind(label: string): Kind {
  const l = label.toLowerCase();
  if (/requirement|gather|analys|stakeholder|discover/.test(l)) return "req";
  if (/spec|srs|sdd|sds|document/.test(l)) return "doc";
  if (/design|api|architect|integrat|flow|system/.test(l)) return "sys";
  if (/wireframe|prototype|figma|\bui\b|\bux\b|mockup/.test(l)) return "wire";
  if (/test|uat|\bqa\b|quality|defect|verify/.test(l)) return "test";
  if (/sign|support|deploy|launch|deliver|handover|go-live|release/.test(l)) return "sign";
  return "generic";
}

const L = "var(--line-strong)";
const S = "var(--surface)";
const K = "var(--sunken)";
const A = "var(--accent)";
const I = (i: number) => ({ "--i": i }) as React.CSSProperties;

function Req() {
  return (
    <>
      {[
        [26, 40, -4],
        [44, 108, 3],
        [30, 176, -2],
      ].map(([x, y, r], i) => (
        <g key={i} className="a-pop" style={{ ...I(i), transformOrigin: "center" }} transform={`rotate(${r} ${x + 45} ${y + 25})`}>
          <rect x={x} y={y} width="96" height="52" rx="6" fill={i === 1 ? "color-mix(in oklab, var(--accent) 14%, var(--surface))" : S} stroke={L} />
          <rect x={x + 12} y={y + 15} width="56" height="5" rx="2.5" fill={L} />
          <rect x={x + 12} y={y + 28} width="40" height="5" rx="2.5" fill={L} />
        </g>
      ))}
      {[66, 134, 202].map((y, i) => (
        <path key={i} className="a-draw" style={I(i + 3)} pathLength={1} d={`M ${i === 1 ? 142 : 124} ${y} C 170 ${y}, 180 ${110 + i * 22}, 214 ${110 + i * 22}`} fill="none" stroke={A} strokeWidth="1.5" />
      ))}
      <rect x="214" y="78" width="122" height="104" rx="8" fill={S} stroke={L} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="232" cy={110 + i * 22} r="4" fill={A} className="a-pop" style={I(i + 5)} />
          <rect x="244" y={107 + i * 22} width={74 - i * 10} height="6" rx="3" fill={L} className="a-grow-x" style={I(i + 5)} />
        </g>
      ))}
      <rect x="226" y="90" width="50" height="6" rx="3" fill="var(--ink)" opacity=".75" />
    </>
  );
}

function Doc() {
  return (
    <>
      <rect x="96" y="18" width="170" height="224" rx="8" fill={S} stroke={L} />
      <path d="M 236 18 L 266 48 L 236 48 Z" fill={K} stroke={L} />
      <rect x="116" y="40" width="72" height="9" rx="4.5" fill={A} className="a-grow-x" style={I(0)} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect
          key={i}
          x="116"
          y={66 + i * 17 + (i > 3 ? 10 : 0)}
          width={i === 3 || i === 8 ? 70 : i % 3 === 2 ? 110 : 130}
          height="5"
          rx="2.5"
          fill={i === 4 ? "var(--ink)" : L}
          opacity={i === 4 ? 0.7 : 1}
          className="a-grow-x"
          style={I(i + 1)}
        />
      ))}
      <rect x="226" y="208" width="4" height="12" fill={A} className="a-caret" />
      <g className="a-pop" style={I(10)}>
        <rect x="40" y="172" width="78" height="30" rx="15" fill="color-mix(in oklab, var(--accent) 14%, var(--surface))" stroke={A} />
        <rect x="56" y="185" width="46" height="5" rx="2.5" fill={A} />
      </g>
    </>
  );
}

function Sys() {
  const nodes = [
    [40, 100],
    [150, 36],
    [150, 164],
    [262, 100],
  ];
  const path = "M 102 120 C 126 120, 126 56, 150 56 M 212 56 C 238 56, 238 120, 262 120 M 102 120 C 126 120, 126 184, 150 184 M 212 184 C 238 184, 238 120, 262 120";
  return (
    <>
      <path d={path} pathLength={1} fill="none" stroke={L} strokeWidth="1.5" className="a-draw" style={I(2)} />
      {nodes.map(([x, y], i) => (
        <g key={i} className="a-pop" style={{ ...I(i), transformOrigin: "center" }}>
          <rect x={x} y={y} width="62" height="40" rx="8" fill={i === 3 ? "color-mix(in oklab, var(--accent) 14%, var(--surface))" : S} stroke={i === 3 ? A : L} />
          <rect x={x + 12} y={y + 17} width={i === 3 ? 26 : 38} height="6" rx="3" fill={i === 3 ? A : L} />
        </g>
      ))}
      <circle r="5" fill={A} className="a-travel" style={{ offsetPath: "path('M 102 120 C 126 120, 126 56, 150 56 L 212 56 C 238 56, 238 120, 262 120')" } as React.CSSProperties} />
      <circle r="5" fill={A} className="a-travel" style={{ offsetPath: "path('M 102 120 C 126 120, 126 184, 150 184 L 212 184 C 238 184, 238 120, 262 120')", animationDelay: "1.4s" } as React.CSSProperties} />
      <text x="40" y="232" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
        POST /applications → 201
      </text>
    </>
  );
}

function Wire() {
  return (
    <>
      <rect x="40" y="22" width="280" height="206" rx="10" fill={S} stroke={L} />
      <rect x="40" y="22" width="280" height="26" rx="10" fill={K} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={56 + i * 12} cy="35" r="3.5" fill={L} />
      ))}
      <rect x="54" y="62" width="60" height="150" rx="6" fill={K} className="a-pop" style={I(0)} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="64" y={76 + i * 18} width={i === 0 ? 40 : 32} height="5" rx="2.5" fill={i === 0 ? A : L} className="a-grow-x" style={I(i + 1)} />
      ))}
      <rect x="126" y="62" width="180" height="40" rx="6" fill="color-mix(in oklab, var(--accent) 12%, var(--surface))" stroke={A} className="a-pop" style={I(2)} />
      {[0, 1].map((r) =>
        [0, 1].map((c) => (
          <rect key={`${r}${c}`} x={126 + c * 94} y={112 + r * 52} width="86" height="44" rx="6" fill={K} stroke={L} className="a-pop" style={I(3 + r * 2 + c)} />
        )),
      )}
      <g className="a-cursor">
        <path d="M 0 0 L 0 16 L 4.5 12 L 8 19 L 10.5 18 L 7 11 L 13 11 Z" fill="var(--ink)" stroke={S} strokeWidth="1" />
      </g>
    </>
  );
}

function Test() {
  return (
    <>
      <rect x="70" y="24" width="220" height="212" rx="10" fill={S} stroke={L} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="90" y={46 + i * 38} width="22" height="22" rx="6" fill={K} stroke={L} />
          <path d={`M 95 ${57 + i * 38} l 4.5 4.5 l 8 -9`} pathLength={1} fill="none" stroke={A} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="a-draw" style={I(i * 2 + 1)} />
          <rect x="124" y={51 + i * 38} width={i % 2 ? 110 : 140} height="6" rx="3" fill={L} />
          <rect x="124" y={61 + i * 38} width={i % 2 ? 70 : 90} height="4" rx="2" fill={K} />
        </g>
      ))}
      <rect x="90" y="206" width="180" height="8" rx="4" fill={K} />
      <rect x="90" y="206" width="180" height="8" rx="4" fill={A} className="a-grow-x a-slow" style={I(1)} />
    </>
  );
}

function Sign() {
  return (
    <>
      <rect x="64" y="28" width="150" height="200" rx="8" fill={S} stroke={L} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="84" y={52 + i * 18} width={i === 4 ? 60 : 108} height="5" rx="2.5" fill={L} />
      ))}
      <path d="M 86 196 c 10 -14, 18 6, 28 -6 s 14 8, 24 -2" pathLength={1} fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" className="a-draw" style={I(1)} />
      <g className="a-stamp" style={{ transformOrigin: "236px 150px" }}>
        <circle cx="236" cy="150" r="44" fill="color-mix(in oklab, var(--accent) 10%, var(--surface))" stroke={A} strokeWidth="2.5" />
        <circle cx="236" cy="150" r="35" fill="none" stroke={A} strokeWidth="1" strokeDasharray="3 4" />
        <path d="M 220 151 l 10 10 l 20 -22" pathLength={1} fill="none" stroke={A} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="a-draw" style={I(6)} />
      </g>
    </>
  );
}

function Generic() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="180" cy="130" r={30 + i * 26} fill="none" stroke={i === 0 ? A : L} className="a-pop" style={I(i)} />
      ))}
      <circle cx="180" cy="130" r="8" fill={A} />
    </>
  );
}

const ART: Record<Kind, () => React.ReactNode> = { req: Req, doc: Doc, sys: Sys, wire: Wire, test: Test, sign: Sign, generic: Generic };

export function StepArt({ label, className }: { label: string; className?: string }) {
  const Art = ART[stepKind(label)];
  return (
    <svg viewBox="0 0 360 260" className={className} aria-hidden>
      <Art />
    </svg>
  );
}

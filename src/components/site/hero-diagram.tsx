/**
 * Hero illustration: a small data flow diagram that draws itself, then data
 * packets keep moving along the flows. It shows the kind of artefact the
 * owner produces; the labels are generic, not from any client system.
 * Pure SVG/CSS; without motion it is simply the finished diagram.
 */
const FLOWS = [
  { id: "f1", d: "M112 140 C 140 140, 130 60, 160 60", label: "request", lx: 92, ly: 84, at: 0.5 },
  { id: "f2", d: "M288 60 C 340 60, 374 90, 374 128", label: "record", lx: 318, ly: 50, at: 1.1 },
  { id: "f3", d: "M224 98 L 224 200", label: "details", lx: 232, ly: 154, at: 1.6 },
  { id: "f4", d: "M374 172 C 374 212, 340 240, 290 240", label: "history", lx: 296, ly: 222, at: 2.2 },
  { id: "f5", d: "M160 240 C 110 240, 64 222, 64 176", label: "status", lx: 74, ly: 262, at: 2.5 },
];

export function HeroDiagram({ className }: { className?: string }) {
  const d = (s: number) => ({ "--at": `${s}s` }) as React.CSSProperties;
  return (
    <figure aria-label="Illustration: a data flow diagram" className={`dfd relative rounded-[1.4rem] border border-line bg-surface/90 shadow-[0_30px_70px_-40px_rgb(0_0_0/0.45)] backdrop-blur ${className ?? ""}`}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 text-[13px] text-muted">
        <span>How I map a process</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 rounded-full bg-accent opacity-50 motion-safe:animate-ping" />
            <span className="relative size-1.5 rounded-full bg-accent" />
          </span>
          Data flow
        </span>
      </figcaption>
      <svg viewBox="0 0 440 300" className="block h-auto w-full p-3" aria-hidden>
        <defs>
          <marker id="dfd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
          </marker>
          <pattern id="dfd-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0 H0 V20" fill="none" stroke="var(--line)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="440" height="300" fill="url(#dfd-grid)" opacity="0.7" />

        {/* Flows */}
        {FLOWS.map((f) => (
          <g key={f.id} className="dfd-flow" style={d(f.at)}>
            <path className="dfd-line" d={f.d} pathLength={1} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
            <path className="dfd-head" d={f.d} fill="none" stroke="transparent" markerEnd="url(#dfd-arrow)" />
            <text x={f.lx} y={f.ly} fontSize="11" fill="var(--muted)" className="dfd-label">
              {f.label}
            </text>
          </g>
        ))}

        {/* External entity */}
        <g className="dfd-node" style={d(0.2)}>
          <rect x="16" y="126" width="96" height="50" rx="4" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.4" />
          <rect x="20" y="130" width="96" height="50" rx="4" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
          <text x="64" y="156" fontSize="12.5" fontWeight="600" textAnchor="middle" fill="var(--ink)">
            Applicant
          </text>
        </g>

        {/* Processes */}
        {[
          { x: 160, y: 22, n: "1.0", t: ["Capture", "request"], at: 0.8 },
          { x: 160, y: 202, n: "2.0", t: ["Validate", "details"], at: 1.9 },
        ].map((p) => (
          <g key={p.n} className="dfd-node" style={d(p.at)}>
            <rect x={p.x} y={p.y} width="128" height="76" rx="14" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.4" />
            <line x1={p.x} x2={p.x + 128} y1={p.y + 22} y2={p.y + 22} stroke="var(--line-strong)" />
            <text x={p.x + 64} y={p.y + 15} fontSize="10.5" textAnchor="middle" fill="var(--accent-ink)" fontWeight="600">
              {p.n}
            </text>
            <text x={p.x + 64} y={p.y + 44} fontSize="12.5" textAnchor="middle" fill="var(--ink)" fontWeight="600">
              {p.t[0]}
            </text>
            <text x={p.x + 64} y={p.y + 61} fontSize="12.5" textAnchor="middle" fill="var(--ink)" fontWeight="600">
              {p.t[1]}
            </text>
          </g>
        ))}

        {/* Data store */}
        <g className="dfd-node" style={d(1.4)}>
          <rect x="322" y="128" width="106" height="44" fill="color-mix(in oklab, var(--accent) 7%, var(--surface))" />
          <path d="M428 128 H322 V172 H428" fill="none" stroke="var(--ink-2)" strokeWidth="1.4" />
          <line x1="352" x2="352" y1="128" y2="172" stroke="var(--ink-2)" strokeWidth="1.2" />
          <text x="337" y="154" fontSize="11" textAnchor="middle" fill="var(--accent-ink)" fontWeight="600">
            D1
          </text>
          <text x="390" y="154" fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="600">
            Records
          </text>
        </g>

        {/* Data packets travelling along the flows (motion only) */}
        <g className="dfd-packets">
          {FLOWS.map((f, i) => (
            <circle key={f.id} r="4" fill="var(--accent)" opacity="0">
              <animateMotion dur="2.2s" repeatCount="indefinite" begin={`${3.4 + i * 0.45}s`} path={f.d} />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.2s" repeatCount="indefinite" begin={`${3.4 + i * 0.45}s`} />
            </circle>
          ))}
        </g>
      </svg>
    </figure>
  );
}

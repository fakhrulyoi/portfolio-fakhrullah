import {
  ArrowLeftRight, BadgeCheck, Bug, ClipboardList, Code2, Database, Dna, FileText, FlaskConical, GitCompare, LayoutTemplate,
  MousePointerClick, Network, Palette, Plug, RefreshCw, Route, ScanSearch, ShieldCheck, Sparkles, Table2, Users, Workflow, Wrench, FileStack,
} from "lucide-react";
import type { ConceptKey, IconSpec } from "@/lib/skill-icons";
import { cn } from "@/lib/utils";

const CONCEPT: Record<ConceptKey, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  requirements: ClipboardList, process: Workflow, gap: GitCompare, spec: FileText, diagram: Network, sequence: ArrowLeftRight,
  wireframe: LayoutTemplate, prototype: MousePointerClick, journey: Route, test: FlaskConical, api: Plug, bug: Bug, uat: BadgeCheck,
  standard: ShieldCheck, database: Database, code: Code2, agile: RefreshCw, design: Palette, data: Table2, algorithm: Dna,
  search: ScanSearch, people: Users, doc: FileStack, tool: Wrench, spark: Sparkles,
};

/** A brand logo (in its own colour) or a neutral line icon. Decorative: the skill name is always shown as text. */
export function SkillIcon({ spec, className }: { spec?: IconSpec; className?: string }) {
  if (spec?.b) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn("brand-icon shrink-0", spec.b.d && "brand-dark", spec.b.l && "brand-light", className)}
        style={{ "--bi": `#${spec.b.h}` } as React.CSSProperties}
      >
        <use href={`#bi-${spec.b.id}`} />
      </svg>
    );
  }
  const Icon = CONCEPT[spec?.c ?? "spark"];
  return <Icon aria-hidden className={cn("shrink-0 text-accent-ink", className)} strokeWidth={1.8} />;
}

/** Skill or tool chip with its icon. */
export function TechChip({ name, spec, className, style }: { name: string; spec?: IconSpec; className?: string; style?: React.CSSProperties }) {
  return (
    <li
      style={style}
      className={cn(
        "tech-chip group/chip inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-1.5 pr-2.5 text-[13px] text-ink-2",
        className,
      )}
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-sunken transition-transform duration-300 group-hover/chip:rotate-[-8deg] group-hover/chip:scale-110">
        <SkillIcon spec={spec} className="size-3" />
      </span>
      {name}
    </li>
  );
}

/** One hidden SVG holding every brand logo used on the page; icons reference it with <use>. */
export function BrandSprite({ items }: { items: { id: string; p: string }[] }) {
  if (!items.length) return null;
  return (
    <svg aria-hidden width="0" height="0" className="absolute size-0 overflow-hidden">
      <defs>
        {items.map((i) => (
          <symbol key={i.id} id={`bi-${i.id}`} viewBox="0 0 24 24">
            <path d={i.p} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

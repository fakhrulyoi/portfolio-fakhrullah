import { BRAND_ICONS } from "./brand-icons";

/**
 * Picks an icon for a skill or tool name. Brand logos are used only when the
 * name is exactly that product (so "Postman-style testing" does not get the
 * Postman logo); everything else gets a neutral concept icon.
 * Import this from server components only, and pass the results to client
 * components, so the logo data stays out of the browser bundle.
 */
export type ConceptKey =
  | "requirements" | "process" | "gap" | "spec" | "diagram" | "sequence" | "wireframe" | "prototype" | "journey"
  | "test" | "api" | "bug" | "uat" | "standard" | "database" | "code" | "agile" | "design" | "data" | "algorithm"
  | "search" | "people" | "doc" | "tool" | "spark";
export type IconSpec = { b?: { id: string; h: string; d: 0 | 1; l: 0 | 1 }; c?: ConceptKey };

const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9+#.]+/g, " ").trim();

const BY_NAME = new Map<string, (typeof BRAND_ICONS)[number]>();
const BY_ID = new Map<string, string>();
const idOf = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "");
for (const i of BRAND_ICONS) {
  for (const n of [i.t, ...i.a]) BY_NAME.set(norm(n), i);
  BY_ID.set(idOf(i.t), i.p);
}

const CONCEPTS: [RegExp, ConceptKey][] = [
  [/requirement|elicitation|stakeholder/, "requirements"],
  [/gap/, "gap"],
  [/business process|workflow|process/, "process"],
  [/\bsrs\b|\bsdd\b|\bsds\b|\bbrs\b|specification|procedure/, "spec"],
  [/sequence/, "sequence"],
  [/dfd|data flow|diagram|flow|uml|erd|model/, "diagram"],
  [/wireframe|wireflow|mockup/, "wireframe"],
  [/prototyp/, "prototype"],
  [/journey|persona/, "journey"],
  [/\bapi\b|integration|endpoint/, "api"],
  [/defect|bug|debug/, "bug"],
  [/\buat\b|\bfat\b|acceptance/, "uat"],
  [/test|\bqa\b/, "test"],
  [/cmmi|standard|iso|compliance/, "standard"],
  [/oracle|sql|database|db\b|heidisql|dbeaver/, "database"],
  [/java|code|ide|netbeans|programming|vs ?code/, "code"],
  [/agile|scrum|sprint/, "agile"],
  [/canva|design|ui|ux/, "design"],
  [/genetic|algorithm|tf idf|machine learning|ai\b/, "algorithm"],
  [/data|excel|report/, "data"],
  [/analysis|research/, "search"],
  [/communication|collaboration|leadership|team/, "people"],
  [/document|writing/, "doc"],
  [/tool/, "tool"],
];

export function iconFor(name: string): IconSpec {
  const n = norm(name);
  const b = BY_NAME.get(n);
  if (b) return { b: { id: idOf(b.t), h: b.h, d: b.d, l: b.l } };
  for (const [re, key] of CONCEPTS) if (re.test(n)) return { c: key };
  return { c: "spark" };
}

export function iconMap(names: string[]): Record<string, IconSpec> {
  const out: Record<string, IconSpec> = {};
  for (const n of names) out[n] = iconFor(n);
  return out;
}

export function groupIcon(name: string): ConceptKey {
  const n = norm(name);
  if (/analysis|requirement/.test(n)) return "search";
  if (/document/.test(n)) return "doc";
  if (/design|model/.test(n)) return "diagram";
  if (/ui|ux/.test(n)) return "design";
  if (/test|support|quality/.test(n)) return "test";
  if (/program|web|develop|code/.test(n)) return "code";
  if (/data/.test(n)) return "database";
  if (/tool|practice/.test(n)) return "tool";
  return iconFor(name).c ?? "spark";
}

/** Only the entries of `map` for `names` (keeps client props small). */
export function pick(map: Record<string, IconSpec>, names: string[]): Record<string, IconSpec> {
  const out: Record<string, IconSpec> = {};
  for (const n of names) if (map[n]) out[n] = map[n];
  return out;
}

/** Path data for every brand logo used, for a single SVG sprite on the page. */
export function spriteFor(specs: IconSpec[]): { id: string; p: string }[] {
  const ids = [...new Set(specs.map((s) => s.b?.id).filter(Boolean) as string[])];
  return ids.map((id) => ({ id, p: BY_ID.get(id) ?? "" })).filter((x) => x.p);
}

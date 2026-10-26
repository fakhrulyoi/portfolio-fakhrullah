import { formatRange } from "./format";
import type { Education, Experience, Project, Settings, SkillGroup } from "./schemas";

/** Plain, single-column resume structure used by the preview, PDF, Word and text exports. */
export type AtsResume = {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  skills: string[];
  experience: { heading: string; org: string; meta: string; dates: string; bullets: string[] }[];
  projects: { heading: string; meta: string; bullets: string[] }[];
  education: { heading: string; org: string; dates: string; detail: string }[];
  certifications: string[];
  languages: string[];
  activities: string[];
  fileName: string;
};

export type AtsSource = {
  settings: Settings;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skill_groups: SkillGroup[];
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function buildAtsResume(src: AtsSource, ats: Settings["ats"]): AtsResume {
  const { profile, about } = src.settings;
  const excluded = new Set(ats.excluded);
  const limit = ats.max_bullets === "all" ? Infinity : Number(ats.max_bullets);

  const contact = [
    ats.show_location && profile.location,
    profile.email,
    ats.show_phone && profile.phone,
    ats.show_links && profile.linkedin_url && profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, ""),
    ats.show_links && profile.github_url && profile.github_url.replace(/^https?:\/\/(www\.)?/, ""),
    ...(ats.show_links ? profile.other_links.map((l) => l.url.replace(/^https?:\/\/(www\.)?/, "")) : []),
  ].filter(Boolean) as string[];

  const skills = ats.skills.length ? ats.skills : src.skill_groups.filter((g) => g.visible !== false).flatMap((g) => g.items);

  const base = clean(profile.full_name.replace(/\s+bin(ti)?\s+.*/i, "")) || "Resume";
  const fileName = (ats.file_name || `${base} Resume`).replace(/\s+/g, "_");

  return {
    name: profile.full_name,
    title: ats.target_title || profile.title,
    contact,
    summary: clean(ats.summary || about.summary[0] || profile.intro || ""),
    skills: [...new Set(skills.map(clean).filter(Boolean))],
    experience: src.experiences
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        heading: e.role,
        org: e.company,
        meta: [e.employment_type, e.location].filter(Boolean).join(", "),
        dates: formatRange(e.start_date, e.end_date, e.is_current),
        bullets: (e.highlights.length ? e.highlights : e.summary ? [e.summary] : []).slice(0, limit).map(clean),
      })),
    projects: ats.include_projects
      ? src.projects
          .filter((p) => !excluded.has(p.id))
          .map((p) => ({
            heading: p.title,
            meta: [p.role, p.year].filter(Boolean).join(", "),
            bullets: [
              ...(p.contributions.length ? p.contributions : p.summary ? [p.summary] : []).slice(0, Math.min(limit, 4)),
              ...p.awards.map((a) => `Award: ${a}`),
              ...(p.tech.length ? [`Technologies: ${p.tech.join(", ")}`] : []),
            ].map(clean),
          }))
      : [],
    education: src.education
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        heading: e.qualification,
        org: e.institution,
        dates: formatRange(e.start_date, e.end_date),
        detail: e.grade,
      })),
    certifications: ats.certifications,
    languages: ats.include_languages ? about.languages : [],
    activities: ats.include_activities ? about.activities : [],
    fileName,
  };
}

/** Plain-text version (paste into job portals that ask for text). */
export function atsToText(r: AtsResume) {
  const out: string[] = [r.name.toUpperCase(), r.title, r.contact.join(" | "), ""];
  const section = (t: string) => out.push("", t.toUpperCase(), "-".repeat(t.length));
  if (r.summary) {
    section("Professional Summary");
    out.push(r.summary);
  }
  if (r.skills.length) {
    section("Skills");
    out.push(r.skills.join(", "));
  }
  if (r.experience.length) {
    section("Work Experience");
    r.experience.forEach((e) => {
      out.push("", `${e.heading} | ${e.org}${e.meta ? ` | ${e.meta}` : ""}`, e.dates);
      e.bullets.forEach((b) => out.push(`- ${b}`));
    });
  }
  if (r.projects.length) {
    section("Projects");
    r.projects.forEach((p) => {
      out.push("", `${p.heading}${p.meta ? ` | ${p.meta}` : ""}`);
      p.bullets.forEach((b) => out.push(`- ${b}`));
    });
  }
  if (r.education.length) {
    section("Education");
    r.education.forEach((e) => out.push("", `${e.heading} | ${e.org}`, [e.dates, e.detail].filter(Boolean).join(" | ")));
  }
  if (r.certifications.length) {
    section("Certifications");
    r.certifications.forEach((c) => out.push(`- ${c}`));
  }
  if (r.languages.length) {
    section("Languages");
    out.push(r.languages.join(", "));
  }
  if (r.activities.length) {
    section("Leadership and Activities");
    r.activities.forEach((a) => out.push(`- ${a}`));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ---------------------------------------------------------------------------
// Rough keyword match against a job description
// ---------------------------------------------------------------------------
const STOP = new Set(
  `a about above across after again against all also an and any are as at be because been before being below between both but by can could did do does doing during each either etc few for from further had has have having he her here hers him his how i if in into is it its itself just least less like may me more most must my no nor not of off on once only or other our ours out over own per same she should so some such than that the their them then there these they this those through to too under until up upon us very via was we were what when where which while who whom why will with within without would you your yours
  ability able apply applicant applicants candidate candidates company role position job work working team teams years year experience experienced strong good excellent knowledge skills skill including include includes required preferred plus responsibilities responsible responsibility opportunity join looking seeking based ensure provide support related relevant using use used well new etc e.g i.e minimum degree diploma bachelor field least prepare gather create perform assist help make take handle maintain carry other various across day daily within key`.split(/\s+/),
);

function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[-./]+|[-./]+$/g, ""))
    .filter(Boolean)
    .join(" ");
}

/** Top terms (1–2 words) from a job description, with whether the resume contains them. */
export function keywordMatch(jobText: string, resumeText: string, limit = 30) {
  const jd = normalise(jobText);
  const resume = ` ${normalise(resumeText)} `;
  if (!jd) return [];
  const words = jd.split(" ");
  const counts = new Map<string, number>();
  const add = (t: string, w = 1) => counts.set(t, (counts.get(t) ?? 0) + w);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.length < 2 || STOP.has(w) || /^\d+$/.test(w)) continue;
    add(w);
    const n = words[i + 1];
    if (n && !STOP.has(n) && n.length >= 2 && !/^\d+$/.test(n)) add(`${w} ${n}`, 1.5);
  }
  const terms = [...counts.entries()]
    .filter(([t, c]) => (t.includes(" ") ? c >= 3 : c >= 1) && t.length >= 2)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  const picked: string[] = [];
  for (const [t] of terms) {
    if (picked.length >= limit) break;
    // Skip a single word already covered by a chosen two-word phrase.
    if (!t.includes(" ") && picked.some((p) => p.split(" ").includes(t))) continue;
    if (picked.includes(`${t}s`) || (t.endsWith("s") && picked.includes(t.slice(0, -1)))) continue;
    picked.push(t);
  }
  // Drop single words that a chosen phrase already covers.
  const phrases = picked.filter((t) => t.includes(" "));
  const final = picked.filter((t) => t.includes(" ") || !phrases.some((p) => p.split(" ").includes(t)));
  const has = (t: string) => resume.includes(` ${t} `);
  return final.map((term) => ({
    term,
    found: has(term) || has(`${term}s`) || (term.endsWith("s") && has(term.slice(0, -1))),
  }));
}

/** Simple ATS-readiness checks. */
export function atsChecks(r: AtsResume) {
  const words = atsToText(r).split(/\s+/).length;
  return [
    { ok: Boolean(r.contact.some((c) => c.includes("@"))), label: "Email address included" },
    { ok: Boolean(r.title), label: "Target job title at the top" },
    { ok: r.summary.length >= 150 && r.summary.length <= 700, label: "Summary is 2–4 sentences (150–700 characters)" },
    { ok: r.skills.length >= 6 && r.skills.length <= 30, label: "6–30 skills listed as keywords" },
    { ok: r.experience.every((e) => e.dates), label: "Every job has dates" },
    { ok: r.experience.every((e) => e.bullets.length <= 8), label: "No more than 8 bullet points per job" },
    { ok: words <= 900, label: `Length suits 1–2 pages (${words} words)` },
  ];
}

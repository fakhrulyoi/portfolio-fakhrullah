import type { AtsSettings, Education, Experience, Project, Settings, SkillGroup } from "./schemas";

/**
 * Resume structure (matches the owner's reference layout): centred header,
 * Professional Summary, Technical Skills (labelled lines), Work Experience,
 * Education, Projects, Certifications, Leadership & Activities, Reference.
 */
export type AtsEntry = { heading: string; sub: string; dates: string; bullets: string[] };
export type AtsResume = {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  skills: { label: string; text: string }[];
  experience: AtsEntry[];
  education: AtsEntry[];
  projects: AtsEntry[];
  certifications: string[];
  activities: string[];
  references: string[];
  fileName: string;
};

export type AtsSource = {
  settings: Settings;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skill_groups: SkillGroup[];
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const longMonth = (ym: string) => {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "";
};
/** "February 2026 – Present"; whole calendar years (Jan–Dec) show just the end year. */
export function longRange(start: string, end: string, current = false) {
  if (!current && /-01$/.test(start) && /-12$/.test(end)) return end.slice(0, 4);
  const s = longMonth(start);
  const e = current ? "Present" : longMonth(end);
  return s && e ? `${s} – ${e}` : s || e;
}
const stripUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const joinAnd = (a: string[]) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

function placeLine(institution: string, location: string) {
  const extra = location
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !/^malaysia$/i.test(p) && !institution.toLowerCase().includes(p.toLowerCase()));
  return [institution, ...extra].join(", ");
}

export function buildAtsResume(src: AtsSource, ats: AtsSettings): AtsResume {
  const { profile, about } = src.settings;
  const excluded = new Set(ats.excluded);
  const limit = ats.max_bullets === "all" ? Infinity : Number(ats.max_bullets);

  const contact = [
    ats.show_location && profile.location,
    ats.show_phone && profile.phone,
    profile.email,
    ...(ats.show_links ? [profile.linkedin_url, profile.github_url, ...profile.other_links.map((l) => l.url)].filter(Boolean).map(stripUrl) : []),
  ].filter(Boolean) as string[];

  // Skills: custom lines ("Label: items") or the Skills page groups.
  const skills = (
    ats.skills.length
      ? ats.skills.map((line) => {
          const i = line.indexOf(":");
          return i > 0 && i < 60 ? { label: line.slice(0, i).trim(), text: line.slice(i + 1).trim() } : { label: "", text: line };
        })
      : src.skill_groups.filter((g) => g.visible !== false && g.items.length).map((g) => ({ label: g.name, text: g.items.join(", ") }))
  ).filter((l) => l.text);
  if (ats.include_languages && about.languages.length && !skills.some((l) => /^languages?$/i.test(l.label))) {
    skills.push({ label: "Languages", text: about.languages.join(", ") });
  }

  const base = clean(profile.full_name.replace(/\s+bin(ti)?\s+.*/i, "")) || "Resume";
  const fileName = (ats.file_name || `${base} Resume`).replace(/\s+/g, "_");

  return {
    name: profile.full_name,
    title: ats.target_title || profile.title,
    contact,
    summary: clean(ats.summary || about.summary[0] || profile.intro || ""),
    skills,
    experience: src.experiences
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        heading: /internship/i.test(e.employment_type) && !/intern/i.test(e.role) ? `${e.role} (Internship)` : e.role,
        sub: [e.company, e.context, e.location ? `${e.location}${e.work_mode ? ` (${e.work_mode})` : ""}` : ""].filter(Boolean).join(" | "),
        dates: longRange(e.start_date, e.end_date, e.is_current),
        bullets: (e.highlights.length ? e.highlights : e.summary ? [e.summary] : []).slice(0, limit).map(clean),
      })),
    education: src.education
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        heading: e.qualification,
        sub: [placeLine(e.institution, e.location), e.grade].filter(Boolean).join(" | "),
        dates: longRange(e.start_date, e.end_date),
        bullets: [],
      })),
    projects: ats.include_projects
      ? src.projects
          .filter((p) => !excluded.has(p.id))
          .map((p) => ({
            heading: /final year project/i.test(p.category) && !/final year/i.test(p.title) ? `${p.title} (Final Year Project)` : p.title,
            sub: "",
            dates: p.year,
            bullets: [
              ...(p.contributions.length ? p.contributions : p.summary ? [p.summary] : []).slice(0, Math.min(limit, 4)),
              ...(p.awards.length ? [`Awards: ${joinAnd(p.awards)}.`] : []),
            ].map(clean),
          }))
      : [],
    certifications: ats.certifications,
    activities: ats.include_activities ? about.activities : [],
    references: ats.references,
    fileName,
  };
}

/** Plain-text version (paste into job portals that ask for text). */
export function atsToText(r: AtsResume) {
  const out: string[] = [r.name.toUpperCase(), r.title, r.contact.join(" | ")];
  const section = (t: string) => out.push("", t.toUpperCase());
  const entries = (list: AtsEntry[]) =>
    list.forEach((e) => {
      out.push(`${e.heading}${e.dates ? ` | ${e.dates}` : ""}`);
      if (e.sub) out.push(e.sub);
      e.bullets.forEach((b) => out.push(`- ${b}`));
    });
  if (r.summary) {
    section("Professional Summary");
    out.push(r.summary);
  }
  if (r.skills.length) {
    section("Technical Skills");
    r.skills.forEach((l) => out.push(l.label ? `${l.label}: ${l.text}` : l.text));
  }
  if (r.experience.length) {
    section("Work Experience");
    entries(r.experience);
  }
  if (r.education.length) {
    section("Education");
    entries(r.education);
  }
  if (r.projects.length) {
    section("Projects");
    entries(r.projects);
  }
  if (r.certifications.length) {
    section("Certifications");
    r.certifications.forEach((c) => out.push(`- ${c}`));
  }
  if (r.activities.length) {
    section("Leadership & Activities");
    r.activities.forEach((a) => out.push(`- ${a}`));
  }
  if (r.references.length) {
    section(r.references.length > 1 ? "References" : "Reference");
    r.references.forEach((x) => out.push(x));
  }
  return out.join("\n").trim() + "\n";
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
    { ok: r.skills.some((l) => l.text.split(",").length >= 3), label: "Skills listed as keywords" },
    { ok: r.experience.every((e) => e.dates), label: "Every job has dates" },
    { ok: r.experience.every((e) => e.bullets.length <= 8), label: "No more than 8 bullet points per job" },
    { ok: words <= 900, label: `Length suits 1–2 pages (${words} words)` },
  ];
}

import { z } from "zod";

// ---------- shared field helpers (strict: used when saving) ----------
const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const reqText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(max, `Keep this under ${max} characters`);
const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s<>"]+$/i.test(v), "Enter a full link starting with https://");
const emailOrEmpty = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address");
const list = (maxItems: number, maxLen: number) =>
  z
    .array(z.string().trim().max(maxLen, `Each item must be under ${maxLen} characters`))
    .transform((a) => a.filter(Boolean))
    .pipe(z.array(z.string()).max(maxItems, `Up to ${maxItems} items`));
const yearMonth = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}$/.test(v), "Use the month picker (YYYY-MM)");
const hex = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #2450D8");
const storagePath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(images|documents)\/[\w\-./]+$/.test(v), "Invalid file reference");

// ---------- site settings (one JSON document) ----------
export const profileSchema = z.object({
  full_name: reqText(120, "Full name"),
  short_name: text(60),
  title: text(120),
  headline: text(220),
  intro: text(600),
  process_steps: list(8, 40),
  location: text(120),
  availability: z.object({ enabled: z.boolean(), text: text(140) }),
  photo_path: storagePath,
  show_photo: z.boolean(),
  email: emailOrEmpty,
  phone: text(40),
  show_phone: z.boolean(),
  linkedin_url: urlOrEmpty,
  github_url: urlOrEmpty,
  other_links: z
    .array(z.object({ label: text(40), url: urlOrEmpty }))
    .transform((a) => a.filter((l) => l.label || l.url))
    .pipe(
      z
        .array(
          z.object({
            label: z.string().min(1, "Each link needs a label"),
            url: z.string().min(1, "Each link needs a URL"),
          }),
        )
        .max(6, "Up to 6 links"),
    ),
});

export const aboutSchema = z.object({
  summary: list(6, 1500),
  strengths: list(16, 160),
  interests: list(12, 80),
  languages: list(8, 80),
  activities: list(10, 300),
});

export const resumeSchema = z.object({
  path: storagePath,
  file_name: text(200),
  updated_at: text(40),
  show_preview: z.boolean(),
});

export const seoSchema = z.object({
  title: text(120),
  description: text(300),
  og_image_path: storagePath,
});

export const themeSchema = z.object({
  template: z.enum(["classic", "document", "panel"]),
  accent: hex,
  default_mode: z.enum(["light", "dark", "system"]),
  allow_toggle: z.boolean(),
});

export const SECTION_KEYS = ["about", "experience", "projects", "skills", "education", "resume", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const sectionsSchema = z.object({
  about: z.boolean(),
  experience: z.boolean(),
  projects: z.boolean(),
  skills: z.boolean(),
  education: z.boolean(),
  resume: z.boolean(),
  contact: z.boolean(),
});

export const contactSettingsSchema = z.object({
  intro: text(300),
  form_enabled: z.boolean(),
});

export const atsSchema = z.object({
  target_title: text(120),
  summary: text(1500),
  skills: list(60, 80),
  certifications: list(12, 200),
  max_bullets: z.enum(["all", "6", "4", "3"]),
  show_phone: z.boolean(),
  show_location: z.boolean(),
  show_links: z.boolean(),
  include_projects: z.boolean(),
  include_languages: z.boolean(),
  include_activities: z.boolean(),
  excluded: z.array(z.uuid()).max(300),
  file_name: z
    .string()
    .trim()
    .max(80)
    .refine((v) => v === "" || /^[\w\- .]+$/.test(v), "Use letters, numbers, spaces, - and _ only"),
});

export const settingsSectionSchemas = {
  profile: profileSchema,
  about: aboutSchema,
  resume: resumeSchema,
  seo: seoSchema,
  theme: themeSchema,
  sections: sectionsSchema,
  contact: contactSettingsSchema,
  ats: atsSchema,
} as const;

export type Settings = { [K in keyof typeof settingsSectionSchemas]: z.output<(typeof settingsSectionSchemas)[K]> };
export type SettingsSection = keyof Settings;

export const DEFAULT_SETTINGS: Settings = {
  profile: {
    full_name: "",
    short_name: "",
    title: "",
    headline: "",
    intro: "",
    process_steps: [],
    location: "",
    availability: { enabled: false, text: "" },
    photo_path: "",
    show_photo: true,
    email: "",
    phone: "",
    show_phone: false,
    linkedin_url: "",
    github_url: "",
    other_links: [],
  },
  about: { summary: [], strengths: [], interests: [], languages: [], activities: [] },
  resume: { path: "", file_name: "", updated_at: "", show_preview: true },
  seo: { title: "", description: "", og_image_path: "" },
  theme: { template: "classic", accent: "#2450D8", default_mode: "light", allow_toggle: true },
  sections: { about: true, experience: true, projects: true, skills: true, education: true, resume: true, contact: true },
  contact: { intro: "", form_enabled: true },
  ats: {
    target_title: "",
    summary: "",
    skills: [],
    certifications: [],
    max_bullets: "all",
    show_phone: true,
    show_location: true,
    show_links: true,
    include_projects: true,
    include_languages: true,
    include_activities: false,
    excluded: [],
    file_name: "",
  },
};

/** Fill any missing keys (e.g. after adding a new setting) with defaults. */
export function mergeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, Record<string, unknown>>;
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as SettingsSection[]) {
    const def = DEFAULT_SETTINGS[key] as Record<string, unknown>;
    const val = r[key] && typeof r[key] === "object" ? r[key] : {};
    const merged: Record<string, unknown> = { ...def };
    for (const k of Object.keys(def)) {
      const v = (val as Record<string, unknown>)[k];
      const d = def[k];
      if (v === undefined || v === null) continue;
      if (Array.isArray(d)) merged[k] = Array.isArray(v) ? v : d;
      else if (d && typeof d === "object") merged[k] = { ...(d as object), ...(typeof v === "object" ? v : {}) };
      else if (typeof v === typeof d) merged[k] = v;
    }
    out[key] = merged;
  }
  return out as Settings;
}

// ---------- collection tables ----------
export const experienceSchema = z
  .object({
    company: reqText(160, "Company"),
    role: reqText(160, "Job title"),
    employment_type: text(60),
    work_mode: text(60),
    location: text(160),
    context: text(240),
    start_date: yearMonth,
    end_date: yearMonth,
    is_current: z.boolean(),
    summary: text(1200),
    highlights: list(20, 600),
    tools: list(30, 60),
    visible: z.boolean(),
  })
  .refine((v) => v.is_current || !v.end_date || !v.start_date || v.end_date >= v.start_date, {
    message: "End date must be after the start date",
    path: ["end_date"],
  });

export const PROJECT_VISUALS = ["flow", "dashboard", "schedule", "chart", "booking", "learning", "document"] as const;

export const projectSchema = z.object({
  title: reqText(160, "Title"),
  category: text(80),
  year: text(40),
  summary: text(600),
  role: text(200),
  contributions: list(12, 400),
  awards: list(6, 200),
  tech: list(20, 60),
  image_path: storagePath,
  image_alt: text(200),
  visual: z.enum(PROJECT_VISUALS),
  live_url: urlOrEmpty,
  repo_url: urlOrEmpty,
  case_study_url: urlOrEmpty,
  confidential: z.boolean(),
  featured: z.boolean(),
  visible: z.boolean(),
});

export const skillGroupSchema = z.object({
  name: reqText(120, "Category name"),
  items: list(40, 80),
  visible: z.boolean(),
});

export const educationSchema = z.object({
  institution: reqText(200, "Institution"),
  qualification: reqText(200, "Qualification"),
  field: text(160),
  location: text(160),
  start_date: yearMonth,
  end_date: yearMonth,
  grade: text(80),
  details: list(10, 400),
  visible: z.boolean(),
});

export const COLLECTIONS = {
  experiences: experienceSchema,
  projects: projectSchema,
  skill_groups: skillGroupSchema,
  education: educationSchema,
} as const;
export type CollectionName = keyof typeof COLLECTIONS;
export const isCollection = (v: string): v is CollectionName => v in COLLECTIONS;

export type Experience = z.infer<typeof experienceSchema> & { id: string; sort_order: number };
export type Project = z.infer<typeof projectSchema> & { id: string; sort_order: number };
export type SkillGroup = z.infer<typeof skillGroupSchema> & { id: string; sort_order: number };
export type Education = z.infer<typeof educationSchema> & { id: string; sort_order: number };

export type Portfolio = {
  settings: Settings;
  experiences: Experience[];
  projects: Project[];
  skill_groups: SkillGroup[];
  education: Education[];
  published_at: string | null;
};

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120, "Name is too long"),
  email: z.string().trim().max(200).regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address"),
  subject: z.string().trim().max(200, "Subject is too long").default(""),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(5000, "Message is too long (5,000 characters max)"),
  company: z.string().max(0).optional().default(""), // honeypot: must stay empty
  started_at: z.coerce.number().optional(),
  turnstile_token: z.string().max(4096).optional(),
});

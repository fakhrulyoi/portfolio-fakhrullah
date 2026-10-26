import { Mail, Phone, Link as LinkIcon } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import type { Portfolio } from "@/lib/schemas";
import { storageUrl } from "@/lib/format";

export type IconType = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
export type ContactLink = { href: string; label: string; icon: IconType; name: string };
export type SectionId = "about" | "experience" | "projects" | "skills" | "education" | "resume" | "contact";

export const TEMPLATES = ["classic", "document", "panel"] as const;
export type TemplateId = (typeof TEMPLATES)[number];

/** Props every template receives. */
export type TemplateProps = {
  data: Portfolio;
  model: PortfolioModel;
  resumeHref: string;
  previewBanner?: React.ReactNode;
  contactDisabled: boolean;
};

const SECTION_LABELS: [SectionId, string][] = [
  ["about", "About"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["resume", "Resume"],
  ["contact", "Contact"],
];

/** Everything derived from the data that all templates need. */
export function buildModel(data: Portfolio) {
  const { settings, experiences, projects, skill_groups, education } = data;
  const { profile, about, sections, resume } = settings;
  const hasResume = Boolean(resume.path);

  const show: Record<SectionId, boolean> = {
    about: sections.about && (about.summary.length > 0 || about.strengths.length > 0),
    experience: sections.experience && experiences.length > 0,
    projects: sections.projects && projects.length > 0,
    skills: sections.skills && skill_groups.length > 0,
    education: sections.education && education.length > 0,
    resume: sections.resume && hasResume,
    contact: sections.contact,
  };
  const nav = SECTION_LABELS.filter(([k]) => show[k]).map(([id, label]) => ({ id, label }));

  const photo = profile.show_photo && profile.photo_path ? storageUrl(profile.photo_path) : "";
  const contactLinks = [
    profile.email && { href: `mailto:${profile.email}`, label: profile.email, icon: Mail, name: "Email" },
    profile.linkedin_url && { href: profile.linkedin_url, label: "LinkedIn", icon: LinkedinIcon, name: "LinkedIn" },
    profile.github_url && { href: profile.github_url, label: "GitHub", icon: GithubIcon, name: "GitHub" },
    ...profile.other_links.map((l) => ({ href: l.url, label: l.label, icon: LinkIcon, name: l.label })),
    profile.show_phone &&
      profile.phone && { href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`, label: profile.phone, icon: Phone, name: "Phone" },
  ].filter(Boolean) as ContactLink[];

  const current = experiences.find((e) => e.is_current);
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    jobTitle: profile.title || undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
    sameAs: [profile.linkedin_url, profile.github_url, ...profile.other_links.map((l) => l.url)].filter(Boolean),
    worksFor: current ? { "@type": "Organization", name: current.company } : undefined,
    alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution })),
  };

  return { show, nav, photo, contactLinks, hasResume, personLd };
}
export type PortfolioModel = ReturnType<typeof buildModel>;

export function externalProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer me" } : {};
}

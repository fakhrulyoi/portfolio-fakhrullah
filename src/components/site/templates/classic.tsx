import { ArrowDown, Download, MapPin, FileText, Trophy, UserRound, BriefcaseBusiness, FolderKanban, Cpu, GraduationCap, Send } from "lucide-react";
import { iconFor, iconMap, groupIcon, pick, spriteFor } from "@/lib/skill-icons";
import { BrandSprite, SkillIcon } from "../skill-icon";
import { IconMarquee } from "../icon-marquee";
import { HeroFloat } from "../hero-float";
import { HeroDiagram } from "../hero-diagram";
import { MobileDock } from "../mobile-dock";
import { SkillsShowcase } from "../skills-showcase";
import { CountRing, Scramble, ScrollLit } from "../motion-plus";
import { formatDateTime, formatMonth, formatRange, parseStep, storageUrl } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader } from "../header";
import { ExperienceItem } from "../experience-item";
import { ProjectCard } from "../project-card";
import { ContactForm } from "../contact-form";
import { externalProps, type TemplateProps } from "../model";
import { JsonLd } from "./shared";
import { BackToTop, BigEmail, Crosshair, Magnetic, Reveal, RiseWords, ScrollProgress, SpotlightTracker, TimelineRail } from "../motion";
import { Pipeline } from "../pipeline";

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  about: UserRound,
  experience: BriefcaseBusiness,
  projects: FolderKanban,
  skills: Cpu,
  education: GraduationCap,
  resume: FileText,
  contact: Send,
};

function Section({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = SECTION_ICONS[id];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("border-t border-line py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <h2 id={`${id}-title`} className="sec-title flex items-center gap-3.5 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2.25rem]">
            {Icon ? (
              <span aria-hidden className="sec-badge relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-fg shadow-[0_10px_24px_-10px_var(--accent)]">
                <Icon className="size-5" strokeWidth={2} />
              </span>
            ) : (
              <span aria-hidden className="h-[0.9em] w-1 rounded-full bg-accent" />
            )}
            <span className="sec-mask block overflow-hidden pb-[0.08em]">
              <span className="sec-text block">{title}</span>
            </span>
          </h2>
          {intro && <p className="mt-3 text-[17px] leading-relaxed text-muted">{intro}</p>}
        </Reveal>
        <Reveal variant="fade" delay={80}>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

function cgpa(grade: string) {
  const m = /cgpa\s*([0-4]\.\d{1,2})/i.exec(grade);
  return m ? Number(m[1]) : null;
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-2">
        {items.map((i) => (
          <li key={i} className="border-b border-line pb-2 last:border-0">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Classic: open layout, process-flow hero, card grid of projects. */
export function ClassicTemplate({ data, model, resumeHref, previewBanner, contactDisabled }: TemplateProps) {
  const { settings, experiences, projects, skill_groups, education } = data;
  const { profile, about, resume, contact, theme } = settings;
  const { show, nav, photo, contactLinks, hasResume } = model;
  const steps = profile.process_steps.map(parseStep);

  // Icons for every skill, tool and technology named on the page (resolved here, on the server).
  const allNames = [...new Set([...skill_groups.flatMap((g) => g.items), ...experiences.flatMap((e) => e.tools), ...projects.flatMap((p) => p.tech)])];
  const icons = iconMap(allNames);
  const branded = allNames.filter((n) => icons[n].b);
  const marquee = [...branded, ...allNames.filter((n) => !icons[n].b && n.length <= 22)].slice(0, 26).map((name) => ({ name, spec: icons[name] }));
  const orbNames = [...branded, ...skill_groups.flatMap((g) => g.items).filter((n) => !icons[n].b && n.length <= 16)];
  const orbs = [...new Set(orbNames)].slice(0, 20).map((name) => ({
    name,
    spec: icons[name],
    groups: skill_groups.filter((g) => g.items.includes(name)).map((g) => g.id),
  }));
  const groups = skill_groups.map((g) => ({ id: g.id, name: g.name, icon: groupIcon(g.name), items: g.items.map((n) => ({ name: n, spec: icons[n] })) }));
  const awards = projects.flatMap((p) => p.awards.map((award) => ({ award, project: p.title })));
  // Keep the large "lit" lead short: the first sentence or two, the rest as normal text.
  const [firstPara = "", ...otherParas] = about.summary;
  const sentences = firstPara.split(/(?<=[.!?])\s+/);
  let lead = "";
  while (sentences.length && (lead.length < 60 || !lead)) lead = `${lead} ${sentences.shift()}`.trim();
  const restSummary = [sentences.join(" "), ...otherParas].filter(Boolean);

  return (
    <div id="top" className="min-h-dvh bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <BrandSprite items={spriteFor(Object.values(icons))} />
      <ScrollProgress />
      <SpotlightTracker />
      <SiteHeader
        name={profile.short_name || profile.full_name}
        nav={[...(steps.length > 1 ? [{ id: "process", label: "Process" }] : []), ...nav.filter((n) => !(n.id === "resume" && show.contact))]}
        allowToggle={theme.allow_toggle}
        banner={previewBanner}
      />

      <main id="main">
        {/* Hero: drafting table */}
        <section aria-label="Introduction" className="relative overflow-hidden">
          <div aria-hidden className="blueprint pointer-events-none absolute inset-0" />
          <Crosshair />
          <HeroFloat items={branded.slice(0, 3).map((name) => ({ name, spec: icons[name] }))} />
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
            <div className="rise-b flex flex-wrap items-center gap-4" style={{ "--d": 0 } as React.CSSProperties}>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`Portrait of ${profile.full_name}`} width={56} height={56} className="size-14 rounded-full border border-line object-cover" />
              )}
              {profile.availability.enabled && profile.availability.text && (
                <p className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface/80 px-3 py-1.5 text-[13px] text-ink-2 backdrop-blur sm:rounded-full">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 rounded-full bg-success opacity-30 motion-safe:animate-ping" />
                    <span className="relative size-2 rounded-full bg-success" />
                  </span>
                  {profile.availability.text}
                </p>
              )}
            </div>

            <h1 className="mt-8 text-balance text-[clamp(2.75rem,7.4vw,6.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink">
              <RiseWords text={profile.full_name} start={60} step={60} />
            </h1>

            {/* Dimension line, like a technical drawing */}
            {(profile.title || profile.location) && (
              <div className="mt-8 flex items-center gap-3 sm:mt-10" aria-label={[profile.title, profile.location].filter(Boolean).join(", ")}>
                <span aria-hidden className="dim-tick h-4 w-px bg-ink-2" />
                <span aria-hidden className="dim-l h-px flex-1 bg-ink-2/60" />
                <p className="rise-b shrink-0 text-center text-[15px] text-ink-2 sm:text-lg" style={{ "--d": 360 } as React.CSSProperties}>
                  <Scramble text={profile.title} delay={450} className="font-medium text-ink" />
                  {profile.title && profile.location && <span className="mx-2 text-line-strong">/</span>}
                  {profile.location}
                </p>
                <span aria-hidden className="dim-r h-px flex-1 bg-ink-2/60" />
                <span aria-hidden className="dim-tick h-4 w-px bg-ink-2" />
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
              <div>
                {profile.headline && (
                  <p className="rise-b max-w-2xl text-[1.375rem] font-medium leading-snug tracking-[-0.015em] text-ink sm:text-[1.75rem]" style={{ "--d": 420 } as React.CSSProperties}>
                    {profile.headline}
                  </p>
                )}
                {profile.intro && (
                  <p className="rise-b prose-measure mt-5 text-[17px] leading-relaxed text-ink-2" style={{ "--d": 480 } as React.CSSProperties}>
                    {profile.intro}
                  </p>
                )}
                <div className="rise-b mt-8 flex flex-wrap gap-3" style={{ "--d": 540 } as React.CSSProperties}>
                  {show.projects && (
                    <Magnetic>
                      <a href="#projects" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "press group/cta")}>
                        View my projects
                        <ArrowDown className="transition-transform duration-300 group-hover/cta:translate-y-0.5" aria-hidden />
                      </a>
                    </Magnetic>
                  )}
                  {hasResume ? (
                    <Magnetic>
                      <a href={`${resumeHref}?download=1`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "press")}>
                        <Download aria-hidden />
                        Download resume
                      </a>
                    </Magnetic>
                  ) : (
                    show.contact && (
                      <a href="#contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "press")}>
                        <Send aria-hidden />
                        Contact me
                      </a>
                    )
                  )}
                </div>
                {awards.length > 0 && (
                  <ul className="mt-10 flex flex-wrap gap-3" aria-label="Recognition">
                    {awards.map((a, i) => (
                      <li
                        key={a.award}
                        className="award rise-b relative flex max-w-sm items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface/90 py-2.5 pl-2.5 pr-4 backdrop-blur"
                        style={{ "--d": 650 + i * 90, "--i": i } as React.CSSProperties}
                      >
                        <span className="award-medal flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,#d97706_14%,transparent)] text-[#b45309] dark:text-[#fbbf24]">
                          <Trophy className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[14px] font-semibold leading-snug text-ink">{a.award}</span>
                          <span className="block truncate text-[12.5px] text-muted">{a.project}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rise-b mx-auto hidden w-full max-w-xl md:block lg:max-w-none" style={{ "--d": 300 } as React.CSSProperties}>
                <HeroDiagram />
              </div>
            </div>
          </div>
        </section>

        <IconMarquee items={marquee} label="Tools and methods I use" />

        {steps.length > 1 && <Pipeline steps={steps} />}

        {show.about && (
          <Section id="about" title="About">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
              <div className="prose-measure space-y-5 text-[17px] leading-relaxed text-ink-2">
                {lead && <ScrollLit text={lead} className="lit text-[1.2rem] font-medium leading-[1.6] tracking-[-0.01em] sm:text-[1.35rem]" />}
                {restSummary.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {education[0] && (
                  <p className="text-[15px] text-muted">
                    Education: {education[0].qualification}, {education[0].institution}
                    {education[0].end_date ? ` (${formatMonth(education[0].end_date)})` : ""}.
                  </p>
                )}
              </div>
              {about.strengths.length > 0 && (
                <Reveal className="strengths self-start">
                  <h3 className="text-sm font-semibold text-ink">Strengths</h3>
                  <ul className="mt-4 space-y-2">
                    {about.strengths.map((s, i) => (
                      <li
                        key={s}
                        className="strength flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] leading-snug text-ink-2"
                        style={{ "--i": i } as React.CSSProperties}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]">
                          <SkillIcon spec={iconFor(s)} className="size-4" />
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
            {(about.interests.length > 0 || about.languages.length > 0 || about.activities.length > 0) && (
              <div className="mt-14 grid grid-cols-1 gap-10 border-t border-line pt-10 md:grid-cols-3">
                <SmallList title="Roles I'm interested in" items={about.interests} />
                <SmallList title="Languages" items={about.languages} />
                <SmallList title="Leadership and activities" items={about.activities} />
              </div>
            )}
          </Section>
        )}

        {show.experience && (
          <Section id="experience" title="Experience">
            <ol className="relative md:space-y-14">
              <TimelineRail className="left-0 md:left-[15.5rem]" />
              {experiences.map((e) => (
                <ExperienceItem key={e.id} e={e} icons={pick(icons, e.tools)} />
              ))}
            </ol>
          </Section>
        )}

        {show.projects && (
          <Section
            id="projects"
            title="Projects"
            intro="Selected work from my role, internships and studies. Open a project to see exactly what I was responsible for."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={(i % 2) * 120}>
                  <ProjectCard p={p} icons={pick(icons, p.tech)} />
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {show.skills && (
          <Section id="skills" title="Skills">
            <SkillsShowcase groups={groups} orbs={orbs} />
          </Section>
        )}

        {show.education && (
          <Section id="education" title="Education">
            <ol className="divide-y divide-line border-y border-line">
              {education.map((e) => (
                <li key={e.id} className="edu-row grid grid-cols-1 gap-2 py-7 md:grid-cols-[13rem_1fr_auto] md:gap-10">
                  <p className="text-sm tabular-nums text-muted">{formatRange(e.start_date, e.end_date)}</p>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{e.qualification}</h3>
                    <p className="mt-1 text-[15px] text-ink-2">
                      {e.institution}
                      {e.grade && !cgpa(e.grade) && <span className="text-muted">, {e.grade}</span>}
                    </p>
                    {e.details.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-line-strong">
                        {e.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {cgpa(e.grade) && (
                    <div className="mt-3 md:mt-0">
                      <CountRing value={cgpa(e.grade)!} label={e.grade} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {show.resume && !show.contact && (
          <Section id="resume" title="Resume">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-5">
                  <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{resume.file_name || "Resume (PDF)"}</p>
                    {resume.updated_at && (
                      <p className="mt-1 text-[13px] text-muted">Updated {formatDateTime(resume.updated_at)}</p>
                    )}
                  </div>
                </div>
                <a href={`${resumeHref}?download=1`} className={buttonVariants({ variant: "primary", size: "lg" })}>
                  <Download aria-hidden />
                  Download PDF
                </a>
                <a href={resumeHref} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Open in a new tab
                </a>
              </div>
              {resume.show_preview && (
                <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
                  <iframe
                    src={`${storageUrl(resume.path)}#view=FitH`}
                    title="Resume preview"
                    loading="lazy"
                    className="h-[44rem] w-full"
                  />
                </div>
              )}
            </div>
          </Section>
        )}

        {show.contact && (
          <Section id="contact" title="Contact" intro={contact.intro || undefined}>
            {profile.email && (
              <div className="relative mb-14">
                <div aria-hidden className="flight pointer-events-none absolute -top-[13.5rem] right-0 hidden h-[120px] w-[400px] xl:block">
                  <svg viewBox="0 0 400 120" width="400" height="120" fill="none" className="absolute inset-0 text-line-strong">
                    <path className="flight-path" d="M10 100 C 100 100, 120 20, 210 40 S 350 110, 392 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" />
                  </svg>
                  <span className="plane absolute left-0 top-0 flex size-9 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_8px_20px_-8px_var(--accent)]">
                    <Send className="size-4" />
                  </span>
                </div>
                <BigEmail email={profile.email} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
              <div>
              {show.resume && (
                <div id="resume" className="resume-card group relative mb-6 overflow-hidden rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-start gap-4">
                    <span aria-hidden className="relative mt-0.5 h-14 w-11 shrink-0">
                      <span className="absolute inset-0 rotate-[-8deg] rounded-md border border-line bg-sunken transition-transform duration-300 group-hover:rotate-[-14deg]" />
                      <span className="absolute inset-0 flex items-center justify-center rounded-md border border-line bg-surface shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                        <FileText className="size-5 text-accent-ink" />
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">Resume</p>
                      <p className="truncate text-[13px] text-muted">
                        {resume.updated_at ? `Updated ${formatDateTime(resume.updated_at)}` : resume.file_name || "PDF"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a href={`${resumeHref}?download=1`} className={cn(buttonVariants({ variant: "primary", size: "sm" }), "press flex-1")}>
                      <Download aria-hidden /> Download PDF
                    </a>
                    <a href={resumeHref} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Open
                    </a>
                  </div>
                </div>
              )}
              <ul className="space-y-1">
                {contactLinks
                  .filter((l) => l.name !== "Email")
                  .map(({ href, label, icon: Icon, name }) => (
                  <li key={href}>
                    <a
                      href={href}
                      {...externalProps(href)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-ink transition-colors hover:bg-surface"
                    >
                      <Icon className="size-4 text-muted group-hover:text-accent-ink" aria-hidden />
                      <span className="sr-only">{name}: </span>
                      <span className="truncate">{label}</span>
                    </a>
                  </li>
                ))}
                {profile.location && (
                  <li className="flex items-center gap-3 px-3 py-3 text-[15px] text-muted">
                    <MapPin className="size-4" aria-hidden />
                    {profile.location}
                  </li>
                )}
              </ul>
              </div>
              {contact.form_enabled ? (
                <ContactForm disabled={contactDisabled} />
              ) : (
                <p className="text-[15px] text-ink-2">The best way to reach me is by email.</p>
              )}
            </div>
          </Section>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {profile.full_name}
          </p>
          {data.published_at && <p>Last updated {formatDateTime(data.published_at)}</p>}
        </div>
      </footer>

      <div className="hidden lg:block">
        <BackToTop />
      </div>
      <MobileDock resumeHref={hasResume ? resumeHref : undefined} showContact={show.contact} />
      <JsonLd data={model.personLd} />
    </div>
  );
}

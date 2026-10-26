import { ArrowDown, Download, MapPin, FileText } from "lucide-react";
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
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("border-t border-line py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <h2 id={`${id}-title`} className="flex items-center gap-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2rem]">
            <span aria-hidden className="h-[0.9em] w-1 rounded-full bg-accent" />
            {title}
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

  return (
    <div id="top" className="min-h-dvh bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <SpotlightTracker />
      <SiteHeader
        name={profile.short_name || profile.full_name}
        nav={steps.length > 1 ? [{ id: "process", label: "Process" }, ...nav] : nav}
        allowToggle={theme.allow_toggle}
        banner={previewBanner}
      />

      <main id="main">
        {/* Hero: drafting table */}
        <section aria-label="Introduction" className="relative overflow-hidden">
          <div aria-hidden className="blueprint pointer-events-none absolute inset-0" />
          <Crosshair />
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
              <RiseWords text={profile.full_name} start={120} step={80} />
            </h1>

            {/* Dimension line, like a technical drawing */}
            {(profile.title || profile.location) && (
              <div className="mt-8 flex items-center gap-3 sm:mt-10" aria-label={[profile.title, profile.location].filter(Boolean).join(", ")}>
                <span aria-hidden className="dim-tick h-4 w-px bg-ink-2" />
                <span aria-hidden className="dim-l h-px flex-1 bg-ink-2/60" />
                <p className="rise-b shrink-0 text-center text-[15px] text-ink-2 sm:text-lg" style={{ "--d": 900 } as React.CSSProperties}>
                  <span className="font-medium text-ink">{profile.title}</span>
                  {profile.title && profile.location && <span className="mx-2 text-line-strong">/</span>}
                  {profile.location}
                </p>
                <span aria-hidden className="dim-r h-px flex-1 bg-ink-2/60" />
                <span aria-hidden className="dim-tick h-4 w-px bg-ink-2" />
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
              <div>
                {profile.headline && (
                  <p className="rise-b max-w-2xl text-[1.375rem] font-medium leading-snug tracking-[-0.015em] text-ink sm:text-[1.75rem]" style={{ "--d": 1050 } as React.CSSProperties}>
                    {profile.headline}
                  </p>
                )}
                {profile.intro && (
                  <p className="rise-b prose-measure mt-5 text-[17px] leading-relaxed text-ink-2" style={{ "--d": 1150 } as React.CSSProperties}>
                    {profile.intro}
                  </p>
                )}
              </div>
              <div className="rise-b flex flex-wrap gap-3 lg:justify-end lg:pt-1.5" style={{ "--d": 1250 } as React.CSSProperties}>
                {show.projects && (
                  <Magnetic>
                    <a href="#projects" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "press group/cta")}>
                      View my projects
                      <ArrowDown className="transition-transform duration-300 group-hover/cta:translate-y-0.5" aria-hidden />
                    </a>
                  </Magnetic>
                )}
                {hasResume && (
                  <Magnetic>
                    <a href={`${resumeHref}?download=1`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "press")}>
                      <Download aria-hidden />
                      Download resume
                    </a>
                  </Magnetic>
                )}
              </div>
            </div>
          </div>
        </section>

        {steps.length > 1 && <Pipeline steps={steps} />}

        {show.about && (
          <Section id="about" title="About">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
              <div className="prose-measure space-y-5 text-[17px] leading-relaxed text-ink-2">
                {about.summary.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {education[0] && (
                  <p className="text-[15px] text-muted">
                    Education: {education[0].qualification}, {education[0].institution}
                    {education[0].end_date ? ` (${formatMonth(education[0].end_date)})` : ""}.
                  </p>
                )}
              </div>
              <div className="space-y-10">
                <SmallList title="Strengths" items={about.strengths} />
              </div>
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
                <ExperienceItem key={e.id} e={e} />
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
                  <ProjectCard p={p} />
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {show.skills && (
          <Section id="skills" title="Skills">
            <dl className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {skill_groups.map((g, gi) => (
                <Reveal key={g.id} delay={(gi % 3) * 90} className="border-t border-line pt-5">
                  <dt className="text-sm font-semibold text-ink">{g.name}</dt>
                  <dd className="mt-3">
                    <ul className="flex flex-wrap gap-1.5">
                      {g.items.map((s) => (
                        <li key={s} className="rounded-md border border-line bg-surface px-2.5 py-1 text-[13px] text-ink-2 transition-colors duration-200 hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--line))] hover:text-ink">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </Section>
        )}

        {show.education && (
          <Section id="education" title="Education">
            <ol className="divide-y divide-line border-y border-line">
              {education.map((e) => (
                <li key={e.id} className="grid grid-cols-1 gap-2 py-7 md:grid-cols-[13rem_1fr] md:gap-10">
                  <p className="text-sm tabular-nums text-muted">{formatRange(e.start_date, e.end_date)}</p>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{e.qualification}</h3>
                    <p className="mt-1 text-[15px] text-ink-2">
                      {e.institution}
                      {e.grade && <span className="text-muted">, {e.grade}</span>}
                    </p>
                    {e.details.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-line-strong">
                        {e.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {show.resume && (
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
              <div className="mb-14">
                <BigEmail email={profile.email} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
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

      <BackToTop />
      <JsonLd data={model.personLd} />
    </div>
  );
}

import { Download, FileText, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatDateTime, formatRange, initials, parseStep, storageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { ContactForm } from "../contact-form";
import { ExperienceItem } from "../experience-item";
import { ProjectCard } from "../project-card";
import { externalProps, type TemplateProps } from "../model";
import { PanelNav } from "./panel-parts";
import { Availability, JsonLd, SkipLink } from "./shared";
import { BackToTop, Reveal, RiseWords, ScrollProgress, SpotlightTracker, TimelineRail } from "../motion";

function Block({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-14 first:pt-0 sm:py-16">
      <Reveal className="mb-8 flex items-center gap-4">
        <h2 id={`${id}-title`} className="text-[1.5rem] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </Reveal>
      {intro && <p className="-mt-4 mb-8 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>}
      <Reveal variant="fade" delay={80}>
        {children}
      </Reveal>
    </section>
  );
}

/** Side panel: a fixed profile panel on the left, content scrolling on the right. */
export function PanelTemplate({ data, model, resumeHref, previewBanner, contactDisabled }: TemplateProps) {
  const { settings, experiences, projects, skill_groups, education } = data;
  const { profile, about, resume, contact, theme } = settings;
  const { show, nav, photo, contactLinks, hasResume } = model;

  const identity = (
    <>
      <div className="flex items-center gap-4 lg:block">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Portrait of ${profile.full_name}`} width={96} height={96} className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/15 lg:size-24" />
        ) : (
          <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-semibold text-[var(--accent-fg)] lg:size-24 lg:text-3xl">
            {initials(profile.full_name)}
          </span>
        )}
        <div className="min-w-0 lg:mt-6">
          <h1 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-white lg:text-[1.9rem]">{profile.full_name}</h1>
          {profile.title && <p className="mt-1 text-[15px] text-white/70">{profile.title}</p>}
        </div>
      </div>
      {profile.location && (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-white/55">
          <MapPin className="size-3.5" aria-hidden /> {profile.location}
        </p>
      )}
      {profile.availability.enabled && profile.availability.text && (
        <Availability text={profile.availability.text} className="mt-3 text-white/80" />
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {hasResume && (
          <a href={`${resumeHref}?download=1`} className={buttonVariants({ variant: "primary", size: "md" })}>
            <Download aria-hidden /> Resume
          </a>
        )}
        {show.contact && (
          <a href="#contact" className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
            Contact me
          </a>
        )}
      </div>
    </>
  );

  const links = contactLinks.length > 0 && (
    <ul className="flex flex-wrap gap-1">
      {contactLinks.map(({ href, label, icon: Icon, name }) => (
        <li key={href}>
          <a
            href={href}
            {...externalProps(href)}
            title={label}
            className="inline-flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">
              {name}: {label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div id="top" className="min-h-dvh bg-paper text-ink">
      <SkipLink />
      <ScrollProgress />
      <SpotlightTracker />
      {previewBanner && <div className="relative z-50">{previewBanner}</div>}
      <div className="lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Panel (fixed dark surface in both themes) */}
        <aside className="bg-[#15171c] text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-white/5">
          <div className="rise-b flex h-full flex-col px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
            {identity}
            <div className="mt-10 hidden lg:block">
              <PanelNav items={nav} variant="side" />
            </div>
            <div className="mt-8 flex items-center justify-between gap-2 border-t border-white/10 pt-5 lg:mt-auto">
              {links}
              {theme.allow_toggle && (
                <div className="text-white/70 [&_button:hover]:bg-white/10 [&_button:hover]:text-white [&_button]:text-white/60">
                  <ThemeToggle />
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile section bar */}
        <div className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur lg:hidden">
          <PanelNav items={nav} variant="bar" />
        </div>

        <main id="main" className="min-w-0 px-5 py-12 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto max-w-4xl">
            {/* Intro */}
            <section aria-label="Introduction" className="pb-14">
              {profile.headline && (
                <p className="max-w-3xl text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.025em] sm:text-[2.25rem]">
                  <RiseWords text={profile.headline} start={150} step={45} />
                </p>
              )}
              {profile.intro && (
                <p className="rise-b mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-2" style={{ "--d": 650 } as React.CSSProperties}>
                  {profile.intro}
                </p>
              )}
              {profile.process_steps.length > 0 && (
                <ol aria-label="How I work" className="mt-10 flex flex-wrap items-center gap-2 text-[13px]">
                  {profile.process_steps.map((s, i) => (
                    <li key={i} className="rise-b flex items-center" style={{ "--d": 800 + i * 90 } as React.CSSProperties}>
                      <span className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink-2">
                        <span className="mr-1.5 tabular-nums text-accent-ink">{i + 1}</span>
                        {parseStep(s).label}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <div className="divide-y divide-line border-t border-line">
              {show.about && (
                <Block id="about" title="About">
                  <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_17rem]">
                    <div className="max-w-2xl space-y-4 text-[16px] leading-relaxed text-ink-2">
                      {about.summary.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="space-y-6">
                      {about.interests.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold">Looking for</h3>
                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {about.interests.map((r) => (
                              <li key={r} className="rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] px-2.5 py-1 text-[13px] font-medium text-accent-ink">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {about.languages.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold">Languages</h3>
                          <ul className="mt-2 space-y-1 text-[14px] text-ink-2">
                            {about.languages.map((l) => (
                              <li key={l}>{l}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {about.strengths.length > 0 && (
                    <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {about.strengths.map((s) => (
                        <li key={s} className="rounded-xl border border-line bg-surface px-4 py-3 text-[14px] text-ink-2">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  {about.activities.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-sm font-semibold">Leadership and activities</h3>
                      <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-2">
                        {about.activities.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Block>
              )}

              {show.experience && (
                <Block id="experience" title="Experience">
                  <ol className="relative md:space-y-12">
                    <TimelineRail className="left-0 md:left-[15.5rem]" />
                    {experiences.map((e) => (
                      <ExperienceItem key={e.id} e={e} />
                    ))}
                  </ol>
                </Block>
              )}

              {show.projects && (
                <Block id="projects" title="Projects" intro="Open a project to see exactly what I was responsible for.">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {projects.map((p, i) => (
                      <div key={p.id} className={cn(i === 0 && projects.length > 2 && "md:col-span-2")}>
                        <ProjectCard p={p} />
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {show.skills && (
                <Block id="skills" title="Skills">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {skill_groups.map((g) => (
                      <div key={g.id} className="rounded-xl border border-line bg-surface p-5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                          {g.name}
                        </h3>
                        <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{g.items.join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {show.education && (
                <Block id="education" title="Education">
                  <ol className="space-y-4">
                    {education.map((e) => (
                      <li key={e.id} className="rounded-xl border border-line bg-surface p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="font-semibold">{e.qualification}</h3>
                          <p className="text-[13px] tabular-nums text-muted">{formatRange(e.start_date, e.end_date)}</p>
                        </div>
                        <p className="mt-1 text-[14px] text-ink-2">
                          {e.institution}
                          {e.grade && <span className="font-medium text-ink">, {e.grade}</span>}
                        </p>
                        {e.details.length > 0 && (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-ink-2 marker:text-line-strong">
                            {e.details.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </Block>
              )}

              {show.resume && (
                <Block id="resume" title="Resume">
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5">
                    <FileText className="size-6 text-muted" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{resume.file_name || "Resume (PDF)"}</p>
                      {resume.updated_at && <p className="text-[13px] text-muted">Updated {formatDateTime(resume.updated_at)}</p>}
                    </div>
                    <a href={resumeHref} target="_blank" rel="noopener" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      Open
                    </a>
                    <a href={`${resumeHref}?download=1`} className={buttonVariants({ variant: "primary", size: "sm" })}>
                      <Download aria-hidden /> Download PDF
                    </a>
                  </div>
                  {resume.show_preview && (
                    <div className="mt-5 hidden overflow-hidden rounded-xl border border-line lg:block">
                      <iframe src={`${storageUrl(resume.path)}#view=FitH`} title="Resume preview" loading="lazy" className="h-[40rem] w-full" />
                    </div>
                  )}
                </Block>
              )}

              {show.contact && (
                <Block id="contact" title="Contact" intro={contact.intro || undefined}>
                  {contact.form_enabled ? (
                    <ContactForm disabled={contactDisabled} />
                  ) : (
                    <p className="text-[15px] text-ink-2">The best way to reach me is through the links in the panel.</p>
                  )}
                </Block>
              )}
            </div>

            <footer className="mt-6 flex flex-col gap-1 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:justify-between">
              <p>
                © {new Date().getFullYear()} {profile.full_name}
              </p>
              {data.published_at && <p>Last updated {formatDateTime(data.published_at)}</p>}
            </footer>
          </div>
        </main>
      </div>
      <BackToTop />
      <JsonLd data={model.personLd} />
    </div>
  );
}

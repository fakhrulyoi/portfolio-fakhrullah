import "@fontsource-variable/newsreader";
import { Award, Download, ExternalLink, FileText, Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatDateTime, formatRange, storageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { ContactForm } from "../contact-form";
import { externalProps, type SectionId, type TemplateProps } from "../model";
import { DocToc, PrintButton, type TocItem } from "./document-parts";
import { Availability, JsonLd, SkipLink } from "./shared";
import { BackToTop, Reveal, ScrollProgress } from "../motion";

const TITLES: Record<SectionId, string> = {
  about: "Summary",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  resume: "Resume",
  contact: "Contact",
};

function DocSection({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-line pt-10 print:break-inside-auto">
      <h2 id={`${id}-title`} data-doc-h className="font-doc flex items-baseline gap-4 text-[1.75rem] font-medium leading-tight tracking-[-0.01em] text-ink">
        <span className="font-sans text-base font-medium tabular-nums text-accent-ink">{num}</span>
        {title}
      </h2>
      <Reveal variant="fade" className="mt-7">
        {children}
      </Reveal>
    </section>
  );
}

function Meta({ items }: { items: [string, React.ReactNode][] }) {
  const rows = items.filter(([, v]) => v);
  if (!rows.length) return null;
  return (
    <dl className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-[7rem_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 truncate text-ink-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const bodyText = "font-doc text-[1.125rem] leading-[1.7] text-ink-2";

/** Document: a specification-style sheet with numbered sections. Prints cleanly. */
export function DocumentTemplate({ data, model, resumeHref, previewBanner, contactDisabled }: TemplateProps) {
  const { settings, experiences, projects, skill_groups, education } = data;
  const { profile, about, resume, contact, theme } = settings;
  const { show, photo, contactLinks, hasResume } = model;

  const order: SectionId[] = ["about", "experience", "projects", "skills", "education", "resume", "contact"];
  const toc: TocItem[] = order.filter((k) => show[k]).map((k, i) => ({ id: k, label: TITLES[k], num: String(i + 1) }));
  const num = (k: SectionId) => toc.find((t) => t.id === k)?.num ?? "";

  return (
    <div id="top" className="min-h-dvh bg-sunken text-ink print:bg-white">
      <SkipLink />
      <ScrollProgress />
      <header className="sticky top-0 z-40 border-b border-line bg-sunken/90 backdrop-blur print:hidden">
        {previewBanner}
        <div className="mx-auto flex h-14 max-w-[76rem] items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            {profile.short_name || profile.full_name}
          </a>
          <div className="flex items-center gap-1">
            <PrintButton />
            {theme.allow_toggle && <ThemeToggle />}
          </div>
        </div>
      </header>

      <div className="mx-auto grid grid-cols-1 max-w-[76rem] gap-10 px-0 py-0 sm:px-6 sm:py-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 print:block print:p-0">
        <aside className="hidden lg:block print:hidden">
          <DocToc items={toc} />
        </aside>

        <main
          id="main"
          className="rise-b mx-auto w-full max-w-[52rem] border-line bg-surface px-5 py-10 sm:rounded-md sm:border sm:px-12 sm:py-14 sm:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_-12px_rgba(0,0,0,0.08)] lg:px-16 print:max-w-none print:border-0 print:p-0 print:shadow-none"
        >
          {/* Cover */}
          <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
            <Meta
              items={[
                ["Role", profile.title],
                ["Location", profile.location],
                ["Email", profile.email],
                ["Status", profile.availability.enabled ? profile.availability.text : ""],
                ["Last updated", data.published_at ? formatDateTime(data.published_at) : ""],
              ]}
            />
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={`Portrait of ${profile.full_name}`} width={88} height={88} className="size-[5.5rem] shrink-0 rounded-sm border border-line object-cover" />
            )}
          </div>

          <h1 className="rise-b font-doc mt-10 text-[2.5rem] font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-[3.25rem]">
            {profile.full_name}
          </h1>
          {profile.headline && <p className="font-doc mt-5 text-[1.375rem] leading-snug text-ink">{profile.headline}</p>}
          {profile.intro && <p className={cn(bodyText, "mt-4")}>{profile.intro}</p>}

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            {hasResume && (
              <a href={`${resumeHref}?download=1`} className={buttonVariants({ variant: "primary", size: "md" })}>
                <Download aria-hidden /> Download resume
              </a>
            )}
            {show.contact && (
              <a href="#contact" className={buttonVariants({ variant: "outline", size: "md" })}>
                Contact me
              </a>
            )}
          </div>

          {/* Mobile contents */}
          {toc.length > 1 && (
            <details className="mt-10 rounded-md border border-line px-4 py-3 lg:hidden print:hidden">
              <summary className="cursor-pointer text-sm font-medium">Contents</summary>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="flex gap-3 text-ink-2 hover:text-ink">
                      <span className="w-4 tabular-nums text-muted">{t.num}</span>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="mt-14 space-y-14">
            {show.about && (
              <DocSection id="about" num={num("about")} title={TITLES.about}>
                <div className={cn(bodyText, "space-y-4")}>
                  {about.summary.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {about.strengths.length > 0 && (
                  <>
                    <h3 className="mt-9 text-sm font-semibold">Strengths</h3>
                    <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[15px] text-ink-2 sm:grid-cols-2">
                      {about.strengths.map((s) => (
                        <li key={s} className="flex gap-2.5">
                          <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {(about.interests.length > 0 || about.languages.length > 0 || about.activities.length > 0) && (
                  <dl className="mt-9 divide-y divide-line border-y border-line text-[15px]">
                    {(
                      [
                        ["Target roles", about.interests.join(", ")],
                        ["Languages", about.languages.join(", ")],
                        ["Activities", about.activities],
                      ] as const
                    )
                      .filter(([, v]) => v.length)
                      .map(([k, v]) => (
                        <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6">
                          <dt className="text-muted">{k}</dt>
                          <dd className="text-ink-2">
                            {Array.isArray(v) ? (
                              <ul className="space-y-1.5">
                                {v.map((a) => (
                                  <li key={a}>{a}</li>
                                ))}
                              </ul>
                            ) : (
                              v
                            )}
                          </dd>
                        </div>
                      ))}
                  </dl>
                )}
              </DocSection>
            )}

            {show.experience && (
              <DocSection id="experience" num={num("experience")} title={TITLES.experience}>
                <div className="space-y-11">
                  {experiences.map((e, i) => (
                    <article key={e.id} className="print:break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h3 className="font-doc text-[1.3rem] font-semibold leading-snug">
                          <span className="mr-3 font-sans text-[13px] font-medium tabular-nums text-muted">
                            {num("experience")}.{i + 1}
                          </span>
                          {e.role}, {e.company}
                        </h3>
                        <p className="text-[13px] tabular-nums text-muted">{formatRange(e.start_date, e.end_date, e.is_current)}</p>
                      </div>
                      {(e.context || e.employment_type || e.work_mode || e.location) && (
                        <p className="mt-1 text-[13px] text-muted">
                          {[e.context, e.employment_type, e.work_mode, e.location].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {e.highlights.length > 0 ? (
                        <ul className="font-doc mt-4 list-disc space-y-2 pl-5 text-[1.0625rem] leading-relaxed text-ink-2 marker:text-line-strong">
                          {e.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      ) : (
                        e.summary && <p className={cn(bodyText, "mt-3")}>{e.summary}</p>
                      )}
                      {e.tools.length > 0 && (
                        <p className="mt-4 text-[13px] text-muted">
                          <span className="font-medium text-ink-2">Tools and methods:</span> {e.tools.join(", ")}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </DocSection>
            )}

            {show.projects && (
              <DocSection id="projects" num={num("projects")} title={TITLES.projects}>
                <div className="space-y-12">
                  {projects.map((p, i) => {
                    const links = [
                      p.live_url && ["Live site", p.live_url],
                      p.repo_url && ["Source code", p.repo_url],
                      p.case_study_url && ["Case study", p.case_study_url],
                    ].filter(Boolean) as [string, string][];
                    const n = `${num("projects")}.${i + 1}`;
                    return (
                      <article key={p.id} className="print:break-inside-avoid">
                        <h3 className="font-doc text-[1.3rem] font-semibold leading-snug">
                          <span className="mr-3 font-sans text-[13px] font-medium tabular-nums text-muted">{n}</span>
                          {p.title}
                        </h3>
                        <p className="mt-1 text-[13px] text-muted">{[p.category, p.year].filter(Boolean).join(", ")}</p>
                        {p.summary && <p className={cn(bodyText, "mt-3")}>{p.summary}</p>}
                        {p.image_path && (
                          <figure className="mt-5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={storageUrl(p.image_path)}
                              alt={p.image_alt || `Screenshot of ${p.title}`}
                              loading="lazy"
                              className="w-full rounded-sm border border-line"
                            />
                            <figcaption className="mt-2 text-[13px] text-muted">
                              Figure {n}. {p.image_alt || p.title}
                            </figcaption>
                          </figure>
                        )}
                        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-[7rem_1fr]">
                          {p.role && (
                            <>
                              <dt className="text-muted">My role</dt>
                              <dd className="text-ink-2">{p.role}</dd>
                            </>
                          )}
                          {p.contributions.length > 0 && (
                            <>
                              <dt className="text-muted">What I did</dt>
                              <dd>
                                <ul className="list-disc space-y-1.5 pl-5 text-ink-2 marker:text-line-strong">
                                  {p.contributions.map((c) => (
                                    <li key={c}>{c}</li>
                                  ))}
                                </ul>
                              </dd>
                            </>
                          )}
                          {p.awards.length > 0 && (
                            <>
                              <dt className="text-muted">Recognition</dt>
                              <dd className="space-y-1">
                                {p.awards.map((a) => (
                                  <p key={a} className="flex gap-2 text-ink">
                                    <Award className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden />
                                    {a}
                                  </p>
                                ))}
                              </dd>
                            </>
                          )}
                          {p.tech.length > 0 && (
                            <>
                              <dt className="text-muted">Technology</dt>
                              <dd className="text-ink-2">{p.tech.join(", ")}</dd>
                            </>
                          )}
                          {links.length > 0 && (
                            <>
                              <dt className="text-muted">Links</dt>
                              <dd className="flex flex-wrap gap-x-5 gap-y-1">
                                {links.map(([label, href]) => (
                                  <a key={href} href={href} {...externalProps(href)} className="inline-flex items-center gap-1 font-medium text-accent-ink underline-offset-4 hover:underline">
                                    {label} <ExternalLink className="size-3.5" aria-hidden />
                                    <span className="hidden print:inline"> ({href})</span>
                                  </a>
                                ))}
                              </dd>
                            </>
                          )}
                        </dl>
                        {p.confidential && (
                          <p className="mt-4 flex gap-2 text-[13px] text-muted">
                            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                            Client work under confidentiality. Details are limited to my role.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </DocSection>
            )}

            {show.skills && (
              <DocSection id="skills" num={num("skills")} title={TITLES.skills}>
                <table className="w-full border-collapse text-left text-[15px]">
                  <caption className="sr-only">Skills by area</caption>
                  <thead>
                    <tr className="border-b border-line-strong text-[13px] text-muted">
                      <th scope="col" className="w-[38%] py-2 pr-6 font-medium">Area</th>
                      <th scope="col" className="py-2 font-medium">Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skill_groups.map((g) => (
                      <tr key={g.id} className="border-b border-line align-top">
                        <th scope="row" className="py-3 pr-6 font-medium text-ink">{g.name}</th>
                        <td className="py-3 text-ink-2">{g.items.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DocSection>
            )}

            {show.education && (
              <DocSection id="education" num={num("education")} title={TITLES.education}>
                <div className="space-y-8">
                  {education.map((e) => (
                    <article key={e.id} className="print:break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h3 className="font-doc text-[1.2rem] font-semibold">{e.qualification}</h3>
                        <p className="text-[13px] tabular-nums text-muted">{formatRange(e.start_date, e.end_date)}</p>
                      </div>
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
                    </article>
                  ))}
                </div>
              </DocSection>
            )}

            {show.resume && (
              <DocSection id="resume" num={num("resume")} title={TITLES.resume}>
                <div className="flex flex-wrap items-center gap-4 rounded-md border border-line p-4">
                  <FileText className="size-5 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{resume.file_name || "Resume (PDF)"}</p>
                    {resume.updated_at && <p className="text-[13px] text-muted">Updated {formatDateTime(resume.updated_at)}</p>}
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <a href={resumeHref} target="_blank" rel="noopener" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      Open
                    </a>
                    <a href={`${resumeHref}?download=1`} className={buttonVariants({ variant: "primary", size: "sm" })}>
                      <Download aria-hidden /> Download
                    </a>
                  </div>
                </div>
              </DocSection>
            )}

            {show.contact && (
              <DocSection id="contact" num={num("contact")} title={TITLES.contact}>
                {contact.intro && <p className={cn(bodyText, "mb-6")}>{contact.intro}</p>}
                <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                  {contactLinks.map(({ href, label, icon: Icon, name }) => (
                    <li key={href}>
                      <a href={href} {...externalProps(href)} className="inline-flex items-center gap-2 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                        <Icon className="size-4 text-muted" aria-hidden />
                        <span className="sr-only">{name}: </span>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
                {contact.form_enabled && (
                  <div className="print:hidden">
                    <ContactForm disabled={contactDisabled} />
                  </div>
                )}
              </DocSection>
            )}
          </div>

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-[13px] text-muted">
            <p>
              © {new Date().getFullYear()} {profile.full_name}
            </p>
            {profile.availability.enabled && profile.availability.text && <Availability text={profile.availability.text} className="print:hidden" />}
          </footer>
        </main>
      </div>
      <BackToTop />
      <JsonLd data={model.personLd} />
    </div>
  );
}

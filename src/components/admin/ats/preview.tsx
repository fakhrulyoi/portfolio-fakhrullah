import type { AtsResume } from "@/lib/ats";

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1.5 mt-4 border-b border-neutral-400 pb-0.5 text-[11.5px] font-bold uppercase tracking-wide">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

/** On-screen preview with the same structure as the PDF/Word output. */
export function ResumePreview({ r }: { r: AtsResume }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken p-3 sm:p-5">
      <p className="mb-2 text-[12px] text-muted">Preview (A4, one column)</p>
      <article
        aria-label="Resume preview"
        className="mx-auto max-h-[70dvh] overflow-y-auto xl:max-h-[calc(100dvh-12rem)] bg-white px-6 py-7 text-[11px] leading-[1.45] text-neutral-900 shadow-sm sm:px-9"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <h2 className="text-[19px] font-bold leading-tight">{r.name}</h2>
        {r.title && <p className="mt-0.5 text-[12.5px]">{r.title}</p>}
        {r.contact.length > 0 && <p className="mt-1 text-[10.5px] text-neutral-700">{r.contact.join(" | ")}</p>}

        {r.summary && (
          <>
            <H>Professional Summary</H>
            <p>{r.summary}</p>
          </>
        )}
        {r.skills.length > 0 && (
          <>
            <H>Skills</H>
            <p>{r.skills.join(", ")}</p>
          </>
        )}
        {r.experience.length > 0 && <H>Work Experience</H>}
        {r.experience.map((e, i) => (
          <div key={i} className="mt-2">
            <div className="flex justify-between gap-3">
              <p className="font-bold">
                {e.heading}, {e.org}
              </p>
              <p className="shrink-0 text-neutral-700">{e.dates}</p>
            </div>
            {e.meta && <p className="text-neutral-700">{e.meta}</p>}
            <Bullets items={e.bullets} />
          </div>
        ))}
        {r.projects.length > 0 && <H>Projects</H>}
        {r.projects.map((p, i) => (
          <div key={i} className="mt-2">
            <p className="font-bold">{p.heading}</p>
            {p.meta && <p className="text-neutral-700">{p.meta}</p>}
            <Bullets items={p.bullets} />
          </div>
        ))}
        {r.education.length > 0 && <H>Education</H>}
        {r.education.map((e, i) => (
          <div key={i} className="mt-2">
            <div className="flex justify-between gap-3">
              <p className="font-bold">{e.heading}</p>
              <p className="shrink-0 text-neutral-700">{e.dates}</p>
            </div>
            <p>{[e.org, e.detail].filter(Boolean).join(", ")}</p>
          </div>
        ))}
        {r.certifications.length > 0 && (
          <>
            <H>Certifications</H>
            <Bullets items={r.certifications} />
          </>
        )}
        {r.languages.length > 0 && (
          <>
            <H>Languages</H>
            <p>{r.languages.join(", ")}</p>
          </>
        )}
        {r.activities.length > 0 && (
          <>
            <H>Leadership and Activities</H>
            <Bullets items={r.activities} />
          </>
        )}
      </article>
    </div>
  );
}

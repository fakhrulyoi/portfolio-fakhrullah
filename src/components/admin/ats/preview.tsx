import type { AtsEntry, AtsResume } from "@/lib/ats";

const FONT_CSS = `
@font-face{font-family:"CarlitoPreview";src:url(/fonts/carlito-latin-400-normal.woff) format("woff");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"CarlitoPreview";src:url(/fonts/carlito-latin-400-italic.woff) format("woff");font-weight:400;font-style:italic;font-display:swap}
@font-face{font-family:"CarlitoPreview";src:url(/fonts/carlito-latin-700-normal.woff) format("woff");font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:"CarlitoPreview";src:url(/fonts/carlito-latin-700-italic.woff) format("woff");font-weight:700;font-style:italic;font-display:swap}`;

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 mt-3.5 border-b border-black pb-px text-[10.5pt] font-bold uppercase">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-0.5 list-disc space-y-[3px] pl-[26px] marker:text-black">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

function Entries({ list }: { list: AtsEntry[] }) {
  return (
    <>
      {list.map((e, i) => (
        <div key={i} className="mt-1.5">
          <div className="flex justify-between gap-3 font-bold">
            <p>{e.heading}</p>
            {e.dates && <p className="shrink-0">{e.dates}</p>}
          </div>
          {e.sub && <p className="italic">{e.sub}</p>}
          <Bullets items={e.bullets} />
        </div>
      ))}
    </>
  );
}

/** On-screen preview with the same structure and fonts as the PDF/Word output. */
export function ResumePreview({ r }: { r: AtsResume }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken p-3 sm:p-5">
      <style>{FONT_CSS}</style>
      <p className="mb-2 text-[12px] text-muted">Preview (A4)</p>
      <article
        aria-label="Resume preview"
        className="mx-auto max-h-[70dvh] overflow-y-auto bg-white px-[5%] py-7 text-[10pt] leading-[1.25] text-black shadow-sm xl:max-h-[calc(100dvh-12rem)]"
        style={{ fontFamily: '"CarlitoPreview", Calibri, Carlito, Arial, sans-serif' }}
      >
        <h2 className="text-center text-[14pt] font-bold uppercase tracking-[0.02em]">{r.name}</h2>
        {r.title && <p className="mt-0.5 text-center text-[10.5pt]">{r.title}</p>}
        {r.contact.length > 0 && <p className="text-center">{r.contact.join(" | ")}</p>}

        {r.summary && (
          <>
            <H>Professional Summary</H>
            <p>{r.summary}</p>
          </>
        )}
        {r.skills.length > 0 && (
          <>
            <H>Technical Skills</H>
            {r.skills.map((l, i) => (
              <p key={i} className="mb-[3px]">
                {l.label && <b>{l.label}: </b>}
                {l.text}
              </p>
            ))}
          </>
        )}
        {r.experience.length > 0 && (
          <>
            <H>Work Experience</H>
            <Entries list={r.experience} />
          </>
        )}
        {r.education.length > 0 && (
          <>
            <H>Education</H>
            <Entries list={r.education} />
          </>
        )}
        {r.projects.length > 0 && (
          <>
            <H>Projects</H>
            <Entries list={r.projects} />
          </>
        )}
        {r.certifications.length > 0 && (
          <>
            <H>Certifications</H>
            <Bullets items={r.certifications} />
          </>
        )}
        {r.activities.length > 0 && (
          <>
            <H>Leadership &amp; Activities</H>
            <Bullets items={r.activities} />
          </>
        )}
        {r.references.length > 0 && (
          <>
            <H>{r.references.length > 1 ? "References" : "Reference"}</H>
            {r.references.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </>
        )}
      </article>
    </div>
  );
}

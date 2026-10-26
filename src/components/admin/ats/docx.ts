import { AlignmentType, BorderStyle, Document, LevelFormat, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { AtsEntry, AtsResume } from "@/lib/ats";

// Word version of the same layout: Calibri, centred header, ruled headings,
// right tab for dates, italic organisation lines, real Word bullets.
const FONT = "Calibri";
const SIZE = 20; // half-points: 10pt
const RIGHT = 10466; // A4 width (11906) minus 0.5" margins (720 each), in twips

const t = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; allCaps?: boolean } = {}) =>
  new TextRun({ text, font: FONT, size: o.size ?? SIZE, bold: o.bold, italics: o.italics, allCaps: o.allCaps });

const heading = (text: string) =>
  new Paragraph({
    spacing: { before: 200, after: 60 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
    children: [t(text, { bold: true, size: 21, allCaps: true })],
  });
const bullet = (text: string) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [t(text)] });

function entries(list: AtsEntry[]) {
  const out: Paragraph[] = [];
  for (const e of list) {
    out.push(
      new Paragraph({
        spacing: { before: 100 },
        keepNext: true,
        tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
        children: [t(e.heading, { bold: true }), ...(e.dates ? [t(`\t${e.dates}`, { bold: true })] : [])],
      }),
    );
    if (e.sub) out.push(new Paragraph({ keepNext: e.bullets.length > 0, children: [t(e.sub, { italics: true })] }));
    e.bullets.forEach((b) => out.push(bullet(b)));
  }
  return out;
}

export async function resumeDocxBlob(r: AtsResume) {
  const center = (runs: TextRun[]) => new Paragraph({ alignment: AlignmentType.CENTER, children: runs });
  const children: Paragraph[] = [center([t(r.name, { bold: true, size: 28, allCaps: true })])];
  if (r.title) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [t(r.title, { size: 21 })] }));
  if (r.contact.length) children.push(center([t(r.contact.join(" | "))]));
  if (r.summary) children.push(heading("Professional Summary"), new Paragraph({ children: [t(r.summary)] }));
  if (r.skills.length) {
    children.push(heading("Technical Skills"));
    r.skills.forEach((l) =>
      children.push(new Paragraph({ spacing: { after: 20 }, children: [...(l.label ? [t(`${l.label}: `, { bold: true })] : []), t(l.text)] })),
    );
  }
  if (r.experience.length) children.push(heading("Work Experience"), ...entries(r.experience));
  if (r.education.length) children.push(heading("Education"), ...entries(r.education));
  if (r.projects.length) children.push(heading("Projects"), ...entries(r.projects));
  if (r.certifications.length) children.push(heading("Certifications"), ...r.certifications.map(bullet));
  if (r.activities.length) children.push(heading("Leadership & Activities"), ...r.activities.map(bullet));
  if (r.references.length) {
    children.push(heading(r.references.length > 1 ? "References" : "Reference"), ...r.references.map((x) => new Paragraph({ children: [t(x)] })));
  }

  const doc = new Document({
    creator: r.name,
    title: `${r.name} - Resume`,
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 220 } } } }],
        },
      ],
    },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 680, bottom: 680, left: 720, right: 720 } } }, children }],
  });
  return Packer.toBlob(doc);
}

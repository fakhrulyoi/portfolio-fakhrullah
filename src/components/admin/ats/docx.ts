import { AlignmentType, BorderStyle, Document, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { AtsResume } from "@/lib/ats";

// Word version: Calibri, single column, built-in bullet style, no tables.
const FONT = "Calibri";
const run = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) =>
  new TextRun({ text, font: FONT, size: opts.size ?? 21, bold: opts.bold, color: opts.color });

const heading = (t: string) =>
  new Paragraph({
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 2 } },
    children: [run(t.toUpperCase(), { bold: true, size: 22 })],
  });
const para = (t: string) => new Paragraph({ spacing: { after: 40 }, children: [run(t)] });
const bullet = (t: string) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [run(t)] });
const titleRow = (left: string, right: string) =>
  new Paragraph({
    spacing: { before: 120 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9600 }],
    children: [run(left, { bold: true }), ...(right ? [run(`\t${right}`, { color: "333333" })] : [])],
  });

export async function resumeDocxBlob(r: AtsResume) {
  const children: Paragraph[] = [
    new Paragraph({ alignment: AlignmentType.LEFT, children: [run(r.name, { bold: true, size: 34 })] }),
  ];
  if (r.title) children.push(new Paragraph({ children: [run(r.title, { size: 23 })] }));
  if (r.contact.length) children.push(new Paragraph({ children: [run(r.contact.join(" | "), { size: 19, color: "333333" })] }));
  if (r.summary) children.push(heading("Professional Summary"), para(r.summary));
  if (r.skills.length) children.push(heading("Skills"), para(r.skills.join(", ")));
  if (r.experience.length) {
    children.push(heading("Work Experience"));
    for (const e of r.experience) {
      children.push(titleRow(`${e.heading}, ${e.org}`, e.dates));
      if (e.meta) children.push(new Paragraph({ children: [run(e.meta, { color: "333333" })] }));
      e.bullets.forEach((b) => children.push(bullet(b)));
    }
  }
  if (r.projects.length) {
    children.push(heading("Projects"));
    for (const p of r.projects) {
      children.push(titleRow(p.heading, ""));
      if (p.meta) children.push(new Paragraph({ children: [run(p.meta, { color: "333333" })] }));
      p.bullets.forEach((b) => children.push(bullet(b)));
    }
  }
  if (r.education.length) {
    children.push(heading("Education"));
    for (const e of r.education) {
      children.push(titleRow(e.heading, e.dates), para([e.org, e.detail].filter(Boolean).join(", ")));
    }
  }
  if (r.certifications.length) children.push(heading("Certifications"), ...r.certifications.map(bullet));
  if (r.languages.length) children.push(heading("Languages"), para(r.languages.join(", ")));
  if (r.activities.length) children.push(heading("Leadership and Activities"), ...r.activities.map(bullet));

  const doc = new Document({
    creator: r.name,
    title: `${r.name} - Resume`,
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    sections: [{ properties: { page: { margin: { top: 800, bottom: 800, left: 1000, right: 1000 } } }, children }],
  });
  return Packer.toBlob(doc);
}

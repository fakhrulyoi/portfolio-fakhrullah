import { Document, Font, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AtsEntry, AtsResume } from "@/lib/ats";

// Layout follows the owner's reference resume: Calibri-metric font (Carlito),
// centred header, ruled uppercase section headings, bold right-aligned dates,
// italic organisation lines. Single column, real text: ATS-readable.
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const base = typeof window !== "undefined" ? window.location.origin : "";
  Font.register({
    family: "Carlito",
    fonts: [
      { src: `${base}/fonts/carlito-latin-400-normal.woff` },
      { src: `${base}/fonts/carlito-latin-400-italic.woff`, fontStyle: "italic" },
      { src: `${base}/fonts/carlito-latin-700-normal.woff`, fontWeight: 700 },
      { src: `${base}/fonts/carlito-latin-700-italic.woff`, fontWeight: 700, fontStyle: "italic" },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsReady = true;
}

const s = StyleSheet.create({
  page: { paddingTop: 37, paddingBottom: 36, paddingHorizontal: 36, fontFamily: "Carlito", fontSize: 10, lineHeight: 1.25, color: "#000000" },
  name: { fontSize: 14, fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.2 },
  title: { fontSize: 10.5, textAlign: "center", marginTop: 3 },
  contact: { fontSize: 10, textAlign: "center", marginTop: 2 },
  h2: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", marginTop: 11, marginBottom: 4, paddingBottom: 1.5, borderBottomWidth: 1, borderBottomColor: "#000000" },
  summary: {},
  skillLine: { marginBottom: 2.5 },
  bold: { fontWeight: 700 },
  entry: { marginTop: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  heading: { fontWeight: 700, flex: 1, paddingRight: 8 },
  dates: { fontWeight: 700 },
  sub: { fontStyle: "italic" },
  bullet: { flexDirection: "row", marginTop: 2.5, paddingLeft: 8 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
  plain: { marginTop: 1.5 },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((b, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

function Entries({ list }: { list: AtsEntry[] }) {
  return (
    <>
      {list.map((e, i) => (
        <View key={i} style={s.entry}>
          <View wrap={false}>
            <View style={s.row}>
              <Text style={s.heading}>{e.heading}</Text>
              {e.dates ? <Text style={s.dates}>{e.dates}</Text> : null}
            </View>
            {e.sub ? <Text style={s.sub}>{e.sub}</Text> : null}
          </View>
          <Bullets items={e.bullets} />
        </View>
      ))}
    </>
  );
}

const H = ({ children }: { children: string }) => (
  <Text style={s.h2} minPresenceAhead={40}>
    {children}
  </Text>
);

export function ResumePdf({ r }: { r: AtsResume }) {
  return (
    <Document title={`${r.name} - Resume`} author={r.name} subject={r.title} keywords={r.skills.map((l) => l.text).join(", ")} creator="Portfolio">
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{r.name}</Text>
        {r.title ? <Text style={s.title}>{r.title}</Text> : null}
        {r.contact.length ? <Text style={s.contact}>{r.contact.join(" | ")}</Text> : null}

        {r.summary ? (
          <>
            <H>Professional Summary</H>
            <Text style={s.summary}>{r.summary}</Text>
          </>
        ) : null}

        {r.skills.length ? (
          <>
            <H>Technical Skills</H>
            {r.skills.map((l, i) => (
              <Text key={i} style={s.skillLine}>
                {l.label ? <Text style={s.bold}>{l.label}: </Text> : null}
                {l.text}
              </Text>
            ))}
          </>
        ) : null}

        {r.experience.length ? (
          <>
            <H>Work Experience</H>
            <Entries list={r.experience} />
          </>
        ) : null}
        {r.education.length ? (
          <>
            <H>Education</H>
            <Entries list={r.education} />
          </>
        ) : null}
        {r.projects.length ? (
          <>
            <H>Projects</H>
            <Entries list={r.projects} />
          </>
        ) : null}
        {r.certifications.length ? (
          <>
            <H>Certifications</H>
            <Bullets items={r.certifications} />
          </>
        ) : null}
        {r.activities.length ? (
          <>
            <H>Leadership & Activities</H>
            <Bullets items={r.activities} />
          </>
        ) : null}
        {r.references.length ? (
          <>
            <H>{r.references.length > 1 ? "References" : "Reference"}</H>
            {r.references.map((x, i) => (
              <Text key={i} style={s.plain}>
                {x}
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}

export async function resumePdfBlob(r: AtsResume) {
  registerFonts();
  return pdf(<ResumePdf r={r} />).toBlob();
}

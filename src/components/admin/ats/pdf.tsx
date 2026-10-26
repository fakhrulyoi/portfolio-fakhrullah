import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AtsResume } from "@/lib/ats";

// Built-in Helvetica: a standard font every ATS can read. Single column,
// real text, standard section names, no tables, icons or images.
const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 44, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#111111" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 18, lineHeight: 1.15 },
  title: { fontSize: 11.5, marginTop: 3 },
  contact: { fontSize: 9.5, marginTop: 5, color: "#333333" },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 14, marginBottom: 5, paddingBottom: 2, borderBottomWidth: 0.75, borderBottomColor: "#999999", textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#333333" },
  item: { marginTop: 6 },
  bullet: { flexDirection: "row", marginTop: 2, paddingLeft: 4 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
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

export function ResumePdf({ r }: { r: AtsResume }) {
  return (
    <Document title={`${r.name} - Resume`} author={r.name} subject={r.title} keywords={r.skills.join(", ")} creator="Portfolio">
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{r.name}</Text>
        {r.title ? <Text style={s.title}>{r.title}</Text> : null}
        {r.contact.length ? <Text style={s.contact}>{r.contact.join(" | ")}</Text> : null}

        {r.summary ? (
          <>
            <Text style={s.h2}>Professional Summary</Text>
            <Text>{r.summary}</Text>
          </>
        ) : null}

        {r.skills.length ? (
          <>
            <Text style={s.h2}>Skills</Text>
            <Text>{r.skills.join(", ")}</Text>
          </>
        ) : null}

        {r.experience.length ? <Text style={s.h2}>Work Experience</Text> : null}
        {r.experience.map((e, i) => (
          <View key={i} style={s.item}>
            <View style={s.row} wrap={false}>
              <Text style={s.bold}>
                {e.heading}, {e.org}
              </Text>
              <Text style={s.muted}>{e.dates}</Text>
            </View>
            {e.meta ? <Text style={s.muted}>{e.meta}</Text> : null}
            <Bullets items={e.bullets} />
          </View>
        ))}

        {r.projects.length ? <Text style={s.h2}>Projects</Text> : null}
        {r.projects.map((p, i) => (
          <View key={i} style={s.item}>
            <Text style={s.bold}>{p.heading}</Text>
            {p.meta ? <Text style={s.muted}>{p.meta}</Text> : null}
            <Bullets items={p.bullets} />
          </View>
        ))}

        {r.education.length ? <Text style={s.h2}>Education</Text> : null}
        {r.education.map((e, i) => (
          <View key={i} style={s.item} wrap={false}>
            <View style={s.row}>
              <Text style={s.bold}>{e.heading}</Text>
              <Text style={s.muted}>{e.dates}</Text>
            </View>
            <Text>{[e.org, e.detail].filter(Boolean).join(", ")}</Text>
          </View>
        ))}

        {r.certifications.length ? (
          <>
            <Text style={s.h2}>Certifications</Text>
            <Bullets items={r.certifications} />
          </>
        ) : null}
        {r.languages.length ? (
          <>
            <Text style={s.h2}>Languages</Text>
            <Text>{r.languages.join(", ")}</Text>
          </>
        ) : null}
        {r.activities.length ? (
          <>
            <Text style={s.h2}>Leadership and Activities</Text>
            <Bullets items={r.activities} />
          </>
        ) : null}
      </Page>
    </Document>
  );
}

export async function resumePdfBlob(r: AtsResume) {
  return pdf(<ResumePdf r={r} />).toBlob();
}

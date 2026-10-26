import { ImageResponse } from "next/og";
import { getPublishedPortfolio } from "@/lib/data";
import { parseStep } from "@/lib/format";

export const revalidate = 3600;

/** Default social sharing image, generated from the published profile. */
export async function GET() {
  const r = await getPublishedPortfolio();
  const s = r.status === "ok" ? r.data.settings : null;
  const name = s?.profile.full_name || "Portfolio";
  const title = s?.profile.title || "";
  const headline = s?.profile.headline || "";
  const accent = s?.theme.accent || "#2450D8";
  const steps = (s?.profile.process_steps ?? []).slice(0, 6).map((x) => parseStep(x).label);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f7f5", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#18181b", letterSpacing: -2, lineHeight: 1.05 }}>{name}</div>
            {title && <div style={{ fontSize: 34, color: "#6b6b72", marginTop: 18 }}>{title}</div>}
          </div>
          {headline && <div style={{ fontSize: 30, color: "#18181b", lineHeight: 1.3, maxWidth: 640 }}>{headline}</div>}
        </div>
        {steps.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, marginLeft: 48, width: 360 }}>
            {steps.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: accent }} />
                <div style={{ fontSize: 24, color: "#3f3f46" }}>{t}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

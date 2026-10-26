import type { Metadata } from "next";
import { connection } from "next/server";
import { getPublishedPortfolio } from "@/lib/data";
import { storageUrl } from "@/lib/format";
import { Portfolio } from "@/components/site/portfolio";

// Static page, refreshed instantly whenever you press Publish in the
// dashboard (and at most hourly as a safety net).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const r = await getPublishedPortfolio();
  if (r.status !== "ok") return { title: "Portfolio" };
  const { seo, profile } = r.data.settings;
  const title = seo.title || [profile.full_name, profile.title].filter(Boolean).join(" | ");
  const description = seo.description || profile.headline || profile.intro;
  const image = seo.og_image_path ? storageUrl(seo.og_image_path) : "/og";
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      title,
      description,
      url: "/",
      siteName: profile.full_name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: { index: true, follow: true },
  };
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </main>
  );
}

export default async function HomePage() {
  const r = await getPublishedPortfolio();
  if (r.status === "ok") return <Portfolio data={r.data} />;
  // Don't cache a "not ready" page: render it fresh until content loads.
  await connection();
  if (r.status === "unconfigured")
    return (
      <Notice title="Almost there">
        The site is running, but it isn&apos;t connected to its database yet. Add the Supabase environment variables
        described in the README, then redeploy.
      </Notice>
    );
  if (r.status === "empty")
    return (
      <Notice title="Coming soon">
        This portfolio hasn&apos;t been published yet. The owner can publish it from the dashboard.
      </Notice>
    );
  return (
    <Notice title="Temporarily unavailable">
      The portfolio couldn&apos;t be loaded right now. Please refresh in a minute.
    </Notice>
  );
}

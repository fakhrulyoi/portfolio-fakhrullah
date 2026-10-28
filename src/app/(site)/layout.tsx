import { Providers } from "@/components/providers";
import { AccentScope } from "@/components/accent-scope";
import { Analytics } from "@vercel/analytics/next";
import { getPublishedPortfolio } from "@/lib/data";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const result = await getPublishedPortfolio();
  const theme = result.status === "ok" ? result.data.settings.theme : null;
  return (
    <Providers
      defaultTheme={theme?.default_mode ?? "light"}
      forcedTheme={theme && !theme.allow_toggle && theme.default_mode !== "system" ? theme.default_mode : undefined}
    >
      <AccentScope accent={theme?.accent ?? "#2450D8"}>{children}</AccentScope>
      {/* Cookie-free visitor counts for the public site. Enable Web Analytics in Vercel, then set ANALYTICS=on. */}
      {process.env.ANALYTICS === "on" && <Analytics />}
    </Providers>
  );
}

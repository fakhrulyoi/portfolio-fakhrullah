import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { normalisePortfolio } from "@/lib/data";
import { storageUrl } from "@/lib/format";
import { Portfolio } from "@/components/site/portfolio";
import { AccentScope } from "@/components/accent-scope";
import { PublishBar } from "@/components/admin/publish-bar";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage() {
  const { supabase } = await requireAdmin();
  const [{ data, error }, { data: state }] = await Promise.all([
    supabase.rpc("get_draft_portfolio"),
    supabase.from("site_state").select("last_change_at,last_published_at").eq("id", 1).maybeSingle(),
  ]);
  const portfolio = normalisePortfolio(data);
  if (error || !portfolio) {
    return <p className="p-10 text-sm text-danger">The preview couldn&apos;t be loaded: {error?.message ?? "no content"}.</p>;
  }
  const hasChanges = !state?.last_published_at || new Date(state.last_change_at) > new Date(state.last_published_at);
  const banner = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sunken px-5 py-2.5 text-sm sm:px-8">
      <p>
        <strong className="font-semibold">Preview.</strong> <span className="text-muted">This is your draft. Visitors still see the published version.</span>
      </p>
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          Back to dashboard
        </Link>
        <PublishBar hasChanges={hasChanges} lastPublished={state?.last_published_at ?? null} compact />
      </div>
    </div>
  );
  return (
    <AccentScope accent={portfolio.settings.theme.accent}>
      <Portfolio
        data={{ ...portfolio, published_at: null }}
        resumeHref={portfolio.settings.resume.path ? storageUrl(portfolio.settings.resume.path) : "/resume"}
        previewBanner={banner}
        contactDisabled
      />
    </AccentScope>
  );
}

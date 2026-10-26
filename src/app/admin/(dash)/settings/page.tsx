import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getDraftSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Site settings" };

function Block({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-muted">{description}</p>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const s = await getDraftSettings();
  return (
    <>
      <PageHeader title="Site settings" description="Search and sharing details, colours, and which sections appear on your site. Each block saves separately." />
      <div className="space-y-6">
        <Block title="Appearance" description="Template, accent colour and light/dark mode.">
          <SettingsForm section="theme" initial={s.theme} />
        </Block>
        <Block title="Search and social sharing" description="How your site appears in Google and when your link is shared.">
          <SettingsForm section="seo" initial={s.seo} />
        </Block>
        <Block title="Sections" description="Turn whole sections on or off. Empty sections are hidden automatically.">
          <SettingsForm section="sections" initial={s.sections} />
        </Block>
        <Block title="Contact" description="Messages sent through the form arrive in Messages.">
          <SettingsForm section="contact" initial={s.contact} />
        </Block>
      </div>
    </>
  );
}

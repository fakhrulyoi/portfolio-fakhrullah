import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getDraftSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const s = await getDraftSettings();
  return (
    <>
      <PageHeader title="About" description="Your professional summary, strengths and the roles you're looking for. Keep every claim something your resume supports." />
      <SettingsForm section="about" initial={s.about} />
    </>
  );
}

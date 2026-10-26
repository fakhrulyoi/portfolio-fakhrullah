import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getDraftSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Profile & home" };

export default async function ProfilePage() {
  const s = await getDraftSettings();
  return (
    <>
      <PageHeader title="Profile & home" description="Your name, headline, photo, availability and contact links. These appear at the top of your site and in the Contact section." />
      <SettingsForm section="profile" initial={s.profile} />
    </>
  );
}

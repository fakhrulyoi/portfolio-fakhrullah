"use client";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/actions";
import type { Settings, SettingsSection } from "@/lib/schemas";
import { AdminForm } from "./form";
import { SETTINGS_FIELDS } from "./config";

export function SettingsForm<S extends SettingsSection>({ section, initial }: { section: S; initial: Settings[S] }) {
  const router = useRouter();
  const fields = SETTINGS_FIELDS[section] ?? [];
  return (
    <AdminForm
      fields={fields}
      initial={initial as Record<string, unknown>}
      onSave={(v) => saveSettings(section, v)}
      onSaved={() => router.refresh()}
    />
  );
}

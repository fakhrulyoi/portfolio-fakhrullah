"use client";
import { changePassword } from "@/lib/actions";
import { AdminForm } from "./form";

export function PasswordForm() {
  return (
    <AdminForm
      stickyFooter={false}
      submitLabel="Update password"
      fields={[
        { type: "password", name: "password", label: "New password", help: "At least 10 characters, with letters and a number.", half: true },
        { type: "password", name: "confirm", label: "Confirm new password", half: true },
      ]}
      initial={{ password: "", confirm: "" }}
      onSave={(v) => changePassword(v as { password: string; confirm: string })}
    />
  );
}

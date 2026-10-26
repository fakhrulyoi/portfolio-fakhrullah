import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "@/components/admin/password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { user } = await requireAdmin();
  const { reset } = await searchParams;
  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${user.email}.`} />
      {reset && <p className="mb-6 rounded-lg bg-sunken p-3 text-sm">You followed a reset link. Choose a new password below.</p>}
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-5 font-semibold">Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">We&apos;ll email a link that lets you choose a new password.</p>
        <div className="mt-8">
          <ForgotForm />
        </div>
        <Link href="/admin/login" className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

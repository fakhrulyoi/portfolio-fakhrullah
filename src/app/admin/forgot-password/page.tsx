import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-5">
      <div aria-hidden className="blueprint pointer-events-none absolute inset-0" />
      <div className="rise-b relative w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] sm:p-8">
        <span aria-hidden className="mb-6 flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-fg">P</span>
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

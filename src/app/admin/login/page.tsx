import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

const MESSAGES: Record<string, string> = {
  not_admin: "That account doesn't have admin access, so you've been signed out.",
  link_expired: "That link has expired or was already used. Request a new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const notice = sp.error ? MESSAGES[sp.error] : sp.signed_out ? "You've been signed out." : null;
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-5">
      <div aria-hidden className="blueprint pointer-events-none absolute inset-0" />
      <div className="rise-b relative w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] sm:p-8">
        <span aria-hidden className="mb-6 flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-fg">P</span>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your dashboard</h1>
        <p className="mt-2 text-sm text-muted">For the portfolio owner only.</p>
        {notice && <p className="mt-6 rounded-lg bg-sunken p-3 text-sm">{notice}</p>}
        <div className="mt-8">
          <LoginForm next={sp.next} />
        </div>
      </div>
    </main>
  );
}

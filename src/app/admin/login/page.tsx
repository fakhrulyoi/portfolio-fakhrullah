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
    <main className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
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

"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset, signIn, type ActionResult } from "@/lib/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signIn, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required aria-invalid={fe.email ? true : undefined} />
        {fe.email && <p className="text-[13px] text-danger">{fe.email}</p>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/admin/forgot-password" className="text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
            Forgot password?
          </a>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={fe.password ? true : undefined} />
        {fe.password && <p className="text-[13px] text-danger">{fe.password}</p>}
      </div>
      {state && !state.ok && (
        <p role="alert" className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] p-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="solid" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(requestPasswordReset, null);
  if (state?.ok) return <p role="status" className="rounded-lg bg-sunken p-4 text-sm leading-relaxed">{state.message}</p>;
  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Admin email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" variant="solid" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}

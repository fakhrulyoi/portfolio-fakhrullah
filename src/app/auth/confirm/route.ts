import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Landing point for password-reset emails. */
export async function GET(req: NextRequest) {
  const token_hash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = req.nextUrl.searchParams.get("code");
  const supabase = await createSupabaseServerClient();
  let ok = false;
  if (token_hash && type) ok = !(await supabase.auth.verifyOtp({ type, token_hash })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  const url = new URL(ok ? "/admin/account?reset=1" : "/admin/login?error=link_expired", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

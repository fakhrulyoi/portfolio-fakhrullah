import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function handle(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const reason = req.nextUrl.searchParams.get("reason");
  const url = new URL("/admin/login", req.url);
  if (reason === "not_admin") url.searchParams.set("error", "not_admin");
  else url.searchParams.set("signed_out", "1");
  return NextResponse.redirect(url, { status: 303 });
}

export const GET = handle;
export const POST = handle;

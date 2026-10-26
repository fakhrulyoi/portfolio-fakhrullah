import { NextResponse, type NextRequest } from "next/server";
import { getPublishedPortfolio } from "@/lib/data";
import { storageUrl } from "@/lib/format";

// Always resolves to the latest PUBLISHED resume, so /resume is a stable
// link you can put in emails and job applications.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const r = await getPublishedPortfolio();
  const resume = r.status === "ok" ? r.data.settings.resume : null;
  if (!resume?.path) {
    return new NextResponse("No resume has been published yet.", { status: 404, headers: { "content-type": "text/plain" } });
  }
  const url = new URL(storageUrl(resume.path));
  if (req.nextUrl.searchParams.has("download")) {
    url.searchParams.set("download", resume.file_name || "resume.pdf");
  }
  return NextResponse.redirect(url, { status: 307, headers: { "cache-control": "no-store" } });
}

import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { PublishBar } from "@/components/admin/publish-bar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const [{ data: state }, { count: unread }] = await Promise.all([
    supabase.from("site_state").select("last_change_at,last_published_at").eq("id", 1).maybeSingle(),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  const hasChanges = !state?.last_published_at || new Date(state.last_change_at) > new Date(state.last_published_at);
  return (
    <div className="min-h-dvh bg-paper text-ink lg:flex">
      <Sidebar email={user.email ?? ""} unread={unread ?? 0} />
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:px-8">
          <PublishBar hasChanges={hasChanges} lastPublished={state?.last_published_at ?? null} />
        </div>
        <main className="mx-auto max-w-4xl px-4 py-8 has-[[data-wide]]:max-w-7xl sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

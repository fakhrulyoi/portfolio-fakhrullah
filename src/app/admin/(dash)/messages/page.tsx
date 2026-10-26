import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { MessageList } from "@/components/admin/message-list";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,message,is_read,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <>
      <PageHeader title="Messages" description="Messages from your contact form. Reply from your own email; replies go straight to the sender." />
      <MessageList messages={data ?? []} />
    </>
  );
}

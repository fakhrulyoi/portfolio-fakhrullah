import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getCollection } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Experience" };

export default async function Page() {
  const items = await getCollection("experiences");
  return (
    <>
      <PageHeader title="Experience" description="Add, edit and reorder your work experience. Hidden items stay in your draft but don't appear on the site." />
      <CollectionManager collection="experiences" items={items} />
    </>
  );
}

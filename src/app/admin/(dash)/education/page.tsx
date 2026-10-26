import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getCollection } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Education" };

export default async function Page() {
  const items = await getCollection("education");
  return (
    <>
      <PageHeader title="Education" description="Your qualifications, results and relevant coursework." />
      <CollectionManager collection="education" items={items} />
    </>
  );
}

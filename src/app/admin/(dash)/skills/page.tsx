import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getCollection } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Skills" };

export default async function Page() {
  const items = await getCollection("skill_groups");
  return (
    <>
      <PageHeader title="Skills" description="Group your skills into categories. Only list skills you can demonstrate." />
      <CollectionManager collection="skill_groups" items={items} />
    </>
  );
}

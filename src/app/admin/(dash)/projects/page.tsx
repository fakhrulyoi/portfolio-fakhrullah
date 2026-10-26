import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getCollection } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Projects" };

export default async function Page() {
  const items = await getCollection("projects");
  return (
    <>
      <PageHeader title="Projects" description="Add projects, upload screenshots, and choose which ones appear. Never upload confidential screens or documents." />
      <CollectionManager collection="projects" items={items} />
    </>
  );
}

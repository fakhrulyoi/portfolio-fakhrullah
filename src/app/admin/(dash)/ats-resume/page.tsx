import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { AtsBuilder } from "@/components/admin/ats/ats-builder";
import { getAtsSettings, getCollection, getDraftSettings } from "@/lib/admin-data";
import type { Education, Experience, Project, SkillGroup } from "@/lib/schemas";

export const metadata: Metadata = { title: "ATS resume" };

export default async function AtsResumePage() {
  const [settings, { ats, ready }, experiences, projects, education, skill_groups] = await Promise.all([
    getDraftSettings(),
    getAtsSettings(),
    getCollection("experiences"),
    getCollection("projects"),
    getCollection("education"),
    getCollection("skill_groups"),
  ]);
  return (
    <>
      <PageHeader
        title="ATS resume"
        description="Builds a plain, one-column resume from your portfolio content that applicant tracking systems can read. Tailor it for each job, then download it as PDF or Word."
      />
      <AtsBuilder
        initial={ats}
        ready={ready}
        source={{
          settings,
          experiences: experiences as unknown as Experience[],
          projects: projects as unknown as Project[],
          education: education as unknown as Education[],
          skill_groups: skill_groups as unknown as SkillGroup[],
        }}
      />
    </>
  );
}

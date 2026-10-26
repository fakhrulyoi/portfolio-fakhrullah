import type { Portfolio as PortfolioData } from "@/lib/schemas";
import { buildModel, TEMPLATES, type TemplateId } from "./model";
import { ClassicTemplate } from "./templates/classic";
import { DocumentTemplate } from "./templates/document";
import { PanelTemplate } from "./templates/panel";

const RENDERERS = { classic: ClassicTemplate, document: DocumentTemplate, panel: PanelTemplate } as const;

/**
 * The public portfolio. Rendered by the public home page (published data)
 * and by the admin preview (draft data), so both always match. The layout
 * comes from Site settings > Appearance > Template.
 */
export function Portfolio({
  data,
  resumeHref = "/resume",
  previewBanner,
  contactDisabled = false,
}: {
  data: PortfolioData;
  resumeHref?: string;
  previewBanner?: React.ReactNode;
  contactDisabled?: boolean;
}) {
  const id = data.settings.theme.template as TemplateId;
  const Template = RENDERERS[TEMPLATES.includes(id) ? id : "classic"];
  return (
    <Template
      data={data}
      model={buildModel(data)}
      resumeHref={resumeHref}
      previewBanner={previewBanner}
      contactDisabled={contactDisabled}
    />
  );
}

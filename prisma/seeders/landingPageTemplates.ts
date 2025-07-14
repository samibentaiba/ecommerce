// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/landingPageTemplates.ts

import prisma from "&/prisma";
import { loadCSV, safeCreate } from "../utils/handler";
import { LandingPageSectionType } from "@prisma/client";

type TemplateRow = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isDefault: string;
  createdAt: string;
};

type SectionRow = {
  id: string;
  templateId: string;
  type: string;
  title: string;
  content: string;
  image: string;
  settings: string; // JSON string
  order: string;
};

export default async function seedLandingPageTemplates() {
  const templates = await loadCSV<TemplateRow>("landing_page_templates.csv");
  const sections = await loadCSV<SectionRow>(
    "landing_page_template_sections.csv"
  );

  for (const tpl of templates) {
    const linkedSections = sections.filter((s) => s.templateId === tpl.id);

    await safeCreate(`landingPageTemplate ${tpl.name}`, async () =>
      prisma.landingPageTemplate.create({
        data: {
          id: tpl.id, // Use the ID from CSV
          name: tpl.name,
          description: tpl.description,
          thumbnail: tpl.thumbnail,
          isDefault: tpl.isDefault === "true",
          createdAt: new Date(tpl.createdAt),
          sections: {
            create: linkedSections.map((s) => ({
              type: s.type.toUpperCase() as LandingPageSectionType,
              title: s.title,
              content: s.content,
              image: s.image,
              settings: JSON.parse(s.settings),
              order: parseInt(s.order, 10),
            })),
          },
        },
      })
    );
  }
}

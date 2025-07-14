// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/landingPages.ts

import prisma from "&/prisma";
import { loadCSV, safeCreate } from "../utils/handler";
import { LandingPageStatus } from "@prisma/client";

type LandingPageRow = {
  id: string;
  title: string;
  slug: string;
  productId: string;
  headline: string;
  description: string;
  heroImage: string;
  status: string;
  createdAt: string;
  templateId: string;
};

export default async function seedLandingPages() {
  const rows = await loadCSV<LandingPageRow>("landing_pages.csv");

  for (const row of rows) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: row.productId },
    });

    if (!product) {
      console.warn(`⚠️ Product not found for landing page: ${row.productId}`);
      continue;
    }

    // Check if template exists (if templateId is provided)
    let templateId = null;
    if (row.templateId && row.templateId !== "null" && row.templateId !== "") {
      // Try to find template by ID first
      let template = await prisma.landingPageTemplate.findUnique({
        where: { id: row.templateId },
      });

      // If not found by ID, try to find by name (for backward compatibility)
      if (!template) {
        const templateNames = {
          "1": "Modern Hero Template",
          "2": "Product Showcase Template",
          "3": "Minimalist Template",
          "4": "Feature-Rich Template",
          "modern-hero-template": "Modern Hero Template",
          "product-showcase-template": "Product Showcase Template",
          "minimalist-template": "Minimalist Template",
          "feature-rich-template": "Feature-Rich Template",
        };
        const templateName =
          templateNames[row.templateId as keyof typeof templateNames];
        if (templateName) {
          template = await prisma.landingPageTemplate.findFirst({
            where: { name: templateName },
          });
        }
      }

      if (template) {
        templateId = template.id;
      } else {
        console.warn(`⚠️ Template not found: ${row.templateId}`);
      }
    }

    // If no template found, use the default template
    if (!templateId) {
      const defaultTemplate = await prisma.landingPageTemplate.findFirst({
        where: { isDefault: true },
      });
      if (defaultTemplate) {
        templateId = defaultTemplate.id;
        console.log(`✅ Using default template for landing page: ${row.title}`);
      } else {
        console.warn(
          `⚠️ No default template found for landing page: ${row.title}`
        );
        continue; // Skip this landing page if no template is available
      }
    }

    await safeCreate(`landing page ${row.title}`, async () =>
      prisma.landingPage.create({
        data: {
          id: row.id,
          title: row.title,
          slug: row.slug,
          productId: row.productId,
          headline: row.headline,
          description: row.description,
          heroImage: row.heroImage,
          status: row.status.toUpperCase() as LandingPageStatus,
          createdAt: new Date(row.createdAt),
          templateId: templateId,
        },
      })
    );
  }
}

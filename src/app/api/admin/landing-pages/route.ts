import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to normalize status
function normalizeStatus(status: string | undefined) {
  if (!status) return undefined;
  if (typeof status === "string") {
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PUBLISHED" || upperStatus === "DRAFT") {
      return upperStatus;
    }
    return upperStatus;
  }
  return status;
}

// GET: List all landing pages
export async function GET() {
  try {
    const landingPages = await prisma.landingPage.findMany({
      include: {
        product: true,
        template: true,
        sections: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    // Normalize status and ensure all fields are present
    const result = landingPages.map((lp) => ({
      ...lp,
      status: normalizeStatus(lp.status),
      description: lp.description ?? "",
      heroImage: lp.heroImage ?? "",
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing pages" },
      { status: 500 }
    );
  }
}

// POST: Create a new landing page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      productId,
      headline,
      description,
      status,
      templateId,
      sections,
    } = body;

    // Validate required fields
    if (!title || !slug || !productId || !headline) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, productId, headline" },
        { status: 400 }
      );
    }

    // Ensure template is always provided
    if (!templateId || templateId === "none") {
      return NextResponse.json(
        {
          error:
            "Template is required. Please select a template or use the default template.",
        },
        { status: 400 }
      );
    }

    // Handle templateId - if it's "none" or not provided, find the default template
    let finalTemplateId = templateId;
    if (!templateId || templateId === "none") {
      const defaultTemplate = await prisma.landingPageTemplate.findFirst({
        where: { isDefault: true },
      });
      finalTemplateId = defaultTemplate?.id;
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        title,
        slug,
        productId,
        headline,
        description: description || "",
        status: status ? status.toUpperCase() : "DRAFT",
        templateId: finalTemplateId,
        sections: sections
          ? {
              create: sections.map((section: any, index: number) => ({
                type: section.type.toUpperCase(),
                title: section.title,
                content: section.content,
                image: section.image,
                settings: section.settings || {},
                order: index,
                backgroundColor: section.backgroundColor,
                textColor: section.textColor,
                padding: section.padding,
                margin: section.margin,
                borderRadius: section.borderRadius,
                isVisible: section.isVisible !== false,
                customCSS: section.customCSS,
              })),
            }
          : finalTemplateId
          ? {
              // If no sections provided but template exists, copy sections from template
              create: (
                await prisma.landingPageTemplateSection.findMany({
                  where: { templateId: finalTemplateId },
                  orderBy: { order: "asc" },
                })
              ).map((section, index) => ({
                type: section.type,
                title: section.title,
                content: section.content,
                image: section.image,
                settings: section.settings,
                order: index,
                backgroundColor: section.backgroundColor,
                textColor: section.textColor,
                padding: section.padding,
                margin: section.margin,
                borderRadius: section.borderRadius,
                isVisible: section.isVisible,
                customCSS: section.customCSS,
              })),
            }
          : undefined,
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Normalize status and ensure all fields are present
    const result = {
      ...landingPage,
      status: normalizeStatus(landingPage.status),
      description: landingPage.description ?? "",
      heroImage: landingPage.heroImage ?? "",
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}

// PUT: Update a landing page
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    // Handle status conversion to uppercase
    if (updates.status) {
      updates.status = updates.status.toUpperCase();
    }

    // Ensure template is always provided
    if (!updates.templateId || updates.templateId === "none") {
      return NextResponse.json(
        {
          error:
            "Template is required. Please select a template or use the default template.",
        },
        { status: 400 }
      );
    }

    const landingPage = await prisma.landingPage.update({
      where: { id },
      data: updates,
    });
    // Normalize status and ensure all fields are present
    const result = {
      ...landingPage,
      status: normalizeStatus(landingPage.status),
      description: landingPage.description ?? "",
      heroImage: landingPage.heroImage ?? "",
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json(
      { error: "Failed to update landing page" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a landing page
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.landingPage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json(
      { error: "Failed to delete landing page" },
      { status: 500 }
    );
  }
}

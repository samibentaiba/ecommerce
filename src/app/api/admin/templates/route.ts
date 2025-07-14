import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get all templates with sections
export async function GET() {
  try {
    const templates = await prisma.landingPageTemplate.findMany({
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST: Create new template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, thumbnail, isDefault, sections } = body;

    // Check if template with same name exists
    const existingTemplate = await prisma.landingPageTemplate.findFirst({
      where: { name },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 400 }
      );
    }

    const template = await prisma.landingPageTemplate.create({
      data: {
        name,
        description,
        thumbnail,
        isDefault: isDefault || false,
        sections: {
          create:
            sections?.map((section: any, index: number) => ({
              type: section.type.toUpperCase(),
              title: section.name,
              content: section.description,
              order: index,
              settings: {},
            })) || [],
        },
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to create template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT: Update template
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, thumbnail, isDefault, sections } = body;

    // Update template
    const template = await prisma.landingPageTemplate.update({
      where: { id },
      data: {
        name,
        description,
        thumbnail,
        isDefault: isDefault || false,
        updatedAt: new Date(),
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Update sections if provided
    if (sections) {
      // Delete existing sections
      await prisma.landingPageTemplateSection.deleteMany({
        where: { templateId: id },
      });

      // Create new sections
      await prisma.landingPageTemplateSection.createMany({
        data: sections.map((section: any, index: number) => ({
          templateId: id,
          type: section.type.toUpperCase(),
          title: section.name,
          content: section.description,
          order: index,
          settings: {},
        })),
      });
    }

    // Fetch updated template with sections
    const updatedTemplate = await prisma.landingPageTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE: Delete template
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if template is being used by any landing pages
    const landingPagesUsingTemplate = await prisma.landingPage.findMany({
      where: { templateId: id },
    });

    if (landingPagesUsingTemplate.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete template that is being used by landing pages" },
        { status: 400 }
      );
    }

    // Delete template sections first
    await prisma.landingPageTemplateSection.deleteMany({
      where: { templateId: id },
    });

    // Delete the template
    await prisma.landingPageTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

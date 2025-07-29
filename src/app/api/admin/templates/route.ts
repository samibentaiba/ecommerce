import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPermissionChecker } from "@/lib/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to get current user from session
async function getCurrentUser(): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  // Get the full user data from database
  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: true },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can view templates
    if (!permissionChecker.canView("TEMPLATE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view templates" },
        { status: 403 }
      );
    }

    const templates = await prisma.landingPageTemplate.findMany({
      include: {
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can create templates
    if (!permissionChecker.canCreate("TEMPLATE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to create templates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, category, sections } = body;

    const template = await prisma.landingPageTemplate.create({
      data: {
        name,
        description,
        category,
        sections: {
          create: sections || [],
        },
      },
      include: {
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can edit templates
    if (!permissionChecker.canEdit("TEMPLATE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit templates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const template = await prisma.landingPageTemplate.update({
      where: { id },
      data: updateData,
      include: {
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can delete templates
    if (!permissionChecker.canDelete("TEMPLATE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete templates" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    await prisma.landingPageTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

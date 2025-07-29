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

// GET: Get all landing pages with permission check
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can view landing pages
    if (!permissionChecker.canView("LANDING_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view landing pages" },
        { status: 403 }
      );
    }

    const landingPages = await prisma.landingPage.findMany({
      include: {
        product: true,
        template: true,
        sections: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ landingPages });
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing pages" },
      { status: 500 }
    );
  }
}

// POST: Create a new landing page with permission check
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can create landing pages
    if (!permissionChecker.canCreate("LANDING_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to create landing pages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const landingPage = await prisma.landingPage.create({
      data: body,
      include: {
        product: true,
        template: true,
        sections: true,
      },
    });

    return NextResponse.json({ landingPage });
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}

// PUT: Update a landing page with permission check
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can edit landing pages
    if (!permissionChecker.canEdit("LANDING_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit landing pages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Landing page ID is required" },
        { status: 400 }
      );
    }

    const landingPage = await prisma.landingPage.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        template: true,
        sections: true,
      },
    });

    return NextResponse.json({ landingPage });
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json(
      { error: "Failed to update landing page" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a landing page with permission check
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can delete landing pages
    if (!permissionChecker.canDelete("LANDING_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete landing pages" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Landing page ID is required" },
        { status: 400 }
      );
    }

    await prisma.landingPage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Landing page deleted successfully" });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json(
      { error: "Failed to delete landing page" },
      { status: 500 }
    );
  }
}

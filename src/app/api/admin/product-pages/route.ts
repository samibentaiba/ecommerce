import { NextRequest, NextResponse } from "next/server";
import { ProductPageStatus } from "@prisma/client";
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

    // Check if user can view product pages
    if (!permissionChecker.canView("PRODUCT_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view product pages" },
        { status: 403 }
      );
    }

    const productPages = await prisma.productPage.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ productPages });
  } catch (error) {
    console.error("Error fetching product pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch product pages" },
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

    // Check if user can create product pages
    if (!permissionChecker.canCreate("PRODUCT_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to create product pages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, productId, description, features, specifications, status } =
      body;

    const productPage = await prisma.productPage.create({
      data: {
        title,
        productId,
        description,
        features,
        specifications,
        status: (status || "DRAFT").toUpperCase() as ProductPageStatus,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ productPage });
  } catch (error) {
    console.error("Error creating product page:", error);
    return NextResponse.json(
      { error: "Failed to create product page" },
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

    // Check if user can edit product pages
    if (!permissionChecker.canEdit("PRODUCT_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit product pages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product page ID is required" },
        { status: 400 }
      );
    }

    const productPage = await prisma.productPage.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
      },
    });

    return NextResponse.json({ productPage });
  } catch (error) {
    console.error("Error updating product page:", error);
    return NextResponse.json(
      { error: "Failed to update product page" },
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

    // Check if user can delete product pages
    if (!permissionChecker.canDelete("PRODUCT_PAGE")) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete product pages" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product page ID is required" },
        { status: 400 }
      );
    }

    await prisma.productPage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product page deleted successfully" });
  } catch (error) {
    console.error("Error deleting product page:", error);
    return NextResponse.json(
      { error: "Failed to delete product page" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ResourceType } from "@prisma/client";

// GET: Get all sub-users for the super user
export async function GET() {
  try {
    // Get all sub-users (users with parentId = "singleton")
    const subUsers = await prisma.user.findMany({
      where: {
        parentId: "singleton",
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json({ users: subUsers });
  } catch (error) {
    console.error("Error fetching sub-users:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub-users" },
      { status: 500 }
    );
  }
}

// POST: Create a new sub-user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, permissions } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create sub-user with permissions
    const subUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        parentId: "singleton", // Set the super user as parent
        permissions: {
          create: permissions || [], // Create permissions if provided
        },
      },
      include: {
        permissions: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = subUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Sub-user created successfully",
    });
  } catch (error) {
    console.error("Error creating sub-user:", error);
    return NextResponse.json(
      { error: "Failed to create sub-user" },
      { status: 500 }
    );
  }
}

// PUT: Update a sub-user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, password, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a sub-user
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        parentId: "singleton",
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Sub-user not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
      },
    });

    // Update permissions if provided
    if (permissions) {
      // Delete existing permissions
      await prisma.permission.deleteMany({
        where: { userId: id },
      });

      // Create new permissions
      await prisma.permission.createMany({
        data: permissions.map((perm: any) => ({
          userId: id,
          resource: perm.resource,
          canView: perm.canView,
          canCreate: perm.canCreate,
          canEdit: perm.canEdit,
          canDelete: perm.canDelete,
        })),
      });

      // Fetch updated user with new permissions
      const userWithPermissions = await prisma.user.findUnique({
        where: { id },
        include: {
          permissions: true,
        },
      });

      const { password: _, ...userWithoutPassword } = userWithPermissions!;
      return NextResponse.json({
        user: userWithoutPassword,
        message: "Sub-user updated successfully",
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Sub-user updated successfully",
    });
  } catch (error) {
    console.error("Error updating sub-user:", error);
    return NextResponse.json(
      { error: "Failed to update sub-user" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a sub-user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a sub-user
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        parentId: "singleton",
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Sub-user not found" },
        { status: 404 }
      );
    }

    // Delete user (permissions will be deleted automatically due to cascade)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Sub-user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sub-user:", error);
    return NextResponse.json(
      { error: "Failed to delete sub-user" },
      { status: 500 }
    );
  }
}

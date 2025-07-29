// src\app\api\admin\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createPermissionChecker } from "@/lib/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ProductInput = {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
};

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

// GET: Get all orders with permission check
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can view orders
    if (!permissionChecker.canView("ORDER")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view orders" },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Create a new order with permission check
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can create orders
    if (!permissionChecker.canCreate("ORDER")) {
      return NextResponse.json(
        { error: "Insufficient permissions to create orders" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Handle the order creation with items
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        total: body.total,
        status: body.status,
        orderDate: body.orderDate,
        shippingAddress: body.shippingAddress,
        items: body.items,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// PUT: Update an order with permission check
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can edit orders
    if (!permissionChecker.canEdit("ORDER")) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit orders" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an order with permission check
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can delete orders
    if (!permissionChecker.canDelete("ORDER")) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete orders" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

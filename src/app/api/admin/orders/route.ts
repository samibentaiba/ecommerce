// src\app\api\admin\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

type ProductInput = {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
};

export async function GET() {
  try {
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
        orderDate: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      products: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant?.value,
      })),
      total: order.total,
      status: order.status.toLowerCase(),
      orderDate: order.orderDate.toISOString(),
      shippingAddress: order.shippingAddress,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      products,
      total,
      status,
      orderDate,
      shippingAddress,
    } = body;

    // Create order items
    const orderItems: Array<{
      productName: string;
      quantity: number;
      price: number;
      productId: string;
      variantId: string | null;
      variant?: string;
    }> = products.map((product: ProductInput) => ({
      productName: product.name,
      quantity: product.quantity,
      price: product.price,
      productId: "", // We'll need to find the actual product ID
      variantId: null, // We'll need to find the variant if specified
      variant: product.variant,
    }));

    // Find product IDs for the order items
    for (const item of orderItems) {
      const product = await prisma.product.findFirst({
        where: { name: item.productName },
        include: { variants: true },
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productName}`);
      }

      item.productId = product.id;

      // Find variant if specified
      if (item.variant && product.variants.length > 0) {
        const variant = product.variants.find(
          (v: any) => v.value === item.variant
        );
        if (variant) {
          item.variantId = variant.id;
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        total: parseFloat(total),
        status: (status || "PENDING").toUpperCase() as OrderStatus,
        orderDate: new Date(orderDate),
        shippingAddress,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
          })),
        },
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

    // Transform the response
    const transformedOrder = {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      products: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant?.value,
      })),
      total: order.total,
      status: order.status.toLowerCase(),
      orderDate: order.orderDate.toISOString(),
      shippingAddress: order.shippingAddress,
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      products,
      total,
      status,
      orderDate,
      shippingAddress,
    } = body;

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        total: parseFloat(total),
        status: (status || "PENDING").toUpperCase() as OrderStatus,
        orderDate: new Date(orderDate),
        shippingAddress,
        updatedAt: new Date(),
      },
    });

    // Update order items if provided
    if (products) {
      // Delete existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Create new items
      const orderItems: Array<{
        productName: string;
        quantity: number;
        price: number;
        productId: string;
        variantId: string | null;
        variant?: string;
      }> = products.map((product: ProductInput) => ({
        productName: product.name,
        quantity: product.quantity,
        price: product.price,
        productId: "", // We'll need to find the actual product ID
        variantId: null, // We'll need to find the variant if specified
        variant: product.variant,
      }));

      // Find product IDs for the order items
      for (const item of orderItems) {
        const product = await prisma.product.findFirst({
          where: { name: item.productName },
          include: { variants: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productName}`);
        }

        item.productId = product.id;

        // Find variant if specified
        if (item.variant && product.variants.length > 0) {
          const variant = product.variants.find(
            (v) => v.value === item.variant
          );
          if (variant) {
            item.variantId = variant.id;
          }
        }
      }

      // Create new order items
      await prisma.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
        })),
      });
    }

    // Fetch updated order with relations
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // Transform the response
    const transformedOrder = {
      id: updatedOrder!.id,
      customerName: updatedOrder!.customerName,
      customerPhone: updatedOrder!.customerPhone,
      products: updatedOrder!.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant?.value,
      })),
      total: updatedOrder!.total,
      status: updatedOrder!.status.toLowerCase(),
      orderDate: updatedOrder!.orderDate.toISOString(),
      shippingAddress: updatedOrder!.shippingAddress,
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Delete the order
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

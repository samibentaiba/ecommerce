// src\app\api\admin\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

type ProductInput = {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
};

// GET all orders
export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      total: order.total,
      status: order.status.toLowerCase(),
      orderDate: order.orderDate.toISOString(),
      products: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant?.value || undefined,
      })),
    }))
  );
}

// CREATE order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const products: ProductInput[] = body.products;

  const orderItems = await Promise.all(
    products.map(async (p) => {
      const product = await prisma.product.findFirst({
        where: { name: p.name },
      });

      if (!product) throw new Error(`Product not found: ${p.name}`);

      const variant = p.variant
        ? await prisma.productVariant.findFirst({
            where: {
              value: p.variant,
              productId: product.id,
            },
          })
        : null;

      return {
        productId: product.id,
        productName: product.name,
        quantity: p.quantity,
        price: p.price,
        variantId: variant?.id,
      };
    })
  );

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingAddress: body.shippingAddress,
      total: body.total,
      status: body.status.toUpperCase() as OrderStatus,
      orderDate: new Date(body.orderDate),
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    total: order.total,
    status: order.status.toLowerCase(),
    orderDate: order.orderDate.toISOString(),
    products: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant?.value || undefined,
    })),
  });
}

// UPDATE order

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const body = await req.json();
  const products: ProductInput[] = body.products;

  const orderItems = await Promise.all(
    products.map(async (p) => {
      const product = await prisma.product.findFirst({
        where: { name: p.name },
      });

      if (!product) throw new Error(`Product not found: ${p.name}`);

      const variant = p.variant
        ? await prisma.productVariant.findFirst({
            where: {
              value: p.variant,
              productId: product.id,
            },
          })
        : null;

      return {
        productId: product.id,
        productName: product.name,
        quantity: p.quantity,
        price: p.price,
        variantId: variant?.id,
      };
    })
  );

  const updatedOrder = await prisma.order.update({
    where: { id }, // ✅ Now uses URL query param
    data: {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingAddress: body.shippingAddress,
      total: body.total,
      status: body.status.toUpperCase() as OrderStatus,
      orderDate: new Date(body.orderDate),
      items: {
        deleteMany: {}, // Remove old items
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: updatedOrder.id,
    customerName: updatedOrder.customerName,
    customerEmail: updatedOrder.customerEmail,
    shippingAddress: updatedOrder.shippingAddress,
    total: updatedOrder.total,
    status: updatedOrder.status.toLowerCase(),
    orderDate: updatedOrder.orderDate.toISOString(),
    products: updatedOrder.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant?.value || undefined,
    })),
  });
}


// DELETE order
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  await prisma.order.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}

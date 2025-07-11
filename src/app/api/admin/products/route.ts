// src\app\api\admin\products\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

// GET /api/admin/products — get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/products — create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      status,
      images,
      variants,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        category,
        stock,
        status: (status ?? "ACTIVE").toUpperCase() as ProductStatus,
        images: {
          create: images.map((img: any) => ({
            url: img.url,
            alt: img.alt || "",
            isPrimary: img.isPrimary || false,
          })),
        },
        variants: {
          create: variants.map((variant: any) => ({
            name: variant.name,
            type: variant.type,
            value: variant.value,
            description: variant.description || "",
            variantPrice: variant.variantPrice ?? null,
            stockQuantity: variant.stockQuantity,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/:id — update a product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      status,
      images,
      variants,
    } = body;

    // delete old images/variants
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        originalPrice,
        category,
        stock,
        status: (status ?? "ACTIVE").toUpperCase() as ProductStatus,
        images: {
          create: images.map((img: any) => ({
            url: img.url,
            alt: img.alt || "",
            isPrimary: img.isPrimary || false,
          })),
        },
        variants: {
          create: variants.map((variant: any) => ({
            name: variant.name,
            type: variant.type,
            value: variant.value,
            description: variant.description || "",
            variantPrice: variant.variantPrice ?? null,
            stockQuantity: variant.stockQuantity,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products?id=PRODUCT_ID — delete product
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  try {
    // delete dependent data
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product", details: String(error) },
      { status: 500 }
    );
  }
}

// src\app\api\admin\products\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

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
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        stock: parseInt(stock),
        status: status || "ACTIVE",
        images: {
          create: images || [],
        },
        variants: {
          create: variants || [],
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
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
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

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

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        stock: parseInt(stock),
        status,
        updatedAt: new Date(),
      },
      include: {
        images: true,
        variants: true,
      },
    });

    // Update images if provided
    if (images) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      await prisma.productImage.createMany({
        data: images.map((image: any) => ({
          ...image,
          productId: id,
        })),
      });
    }

    // Update variants if provided
    if (variants) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Create new variants
      await prisma.productVariant.createMany({
        data: variants.map((variant: any) => ({
          ...variant,
          productId: id,
        })),
      });
    }

    // Fetch updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related records first
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    await prisma.wishlist.deleteMany({
      where: { productId: id },
    });

    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });

    // Delete related landing pages
    await prisma.landingPage.deleteMany({
      where: { productId: id },
    });

    // Delete related product page
    await prisma.productPage.deleteMany({
      where: { productId: id },
    });

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting product:", err, err.stack);
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}

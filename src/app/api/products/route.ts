import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "ACTIVE";

    // Build where clause
    const where: any = {
      status: status as "ACTIVE" | "INACTIVE",
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        variants: {
          include: {
            images: {
              orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match frontend expectations
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      stock: product.stock,
      status: product.status,
      rating: product.rating || 0,
      reviews: 0, // You might want to add a reviews field to your schema
      inStock: product.stock > 0,
      featured: false, // You might want to add a featured field to your schema
      images: product.images.map((img) => ({
        id: img.id,
        alt: img.alt,
        isPrimary: img.isPrimary,
        url: `/api/images/${img.id}`,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        type: variant.type,
        value: variant.value,
        description: variant.description,
        variantPrice: variant.variantPrice,
        stockQuantity: variant.stockQuantity,
        images: variant.images.map((img) => ({
          id: img.id,
          alt: img.alt,
          isPrimary: img.isPrimary,
          url: `/api/images/${img.id}`,
        })),
      })),
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

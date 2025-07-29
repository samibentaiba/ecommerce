// src\app\api\admin\products\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPermissionChecker } from "@/lib/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IncomingForm } from "formidable";
import { Readable } from "stream";
import { Buffer } from "buffer";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
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

// Helper to parse multipart/form-data using formidable
async function parseFormData(req: any): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Helper to read file as buffer
async function fileToBuffer(file: any): Promise<Buffer> {
  if (file && file.filepath) {
    return fs.promises.readFile(file.filepath);
  }
  return Buffer.from("");
}

// GET: Get all products with permission check
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    // Check if user can view products
    if (!permissionChecker.canView("PRODUCT")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view products" },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: {
          include: { images: true },
        },
      },
    });

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        images: product.images.map((img) => ({
          id: img.id,
          alt: img.alt,
          isPrimary: img.isPrimary,
          mimeType: img.mimeType,
        })),
        variants: product.variants.map((variant) => ({
          ...variant,
          images: variant.images.map((img) => ({
            id: img.id,
            alt: img.alt,
            isPrimary: img.isPrimary,
            mimeType: img.mimeType,
          })),
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create a new product with permission check
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    if (!permissionChecker.canCreate("PRODUCT")) {
      return NextResponse.json(
        { error: "Insufficient permissions to create products" },
        { status: 403 }
      );
    }

    let body: any;
    let images: any = [];
    let variants: any = [];
    let isMultipart = req.headers
      .get("content-type")
      ?.includes("multipart/form-data");

    if (isMultipart) {
      // @ts-ignore
      const { fields, files } = await parseFormData(req);
      body = fields.product ? JSON.parse(fields.product) : {};
      // Product images
      if (files.images) {
        const imgArr = Array.isArray(files.images)
          ? files.images
          : [files.images];
        images = await Promise.all(
          imgArr.map(async (file: any) => ({
            alt: file.originalFilename || "",
            isPrimary: false,
            image: await fileToBuffer(file),
            mimeType: file.mimetype || "image/jpeg",
          }))
        );
      }
      // Variant images (optional, expects fields.variantImages as JSON mapping variantId to files)
      if (fields.variantImages) {
        const variantImages = JSON.parse(fields.variantImages);
        variants = (body.variants || []).map((variant: any) => {
          const filesForVariant = variantImages[variant.id] || [];
          const variantImagesData = filesForVariant.map((file: any) => ({
            url: "",
            alt: file.originalFilename || "",
            isPrimary: false,
            image: fileToBuffer(file),
            mimeType: file.mimetype || "image/jpeg",
          }));
          // Merge with existing variant images that don't have files
          const existingImages = (variant.images || []).filter(
            (img: any) => !img.file
          );
          return {
            ...variant,
            images: [...existingImages, ...variantImagesData],
          };
        });
      } else {
        variants = body.variants || [];
      }
    } else {
      try {
        body = await req.json();
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 500 }
        );
      }
      images =
        body.images && body.images.create
          ? body.images.create
          : body.images || [];
      variants =
        body.variants && body.variants.create
          ? body.variants.create
          : body.variants || [];
    }

    // Ensure only one primary image per product and per variant
    const processedImages = images.map((img: any, index: number) => ({
      ...img,
      isPrimary: index === 0 && images.some((i: any) => i.isPrimary), // Only first image can be primary if any are marked primary
    }));

    const processedVariants = (variants || []).map((variant: any) => ({
      ...variant,
      images: Array.isArray(variant.images)
        ? {
            create: variant.images.map((img: any, index: number) => ({
              ...img,
              isPrimary:
                index === 0 && variant.images.some((i: any) => i.isPrimary), // Only first image can be primary if any are marked primary
            })),
          }
        : variant.images &&
            typeof variant.images === "object" &&
            "create" in variant.images
          ? {
              create: variant.images.create.map((img: any, index: number) => ({
                ...img,
                isPrimary:
                  index === 0 &&
                  variant.images.create.some((i: any) => i.isPrimary),
              })),
            }
          : undefined,
    }));

    const product = await prisma.product.create({
      data: {
        ...body,
        images: { create: processedImages },
        variants: {
          create: processedVariants,
        },
      },
      include: {
        images: true,
        variants: {
          include: { images: true },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT: Update a product with permission check
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    if (!permissionChecker.canEdit("PRODUCT")) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit products" },
        { status: 403 }
      );
    }

    let body: any;
    let images: any = [];
    let variants: any = [];
    let isMultipart = req.headers
      .get("content-type")
      ?.includes("multipart/form-data");

    if (isMultipart) {
      // @ts-ignore
      const { fields, files } = await parseFormData(req);
      body = fields.product ? JSON.parse(fields.product) : {};
      // Product images
      if (files.images) {
        const imgArr = Array.isArray(files.images)
          ? files.images
          : [files.images];
        images = await Promise.all(
          imgArr.map(async (file: any) => ({
            url: "",
            alt: file.originalFilename || "",
            isPrimary: false,
            image: await fileToBuffer(file),
            mimeType: file.mimetype || "image/jpeg",
          }))
        );
      }
      // Variant images (optional, expects fields.variantImages as JSON mapping variantId to files)
      if (fields.variantImages) {
        const variantImages = JSON.parse(fields.variantImages);
        variants = (body.variants || []).map((variant: any) => {
          const filesForVariant = variantImages[variant.id] || [];
          const variantImagesData = filesForVariant.map((file: any) => ({
            url: "",
            alt: file.originalFilename || "",
            isPrimary: false,
            image: fileToBuffer(file),
            mimeType: file.mimetype || "image/jpeg",
          }));
          // Merge with existing variant images that don't have files
          const existingImages = (variant.images || []).filter(
            (img: any) => !img.file
          );
          return {
            ...variant,
            images: [...existingImages, ...variantImagesData],
          };
        });
      } else {
        variants = body.variants || [];
      }
    } else {
      try {
        body = await req.json();
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 500 }
        );
      }
      images =
        body.images && body.images.create
          ? body.images.create
          : body.images || [];
      variants =
        body.variants && body.variants.create
          ? body.variants.create
          : body.variants || [];
    }

    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Delete existing images and recreate from new array
    await prisma.productImage.deleteMany({ where: { productId: id } });

    // Ensure only one primary image per product and per variant
    const processedImages = (images || []).map((img: any, index: number) => ({
      ...img,
      productId: id,
      isPrimary: index === 0 && images.some((i: any) => i.isPrimary), // Only first image can be primary if any are marked primary
    }));

    const processedVariants = (variants || []).map((variant: any) => ({
      ...variant,
      images: variant.images
        ? {
            create: variant.images.map((img: any, index: number) => ({
              ...img,
              variantId: undefined,
              productId: id,
              isPrimary:
                index === 0 && variant.images.some((i: any) => i.isPrimary), // Only first image can be primary if any are marked primary
            })),
          }
        : undefined,
    }));

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        images: {
          create: processedImages,
        },
        variants: {
          create: processedVariants,
        },
      },
      include: {
        images: true,
        variants: {
          include: { images: true },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product with permission check
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createPermissionChecker(user);

    if (!permissionChecker.canDelete("PRODUCT")) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete products" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

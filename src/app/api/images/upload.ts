import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // Required for file uploads

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const alt = formData.get("alt") || "";
  const isPrimary = formData.get("isPrimary") === "true";
  const productId = formData.get("productId") as string | undefined;
  const variantId = formData.get("variantId") as string | undefined;

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create ProductImage in DB
  const image = await prisma.productImage.create({
    data: {
      url: "", // Will be set to /api/images/[id] after creation
      alt: String(alt),
      isPrimary,
      productId: productId || undefined,
      variantId: variantId || undefined,
      data: buffer,
    },
  });

  // Update the url to point to the API endpoint
  await prisma.productImage.update({
    where: { id: image.id },
    data: { url: `/api/images/${image.id}` },
  });

  return NextResponse.json({ id: image.id, url: `/api/images/${image.id}` });
}

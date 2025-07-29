import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await prisma.productImage.findUnique({ where: { id } });
  if (!image || !image.image) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Use mimeType from database if available, otherwise guess from url
  let contentType = image.mimeType || "image/jpeg";
  if (!image.mimeType && image.url) {
    if (image.url.endsWith(".png")) contentType = "image/png";
    else if (image.url.endsWith(".svg")) contentType = "image/svg+xml";
    else if (image.url.endsWith(".webp")) contentType = "image/webp";
    else if (image.url.endsWith(".gif")) contentType = "image/gif";
  }

  return new NextResponse(image.image as Buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${id}"`,
    },
  });
}

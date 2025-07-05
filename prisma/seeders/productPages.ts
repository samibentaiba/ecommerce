import { PrismaClient } from "@prisma/client";

export default async function seedProductPages(prisma: PrismaClient) {
  const product = await prisma.product.findFirst();

  if (!product) return;

  await prisma.productPage.create({
    data: {
      title: "Premium Wireless Headphones - Product Page",
      slug: "premium-wireless-headphones",
      productId: product.id,
      metaTitle: "Premium Wireless Headphones | Best Audio Experience",
      metaDescription:
        "Experience exceptional sound quality with our premium wireless headphones featuring advanced noise cancellation.",
      content:
        "Detailed product description with specifications, features, and benefits...",
      featuredImage: "/placeholder.svg?height=200&width=300",
      status: "PUBLISHED",
      seoScore: 85,
      lastModified: new Date("2024-01-15"),
    },
  });
}

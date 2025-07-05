
import { PrismaClient } from "@prisma/client";

export default async function seedLandingPages(prisma: PrismaClient) {
  const product = await prisma.product.findFirst();
  const template = await prisma.landingPageTemplate.findFirst();

  if (!product || !template) return;

  await prisma.landingPage.create({
    data: {
      title: "Premium Headphones Landing",
      slug: "premium-headphones",
      productId: product.id,
      templateId: template.id,
      headline: "Experience Sound Like Never Before",
      description:
        "Discover the ultimate audio experience with our premium wireless headphones featuring advanced noise cancellation technology.",
      heroImage: "/placeholder.svg?height=400&width=800",
      status: "PUBLISHED",
      createdAt: new Date("2024-01-15"),
    },
  });
}

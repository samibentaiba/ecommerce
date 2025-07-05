import { PrismaClient } from "@prisma/client";

export default async function seedProducts(prisma: PrismaClient) {
  await prisma.product.create({
    data: {
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 299.99,
      originalPrice: 349.99,
      category: "Electronics",
      stock: 50,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "/placeholder.svg?height=100&width=100",
            alt: "Headphones",
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Black",
            type: "COLOR",
            value: "#000000",
            description: "Classic black finish",
            stockQuantity: 25,
          },
        ],
      },
    },
  });
}

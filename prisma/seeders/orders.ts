

import { PrismaClient } from "@prisma/client";

export default async function seedOrders(prisma: PrismaClient) {
  const user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  const product = await prisma.product.findFirst();

  if (!user || !product) return;

  await prisma.order.create({
    data: {
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      shippingAddress: "123 Main St, City, State 12345",
      total: 299.99,
      status: "PENDING",
      orderDate: new Date("2024-01-15"),
      items: {
        create: [
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: 299.99,
          },
        ],
      },
    },
  });
}


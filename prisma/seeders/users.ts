
import { PrismaClient } from "@prisma/client";

export default async function seedUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        email: "admin@store.com",
        name: "Admin",
        password: "hashed-password",
        role: "ADMIN",
      },
      {
        email: "user@store.com",
        name: "User",
        password: "hashed-password",
        role: "CUSTOMER",
      },
    ],
  });
}

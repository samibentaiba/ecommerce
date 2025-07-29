// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/users.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("🌱 Seeding users...");

  // Create super user (admin)
  const superUserPassword = await bcrypt.hash("admin123", 12);

  const superUser = await prisma.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      id: "admin-1",
      name: "Super Admin",
      email: "admin@store.com",
      password: superUserPassword,
      role: "ADMIN",
      parentId: null, // Super user
      twoFactorEnabled: false,
    },
  });

  // Create sub-users with different permission sets
  const subUser1Password = await bcrypt.hash("user123", 12);
  const subUser1 = await prisma.user.upsert({
    where: { email: "manager@store.com" },
    update: {},
    create: {
      id: "user-1",
      name: "Store Manager",
      email: "manager@store.com",
      password: subUser1Password,
      role: "ADMIN",
      parentId: superUser.id,
      twoFactorEnabled: false,
    },
  });

  const subUser2Password = await bcrypt.hash("user123", 12);
  const subUser2 = await prisma.user.upsert({
    where: { email: "sales@store.com" },
    update: {},
    create: {
      id: "user-2",
      name: "Sales Assistant",
      email: "sales@store.com",
      password: subUser2Password,
      role: "ADMIN",
      parentId: superUser.id,
      twoFactorEnabled: false,
    },
  });

  const subUser3Password = await bcrypt.hash("user123", 12);
  const subUser3 = await prisma.user.upsert({
    where: { email: "content@store.com" },
    update: {},
    create: {
      id: "user-3",
      name: "Content Manager",
      email: "content@store.com",
      password: subUser3Password,
      role: "ADMIN",
      parentId: superUser.id,
      twoFactorEnabled: false,
    },
  });

  // Create permissions for sub-users
  const permissions = [
    // Store Manager - Full access to orders and products
    {
      userId: subUser1.id,
      resource: "ORDER" as const,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      userId: subUser1.id,
      resource: "PRODUCT" as const,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      userId: subUser1.id,
      resource: "SETTINGS" as const,
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },

    // Sales Assistant - Limited access to orders and products
    {
      userId: subUser2.id,
      resource: "ORDER" as const,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    {
      userId: subUser2.id,
      resource: "PRODUCT" as const,
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },

    // Content Manager - Access to landing pages and product pages
    {
      userId: subUser3.id,
      resource: "LANDING_PAGE" as const,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      userId: subUser3.id,
      resource: "PRODUCT_PAGE" as const,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        userId_resource: {
          userId: permission.userId,
          resource: permission.resource,
        },
      },
      update: permission,
      create: permission,
    });
  }

  console.log("✅ Users seeded successfully");
  console.log(`Super User: ${superUser.email} (password: admin123)`);
  console.log(`Sub Users:`);
  console.log(`  - ${subUser1.email} (password: user123) - Store Manager`);
  console.log(`  - ${subUser2.email} (password: user123) - Sales Assistant`);
  console.log(`  - ${subUser3.email} (password: user123) - Content Manager`);
}

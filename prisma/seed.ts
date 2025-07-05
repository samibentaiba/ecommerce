import { PrismaClient } from "../app/generated/prisma";
import seedUsers from "./seeders/users";
import seedProducts from "./seeders/products";
import seedProductPages from "./seeders/productPages";
import seedOrders from "./seeders/orders";
import seedLandingPageTemplates from "./seeders/landingPageTemplates";
import seedLandingPages from "./seeders/landingPages";
import seedSettings from "./seeders/settings";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await seedUsers(prisma);
  await seedProducts(prisma);
  await seedProductPages(prisma);
  await seedOrders(prisma);
  await seedLandingPageTemplates(prisma);
  await seedLandingPages(prisma);
  await seedSettings(prisma);

  console.log("✅ Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

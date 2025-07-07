// /home/sami/Documents/GitHub/ecommerce/prisma/seed.ts

import seedUsers from "&/seeders/users";
import seedProducts from "&/seeders/products";
import seedProductPages from "&/seeders/productPages";
import seedOrders from "&/seeders/orders";
import seedLandingPageTemplates from "&/seeders/landingPageTemplates";
import seedLandingPages from "&/seeders/landingPages";
import seedSettings from "&/seeders/settings";
import prisma from "&/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  await seedUsers();
  await seedProducts();
  await seedProductPages();
  await seedOrders();
  await seedLandingPageTemplates();
  await seedLandingPages();
  await seedSettings(prisma);

  console.log("✅ Done seeding.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

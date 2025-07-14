// /home/sami/Documents/GitHub/ecommerce/prisma/seed.ts

import seedUsers from "&/seeders/users";
import seedProducts from "&/seeders/products";
import seedProductPages from "&/seeders/productPages";
import seedOrders from "&/seeders/orders";
import seedLandingPageTemplates from "&/seeders/landingPageTemplates";
import seedLandingPages from "&/seeders/landingPages";
import seedSettings from "&/seeders/settings";
import seedCart from "&/seeders/cart";
import seedWishlist from "&/seeders/wishlist";
import prisma from "&/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed in dependency order
  await seedUsers();
  await seedProducts();
  await seedProductPages();
  await seedLandingPageTemplates();
  await seedLandingPages();
  await seedOrders();
  await seedCart();
  await seedWishlist();
  await seedSettings(prisma);

  console.log("✅ Done seeding.");
  
  // Log summary
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const cartItemCount = await prisma.cartItem.count();
  const wishlistCount = await prisma.wishlist.count();
  const landingPageCount = await prisma.landingPage.count();
  const productPageCount = await prisma.productPage.count();
  
  console.log("\n📊 Seeding Summary:");
  console.log(`👤 Users: ${userCount}`);
  console.log(`📦 Products: ${productCount}`);
  console.log(`📋 Orders: ${orderCount}`);
  console.log(`🛒 Cart Items: ${cartItemCount}`);
  console.log(`❤️ Wishlist Items: ${wishlistCount}`);
  console.log(`🌐 Landing Pages: ${landingPageCount}`);
  console.log(`📄 Product Pages: ${productPageCount}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

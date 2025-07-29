// /home/sami/Documents/GitHub/ecommerce/prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeders/users";
import seedProducts from "./seeders/products";
import seedOrders from "./seeders/orders";
import seedCart from "./seeders/cart";
import seedWishlist from "./seeders/wishlist";
import seedLandingPages from "./seeders/landingPages";
import seedProductPages from "./seeders/productPages";
import seedLandingPageTemplates from "./seeders/landingPageTemplates";
import seedSettings from "./seeders/settings";

const prisma = new PrismaClient();

// Function to fix multiple primary images
async function fixPrimaryImages() {
  console.log("🔧 Fixing primary images...");

  // Fix product images
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: {
        include: { images: true },
      },
    },
  });

  for (const product of products) {
    // Fix product-level images
    const productImages = product.images.filter((img) => !img.variantId);
    if (productImages.length > 0) {
      const primaryImages = productImages.filter((img) => img.isPrimary);
      if (primaryImages.length > 1) {
        // Keep only the first primary image, set others to false
        for (let i = 1; i < primaryImages.length; i++) {
          await prisma.productImage.update({
            where: { id: primaryImages[i].id },
            data: { isPrimary: false },
          });
        }
        console.log(
          `Fixed ${primaryImages.length - 1} duplicate primary images for product ${product.name}`
        );
      }
    }

    // Fix variant images
    for (const variant of product.variants) {
      const variantImages = variant.images;
      if (variantImages.length > 0) {
        const primaryImages = variantImages.filter((img) => img.isPrimary);
        if (primaryImages.length > 1) {
          // Keep only the first primary image, set others to false
          for (let i = 1; i < primaryImages.length; i++) {
            await prisma.productImage.update({
              where: { id: primaryImages[i].id },
              data: { isPrimary: false },
            });
          }
          console.log(
            `Fixed ${primaryImages.length - 1} duplicate primary images for variant ${variant.name}`
          );
        }
      }
    }
  }

  console.log("✅ Primary images fixed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed users first
    await seedUsers();

    // Seed products
    await seedProducts();

    // Seed other data
    await seedOrders();
    await seedCart();
    await seedWishlist();
    await seedLandingPages();
    await seedProductPages();
    await seedLandingPageTemplates();
    await seedSettings(prisma);

    // Fix any existing primary image issues
    await fixPrimaryImages();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

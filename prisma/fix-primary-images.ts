import { PrismaClient } from "@prisma/client";

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

  let totalFixed = 0;

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
        totalFixed += primaryImages.length - 1;
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
          totalFixed += primaryImages.length - 1;
        }
      }
    }
  }

  console.log(`✅ Primary images fixed. Total images corrected: ${totalFixed}`);
}

async function main() {
  try {
    await fixPrimaryImages();
  } catch (error) {
    console.error("❌ Error fixing primary images:", error);
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

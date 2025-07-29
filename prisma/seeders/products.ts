// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/products.ts

import prisma from "&/prisma";
import { ProductStatus, VariantType } from "@prisma/client";
import { loadCSV, safeCreate } from "../utils/handler";
import fs from "fs";
import path from "path";
import mime from "mime-types";

// New CSV structure
// id,name,description,price,originalPrice,category,stock,status,rating,image_group,image_url,image_alt,is_primary,variant_name,variant_type,variant_value,variant_description,variant_stock,variant_price

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  stock: string;
  status: string;
  rating?: string;
  image_group: "product" | "variant";
  image_url: string;
  image_alt: string;
  is_primary: string;
  variant_name?: string;
  variant_type?: string;
  variant_value?: string;
  variant_description?: string;
  variant_stock?: string;
  variant_price?: string;
};

// Function to get a random image from the images directory
function getRandomImage(): { buffer: Buffer; mimeType: string } | null {
  const imagesDir = path.join(__dirname, "../data/images");
  try {
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.warn("No image files found in images directory");
      return null;
    }

    const randomFile =
      imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(imagesDir, randomFile);
    const buffer = fs.readFileSync(imagePath);
    const mimeType = mime.lookup(imagePath) || "image/jpeg";

    return { buffer, mimeType };
  } catch (error) {
    console.error("Error reading images directory:", error);
    return null;
  }
}

export default async function seedProducts() {
  const rows = await loadCSV<ProductRow>("products.csv");

  // Group by product id
  const productGroups = new Map<string, ProductRow[]>();
  for (const row of rows) {
    if (!productGroups.has(row.id)) productGroups.set(row.id, []);
    productGroups.get(row.id)!.push(row);
  }

  for (const [productId, productRows] of productGroups) {
    const baseRow = productRows[0];
    // Product-level images - use random images
    const productImages = productRows
      .filter((r) => r.image_group === "product")
      .map((imgRow) => {
        const randomImage = getRandomImage();
        return {
          alt: imgRow.image_alt || "Product image",
          isPrimary: imgRow.is_primary === "true",
          image: randomImage?.buffer,
          mimeType: randomImage?.mimeType,
        };
      });
    // Group variant rows by variant_name
    const variantMap = new Map<string, ProductRow[]>();
    for (const row of productRows) {
      if (row.image_group === "variant" && row.variant_name) {
        if (!variantMap.has(row.variant_name))
          variantMap.set(row.variant_name, []);
        variantMap.get(row.variant_name)!.push(row);
      }
    }
    // Build variants (without images)
    const variants = Array.from(variantMap.entries()).map(
      ([variantName, rows]) => {
        const v = rows[0];
        return {
          name: variantName,
          type: (v.variant_type || "COLOR") as VariantType,
          value: v.variant_value || variantName,
          description: v.variant_description || undefined,
          stockQuantity: v.variant_stock ? parseInt(v.variant_stock, 10) : 0,
          variantPrice: v.variant_price
            ? parseFloat(v.variant_price)
            : undefined,
        };
      }
    );
    await safeCreate(
      `product "${baseRow.name}"`,
      async () => {
        // 1. Create product (with variants, but no images)
        const product = await prisma.product.create({
          data: {
            id: baseRow.id,
            name: baseRow.name,
            description: baseRow.description,
            price: parseFloat(baseRow.price),
            originalPrice: parseFloat(baseRow.originalPrice),
            category: baseRow.category,
            stock: parseInt(baseRow.stock, 10),
            status: baseRow.status.toUpperCase() as ProductStatus,
            rating: baseRow.rating ? parseFloat(baseRow.rating) : undefined,
            variants: variants.length > 0 ? { create: variants } : undefined,
          },
          include: { variants: true },
        });
        // 2. Create product images with random images
        for (const img of productImages) {
          if (!img.image) {
            console.warn(
              `Skipping product image for product ${baseRow.id} due to missing image data.`
            );
            continue;
          }
          await prisma.productImage.create({
            data: {
              alt: img.alt,
              isPrimary: img.isPrimary,
              image: img.image,
              mimeType: img.mimeType,
              productId: product.id,
            },
          });
        }
        // 3. Create variant images with random images
        for (const [variantName, rows] of variantMap.entries()) {
          const variant = product.variants.find((v) => v.name === variantName);
          if (!variant) continue;
          for (const img of rows) {
            const randomImage = getRandomImage();
            if (!randomImage) {
              console.warn(
                `Skipping variant image for product ${product.id}, variant ${variant.id} due to missing image data.`
              );
              continue;
            }
            await prisma.productImage.create({
              data: {
                alt: img.image_alt || `${variantName} variant image`,
                isPrimary: img.is_primary === "true",
                image: randomImage.buffer,
                mimeType: randomImage.mimeType,
                productId: product.id,
                variantId: variant.id,
              },
            });
          }
        }
        return product;
      },
      baseRow
    );
  }
}

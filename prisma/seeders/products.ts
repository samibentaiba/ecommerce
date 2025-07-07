// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/products.ts

import prisma from '&/prisma'
import { ProductStatus, VariantType } from '@prisma/client'
import { loadCSV, safeCreate } from '../utils/handler'

type ProductRow = {
  name: string
  description: string
  price: string
  originalPrice: string
  category: string
  stock: string
  status: string
  rating?: string
  image_url?: string
  image_alt?: string
  is_primary?: string
  variant_name?: string
  variant_type?: string
  variant_value?: string
  variant_description?: string
  variant_stock?: string
}

export default async function seedProducts() {
  const rows = await loadCSV<ProductRow>('products.csv')

  for (const row of rows) {
    await safeCreate(`product "${row.name}"`, async () => {
      return prisma.product.create({
        data: {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          originalPrice: parseFloat(row.originalPrice),
          category: row.category,
          stock: parseInt(row.stock, 10),
          status: row.status.toUpperCase() as ProductStatus,
          rating: row.rating ? parseFloat(row.rating) : undefined,

          images: row.image_url
            ? {
              create: [
                {
                  url: row.image_url,
                  alt: row.image_alt || row.name,
                  isPrimary: row.is_primary === 'true',
                },
              ],
            }
            : undefined,

          variants:
            row.variant_name && row.variant_type && row.variant_value
              ? {
                create: [
                  {
                    name: row.variant_name,
                    type: row.variant_type.toUpperCase() as VariantType,
                    value: row.variant_value,
                    description: row.variant_description,
                    stockQuantity: row.variant_stock
                      ? parseInt(row.variant_stock, 10)
                      : 0,
                  },
                ],
              }
              : undefined,
        },
      })
    }, row)
  }
}


// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/products.ts

import prisma from '&/prisma'
import { ProductStatus, VariantType } from '@prisma/client'
import { loadCSV, safeCreate } from '../utils/handler'

type ProductRow = {
  id: string
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
  variant_price?: string
}

export default async function seedProducts() {
  const rows = await loadCSV<ProductRow>('products.csv')

  // Group rows by product name to handle multiple variants
  const productGroups = new Map<string, ProductRow[]>()
  
  for (const row of rows) {
    const key = row.name
    if (!productGroups.has(key)) {
      productGroups.set(key, [])
    }
    productGroups.get(key)!.push(row)
  }

  for (const [productName, productRows] of productGroups) {
    const baseRow = productRows[0] // Use first row for base product data
    
    await safeCreate(`product "${productName}"`, async () => {
      // Collect all variants for this product
      const variants = productRows
        .filter(row => row.variant_name && row.variant_type && row.variant_value)
        .map(row => ({
          name: row.variant_name!,
          type: row.variant_type!.toUpperCase() as VariantType,
          value: row.variant_value!,
          description: row.variant_description || undefined,
          stockQuantity: row.variant_stock ? parseInt(row.variant_stock, 10) : 0,
          variantPrice: row.variant_price ? parseFloat(row.variant_price) : undefined,
        }))

      // Collect all images for this product
      const images = productRows
        .filter(row => row.image_url)
        .map(row => ({
          url: row.image_url!,
          alt: row.image_alt || row.name,
          isPrimary: row.is_primary === 'true',
        }))

      return prisma.product.create({
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

          images: images.length > 0 ? {
            create: images,
          } : undefined,

          variants: variants.length > 0 ? {
            create: variants,
          } : undefined,
        },
      })
    }, baseRow)
  }
}


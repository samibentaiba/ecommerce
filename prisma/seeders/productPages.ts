// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/productPages.ts

import prisma from '&/prisma'
import { ProductPageStatus } from '@prisma/client'
import { loadCSV, safeCreate } from '../utils/handler'

type ProductPageRow = {
  title: string
  slug: string
  productName: string
  metaTitle: string
  metaDescription: string
  content: string
  featuredImage: string
  status: string
  seoScore: string
  lastModified: string
}

export default async function seedProductPages() {
  const rows = await loadCSV<ProductPageRow>('product_pages.csv')

  for (const row of rows) {
    const product = await prisma.product.findFirst({
      where: { name: row.productName },
    })

    if (!product) {
      console.warn(`⚠️ Product not found for product page: ${row.productName}`)
      continue
    }

    await safeCreate(`productPage "${row.title}"`, async () =>
      prisma.productPage.create({
        data: {
          title: row.title,
          slug: row.slug,
          productId: product.id,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          content: row.content,
          featuredImage: row.featuredImage,
          status: row.status.toUpperCase() as ProductPageStatus,
          seoScore: parseInt(row.seoScore, 10),
          lastModified: new Date(row.lastModified),
        },
      }),
      row
    )
  }
}


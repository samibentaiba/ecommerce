// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/wishlist.ts

import prisma from '&/prisma'
import { safeCreate } from '../utils/handler'

export default async function seedWishlist() {
  // Get the singleton user
  const user = await prisma.user.findUnique({
    where: { id: 'singleton' },
  })

  if (!user) {
    console.warn('⚠️ User not found. Skipping wishlist seeding.')
    return
  }

  // Get some products
  const products = await prisma.product.findMany({
    take: 8,
  })

  if (products.length === 0) {
    console.warn('⚠️ No products found. Skipping wishlist seeding.')
    return
  }

  // Add some products to wishlist (randomly select 3-5 products)
  const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3)

  for (const product of selectedProducts) {
    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
      },
    })

    if (existingWishlistItem) {
      console.log(`✅ Wishlist item already exists for product "${product.name}". Skipping.`)
      continue
    }

    await safeCreate(`wishlist item for "${product.name}"`, async () =>
      prisma.wishlist.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
      })
    )
  }
} 
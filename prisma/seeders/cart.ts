// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/cart.ts

import prisma from '&/prisma'
import { safeCreate } from '../utils/handler'

export default async function seedCart() {
  // Get the singleton user
  const user = await prisma.user.findUnique({
    where: { id: 'singleton' },
  })

  if (!user) {
    console.warn('⚠️ User not found. Skipping cart seeding.')
    return
  }

  // Get some products with variants
  const products = await prisma.product.findMany({
    include: { variants: true },
    take: 5,
  })

  if (products.length === 0) {
    console.warn('⚠️ No products found. Skipping cart seeding.')
    return
  }

  // Create or get user's cart
  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    })
  }

  // Add some items to cart
  for (const product of products) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    })

    if (existingItem) {
      console.log(`✅ Cart item already exists for product "${product.name}". Skipping.`)
      continue
    }

    // Randomly select a variant or use base product
    const useVariant = product.variants.length > 0 && Math.random() > 0.5
    const variant = useVariant ? product.variants[Math.floor(Math.random() * product.variants.length)] : null

    await safeCreate(`cart item for "${product.name}"`, async () =>
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant?.id || null,
          quantity: Math.floor(Math.random() * 3) + 1, // 1-3 items
        },
      })
    )
  }
} 
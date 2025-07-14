
import prisma from '&/prisma'
import { loadCSV, safeCreate } from '../utils/handler'
import { OrderStatus } from '@prisma/client'

type OrderRow = {
  id: string
  customerName: string
  customerPhone: string
  products: string // Example: "Premium Wireless Headphones (Black) (x1 @ $299.99), Smart Fitness Watch (Medium) (x1 @ $199.99)"
  total: string
  status: string
  orderDate: string
  shippingAddress: string
}

export default async function seedOrders() {
  const rows = await loadCSV<OrderRow>('orders.csv')

  for (const row of rows) {
    // Parse multiple products from the products string
    const productStrings = row.products.split(', ')
    const orderItems = []

    for (const productString of productStrings) {
      // Handle different product string formats:
      // 1. "Product Name (Variant) (x2 @ $29.99)"
      // 2. "Product Name (x2 @ $29.99)"
      // 3. "Product Name (Variant1, Variant2) (x2 @ $29.99)"
      
      let match = productString.match(/^(.+?) \((.+?)\) \(x(\d+) @ \$([\d.]+)\)$/)
      
      if (!match) {
        // Try without variant: "Product Name (x2 @ $29.99)"
        match = productString.match(/^(.+?) \(x(\d+) @ \$([\d.]+)\)$/)
        if (match) {
          const [, productName, quantityStr, priceStr] = match
          const quantity = parseInt(quantityStr, 10)
          const price = parseFloat(priceStr)

          // Find the product
          const product = await prisma.product.findFirst({
            where: { name: productName },
          })

          if (!product) {
            console.warn(`⚠️ Product not found: ${productName}`)
            continue
          }

          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity,
            price,
            variantId: null,
          })
          continue
        }
        
        console.warn(`⚠️ Failed to parse product: ${productString}`)
        continue
      }

      const [, productName, variantValue, quantityStr, priceStr] = match
      const quantity = parseInt(quantityStr, 10)
      const price = parseFloat(priceStr)

      // Find the product
      const product = await prisma.product.findFirst({
        where: { name: productName },
        include: { variants: true },
      })

      if (!product) {
        console.warn(`⚠️ Product not found: ${productName}`)
        continue
      }

      // Find the variant if specified
      let variantId = null
      if (variantValue && product.variants.length > 0) {
        // Handle multiple variants separated by comma: "Navy, M"
        const variantValues = variantValue.split(', ').map(v => v.trim())
        
        // Try to find a variant that matches any of the values
        const variant = product.variants.find(v => 
          variantValues.some(val => v.value.toLowerCase() === val.toLowerCase())
        )
        
        if (variant) {
          variantId = variant.id
        }
      }

      orderItems.push({
        productId: product.id,
        productName: `${product.name}${variantValue ? ` (${variantValue})` : ''}`,
        quantity,
        price,
        variantId,
      })
    }

    if (orderItems.length === 0) {
      console.warn(`⚠️ No valid products found for order ${row.id}`)
      continue
    }

    await safeCreate(`order ${row.id}`, async () =>
      prisma.order.create({
        data: {
          id: row.id,
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          shippingAddress: row.shippingAddress,
          total: parseFloat(row.total),
          status: row.status.toUpperCase() as OrderStatus,
          orderDate: new Date(row.orderDate),
          items: {
            create: orderItems,
          },
        },
      })
    )
  }
}



import prisma from '&/prisma'
import { loadCSV, safeCreate } from '../utils/handler'
import { OrderStatus } from '@prisma/client'

type OrderRow = {
  id: string
  customerName: string
  customerEmail: string
  products: string // Example: "Premium Wireless Headphones (x1 @ $299.99)"
  total: string
  status: string
  orderDate: string
  shippingAddress: string
}

export default async function seedOrders() {
  const rows = await loadCSV<OrderRow>('orders.csv')

  for (const row of rows) {
    // Extract product info
    const match = row.products.match(/^(.+?) \(x(\d+) @ \$([\d.]+)\)$/)
    if (!match) {
      console.warn(`⚠️ Failed to parse products: ${row.products}`)
      continue
    }

    const [, productName, quantityStr, priceStr] = match
    const quantity = parseInt(quantityStr, 10)
    const price = parseFloat(priceStr)

    const product = await prisma.product.findFirst({
      where: { name: productName },
    })

    if (!product) {
      console.warn(`⚠️ Product not found: ${productName}`)
      continue
    }

    await safeCreate(`order ${row.id}`, async () =>
      prisma.order.create({
        data: {
          customerName: row.customerName,
          customerEmail: row.customerEmail,
          shippingAddress: row.shippingAddress,
          total: parseFloat(row.total),
          status: row.status.toUpperCase() as OrderStatus,
          orderDate: new Date(row.orderDate),
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                quantity,
                price,
              },
            ],
          },
        },
      })
    )
  }
}


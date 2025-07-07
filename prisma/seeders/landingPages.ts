// /home/sami/Documents/GitHub/ecommerce/prisma/seeders/landingPages.ts

import prisma from '&/prisma'
import { LandingPageStatus } from '@prisma/client'
import { safeCreate } from '../utils/handler'

export default async function seedLandingPages() {
  const products = await prisma.product.findMany()
  const templates = await prisma.landingPageTemplate.findMany()

  if (!products.length) {
    console.warn('⚠️ No products found. Skipping landing page seeding.')
    return
  }

  for (const product of products) {
    const existing = await prisma.landingPage.findFirst({
      where: { productId: product.id },
    })

    if (existing) {
      console.log(`✅ Landing page already exists for product "${product.name}". Skipping.`)
      continue
    }

    const useTemplate = templates.length > 0 && Math.random() > 0.5
    const template = useTemplate
      ? templates[Math.floor(Math.random() * templates.length)]
      : null

    const templateId = template ? template.id : null

    await safeCreate(`landing page for "${product.name}"`, async () =>
      prisma.landingPage.create({
        data: {
          title: `${product.name} Landing`,
          slug: product.name.toLowerCase().replace(/\s+/g, '-'),
          productId: product.id,
          templateId,
          headline: `Discover ${product.name}`,
          description: product.description || '',
          heroImage: '/placeholder.svg?height=400&width=800',
          status: LandingPageStatus.PUBLISHED,
          createdAt: new Date(),
        },
      }),
      { productId: product.id, templateId: templateId ?? 'none' }
    )
  }
}


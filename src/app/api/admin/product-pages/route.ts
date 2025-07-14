import { NextRequest, NextResponse } from "next/server"
import { ProductPageStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const productPages = await prisma.productPage.findMany({
      include: {
        product: true,
      },
      orderBy: {
        lastModified: 'desc',
      },
    })

    return NextResponse.json(productPages)
  } catch (error) {
    console.error('Error fetching product pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product pages' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, productId, metaTitle, metaDescription, content, featuredImage, status } = body

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product page already exists for this product
    const existingPage = await prisma.productPage.findUnique({
      where: { productId },
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'Product page already exists for this product' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Calculate SEO score (simple implementation)
    const seoScore = Math.floor(Math.random() * 30) + 70

    const productPage = await prisma.productPage.create({
      data: {
        title,
        productId,
        slug,
        metaTitle,
        metaDescription,
        content,
        featuredImage,
        status: (status || 'DRAFT').toUpperCase() as ProductPageStatus,
        seoScore,
        lastModified: new Date(),
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(productPage)
  } catch (error) {
    console.error('Error creating product page:', error)
    return NextResponse.json(
      { error: 'Failed to create product page' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product page ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { title, productId, metaTitle, metaDescription, content, featuredImage, status } = body

    // Check if product exists
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Calculate SEO score (simple implementation)
    const seoScore = Math.floor(Math.random() * 30) + 70

    const productPage = await prisma.productPage.update({
      where: { id },
      data: {
        title,
        productId,
        slug,
        metaTitle,
        metaDescription,
        content,
        featuredImage,
        status: (status || 'DRAFT').toUpperCase() as ProductPageStatus,
        seoScore,
        lastModified: new Date(),
        updatedAt: new Date(),
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(productPage)
  } catch (error) {
    console.error('Error updating product page:', error)
    return NextResponse.json(
      { error: 'Failed to update product page' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product page ID is required' },
        { status: 400 }
      )
    }

    await prisma.productPage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product page:', error)
    return NextResponse.json(
      { error: 'Failed to delete product page' },
      { status: 500 }
    )
  }
}

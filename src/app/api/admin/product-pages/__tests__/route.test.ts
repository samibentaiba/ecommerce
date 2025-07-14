import { NextRequest } from 'next/server'
import { PrismaClient, ProductPageStatus, ProductStatus } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/prisma'
const mockPrisma = prisma as DeepMockProxy<PrismaClient>

import { GET, POST, PUT, DELETE } from '../route'

// Mock data
const mockProductPage = {
  id: 'page-1',
  title: 'Product Page 1',
  productId: 'product-1',
  slug: 'product-page-1',
  metaTitle: 'Meta Title',
  metaDescription: 'Meta Description',
  content: 'Page content...',
  featuredImage: '/placeholder.svg',
  status: 'PUBLISHED' as ProductPageStatus,
  seoScore: 85,
  lastModified: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  product: {
    id: 'product-1',
    name: 'Product 1',
  },
}

const mockProduct = {
  id: 'product-1',
  name: 'Product 1',
  description: 'Product description',
  price: 29.99,
  originalPrice: 39.99,
  category: 'Electronics',
  stock: 100,
  status: 'ACTIVE' as ProductStatus,
  rating: 4.5,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('Product Pages API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/product-pages', () => {
    it('should return all product pages with product details', async () => {
      mockPrisma.productPage.findMany.mockResolvedValue([mockProductPage])

      const response = await GET()
      const data = await response.json()

      expect(mockPrisma.productPage.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
        },
        orderBy: {
          lastModified: 'desc',
        },
      })

      expect(data).toEqual([mockProductPage])
    })

    it('should handle database errors', async () => {
      mockPrisma.productPage.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch product pages')
    })

    it('should handle empty product pages list', async () => {
      mockPrisma.productPage.findMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(data).toEqual([])
    })
  })

  describe('POST /api/admin/product-pages', () => {
    const createProductPageData = {
      title: 'New Product Page',
      productId: 'product-1',
      metaTitle: 'New Meta Title',
      metaDescription: 'New Meta Description',
      content: 'New page content...',
      featuredImage: '/new-image.svg',
      status: 'DRAFT',
    }

    it('should create a new product page', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(null)
      mockPrisma.productPage.create.mockResolvedValue({
        ...mockProductPage,
        ...createProductPageData,
        id: 'page-2',
        slug: 'new-product-page',
        status: 'DRAFT' as ProductPageStatus,
        seoScore: 75,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify(createProductPageData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      })

      expect(mockPrisma.productPage.findUnique).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
      })

      expect(mockPrisma.productPage.create).toHaveBeenCalledWith({
        data: {
          title: 'New Product Page',
          productId: 'product-1',
          slug: 'new-product-page',
          metaTitle: 'New Meta Title',
          metaDescription: 'New Meta Description',
          content: 'New page content...',
          featuredImage: '/new-image.svg',
          status: 'DRAFT',
          seoScore: expect.any(Number),
          lastModified: expect.any(Date),
        },
        include: {
          product: true,
        },
      })

      expect(data).toMatchObject(createProductPageData)
    })

    it('should return error if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify(createProductPageData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })

    it('should return error if product page already exists for product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(mockProductPage)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify(createProductPageData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product page already exists for this product')
    })

    it('should generate slug from title', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(null)
      mockPrisma.productPage.create.mockResolvedValue({
        ...mockProductPage,
        ...createProductPageData,
        slug: 'new-product-page',
        status: 'DRAFT' as ProductPageStatus,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify(createProductPageData),
      })

      await POST(request)

      expect(mockPrisma.productPage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'new-product-page',
          }),
        })
      )
    })

    it('should handle complex title for slug generation', async () => {
      const complexTitle = 'Product Page with Special Characters & Numbers 123!'
      const expectedSlug = 'product-page-with-special-characters-numbers-123'

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(null)
      mockPrisma.productPage.create.mockResolvedValue({
        ...mockProductPage,
        title: complexTitle,
        slug: expectedSlug,
        status: 'DRAFT' as ProductPageStatus,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify({
          ...createProductPageData,
          title: complexTitle,
        }),
      })

      await POST(request)

      expect(mockPrisma.productPage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expectedSlug,
          }),
        })
      )
    })
  })

  describe('PUT /api/admin/product-pages', () => {
    const updateProductPageData = {
      title: 'Updated Product Page',
      productId: 'product-2',
      metaTitle: 'Updated Meta Title',
      metaDescription: 'Updated Meta Description',
      content: 'Updated page content...',
      featuredImage: '/updated-image.svg',
      status: 'PUBLISHED',
    }

    it('should update an existing product page', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.update.mockResolvedValue({
        ...mockProductPage,
        ...updateProductPageData,
        slug: 'updated-product-page',
        status: 'PUBLISHED' as ProductPageStatus,
        seoScore: 90,
      })
      mockPrisma.productPage.findUnique.mockResolvedValue({
        ...mockProductPage,
        ...updateProductPageData,
        status: 'PUBLISHED' as ProductPageStatus,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages?id=page-1', {
        method: 'PUT',
        body: JSON.stringify(updateProductPageData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(mockPrisma.productPage.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: {
          title: 'Updated Product Page',
          productId: 'product-2',
          slug: 'updated-product-page',
          metaTitle: 'Updated Meta Title',
          metaDescription: 'Updated Meta Description',
          content: 'Updated page content...',
          featuredImage: '/updated-image.svg',
          status: 'PUBLISHED',
          seoScore: expect.any(Number),
          lastModified: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          product: true,
        },
      })

      expect(data).toMatchObject(updateProductPageData)
    })

    it('should return 400 error when product page ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'PUT',
        body: JSON.stringify(updateProductPageData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product page ID is required')
    })

    it('should return error if product not found during update', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages?id=page-1', {
        method: 'PUT',
        body: JSON.stringify(updateProductPageData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })

    it('should handle update without productId change', async () => {
      const updateWithoutProductId = {
        title: 'Updated Title',
        metaTitle: 'Updated Meta Title',
        content: 'Updated content',
        status: 'PUBLISHED',
      }

      mockPrisma.productPage.update.mockResolvedValue({
        ...mockProductPage,
        ...updateWithoutProductId,
        status: 'PUBLISHED' as ProductPageStatus,
      })
      mockPrisma.productPage.findUnique.mockResolvedValue({
        ...mockProductPage,
        ...updateWithoutProductId,
        status: 'PUBLISHED' as ProductPageStatus,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages?id=page-1', {
        method: 'PUT',
        body: JSON.stringify(updateWithoutProductId),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled()
      expect(data).toMatchObject(updateWithoutProductId)
    })
  })

  describe('DELETE /api/admin/product-pages', () => {
    it('should delete a product page', async () => {
      mockPrisma.productPage.delete.mockResolvedValue(mockProductPage)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages?id=page-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(mockPrisma.productPage.delete).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      })

      expect(data).toEqual({ success: true })
    })

    it('should return 400 error when product page ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product page ID is required')
    })

    it('should handle database errors during deletion', async () => {
      mockPrisma.productPage.delete.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages?id=page-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete product page')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })

    it('should handle product page with empty values', async () => {
      const productPageWithEmpties = {
        ...mockProductPage,
        title: 'Page with Empties',
        metaDescription: '',
        featuredImage: '',
      }

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(null)
      mockPrisma.productPage.create.mockResolvedValue(productPageWithEmpties)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Page with Empties',
          productId: 'product-1',
          metaTitle: 'Title',
          metaDescription: '',
          content: 'Content',
          featuredImage: '',
          status: 'DRAFT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toMatchObject({
        title: 'Page with Empties',
        metaDescription: '',
        featuredImage: '',
      })
    })

    it('should handle SEO score generation', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productPage.findUnique.mockResolvedValue(null)
      mockPrisma.productPage.create.mockResolvedValue(mockProductPage)

      const request = new NextRequest('http://localhost:3000/api/admin/product-pages', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Page',
          productId: 'product-1',
          metaTitle: 'Test Meta Title',
          metaDescription: 'Test Meta Description',
          content: 'Test content',
          status: 'DRAFT',
        }),
      })

      await POST(request)

      expect(mockPrisma.productPage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            seoScore: expect.any(Number),
          }),
        })
      )
    })
  })
}) 
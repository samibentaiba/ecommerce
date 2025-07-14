import { renderHook, act, waitFor } from '@testing-library/react'
import { useProductPage } from '../hook'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockProductPages = [
    {
      id: "1",
      title: "Premium Headphones Product Page",
      productId: "product-1",
      slug: "premium-headphones",
      metaTitle: "Premium Wireless Headphones - Best Audio Quality",
      metaDescription: "Discover our premium wireless headphones with advanced noise cancellation technology.",
      content: "Detailed product information and features...",
      featuredImage: "/headphones.jpg",
      status: "PUBLISHED" as const,
      seoScore: 85,
      lastModified: "2024-01-15T10:00:00Z",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      productName: "Premium Wireless Headphones"
    },
    {
      id: "2",
      title: "Smart Watch Product Page",
      productId: "product-2",
      slug: "smart-watch",
      metaTitle: "Smart Fitness Watch - Health Monitoring",
      metaDescription: "Track your fitness goals with our advanced smart watch.",
      content: "Fitness tracking features and specifications...",
      featuredImage: "/watch.jpg",
      status: "DRAFT" as const,
      seoScore: 72,
      lastModified: "2024-01-14T15:30:00Z",
      createdAt: "2024-01-14T15:30:00Z",
      updatedAt: "2024-01-14T15:30:00Z",
      productName: "Smart Fitness Watch"
    }
  ]

  const mockProducts = [
    {
      id: "product-1",
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones",
      price: 299.99,
      originalPrice: 349.99,
      category: "Electronics",
      stock: 50,
      status: "ACTIVE" as const,
      image: "/headphones.jpg",
      images: [],
      variants: [],
      rating: 4.5,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "product-2",
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracking",
      price: 199.99,
      originalPrice: null,
      category: "Wearables",
      stock: 30,
      status: "ACTIVE" as const,
      image: "/watch.jpg",
      images: [],
      variants: [],
      rating: 4.2,
      createdAt: "2024-01-14T15:30:00Z",
      updatedAt: "2024-01-14T15:30:00Z"
    }
  ]

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProductPages),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })

      const { result } = renderHook(() => useProductPage())

      expect(result.current.loading).toBe(true)
      expect(result.current.productPages).toEqual([])
      expect(result.current.products).toEqual([])
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.editingPage).toBe(null)
      expect(result.current.searchTerm).toBe("")
      expect(result.current.statusFilter).toBe("all")
      expect(result.current.formData).toEqual({
        title: "",
        productId: "",
        metaTitle: "",
        metaDescription: "",
        content: "",
        status: "DRAFT",
      })
    })
  })

  describe('Data Fetching', () => {
    it('fetches product pages and products on mount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/product-pages")
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/products")
      
      // Wait for product names to be resolved
      await waitFor(() => {
        expect(result.current.productPages).toEqual(mockProductPages)
        expect(result.current.products).toEqual(mockProducts)
      })
    })

    it('handles fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"))

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productPages).toEqual([])
    })

    it('handles non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productPages).toEqual([])
    })
  })

  describe('Product Page Creation', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('opens create dialog', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setIsDialogOpen(true)
      })

      expect(result.current.isDialogOpen).toBe(true)
      expect(result.current.editingPage).toBe(null)
    })

    it('updates form data', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setFormData({
          title: "New Product Page",
          productId: "product-1",
          metaTitle: "New Meta Title",
          metaDescription: "New meta description",
          content: "New content",
          status: "DRAFT",
        })
      })

      expect(result.current.formData.title).toBe("New Product Page")
    })

    it('creates new product page successfully', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up form data
      act(() => {
        result.current.setFormData({
          title: "New Product Page",
          productId: "product-1",
          metaTitle: "New Meta Title",
          metaDescription: "New meta description",
          content: "New content",
          status: "DRAFT",
        })
      })

      // Mock successful creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 3,
          title: "New Product Page",
          productId: "product-1",
          slug: "new-product-page",
          metaTitle: "New Meta Title",
          metaDescription: "New meta description",
          content: "New content",
          featuredImage: "/placeholder.svg?height=200&width=300",
          status: "DRAFT",
          seoScore: 75,
          lastModified: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          productName: "Premium Wireless Headphones"
        }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/product-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Product Page",
            productId: "product-1",
            metaTitle: "New Meta Title",
            metaDescription: "New meta description",
            content: "New content",
            status: "DRAFT",
            featuredImage: "/placeholder.svg?height=200&width=300",
          }),
        })
      })
    })

    it('handles creation errors', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up form data
      act(() => {
        result.current.setFormData({
          title: "Test Page",
          productId: "product-1",
          metaTitle: "Test Title",
          metaDescription: "Test description",
          content: "Test content",
          status: "DRAFT",
        })
      })

      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Product not found" }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(result.current.productPages).toEqual(mockProductPages) // Should not change on error
      })
    })
  })

  describe('Product Page Editing', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('opens edit dialog with page data', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEdit(mockProductPages[0])
      })

      expect(result.current.editingPage).toEqual(mockProductPages[0])
      expect(result.current.formData.title).toBe("Premium Headphones Product Page")
      expect(result.current.formData.productId).toBe("product-1")
      expect(result.current.formData.metaTitle).toBe("Premium Wireless Headphones - Best Audio Quality")
      expect(result.current.formData.metaDescription).toBe("Discover our premium wireless headphones with advanced noise cancellation technology.")
      expect(result.current.formData.content).toBe("Detailed product information and features...")
      expect(result.current.formData.status).toBe("PUBLISHED")
      expect(result.current.isDialogOpen).toBe(true)
    })

    it('updates existing product page successfully', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up editing state
      act(() => {
        result.current.handleEdit(mockProductPages[0])
      })

      // Update the title after handleEdit sets the form data
      act(() => {
        result.current.setFormData({ ...result.current.formData, title: "Updated Title" })
      })

      // Mock successful update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockProductPages[0],
          title: "Updated Title"
        }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/product-pages?id=1", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Updated Title",
            productId: "product-1",
            metaTitle: "Premium Wireless Headphones - Best Audio Quality",
            metaDescription: "Discover our premium wireless headphones with advanced noise cancellation technology.",
            content: "Detailed product information and features...",
            status: "PUBLISHED",
            featuredImage: "/placeholder.svg?height=200&width=300",
          }),
        })
      })
    })
  })

  describe('Product Page Deletion', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('deletes product page successfully', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await act(async () => {
        await result.current.handleDelete(1)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/product-pages?id=1", {
          method: "DELETE",
        })
        expect(result.current.productPages).toHaveLength(1)
        expect(result.current.productPages[0].id).toBe("2")
      })
    })

    it('handles deletion errors', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      mockFetch.mockRejectedValueOnce(new Error("Failed to delete"))

      await act(async () => {
        try {
          await result.current.handleDelete(1)
        } catch (error) {
          // Expected error
        }
      })

      await waitFor(() => {
        expect(result.current.productPages).toEqual(mockProductPages) // Should not change on error
      })
    })
  })

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('filters by search term', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Headphones")
      })

      expect(result.current.searchTerm).toBe("Headphones")
      expect(result.current.productPages).toHaveLength(1)
      expect(result.current.productPages[0].title).toBe("Premium Headphones Product Page")
    })

    it('filters by product name', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Smart Watch")
      })

      expect(result.current.productPages).toHaveLength(1)
      expect(result.current.productPages[0].title).toBe("Smart Watch Product Page")
    })

    it('filters by status', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setStatusFilter("PUBLISHED")
      })

      expect(result.current.statusFilter).toBe("PUBLISHED")
      expect(result.current.productPages).toHaveLength(1)
      expect(result.current.productPages[0].status).toBe("PUBLISHED")
    })

    it('combines search and status filters', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Headphones")
        result.current.setStatusFilter("PUBLISHED")
      })

      expect(result.current.productPages).toHaveLength(1)
      expect(result.current.productPages[0].title).toBe("Premium Headphones Product Page")
      expect(result.current.productPages[0].status).toBe("PUBLISHED")
    })
  })

  describe('Delete Confirmation', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('opens delete confirmation dialog', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleDeleteClick(mockProductPages[0])
      })

      expect(result.current.showDeleteDialog).toBe(true)
      expect(result.current.pageToDelete).toEqual(mockProductPages[0])
    })

    it('confirms deletion', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockProductPages[0])
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      await waitFor(() => {
        expect(result.current.showDeleteDialog).toBe(false)
        expect(result.current.pageToDelete).toBe(null)
      })
    })

    it('cancels deletion', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockProductPages[0])
      })

      act(() => {
        result.current.handleCancelDelete()
      })

      expect(result.current.showDeleteDialog).toBe(false)
      expect(result.current.pageToDelete).toBe(null)
    })
  })

  describe('Form Reset', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProductPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('resets form to initial state', async () => {
      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set some state
      act(() => {
        result.current.setFormData({
          title: "Test Page",
          productId: "product-1",
          metaTitle: "Test Title",
          metaDescription: "Test description",
          content: "Test content",
          status: "DRAFT",
        })
        result.current.setSearchTerm("test")
        result.current.setStatusFilter("PUBLISHED")
      })

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.formData.title).toBe("")
      expect(result.current.searchTerm).toBe("")
      expect(result.current.statusFilter).toBe("all")
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.editingPage).toBe(null)
    })
  })

  describe('SEO Score Color Helper', () => {
    it('returns correct colors for different SEO scores', () => {
      const { result } = renderHook(() => useProductPage())

      expect(result.current.getSeoScoreColor(90)).toBe("text-green-600")
      expect(result.current.getSeoScoreColor(85)).toBe("text-green-600")
      expect(result.current.getSeoScoreColor(75)).toBe("text-yellow-600")
      expect(result.current.getSeoScoreColor(65)).toBe("text-yellow-600")
      expect(result.current.getSeoScoreColor(55)).toBe("text-red-600")
      expect(result.current.getSeoScoreColor(45)).toBe("text-red-600")
    })
  })

  describe('Data Transformation', () => {
    it('handles string and number IDs correctly', async () => {
      const mixedData = [
        { id: "1", productId: "product-1", title: "String ID Page" },
        { id: 2, productId: 2, title: "Number ID Page" }
      ]

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mixedData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productPages[0].id).toBe("1") // String remains string
      expect(result.current.productPages[1].id).toBe("2") // Number converted to string
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productPages).toEqual([])
    })

    it('handles invalid JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      })

      const { result } = renderHook(() => useProductPage())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productPages).toEqual([])
    })
  })
}) 
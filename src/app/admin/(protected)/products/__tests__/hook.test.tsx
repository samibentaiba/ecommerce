import { renderHook, act, waitFor } from '@testing-library/react'
import { useProducts } from '../hook'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockProducts = [
    {
      id: "product-1",
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 299.99,
      originalPrice: 349.99,
      category: "Electronics",
      stock: 50,
      status: "ACTIVE" as const,
      images: [
        { id: "img-1", url: "/headphones-1.jpg", alt: "Headphones front view", isPrimary: true },
        { id: "img-2", url: "/headphones-2.jpg", alt: "Headphones side view", isPrimary: false }
      ],
      variants: [
        { id: "var-1", name: "Black", type: "COLOR" as const, value: "#000000", description: "Classic black", variantPrice: 299.99, stockQuantity: 25, images: [] },
        { id: "var-2", name: "White", type: "COLOR" as const, value: "#FFFFFF", description: "Clean white", variantPrice: 299.99, stockQuantity: 25, images: [] }
      ],
      rating: 4.5,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "product-2",
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracking with heart rate monitoring",
      price: 199.99,
      originalPrice: undefined,
      category: "Wearables",
      stock: 30,
      status: "INACTIVE" as const,
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
        json: () => Promise.resolve(mockProducts),
      })

      const { result } = renderHook(() => useProducts())

      expect(result.current.loading).toBe(true)
      expect(result.current.products).toEqual([])
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.editingProduct).toBe(null)
      expect(result.current.searchTerm).toBe("")
      expect(result.current.statusFilter).toBe("all")
      expect(result.current.formData).toEqual({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        status: "ACTIVE",
        images: [],
        variants: [],
      })
    })
  })

  describe('Data Fetching', () => {
    it('fetches products on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/products")
      expect(result.current.products).toEqual(mockProducts)
    })

    it('handles fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"))

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.products).toEqual([])
    })

    it('handles non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.products).toEqual([])
    })
  })

  describe('Product Creation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('opens create dialog', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.editingProduct).toBe(null)
    })

    it('adds image to form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addImage()
      })

      expect(result.current.formData.images).toHaveLength(1)
      expect(result.current.formData.images[0]).toEqual({
        id: expect.any(String),
        url: "",
        alt: "",
        isPrimary: true,
      })
    })

    it('updates image in form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add an image first
      act(() => {
        result.current.addImage()
      })

      const imageId = result.current.formData.images[0].id

      act(() => {
        result.current.updateImage(imageId, { url: "/test-image.jpg", alt: "Test image" })
      })

      expect(result.current.formData.images[0].url).toBe("/test-image.jpg")
      expect(result.current.formData.images[0].alt).toBe("Test image")
    })

    it('removes image from form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add images first
      act(() => {
        result.current.addImage()
      })

      await waitFor(() => {
        expect(result.current.formData.images).toHaveLength(1)
      })

      act(() => {
        result.current.addImage()
      })

      await waitFor(() => {
        expect(result.current.formData.images).toHaveLength(2)
      })

      const imageId = result.current.formData.images[0].id

      act(() => {
        result.current.removeImage(imageId)
      })

      await waitFor(() => {
        expect(result.current.formData.images).toHaveLength(1)
        expect(result.current.formData.images[0].id).not.toBe(imageId)
      })
    })

    it('adds variant to form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addVariant()
      })

      expect(result.current.formData.variants).toHaveLength(1)
      expect(result.current.formData.variants[0]).toEqual({
        id: expect.any(String),
        name: "",
        type: "COLOR",
        value: "",
        description: "",
        variantPrice: undefined,
        stockQuantity: 0,
        images: [],
      })
    })

    it('updates variant in form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add a variant first
      act(() => {
        result.current.addVariant()
      })

      const variantId = result.current.formData.variants[0].id

      act(() => {
        result.current.updateVariant(variantId, { name: "Red", value: "#FF0000", type: "COLOR" })
      })

      expect(result.current.formData.variants[0].name).toBe("Red")
      expect(result.current.formData.variants[0].value).toBe("#FF0000")
      expect(result.current.formData.variants[0].type).toBe("COLOR")
    })

    it('removes variant from form', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add variants first
      act(() => {
        result.current.addVariant()
      })

      await waitFor(() => {
        expect(result.current.formData.variants).toHaveLength(1)
      })

      act(() => {
        result.current.addVariant()
      })

      await waitFor(() => {
        expect(result.current.formData.variants).toHaveLength(2)
      })

      const variantId = result.current.formData.variants[0].id

      act(() => {
        result.current.removeVariant(variantId)
      })

      await waitFor(() => {
        expect(result.current.formData.variants).toHaveLength(1)
        expect(result.current.formData.variants[0].id).not.toBe(variantId)
      })
    })
  })

  describe('Product Editing', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('opens edit dialog with product data', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEdit(mockProducts[0])
      })

      expect(result.current.editingProduct).toEqual(mockProducts[0])
      expect(result.current.formData.name).toBe("Premium Wireless Headphones")
      expect(result.current.formData.description).toBe("High-quality wireless headphones with noise cancellation")
      expect(result.current.formData.price).toBe("299.99")
      expect(result.current.formData.category).toBe("Electronics")
      expect(result.current.formData.stock).toBe("50")
      expect(result.current.formData.status).toBe("ACTIVE")
      expect(result.current.formData.images).toEqual(mockProducts[0].images)
      expect(result.current.formData.variants).toEqual(mockProducts[0].variants)
      expect(result.current.isDialogOpen).toBe(true)
    })
  })

  describe('Product Saving', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('creates new product successfully', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up form data
      act(() => {
        result.current.setFormData({
          name: "New Product",
          description: "A new product",
          price: "99.99",
          originalPrice: "129.99",
          category: "Electronics",
          stock: "25",
          status: "ACTIVE",
          images: [],
          variants: [],
        })
      })

      // Mock successful creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: "product-3",
          name: "New Product",
          description: "A new product",
          price: 99.99,
          originalPrice: 129.99,
          category: "Electronics",
          stock: 25,
          status: "ACTIVE",

          images: [],
          variants: [],
          rating: 0,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "New Product",
            description: "A new product",
            price: 99.99,
            originalPrice: 129.99,
            category: "Electronics",
            stock: 25,
            status: "ACTIVE",
            images: [],
            variants: [],
          }),
        })
      })
    })

    it('updates existing product successfully', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up editing state
      act(() => {
        result.current.handleEdit(mockProducts[0])
      })

      // Update the name after handleEdit sets the form data
      act(() => {
        result.current.setFormData({ ...result.current.formData, name: "Updated Product" })
      })

      // Mock successful update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockProducts[0],
          name: "Updated Product"
        }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/products?id=product-1", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Updated Product",
            description: "High-quality wireless headphones with noise cancellation",
            price: 299.99,
            originalPrice: 349.99,
            category: "Electronics",
            stock: 50,
            status: "ACTIVE",
            images: mockProducts[0].images,
            variants: mockProducts[0].variants,
          }),
        })
      })
    })

    it('handles save errors', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up form data
      act(() => {
        result.current.setFormData({
          name: "Test Product",
          description: "Test description",
          price: "50.00",
          originalPrice: "",
          category: "Test",
          stock: "10",
          status: "ACTIVE",
          images: [],
          variants: [],
        })
      })

      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid product data" }),
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(result.current.products).toEqual(mockProducts) // Should not change on error
      })
    })
  })

  describe('Product Deletion', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('deletes product successfully', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock successful deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await act(async () => {
        await result.current.handleDelete("product-1")
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/admin/products?id=product-1", {
          method: "DELETE",
        })
        expect(result.current.products).toHaveLength(1)
        expect(result.current.products[0].id).toBe("product-2")
      })
    })

    it('handles deletion errors', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock deletion error
      mockFetch.mockRejectedValueOnce(new Error("Failed to delete"))

      await act(async () => {
        try {
          await result.current.handleDelete("product-1")
        } catch (error) {
          // Expected error
        }
      })

      await waitFor(() => {
        expect(result.current.products).toEqual(mockProducts) // Should not change on error
      })
    })
  })

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('filters by search term', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Headphones")
      })

      expect(result.current.searchTerm).toBe("Headphones")
      expect(result.current.filteredProducts).toHaveLength(1)
      expect(result.current.filteredProducts[0].name).toBe("Premium Wireless Headphones")
    })

    it('filters by status', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setStatusFilter("ACTIVE")
      })

      expect(result.current.statusFilter).toBe("ACTIVE")
      expect(result.current.filteredProducts).toHaveLength(1)
      expect(result.current.filteredProducts[0].status).toBe("ACTIVE")
    })

    it('combines search and status filters', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Watch")
        result.current.setStatusFilter("INACTIVE")
      })

      expect(result.current.filteredProducts).toHaveLength(1)
      expect(result.current.filteredProducts[0].name).toBe("Smart Fitness Watch")
      expect(result.current.filteredProducts[0].status).toBe("INACTIVE")
    })
  })

  describe('Delete Confirmation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('opens delete confirmation dialog', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleDeleteClick(mockProducts[0])
      })

      expect(result.current.showDeleteDialog).toBe(true)
      expect(result.current.productToDelete).toEqual(mockProducts[0])
    })

    it('confirms deletion', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockProducts[0])
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
        expect(result.current.productToDelete).toBe(null)
      })
    })

    it('cancels deletion', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockProducts[0])
      })

      act(() => {
        result.current.handleCancelDelete()
      })

      expect(result.current.showDeleteDialog).toBe(false)
      expect(result.current.productToDelete).toBe(null)
    })
  })

  describe('Form Reset', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('resets form to initial state', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set some state
      act(() => {
        result.current.setFormData({
          name: "Test Product",
          description: "Test description",
          price: "50.00",
          originalPrice: "",
          category: "Test",
          stock: "10",
          status: "ACTIVE",
          images: [],
          variants: [],
        })
        result.current.setSearchTerm("test")
        result.current.setStatusFilter("ACTIVE")
      })

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.formData.name).toBe("")
      expect(result.current.searchTerm).toBe("")
      expect(result.current.statusFilter).toBe("all")
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.editingProduct).toBe(null)
    })
  })

  describe('Image Management', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('sets primary image correctly', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add multiple images
      act(() => {
        result.current.addImage()
      })

      await waitFor(() => {
        expect(result.current.formData.images).toHaveLength(1)
      })

      act(() => {
        result.current.addImage()
      })

      await waitFor(() => {
        expect(result.current.formData.images).toHaveLength(2)
      })

      const firstImageId = result.current.formData.images[0].id
      const secondImageId = result.current.formData.images[1].id

      // Set second image as primary
      act(() => {
        result.current.updateImage(secondImageId, { isPrimary: true })
      })

      await waitFor(() => {
        expect(result.current.formData.images[0].isPrimary).toBe(false)
        expect(result.current.formData.images[1].isPrimary).toBe(true)
      })
    })

    it('handles image updates with product images setter', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newImages = [
        { id: "new-1", url: "/new1.jpg", alt: "New 1", isPrimary: true },
        { id: "new-2", url: "/new2.jpg", alt: "New 2", isPrimary: false }
      ]

      act(() => {
        result.current.setProductImages(newImages)
      })

      expect(result.current.formData.images).toEqual(newImages)
    })
  })

  describe('Variant Management', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    })

    it('handles variant type changes', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add a variant
      act(() => {
        result.current.addVariant()
      })

      const variantId = result.current.formData.variants[0].id

      // Change variant type
      act(() => {
        result.current.updateVariant(variantId, { type: "SIZE", value: "XL" })
      })

      expect(result.current.formData.variants[0].type).toBe("SIZE")
      expect(result.current.formData.variants[0].value).toBe("XL")
    })

    it('handles variant price updates', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Add a variant
      act(() => {
        result.current.addVariant()
      })

      const variantId = result.current.formData.variants[0].id

      // Update variant price
      act(() => {
        result.current.updateVariant(variantId, { variantPrice: 25.99 })
      })

      expect(result.current.formData.variants[0].variantPrice).toBe(25.99)
    })
  })
}) 
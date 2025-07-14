import { renderHook, act, waitFor } from "@testing-library/react";
import { useOrders } from "../hook";

// Mock fetch
global.fetch = jest.fn();

describe("useOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize with correct default state", () => {
    // Set up default mocks for the two fetch calls made on mount
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    expect(result.current.loading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.filteredOrders).toEqual([]);
    expect(result.current.searchTerm).toBe("");
    expect(result.current.statusFilter).toBe("all");
    expect(result.current.selectedOrder).toBe(null);
    expect(result.current.showEditor).toBe(false);
    expect(result.current.editingOrder).toBe(null);
    expect(result.current.productsList).toEqual([]);
    expect(result.current.showDeleteDialog).toBe(false);
    expect(result.current.orderToDelete).toBe(null);
  });

  it("should fetch orders on mount", async () => {
    const mockOrders = [
      {
        id: "1",
        customerName: "John Doe",
        customerPhone: "+1-555-0101",
        products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
        total: 59.98,
        status: "pending" as const,
        orderDate: "2024-01-01",
        shippingAddress: "123 Main St",
      },
    ];

    // Set up specific mocks for both fetch calls
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/orders");
    expect(result.current.orders).toEqual(mockOrders);
  });

  it("should fetch products on mount", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.productsList).toEqual(mockProducts);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/products");
  });

  it("should handle fetch error gracefully", async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.orders).toEqual([]);
  });

  it("should update search term", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchTerm("test search");
    });

    expect(result.current.searchTerm).toBe("test search");
  });

  it("should update status filter", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setStatusFilter("shipped");
    });

    expect(result.current.statusFilter).toBe("shipped");
  });

  it("should filter orders by search term and status", async () => {
    const mockOrders = [
      {
        id: "1",
        customerName: "John Doe",
        customerPhone: "+1-555-0101",
        products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
        total: 59.98,
        status: "pending" as const,
        orderDate: "2024-01-01",
        shippingAddress: "123 Main St",
      },
      {
        id: "2",
        customerName: "Jane Smith",
        customerPhone: "+1-555-0102",
        products: [{ name: "Product 2", quantity: 1, price: 49.99 }],
        total: 49.99,
        status: "shipped" as const,
        orderDate: "2024-01-02",
        shippingAddress: "456 Oak Ave",
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Filter by search term
    act(() => {
      result.current.setSearchTerm("John");
    });

    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].customerName).toBe("John Doe");

    // Filter by status
    act(() => {
      result.current.setSearchTerm("");
      result.current.setStatusFilter("shipped");
    });

    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].status).toBe("shipped");
  });

  it("should update order status", async () => {
    const mockOrders = [
      {
        id: "1",
        customerName: "John Doe",
        customerPhone: "+1-555-0101",
        products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
        total: 59.98,
        status: "pending" as const,
        orderDate: "2024-01-01",
        shippingAddress: "123 Main St",
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateOrderStatus("1", "processing");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/orders?id=1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...mockOrders[0], status: "processing" }),
    });
  });

  it("should add a new order", async () => {
    const newOrder = {
      id: "2",
      customerName: "Jane Smith",
      customerPhone: "+1-555-0102",
      products: [{ name: "Product 2", quantity: 1, price: 49.99 }],
      total: 49.99,
      status: "pending" as const,
      orderDate: "2024-01-02",
      shippingAddress: "456 Oak Ave",
    };

    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newOrder,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addOrder(newOrder);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
  });

  it("should edit an existing order", async () => {
    const mockOrders = [
      {
        id: "1",
        customerName: "John Doe",
        customerPhone: "+1-555-0101",
        products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
        total: 59.98,
        status: "pending" as const,
        orderDate: "2024-01-01",
        shippingAddress: "123 Main St",
      },
    ];

    const updatedOrder = { ...mockOrders[0], customerName: "John Updated" };

    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedOrder,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.editOrder(updatedOrder);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/orders?id=1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });
  });

  it("should delete an order", async () => {
    const mockOrders = [
      {
        id: "1",
        customerName: "John Doe",
        customerPhone: "+1-555-0101",
        products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
        total: 59.98,
        status: "pending" as const,
        orderDate: "2024-01-01",
        shippingAddress: "123 Main St",
      },
    ];

    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteOrder("1");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/orders?id=1", {
      method: "DELETE",
    });
  });

  it("should handle form creation", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleCreate();
    });

    expect(result.current.showEditor).toBe(true);
    expect(result.current.editingOrder).toBe(null);
    expect(result.current.form.id).toBe("");
    expect(result.current.form.customerName).toBe("");
    expect(result.current.form.status).toBe("pending");
  });

  it("should handle form editing", async () => {
    const mockOrder = {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+1-555-0101",
      products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
      total: 59.98,
      status: "pending" as const,
      orderDate: "2024-01-01",
      shippingAddress: "123 Main St",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleEdit(mockOrder);
    });

    expect(result.current.showEditor).toBe(true);
    expect(result.current.editingOrder).toEqual(mockOrder);
    expect(result.current.form).toEqual(mockOrder);
  });

  it("should handle form changes", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFormChange("customerName", "New Name");
    });

    expect(result.current.form.customerName).toBe("New Name");
  });

  it("should handle delete dialog", async () => {
    const mockOrder = {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+1-555-0101",
      products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
      total: 59.98,
      status: "pending" as const,
      orderDate: "2024-01-01",
      shippingAddress: "123 Main St",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleDeleteClick(mockOrder);
    });

    expect(result.current.showDeleteDialog).toBe(true);
    expect(result.current.orderToDelete).toEqual(mockOrder);
  });

  it("should handle delete confirmation", async () => {
    const mockOrder = {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+1-555-0101",
      products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
      total: 59.98,
      status: "pending" as const,
      orderDate: "2024-01-01",
      shippingAddress: "123 Main St",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleDeleteClick(mockOrder);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.showDeleteDialog).toBe(false);
    expect(result.current.orderToDelete).toBe(null);
  });

  it("should handle delete cancellation", async () => {
    const mockOrder = {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+1-555-0101",
      products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
      total: 59.98,
      status: "pending" as const,
      orderDate: "2024-01-01",
      shippingAddress: "123 Main St",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleDeleteClick(mockOrder);
    });

    expect(result.current.showDeleteDialog).toBe(true);
    expect(result.current.orderToDelete).toEqual(mockOrder);

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.showDeleteDialog).toBe(false);
    expect(result.current.orderToDelete).toBe(null);
  });

  it("should get correct status color", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getStatusColor("pending")).toBe("secondary");
    expect(result.current.getStatusColor("processing")).toBe("default");
    expect(result.current.getStatusColor("shipped")).toBe("outline");
    expect(result.current.getStatusColor("delivered")).toBe("default");
    expect(result.current.getStatusColor("cancelled")).toBe("destructive");
  });

  it("should add product to form", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [
          {
            id: "v1",
            value: "Red",
            type: "COLOR" as const,
            variantPrice: 34.99,
          },
        ],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedProductId("1");
      result.current.setSelectedVariantType("COLOR");
      result.current.setSelectedVariantValue("Red");
      result.current.setSelectedQuantity(2);
    });

    act(() => {
      result.current.addProductToForm();
    });

    expect(result.current.form.products).toHaveLength(1);
    expect(result.current.form.products[0].name).toBe("Product 1");
    expect(result.current.form.products[0].quantity).toBe(2);
    expect(result.current.form.products[0].price).toBe(34.99);
  });

  it("should compute total correctly when adding products", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedProductId("1");
      result.current.setSelectedQuantity(2);
    });

    act(() => {
      result.current.addProductToForm();
    });

    expect(result.current.form.total).toBe(59.98); // 29.99 * 2
  });

  it("should reset form selectors after adding product", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedProductId("1");
      result.current.setSelectedVariantType("COLOR");
      result.current.setSelectedVariantValue("Red");
      result.current.setSelectedQuantity(2);
    });

    act(() => {
      result.current.addProductToForm();
    });

    expect(result.current.selectedProductId).toBe("");
    expect(result.current.selectedVariantType).toBe("");
    expect(result.current.selectedVariantValue).toBe("");
    expect(result.current.selectedQuantity).toBe(1);
  });

  it("should handle save order for new order", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Product 1",
        price: 29.99,
        variants: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "new-id", customerName: "Test" }),
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleCreate();
      result.current.handleFormChange("customerName", "Test Customer");
    });

    await act(async () => {
      result.current.handleSaveOrder();
    });

    expect(result.current.showEditor).toBe(false);
  });

  it("should handle save order for existing order", async () => {
    const mockOrder = {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+1-555-0101",
      products: [{ name: "Product 1", quantity: 2, price: 29.99 }],
      total: 59.98,
      status: "pending" as const,
      orderDate: "2024-01-01",
      shippingAddress: "123 Main St",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockOrder],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, customerName: "Updated" }),
      });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleEdit(mockOrder);
      result.current.handleFormChange("customerName", "Updated");
    });

    await act(async () => {
      result.current.handleSaveOrder();
    });

    expect(result.current.showEditor).toBe(false);
  });
}); 
import { NextRequest } from "next/server";
import { PrismaClient, OrderStatus, ProductStatus } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

// Mock the shared Prisma instance
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from "@/lib/prisma";
const mockPrisma = prisma as DeepMockProxy<PrismaClient>;

import { GET, POST, PUT, DELETE } from "../route";

// Mock data
const mockOrder = {
  id: "order-1",
  customerName: "John Doe",
  customerPhone: "+1-555-0101",
  shippingAddress: "123 Main St",
  total: 21.98,
  status: "PENDING" as OrderStatus,
  orderDate: new Date("2024-01-01"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  items: [
    {
      id: "item-1",
      productId: "product-1",
      productName: "Product 1",
      quantity: 2,
      price: 10.99,
      variant: {
        id: "variant-1",
        value: "Red",
      },
    },
  ],
};

const mockProduct = {
  id: "product-1",
  name: "Product 1",
  description: "A test product",
  price: 10.99,
  originalPrice: null,
  category: "Test Category",
  stock: 100,
  rating: null,
  status: "ACTIVE" as ProductStatus,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  variants: [
    {
      id: "variant-1",
      value: "Red",
      type: "COLOR",
      variantPrice: 12.99,
    },
  ],
};

const mockVariant = {
  id: "variant-1",
  value: "Red",
  productId: "product-1",
};

describe("Orders API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/orders", () => {
    it("should return all orders with items and variants", async () => {
      mockPrisma.order.findMany.mockResolvedValue([mockOrder]);

      const response = await GET();
      const data = await response.json();

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        orderBy: {
          orderDate: "desc",
        },
      });

      expect(data).toEqual([
        {
          id: "order-1",
          customerName: "John Doe",
          customerPhone: "+1-555-0101",
          shippingAddress: "123 Main St",
          total: 21.98,
          status: "pending",
          orderDate: mockOrder.orderDate.toISOString(),
          products: [
            {
              name: "Product 1",
              quantity: 2,
              price: 10.99,
              variant: "Red",
            },
          ],
        },
      ]);
    });

    it("should handle orders without variants", async () => {
      const orderWithoutVariant = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            variant: null,
          },
        ],
      };

      mockPrisma.order.findMany.mockResolvedValue([orderWithoutVariant]);

      const response = await GET();
      const data = await response.json();

      expect(data[0].products[0].variant).toBeUndefined();
    });

    it("should handle database errors", async () => {
      mockPrisma.order.findMany.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch orders");
    });
  });

  describe("POST /api/admin/orders", () => {
    const createOrderData = {
      customerName: "New Customer",
      customerPhone: "+1-555-0103",
      shippingAddress: "789 Pine St",
      total: 15.99,
      status: "pending",
      orderDate: "2024-01-03T00:00:00.000Z",
      products: [
        {
          name: "Product 1",
          quantity: 1,
          price: 15.99,
        },
      ],
    };

    it("should create a new order with products", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.create.mockResolvedValue({
        ...mockOrder,
        ...createOrderData,
        status: "PENDING",
        orderDate: new Date(createOrderData.orderDate),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(createOrderData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { name: "Product 1" },
        include: { variants: true },
      });

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          customerName: "New Customer",
          customerPhone: "+1-555-0103",
          total: 15.99,
          status: "PENDING",
          orderDate: new Date(createOrderData.orderDate),
          shippingAddress: "789 Pine St",
          items: {
            create: [
              {
                productId: "product-1",
                productName: "Product 1",
                quantity: 1,
                price: 15.99,
                variantId: null,
              },
            ],
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      expect(data).toMatchObject({
        customerName: "New Customer",
        customerPhone: "+1-555-0103",
        total: 15.99,
        status: "pending",
      });
    });

    it("should create order with product variants", async () => {
      const orderDataWithVariant = {
        ...createOrderData,
        products: [
          {
            name: "Product 1",
            quantity: 1,
            price: 12.99,
            variant: "Red",
          },
        ],
      };

      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.create.mockResolvedValue({
        ...mockOrder,
        ...orderDataWithVariant,
        status: "PENDING",
        orderDate: new Date(orderDataWithVariant.orderDate),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(orderDataWithVariant),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          items: {
            create: [
              {
                productId: "product-1",
                productName: "Product 1",
                quantity: 1,
                price: 12.99,
                variantId: "variant-1",
              },
            ],
          },
        }),
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });
    });

    it("should handle product not found", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(createOrderData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create order");
    });

    it("should handle invalid request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: "invalid json",
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe("PUT /api/admin/orders", () => {
    const updateOrderData = {
      customerName: "Updated Customer",
      customerPhone: "+1-555-0104",
      shippingAddress: "456 Updated St",
      total: 25.5,
      status: "processing",
      orderDate: "2024-01-04T00:00:00.000Z",
      products: [
        {
          name: "Product 2",
          quantity: 2,
          price: 12.75,
        },
      ],
    };

    it("should update an existing order", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        ...updateOrderData,
        status: "PROCESSING",
        orderDate: new Date(updateOrderData.orderDate),
      });
      mockPrisma.orderItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.orderItem.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        ...updateOrderData,
        status: "PROCESSING",
        orderDate: new Date(updateOrderData.orderDate),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        {
          method: "PUT",
          body: JSON.stringify(updateOrderData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: {
          customerName: "Updated Customer",
          customerPhone: "+1-555-0104",
          total: 25.5,
          status: "PROCESSING",
          orderDate: new Date(updateOrderData.orderDate),
          shippingAddress: "456 Updated St",
          updatedAt: expect.any(Date),
        },
      });

      expect(data).toMatchObject({
        customerName: "Updated Customer",
        status: "processing",
      });
    });

    it("should return 400 error when order ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify(updateOrderData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Order ID is required");
    });

    it("should handle product not found during update", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        {
          method: "PUT",
          body: JSON.stringify(updateOrderData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update order");
    });

    it("should handle invalid request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        {
          method: "PUT",
          body: "invalid json",
        }
      );

      const response = await PUT(request);
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /api/admin/orders", () => {
    it("should delete an order and its items", async () => {
      mockPrisma.orderItem.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.order.delete.mockResolvedValue(mockOrder);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(mockPrisma.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: "order-1" },
      });

      expect(mockPrisma.order.delete).toHaveBeenCalledWith({
        where: { id: "order-1" },
      });

      expect(data).toEqual({ success: true });
    });

    it("should return 400 error when order ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Order ID is required");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.orderItem.deleteMany.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete order");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty products array", async () => {
      const orderDataWithEmptyProducts = {
        customerName: "Customer",
        customerPhone: "+1-555-0105",
        shippingAddress: "123 St",
        total: 0,
        status: "pending",
        orderDate: "2024-01-01T00:00:00.000Z",
        products: [],
      };

      const prismaOrderEmpty = {
        ...mockOrder,
        ...orderDataWithEmptyProducts,
        orderDate: new Date(orderDataWithEmptyProducts.orderDate),
        status: "PENDING" as OrderStatus,
        items: [],
      };
      if ("products" in prismaOrderEmpty)
        delete (prismaOrderEmpty as any).products;
      mockPrisma.order.create.mockResolvedValue(prismaOrderEmpty);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(orderDataWithEmptyProducts),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.products).toEqual([]);
    });

    it("should handle orders with multiple products", async () => {
      const orderDataWithMultipleProducts = {
        customerName: "Customer",
        customerPhone: "+1-555-0106",
        shippingAddress: "123 St",
        total: 50.0,
        status: "pending",
        orderDate: "2024-01-01T00:00:00.000Z",
        products: [
          { name: "Product 1", quantity: 2, price: 15.0 },
          { name: "Product 2", quantity: 1, price: 20.0 },
        ],
      };

      mockPrisma.product.findFirst
        .mockResolvedValueOnce({
          ...mockProduct,
          name: "Product 1",
          price: 15.0,
        })
        .mockResolvedValueOnce({
          ...mockProduct,
          id: "product-2",
          name: "Product 2",
          price: 20.0,
        });

      const prismaOrderMulti = {
        ...mockOrder,
        ...orderDataWithMultipleProducts,
        orderDate: new Date(orderDataWithMultipleProducts.orderDate),
        status: "PENDING" as OrderStatus,
        items: [
          {
            productId: "product-1",
            productName: "Product 1",
            quantity: 2,
            price: 15.0,
            variant: null,
          },
          {
            productId: "product-2",
            productName: "Product 2",
            quantity: 1,
            price: 20.0,
            variant: null,
          },
        ],
      };
      if ("products" in prismaOrderMulti)
        delete (prismaOrderMulti as any).products;
      mockPrisma.order.create.mockResolvedValue(prismaOrderMulti);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(orderDataWithMultipleProducts),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.product.findFirst).toHaveBeenCalledTimes(2);
      expect(data.products).toHaveLength(2);
    });

    it("should handle status case conversion", async () => {
      const orderDataWithUpperCaseStatus = {
        customerName: "Customer",
        customerPhone: "+1-555-0107",
        shippingAddress: "123 St",
        total: 25.0,
        status: "PROCESSING",
        orderDate: "2024-01-01T00:00:00.000Z",
        products: [{ name: "Product 1", quantity: 1, price: 25.0 }],
      };

      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.create.mockResolvedValue({
        ...mockOrder,
        ...orderDataWithUpperCaseStatus,
        orderDate: new Date(orderDataWithUpperCaseStatus.orderDate),
        status: "PROCESSING",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(orderDataWithUpperCaseStatus),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.status).toBe("processing");
    });
  });
});

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orderItem: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
    productVariant: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock the permission checker
jest.mock("@/lib/permissions", () => ({
  createPermissionChecker: jest.fn(() => ({
    canView: jest.fn(() => true),
    canCreate: jest.fn(() => true),
    canEdit: jest.fn(() => true),
    canDelete: jest.fn(() => true),
  })),
}));

const mockPrisma = require("@/lib/prisma").default;
const { getServerSession } = require("next-auth");

describe("Orders API Route", () => {
  const mockUser = {
    id: "admin-1",
    name: "Super Admin",
    email: "admin@store.com",
    role: "ADMIN",
    parentId: null,
    permissions: [
      {
        id: "perm-1",
        userId: "admin-1",
        resource: "ORDER",
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock NextAuth session
    getServerSession.mockResolvedValue({
      user: {
        id: "admin-1",
        name: "Super Admin",
        email: "admin@store.com",
        role: "ADMIN",
      },
    });

    // Mock the user authentication
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    // Reset permission checker to default (all permissions true)
    const { createPermissionChecker } = require("@/lib/permissions");
    createPermissionChecker.mockReturnValue({
      canView: jest.fn(() => true),
      canCreate: jest.fn(() => true),
      canEdit: jest.fn(() => true),
      canDelete: jest.fn(() => true),
    });
  });

  describe("GET /api/admin/orders", () => {
    it("should return all orders with items and variants", async () => {
      const mockOrders = [
        {
          id: "order-1",
          customerName: "John Doe",
          customerPhone: "+1-555-0101",
          total: 299.99,
          status: "PENDING",
          orderDate: new Date("2024-01-01"),
          shippingAddress: "123 Main St",
          items: [
            {
              id: "item-1",
              productId: "product-1",
              variantId: "variant-1",
              quantity: 2,
              price: 149.99,
              productName: "Premium Headphones",
              product: {
                id: "product-1",
                name: "Premium Headphones",
              },
              variant: {
                id: "variant-1",
                name: "Black",
                value: "#000000",
              },
            },
          ],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual(mockOrders);
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
          createdAt: "desc",
        },
      });
    });

    it("should handle orders without variants", async () => {
      const mockOrders = [
        {
          id: "order-2",
          customerName: "Jane Smith",
          customerPhone: "+1-555-0102",
          total: 199.99,
          status: "PROCESSING",
          orderDate: new Date("2024-01-02"),
          shippingAddress: "456 Oak Ave",
          items: [
            {
              id: "item-2",
              productId: "product-2",
              variantId: null,
              quantity: 1,
              price: 199.99,
              productName: "Smart Watch",
              product: {
                id: "product-2",
                name: "Smart Watch",
              },
              variant: null,
            },
          ],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders[0].items[0].variant).toBeNull();
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks permissions", async () => {
      const { createPermissionChecker } = require("@/lib/permissions");
      createPermissionChecker.mockReturnValue({
        canView: jest.fn(() => false),
        canCreate: jest.fn(() => false),
        canEdit: jest.fn(() => false),
        canDelete: jest.fn(() => false),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to view orders");
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
    it("should create a new order with products", async () => {
      const newOrder = {
        customerName: "New Customer",
        customerPhone: "+1-555-0103",
        total: 399.98,
        status: "PENDING",
        orderDate: "2024-01-03T00:00:00.000Z",
        shippingAddress: "789 Pine St",
        items: {
          create: [
            {
              productId: "product-1",
              variantId: null,
              quantity: 2,
              price: 199.99,
              productName: "Product 1",
            },
          ],
        },
      };

      const createdOrder = { id: "new-order-1", ...newOrder };
      mockPrisma.order.create.mockResolvedValue(createdOrder);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify(newOrder),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.order).toEqual(createdOrder);
      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: newOrder,
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

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify({ customerName: "Test Customer" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks create permissions", async () => {
      const { createPermissionChecker } = require("@/lib/permissions");
      createPermissionChecker.mockReturnValue({
        canView: jest.fn(() => true),
        canCreate: jest.fn(() => false),
        canEdit: jest.fn(() => false),
        canDelete: jest.fn(() => false),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify({ customerName: "Test Customer" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to create orders");
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.order.create.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          body: JSON.stringify({ customerName: "Test Customer" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create order");
    });
  });

  describe("PUT /api/admin/orders", () => {
    it("should update an existing order", async () => {
      const updateData = {
        id: "order-1",
        customerName: "Updated Customer",
        customerPhone: "+1-555-0104",
        total: 25.5,
        status: "PROCESSING",
        orderDate: "2024-01-04T00:00:00.000Z",
        shippingAddress: "456 Updated St",
      };

      const updatedOrder = { ...updateData };
      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.order).toEqual(updatedOrder);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: {
          customerName: "Updated Customer",
          customerPhone: "+1-555-0104",
          total: 25.5,
          status: "PROCESSING",
          orderDate: "2024-01-04T00:00:00.000Z",
          shippingAddress: "456 Updated St",
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
    });

    it("should return 400 error when order ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify({ customerName: "Updated Customer" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Order ID is required");
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "order-1",
            customerName: "Updated Customer",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks edit permissions", async () => {
      const { createPermissionChecker } = require("@/lib/permissions");
      createPermissionChecker.mockReturnValue({
        canView: jest.fn(() => true),
        canCreate: jest.fn(() => true),
        canEdit: jest.fn(() => false),
        canDelete: jest.fn(() => false),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "order-1",
            customerName: "Updated Customer",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to edit orders");
    });

    it("should handle order not found", async () => {
      mockPrisma.order.update.mockRejectedValue(new Error("Order not found"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "non-existent",
            customerName: "Updated Customer",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update order");
    });
  });

  describe("DELETE /api/admin/orders", () => {
    it("should delete an order and its items", async () => {
      mockPrisma.order.delete.mockResolvedValue({ id: "order-1" });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Order deleted successfully");
      expect(mockPrisma.order.delete).toHaveBeenCalledWith({
        where: { id: "order-1" },
      });
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

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks delete permissions", async () => {
      const { createPermissionChecker } = require("@/lib/permissions");
      createPermissionChecker.mockReturnValue({
        canView: jest.fn(() => true),
        canCreate: jest.fn(() => true),
        canEdit: jest.fn(() => true),
        canDelete: jest.fn(() => false),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to delete orders");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.order.delete.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?id=order-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete order");
    });
  });
});

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    productPage: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
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

describe("Product Pages API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the user authentication
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "singleton",
      name: "Admin",
      email: "admin@store.com",
      role: "ADMIN",
      parentId: null,
      permissions: [],
    });
  });

  describe("GET /api/admin/product-pages", () => {
    it("should return all product pages with product details", async () => {
      const mockProductPages = [
        {
          id: "page-1",
          productId: "product-1",
          title: "Premium Headphones Page",
          description: "Detailed product description",
          features: ["Wireless", "Noise Cancelling", "Long Battery"],
          specifications: {
            battery: "30 hours",
            weight: "250g",
            connectivity: "Bluetooth 5.0",
          },
          status: "DRAFT",
          product: {
            id: "product-1",
            name: "Premium Wireless Headphones",
          },
        },
      ];

      mockPrisma.productPage.findMany.mockResolvedValue(mockProductPages);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productPages).toEqual(mockProductPages);
      expect(mockPrisma.productPage.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should handle empty product pages list", async () => {
      mockPrisma.productPage.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productPages).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockPrisma.productPage.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch product pages");
    });
  });

  describe("POST /api/admin/product-pages", () => {
    it("should create a new product page", async () => {
      const newProductPage = {
        productId: "product-2",
        title: "New Product Page",
        description: "A new product page description",
        features: ["Feature 1", "Feature 2"],
        specifications: {
          color: "Black",
          size: "Medium",
        },
        status: "DRAFT",
      };

      const createdProductPage = { id: "new-page-1", ...newProductPage };
      mockPrisma.productPage.create.mockResolvedValue(createdProductPage);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "POST",
          body: JSON.stringify(newProductPage),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productPage).toEqual(createdProductPage);
      expect(mockPrisma.productPage.create).toHaveBeenCalledWith({
        data: newProductPage,
        include: {
          product: true,
        },
      });
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.productPage.create.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "POST",
          body: JSON.stringify({ title: "Test Product Page" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create product page");
    });
  });

  describe("PUT /api/admin/product-pages", () => {
    it("should update an existing product page", async () => {
      const updateData = {
        id: "page-1",
        productId: "product-3",
        title: "Updated Product Page",
        description: "Updated description...",
        features: ["Updated Feature 1", "Updated Feature 2"],
        specifications: {
          updated: "value",
        },
        status: "PUBLISHED",
      };

      const updatedProductPage = { ...updateData };
      mockPrisma.productPage.update.mockResolvedValue(updatedProductPage);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productPage).toEqual(updatedProductPage);
      expect(mockPrisma.productPage.update).toHaveBeenCalledWith({
        where: { id: "page-1" },
        data: {
          productId: "product-3",
          title: "Updated Product Page",
          description: "Updated description...",
          features: ["Updated Feature 1", "Updated Feature 2"],
          specifications: {
            updated: "value",
          },
          status: "PUBLISHED",
        },
        include: {
          product: true,
        },
      });
    });

    it("should return 400 error when product page ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "PUT",
          body: JSON.stringify({ title: "Updated Product Page" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product page ID is required");
    });

    it("should handle product page not found", async () => {
      mockPrisma.productPage.update.mockRejectedValue(
        new Error("Product page not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "non-existent",
            title: "Updated Product Page",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update product page");
    });
  });

  describe("DELETE /api/admin/product-pages", () => {
    it("should delete a product page", async () => {
      mockPrisma.productPage.delete.mockResolvedValue({ id: "page-1" });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages?id=page-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Product page deleted successfully");
      expect(mockPrisma.productPage.delete).toHaveBeenCalledWith({
        where: { id: "page-1" },
      });
    });

    it("should return 400 error when product page ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages",
        {
          method: "DELETE",
        }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product page ID is required");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.productPage.delete.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/product-pages?id=page-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete product page");
    });
  });
});

import { NextRequest } from "next/server";
import { TextEncoder, TextDecoder } from "util";
// @ts-ignore
if (typeof global.TextEncoder === "undefined") {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// Mock NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    productImage: {
      deleteMany: jest.fn(),
    },
  },
}));

const mockPrisma = require("@/lib/prisma").default;
const { getServerSession } = require("next-auth");

// After all mocks, import the route handlers using require
const { GET, POST, PUT, DELETE } = require("../route");

describe("Products API Route", () => {
  let mockUser: any;
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      id: "admin-1",
      name: "Super Admin",
      email: "admin@store.com",
      role: "ADMIN",
      parentId: null,
      permissions: [
        {
          id: "perm-1",
          userId: "admin-1",
          resource: "PRODUCT",
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
      ],
    };
    getServerSession.mockResolvedValue({
      user: {
        id: "admin-1",
        name: "Super Admin",
        email: "admin@store.com",
        role: "ADMIN",
      },
    });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    // Mock deleteMany for PUT tests
    mockPrisma.productImage = { deleteMany: jest.fn().mockResolvedValue({}) };
  });

  describe("GET /api/admin/products", () => {
    it("should return all products", async () => {
      const mockProducts = [
        {
          id: "product-1",
          name: "Test Product",
          description: "A test product",
          price: 99.99,
          originalPrice: 129.99,
          stock: 10,
          status: "ACTIVE",
          category: "Electronics",
          images: [],
          variants: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.product.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch products");
    });

    it("should handle empty products list", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toEqual([]);
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks permissions", async () => {
      jest.clearAllMocks();
      // content@store.com has NO PRODUCT permission
      const userWithNoProductPermission = {
        id: "user-3",
        name: "Content Manager",
        email: "content@store.com",
        role: "ADMIN",
        parentId: "admin-1",
        permissions: [
          // No PRODUCT permission
          {
            id: "perm-x",
            userId: "user-3",
            resource: "LANDING_PAGE",
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
          },
        ],
      };
      getServerSession.mockResolvedValue({
        user: {
          id: "user-3",
          name: "Content Manager",
          email: "content@store.com",
          role: "ADMIN",
          parentId: "admin-1",
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue(userWithNoProductPermission);
      const response = await GET();
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to view products");
    });
  });

  describe("POST /api/admin/products", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "New Product",
        description: "A new product description",
        price: 99.99,
        originalPrice: 129.99,
        stock: 25,
        status: "ACTIVE",
        category: "Electronics",
        images: {
          create: [
            {
              id: "new-img-1",
              url: "/api/images/new-img-1",
              alt: "New product image",
              isPrimary: true,
              data: { type: "Buffer", data: [116, 101, 115, 116] },
            },
          ],
        },
        variants: {
          create: [
            {
              id: "new-var-1",
              name: "Red",
              value: "#FF0000",
              type: "COLOR",
              description: "Red variant",
              variantPrice: 99.99,
              stockQuantity: 15,
              images: { create: [] },
            },
          ],
        },
      };
      const createdProduct = { id: "new-product-1", ...newProduct };
      mockPrisma.product.create.mockResolvedValue(createdProduct);
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(newProduct),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.product).toEqual(createdProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: newProduct,
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should handle missing required fields", async () => {
      const incompleteProduct = {
        name: "Incomplete Product",
        // Missing other required fields
      };

      const createdProduct = { id: "incomplete-1", ...incompleteProduct };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(incompleteProduct),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toEqual(createdProduct);
    });

    it("should handle invalid price", async () => {
      const productWithInvalidPrice = {
        name: "Invalid Price Product",
        price: -100,
        stock: 10,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: { create: [] },
      };

      const createdProduct = {
        id: "invalid-price-1",
        ...productWithInvalidPrice,
      };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithInvalidPrice),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product.price).toBe(-100);
    });

    it("should handle invalid stock", async () => {
      const productWithInvalidStock = {
        name: "Invalid Stock Product",
        price: 99.99,
        stock: -5,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: { create: [] },
      };

      const createdProduct = {
        id: "invalid-stock-1",
        ...productWithInvalidStock,
      };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithInvalidStock),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product.stock).toBe(-5);
    });

    it("should handle products without images", async () => {
      const productWithoutImages = {
        name: "Product Without Images",
        description: "A product with no images",
        price: 49.99,
        stock: 10,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: { create: [] },
      };

      const createdProduct = { id: "no-images-1", ...productWithoutImages };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithoutImages),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toEqual(createdProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productWithoutImages,
          images: { create: [] },
          variants: { create: [] },
        },
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.product.create.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Product" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create product");
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Product" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks create permissions", async () => {
      jest.clearAllMocks();
      // sales@store.com has PRODUCT canCreate: false
      const userWithDeniedCreate = {
        id: "user-2",
        name: "Sales Assistant",
        email: "sales@store.com",
        role: "ADMIN",
        parentId: "admin-1",
        permissions: [
          {
            id: "perm-x",
            userId: "user-2",
            resource: "PRODUCT",
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        ],
      };
      getServerSession.mockResolvedValue({
        user: {
          id: "user-2",
          name: "Sales Assistant",
          email: "sales@store.com",
          role: "ADMIN",
          parentId: "admin-1",
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue(userWithDeniedCreate);
      mockPrisma.product.create.mockImplementation(() => {
        throw new Error("Should not be called");
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Product" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to create products");
    });
  });

  describe("PUT /api/admin/products", () => {
    it("should update an existing product", async () => {
      const updateData = {
        id: "product-1",
        name: "Updated Product Name",
        description: "Updated description",
        price: 149.99,
        originalPrice: 179.99,
        stock: 75,
        status: "INACTIVE",
        category: "Updated Category",
      };

      const updatedProduct = { ...updateData };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toEqual(updatedProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: {
          name: "Updated Product Name",
          description: "Updated description",
          price: 149.99,
          originalPrice: 179.99,
          stock: 75,
          status: "INACTIVE",
          category: "Updated Category",
          images: { create: [] },
          variants: { create: [] },
        },
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should return 400 error when product ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated Product" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product ID is required");
    });

    it("should handle product not found", async () => {
      mockPrisma.product.update.mockRejectedValue(
        new Error("Product not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify({ id: "non-existent", name: "Updated Product" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update product");
    });

    it("should handle partial updates", async () => {
      const partialUpdate = {
        id: "product-1",
        name: "Partially Updated Name",
        price: 199.99,
      };

      const updatedProduct = { ...partialUpdate };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify(partialUpdate),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toEqual(updatedProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: {
          name: "Partially Updated Name",
          price: 199.99,
          images: { create: [] },
          variants: { create: [] },
        },
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify({ id: "product-1", name: "Updated Product" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks edit permissions", async () => {
      jest.clearAllMocks();
      // sales@store.com has PRODUCT canEdit: false
      const userWithDeniedEdit = {
        id: "user-2",
        name: "Sales Assistant",
        email: "sales@store.com",
        role: "ADMIN",
        parentId: "admin-1",
        permissions: [
          {
            id: "perm-x",
            userId: "user-2",
            resource: "PRODUCT",
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        ],
      };
      getServerSession.mockResolvedValue({
        user: {
          id: "user-2",
          name: "Sales Assistant",
          email: "sales@store.com",
          role: "ADMIN",
          parentId: "admin-1",
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue(userWithDeniedEdit);
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify({ id: "product-1", name: "Updated Product" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to edit products");
    });
  });

  describe("DELETE /api/admin/products", () => {
    it("should delete a product", async () => {
      mockPrisma.product.delete.mockResolvedValue({ id: "product-1" });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Product deleted successfully");
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: "product-1" },
      });
    });

    it("should return 400 error when product ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "DELETE",
        }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product ID is required");
    });

    it("should handle product not found during deletion", async () => {
      mockPrisma.product.delete.mockRejectedValue(
        new Error("Product not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=non-existent",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete product");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.product.delete.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete product");
    });

    it("should return 401 when user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user lacks delete permissions", async () => {
      jest.clearAllMocks();
      // sales@store.com has PRODUCT canDelete: false
      const userWithDeniedDelete = {
        id: "user-2",
        name: "Sales Assistant",
        email: "sales@store.com",
        role: "ADMIN",
        parentId: "admin-1",
        permissions: [
          {
            id: "perm-x",
            userId: "user-2",
            resource: "PRODUCT",
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        ],
      };
      getServerSession.mockResolvedValue({
        user: {
          id: "user-2",
          name: "Sales Assistant",
          email: "sales@store.com",
          role: "ADMIN",
          parentId: "admin-1",
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue(userWithDeniedDelete);
      mockPrisma.product.delete.mockImplementation(() => {
        throw new Error("Should not be called");
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe("Insufficient permissions to delete products");
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: "invalid json",
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
    });

    it("should handle products with null originalPrice", async () => {
      const productWithNullPrice = {
        name: "Product Without Original Price",
        description: "A product with no original price",
        price: 99.99,
        originalPrice: null,
        stock: 20,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: { create: [] },
      };

      const createdProduct = { id: "null-price-1", ...productWithNullPrice };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithNullPrice),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toEqual(createdProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productWithNullPrice,
          images: { create: [] },
          variants: { create: [] },
        },
        include: {
          images: true,
          variants: { include: { images: true } },
        },
      });
    });

    it("should handle products with complex variant data", async () => {
      const productWithComplexVariants = {
        name: "Product With Complex Variants",
        description: "A product with complex variant data",
        price: 199.99,
        stock: 15,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: {
          create: [
            {
              id: "complex-var-1",
              name: "Large Red",
              value: "L",
              type: "SIZE",
              description: "Large size in red color",
              variantPrice: 219.99,
              stockQuantity: 8,
              images: [
                {
                  id: "var-img-1",
                  url: "/large-red.jpg",
                  alt: "Large Red Variant",
                  isPrimary: true,
                },
              ],
            },
          ],
        },
      };

      const createdProduct = { id: "complex-1", ...productWithComplexVariants };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithComplexVariants),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product).toMatchObject(productWithComplexVariants);
    });

    it("should handle very long product names", async () => {
      const longName = "A".repeat(500);
      const productWithLongName = {
        name: longName,
        price: 99.99,
        stock: 10,
        status: "ACTIVE",
        category: "Electronics",
        images: { create: [] },
        variants: { create: [] },
      };

      const createdProduct = { id: "long-name-1", ...productWithLongName };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithLongName),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.product.name).toBe(longName);
    });
  });
});

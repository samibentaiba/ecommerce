import { NextRequest } from "next/server";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from "@/lib/prisma";
const mockPrisma = prisma as DeepMockProxy<PrismaClient>;

import { GET, POST, PUT, DELETE } from "../route";

// Mock data
const mockProduct = {
  id: "product-1",
  name: "Premium Wireless Headphones",
  description: "High-quality wireless headphones with noise cancellation",
  price: 299.99,
  originalPrice: 349.99,
  category: "Electronics",
  stock: 50,
  status: "ACTIVE" as ProductStatus,
  image: "/headphones.jpg",
  rating: 4.5,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  images: [
    {
      id: "img-1",
      url: "/headphones-1.jpg",
      alt: "Headphones front view",
      isPrimary: true,
    },
    {
      id: "img-2",
      url: "/headphones-2.jpg",
      alt: "Headphones side view",
      isPrimary: false,
    },
  ],
  variants: [
    {
      id: "var-1",
      name: "Black",
      type: "COLOR",
      value: "#000000",
      description: "Classic black",
      variantPrice: 299.99,
      stockQuantity: 25,
      images: [],
    },
    {
      id: "var-2",
      name: "White",
      type: "COLOR",
      value: "#FFFFFF",
      description: "Clean white",
      variantPrice: 299.99,
      stockQuantity: 25,
      images: [],
    },
  ],
};

const mockProducts = [
  mockProduct,
  {
    id: "product-2",
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitoring",
    price: 199.99,
    originalPrice: null,
    category: "Wearables",
    stock: 30,
    status: "INACTIVE" as ProductStatus,
    image: "/watch.jpg",
    rating: 4.2,
    createdAt: new Date("2024-01-14T15:30:00Z"),
    updatedAt: new Date("2024-01-14T15:30:00Z"),
    images: [],
    variants: [],
  },
];

describe("Products API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/products", () => {
    it("should return all products", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await GET();
      const data = await response.json();

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: {
          images: true,
          variants: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      expect(data).toEqual(mockProducts);
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

      expect(data).toEqual([]);
    });
  });

  describe("POST /api/admin/products", () => {
    const createProductData = {
      name: "New Product",
      description: "A new product description",
      price: 99.99,
      originalPrice: 129.99,
      category: "Electronics",
      stock: 25,
      status: "ACTIVE",
      images: [
        {
          id: "new-img-1",
          url: "/new-product-1.jpg",
          alt: "New product image",
          isPrimary: true,
        },
      ],
      variants: [
        {
          id: "new-var-1",
          name: "Red",
          type: "COLOR",
          value: "#FF0000",
          description: "Red variant",
          variantPrice: 99.99,
          stockQuantity: 15,
          images: [],
        },
      ],
    };

    it("should create a new product", async () => {
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...createProductData,
        id: "product-3",
        status: "ACTIVE" as ProductStatus,
        createdAt: new Date("2024-01-16T12:00:00Z"),
        updatedAt: new Date("2024-01-16T12:00:00Z"),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(createProductData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "New Product",
          description: "A new product description",
          price: 99.99,
          originalPrice: 129.99,
          category: "Electronics",
          stock: 25,
          status: "ACTIVE",
          images: {
            create: [
              {
                id: "new-img-1",
                url: "/new-product-1.jpg",
                alt: "New product image",
                isPrimary: true,
              },
            ],
          },
          variants: {
            create: [
              {
                id: "new-var-1",
                name: "Red",
                type: "COLOR",
                value: "#FF0000",
                description: "Red variant",
                variantPrice: 99.99,
                stockQuantity: 15,
                images: [],
              },
            ],
          },
        },
        include: { images: true, variants: true },
      });
      expect(response.status).toBe(200);
      expect(data.name).toBe("New Product");
    });

    it("should handle missing required fields", async () => {
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        name: undefined as unknown as string,
        description: undefined as unknown as string,
        price: undefined as unknown as number,
        originalPrice: undefined as unknown as number | null,
        category: undefined as unknown as string,
        stock: undefined as unknown as number,
        status: undefined as unknown as ProductStatus,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      // The API doesn't validate required fields, so it will try to create with undefined values
      expect(response.status).toBe(200);
      expect(data).toBeDefined();
    });

    it("should handle invalid price", async () => {
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        price: -100,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ ...createProductData, price: -100 }),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      // The API doesn't validate price values, so it will try to create with negative price
      expect(response.status).toBe(200);
      expect(data.price).toBe(-100);
    });

    it("should handle invalid stock", async () => {
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        stock: -5,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify({ ...createProductData, stock: -5 }),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      // The API doesn't validate stock values, so it will try to create with negative stock
      expect(response.status).toBe(200);
      expect(data.stock).toBe(-5);
    });

    it("should handle products without images", async () => {
      const productWithoutImages = {
        name: "Product Without Images",
        description: "A product with no images",
        price: 49.99,
        originalPrice: null,
        category: "Electronics",
        stock: 10,
        status: "ACTIVE",
        images: [],
        variants: [],
      };
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...productWithoutImages,
        id: "product-4",
        status: "ACTIVE" as ProductStatus,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithoutImages),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productWithoutImages,
          images: { create: [] },
          variants: { create: [] },
        },
        include: { images: true, variants: true },
      });
      expect(response.status).toBe(200);
      expect(data.name).toBe("Product Without Images");
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.product.create.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(createProductData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create product");
    });
  });

  describe("PUT /api/admin/products", () => {
    const updateProductData = {
      name: "Updated Product Name",
      description: "Updated description",
      price: 149.99,
      originalPrice: 179.99,
      category: "Updated Category",
      stock: 75,
      status: "INACTIVE",
      images: [
        {
          id: "updated-img-1",
          url: "/updated-product-1.jpg",
          alt: "Updated image",
          isPrimary: true,
        },
      ],
      variants: [
        {
          id: "updated-var-1",
          name: "Blue",
          type: "COLOR",
          value: "#0000FF",
          description: "Blue variant",
          variantPrice: 149.99,
          stockQuantity: 40,
          images: [],
        },
      ],
    };

    it("should update an existing product", async () => {
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        name: "Updated Product Name",
        description: "Updated description",
        price: 149.99,
        originalPrice: 179.99,
        category: "Updated Category",
        stock: 75,
        status: "INACTIVE",
        updatedAt: expect.any(Date),
      });
      mockPrisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        name: "Updated Product Name",
        description: "Updated description",
        price: 149.99,
        originalPrice: 179.99,
        category: "Updated Category",
        stock: 75,
        status: "INACTIVE",
        updatedAt: expect.any(Date),
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        {
          method: "PUT",
          body: JSON.stringify({
            name: "Updated Product Name",
            description: "Updated description",
            price: 149.99,
            originalPrice: 179.99,
            category: "Updated Category",
            stock: 75,
            status: "INACTIVE",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: {
          name: "Updated Product Name",
          description: "Updated description",
          price: 149.99,
          originalPrice: 179.99,
          category: "Updated Category",
          stock: 75,
          status: "INACTIVE",
          updatedAt: expect.any(Date),
        },
        include: { images: true, variants: true },
      });
      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated Product Name");
    });

    it("should return 400 error when product ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "PUT",
          body: JSON.stringify(updateProductData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product ID is required");
    });

    it("should handle product not found", async () => {
      mockPrisma.product.update.mockRejectedValue(
        new Error("Record not found")
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-999",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Doesn't matter" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();
      // The API returns 500 for not found, not 404
      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update product");
    });

    it("should handle partial updates", async () => {
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        name: "Partially Updated Name",
        price: 199.99,
        originalPrice: null,
        stock: NaN,
        category: undefined as unknown as string,
        description: undefined as unknown as string,
        status: undefined as unknown as ProductStatus,
        updatedAt: expect.any(Date),
      });
      mockPrisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        name: "Partially Updated Name",
        price: 199.99,
        originalPrice: null,
        stock: NaN,
        category: undefined as unknown as string,
        description: undefined as unknown as string,
        status: undefined as unknown as ProductStatus,
        updatedAt: expect.any(Date),
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        {
          method: "PUT",
          body: JSON.stringify({
            name: "Partially Updated Name",
            price: 199.99,
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: {
          name: "Partially Updated Name",
          price: 199.99,
          originalPrice: null,
          stock: NaN,
          category: undefined as unknown as string,
          description: undefined as unknown as string,
          status: undefined as unknown as ProductStatus,
          updatedAt: expect.any(Date),
        },
        include: { images: true, variants: true },
      });
      expect(response.status).toBe(200);
      expect(data.name).toBe("Partially Updated Name");
    });
  });

  describe("DELETE /api/admin/products", () => {
    it("should delete a product", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.delete.mockResolvedValue(mockProduct);
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: "product-1" },
      });
      expect(response.status).toBe(200);
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
      // Mock findUnique to return null (product doesn't exist)
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=nonexistent",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Product not found");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.delete.mockRejectedValue(new Error("Database error"));
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products?id=product-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();
      // The API returns 404 for not found, but 500 for other errors
      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete product");
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
      expect(response.status).toBe(500);
    });

    it("should handle products with null originalPrice", async () => {
      const productWithNullPrice = {
        name: "Product Without Original Price",
        description: "A product with no original price",
        price: 99.99,
        originalPrice: null,
        category: "Electronics",
        stock: 20,
        status: "ACTIVE",
        images: [],
        variants: [],
      };
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...productWithNullPrice,
        id: "product-5",
        status: "ACTIVE" as ProductStatus,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithNullPrice),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productWithNullPrice,
          images: { create: [] },
          variants: { create: [] },
        },
        include: { images: true, variants: true },
      });
      expect(response.status).toBe(200);
      expect(data.name).toBe("Product Without Original Price");
    });

    it("should handle products with complex variant data", async () => {
      const productWithComplexVariants = {
        name: "Product With Complex Variants",
        description: "A product with complex variant data",
        price: 199.99,
        category: "Electronics",
        stock: 15,
        status: "ACTIVE",
        images: [],
        variants: [
          {
            id: "complex-var-1",
            name: "Large Red",
            type: "SIZE",
            value: "L",
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
      };

      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...productWithComplexVariants,
        id: "product-6",
        status: "ACTIVE" as ProductStatus,
        rating: 0,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithComplexVariants),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data).toMatchObject(productWithComplexVariants);
    });

    it("should handle very long product names", async () => {
      const longName = "A".repeat(500); // Very long name
      const productWithLongName = {
        name: longName,
        description: "Product with very long name",
        price: 99.99,
        category: "Electronics",
        stock: 10,
        status: "ACTIVE",
        images: [],
        variants: [],
      };

      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...productWithLongName,
        id: "product-7",
        status: "ACTIVE" as ProductStatus,
        rating: 0,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/products",
        {
          method: "POST",
          body: JSON.stringify(productWithLongName),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.name).toBe(longName);
    });
  });
});

import { NextRequest } from "next/server";
import { GET } from "../route";
import prisma from "@/lib/prisma";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    landingPage: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    landingPageTemplate: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    productPage: {
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

// Mock data
const mockOrder = {
  id: "order-1",
  customerName: "John Doe",
  total: 25.99,
  status: "DELIVERED",
  createdAt: new Date("2024-01-01"),
  items: [
    {
      product: {
        name: "Product 1",
      },
    },
  ],
};

const mockTopProduct = {
  productId: "product-1",
  _sum: {
    quantity: 10,
  },
};

const mockProduct = {
  id: "product-1",
  name: "Product 1",
  price: 15.99,
};

describe("Dashboard API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/dashboard", () => {
    it("should return complete dashboard data", async () => {
      // Mock count responses
      mockPrisma.product.count.mockResolvedValue(50);
      mockPrisma.order.count.mockResolvedValue(100);
      mockPrisma.landingPage.count.mockResolvedValue(25);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(10);
      mockPrisma.productPage.count.mockResolvedValue(30);

      // Mock recent orders (first findMany call)
      mockPrisma.order.findMany.mockResolvedValueOnce([mockOrder]);

      // Mock revenue orders (second findMany call)
      const now = new Date();
      mockPrisma.order.findMany.mockResolvedValueOnce([
        { total: 25.99, createdAt: now },
      ]);

      // Mock top products
      mockPrisma.orderItem.groupBy.mockResolvedValue([mockTopProduct]);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Mock order status distribution
      mockPrisma.order.groupBy.mockResolvedValue([
        { status: "PENDING", _count: { status: 20 } },
        { status: "DELIVERED", _count: { status: 80 } },
      ]);

      // Mock recent activity
      mockPrisma.product.findMany.mockResolvedValue([
        { id: "p1", name: "Product 1", createdAt: new Date() },
      ]);
      mockPrisma.landingPage.findMany.mockResolvedValue([
        { id: "lp1", title: "Landing Page 1", createdAt: new Date() },
      ]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([
        { id: "t1", name: "Template 1", createdAt: new Date() },
      ]);

      const response = await GET();
      const data = await response.json();

      // Verify all count calls
      expect(mockPrisma.product.count).toHaveBeenCalled();
      expect(mockPrisma.order.count).toHaveBeenCalled();
      expect(mockPrisma.landingPage.count).toHaveBeenCalled();
      expect(mockPrisma.landingPageTemplate.count).toHaveBeenCalled();
      expect(mockPrisma.productPage.count).toHaveBeenCalled();

      // Verify recent orders call
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            take: 1,
            include: {
              product: true,
            },
          },
        },
      });

      // Verify revenue orders call
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: ["DELIVERED", "SHIPPED"],
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      });

      // Verify top products call
      expect(mockPrisma.orderItem.groupBy).toHaveBeenCalledWith({
        by: ["productId"],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

      // Verify order status distribution call
      expect(mockPrisma.order.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        _count: {
          status: true,
        },
      });

      // Verify recent activity calls
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      });

      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      });

      expect(mockPrisma.landingPageTemplate.findMany).toHaveBeenCalledWith({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      });

      // Verify response structure
      expect(data).toHaveProperty("overview");
      expect(data).toHaveProperty("recentOrders");
      expect(data).toHaveProperty("topProducts");
      expect(data).toHaveProperty("orderStatusDistribution");
      expect(data).toHaveProperty("recentActivity");

      expect(data.overview).toMatchObject({
        totalProducts: 50,
        totalOrders: 100,
        totalLandingPages: 25,
        totalTemplates: 10,
        totalProductPages: 30,
        totalRevenue: 25.99,
        monthlyRevenue: 25.99,
      });
    });

    it("should handle empty data gracefully", async () => {
      // Mock empty responses
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.order.count.mockResolvedValue(0);
      mockPrisma.landingPage.count.mockResolvedValue(0);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(0);
      mockPrisma.productPage.count.mockResolvedValue(0);
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue([]);
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.overview).toMatchObject({
        totalProducts: 0,
        totalOrders: 0,
        totalLandingPages: 0,
        totalTemplates: 0,
        totalProductPages: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      });

      expect(data.recentOrders).toEqual([]);
      expect(data.topProducts).toEqual([]);
      expect(data.orderStatusDistribution).toEqual([]);
      expect(data.recentActivity.products).toEqual([]);
      expect(data.recentActivity.landingPages).toEqual([]);
      expect(data.recentActivity.templates).toEqual([]);
    });

    it("should calculate revenue correctly", async () => {
      const now = new Date();
      const orders = [
        { total: 100, createdAt: now },
        { total: 200, createdAt: now },
        {
          total: 50,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        }, // Previous month
      ];

      mockPrisma.product.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.landingPage.count.mockResolvedValue(5);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(3);
      mockPrisma.productPage.count.mockResolvedValue(8);
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce(orders); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue([]);
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.overview.totalRevenue).toBe(350); // 100 + 200 + 50
      expect(data.overview.monthlyRevenue).toBe(300); // 100 + 200 (current month only)
    });

    it("should handle top products with product details", async () => {
      const topProducts = [
        { productId: "p1", _sum: { quantity: 10 } },
        { productId: "p2", _sum: { quantity: 5 } },
      ];

      const products = [
        { id: "p1", name: "Product 1", price: 15.99 },
        { id: "p2", name: "Product 2", price: 25.5 },
      ];

      mockPrisma.product.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.landingPage.count.mockResolvedValue(5);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(3);
      mockPrisma.productPage.count.mockResolvedValue(8);
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue(topProducts);
      mockPrisma.product.findUnique.mockResolvedValueOnce(products[0]);
      mockPrisma.product.findUnique.mockResolvedValueOnce(products[1]);
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.topProducts).toHaveLength(2);
      expect(data.topProducts[0]).toMatchObject({
        productId: "p1",
        productName: "Product 1",
        totalSold: 10,
        revenue: 159.9, // 15.99 * 10
      });
      expect(data.topProducts[1]).toMatchObject({
        productId: "p2",
        productName: "Product 2",
        totalSold: 5,
        revenue: 127.5, // 25.50 * 5
      });
    });

    it("should handle missing product details gracefully", async () => {
      const topProducts = [
        { productId: "p1", _sum: { quantity: 10 } },
        { productId: "p2", _sum: { quantity: 5 } },
      ];

      mockPrisma.product.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.landingPage.count.mockResolvedValue(5);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(3);
      mockPrisma.productPage.count.mockResolvedValue(8);
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue(topProducts);
      mockPrisma.product.findUnique.mockResolvedValueOnce(null); // Product not found
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: "p2",
        name: "Product 2",
        price: 25.5,
      });
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.topProducts[0]).toMatchObject({
        productId: "p1",
        productName: "Unknown Product",
        totalSold: 10,
        revenue: 0, // 0 * 10
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.product.count.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch dashboard data");
    });

    it("should handle recent orders with multiple items", async () => {
      const recentOrder = {
        id: "order-1",
        customerName: "John Doe",
        total: 50.99,
        status: "PENDING",
        createdAt: new Date("2024-01-01"),
        items: [
          { product: { name: "Product 1" } },
          { product: { name: "Product 2" } },
        ],
      };

      mockPrisma.product.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.landingPage.count.mockResolvedValue(5);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(3);
      mockPrisma.productPage.count.mockResolvedValue(8);
      mockPrisma.order.findMany.mockResolvedValueOnce([recentOrder]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue([]);
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.recentOrders[0]).toMatchObject({
        id: "order-1",
        customerName: "John Doe",
        total: 50.99,
        status: "PENDING",
        productName: "Product 1", // Should take first item's product name
      });
    });

    it("should handle recent orders with no items", async () => {
      const recentOrder = {
        id: "order-1",
        customerName: "John Doe",
        total: 50.99,
        status: "PENDING",
        createdAt: new Date("2024-01-01"),
        items: [],
      };

      mockPrisma.product.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.landingPage.count.mockResolvedValue(5);
      mockPrisma.landingPageTemplate.count.mockResolvedValue(3);
      mockPrisma.productPage.count.mockResolvedValue(8);
      mockPrisma.order.findMany.mockResolvedValueOnce([recentOrder]); // Recent orders
      mockPrisma.order.findMany.mockResolvedValueOnce([]); // Revenue orders
      mockPrisma.orderItem.groupBy.mockResolvedValue([]);
      mockPrisma.order.groupBy.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data.recentOrders[0]).toMatchObject({
        id: "order-1",
        customerName: "John Doe",
        total: 50.99,
        status: "PENDING",
        productName: "Multiple Products", // Default when no items
      });
    });
  });
});

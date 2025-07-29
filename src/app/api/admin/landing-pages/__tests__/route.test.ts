import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    landingPage: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    landingPageTemplate: {
      findFirst: jest.fn(),
    },
    landingPageTemplateSection: {
      findMany: jest.fn(),
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

describe("Landing Pages API Route", () => {
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

  describe("GET /api/admin/landing-pages", () => {
    it("should return all landing pages with product and template details", async () => {
      const mockLandingPages = [
        {
          id: "landing-1",
          title: "Test Landing Page",
          slug: "test-landing-page",
          productId: "product-1",
          headline: "Amazing Product",
          description: "This is a test landing page",
          status: "DRAFT",
          templateId: "template-1",
          product: {
            id: "product-1",
            name: "Test Product",
          },
          template: {
            id: "template-1",
            name: "Default Template",
          },
          sections: [
            {
              id: "section-1",
              type: "HERO",
              title: "Hero Section",
              content: "Welcome to our product",
              order: 1,
            },
          ],
        },
      ];

      mockPrisma.landingPage.findMany.mockResolvedValue(mockLandingPages);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.landingPages).toEqual(mockLandingPages);
      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
          template: true,
          sections: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should handle empty landing pages list", async () => {
      mockPrisma.landingPage.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.landingPages).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockPrisma.landingPage.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch landing pages");
    });
  });

  describe("POST /api/admin/landing-pages", () => {
    it("should create a new landing page", async () => {
      const newLandingPage = {
        title: "New Landing Page",
        slug: "new-landing-page",
        productId: "product-2",
        headline: "New Product Headline",
        description: "A new landing page description",
        status: "DRAFT",
        templateId: "template-2",
        sections: {
          create: [
            {
              type: "HERO",
              title: "Hero Section",
              content: "Welcome to our new product",
              order: 1,
            },
          ],
        },
      };

      const createdLandingPage = { id: "new-landing-1", ...newLandingPage };
      mockPrisma.landingPage.create.mockResolvedValue(createdLandingPage);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify(newLandingPage),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.landingPage).toEqual(createdLandingPage);
      expect(mockPrisma.landingPage.create).toHaveBeenCalledWith({
        data: newLandingPage,
        include: {
          product: true,
          template: true,
          sections: true,
        },
      });
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.landingPage.create.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify({ title: "Test Landing Page" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create landing page");
    });
  });

  describe("PUT /api/admin/landing-pages", () => {
    it("should update an existing landing page", async () => {
      const updateData = {
        id: "landing-1",
        title: "Updated Landing Page",
        slug: "updated-landing-page",
        productId: "product-3",
        headline: "Updated Headline",
        description: "Updated description...",
        status: "PUBLISHED",
        templateId: "template-3",
      };

      const updatedLandingPage = { ...updateData };
      mockPrisma.landingPage.update.mockResolvedValue(updatedLandingPage);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.landingPage).toEqual(updatedLandingPage);
      expect(mockPrisma.landingPage.update).toHaveBeenCalledWith({
        where: { id: "landing-1" },
        data: {
          title: "Updated Landing Page",
          slug: "updated-landing-page",
          productId: "product-3",
          headline: "Updated Headline",
          description: "Updated description...",
          status: "PUBLISHED",
          templateId: "template-3",
        },
        include: {
          product: true,
          template: true,
          sections: true,
        },
      });
    });

    it("should return 400 error when landing page ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify({ title: "Updated Landing Page" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Landing page ID is required");
    });

    it("should handle landing page not found", async () => {
      mockPrisma.landingPage.update.mockRejectedValue(
        new Error("Landing page not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "non-existent",
            title: "Updated Landing Page",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update landing page");
    });
  });

  describe("DELETE /api/admin/landing-pages", () => {
    it("should delete a landing page", async () => {
      mockPrisma.landingPage.delete.mockResolvedValue({ id: "landing-1" });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages?id=landing-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Landing page deleted successfully");
      expect(mockPrisma.landingPage.delete).toHaveBeenCalledWith({
        where: { id: "landing-1" },
      });
    });

    it("should return 400 error when landing page ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "DELETE",
        }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Landing page ID is required");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.landingPage.delete.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages?id=landing-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete landing page");
    });
  });
});

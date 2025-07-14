import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  landingPage: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  landingPageTemplate: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  landingPageTemplateSection: {
    findMany: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Mock data
const mockLandingPage = {
  id: "landing-1",
  title: "Premium Headphones Landing",
  slug: "premium-headphones",
  productId: "product-1",
  headline: "Experience Sound Like Never Before",
  subheadline: null,
  description: "Discover the ultimate audio experience...",
  heroImage: "/placeholder.svg",
  status: "PUBLISHED" as "DRAFT" | "PUBLISHED",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  templateId: "template-1",
  product: {
    id: "product-1",
    name: "Premium Wireless Headphones",
  },
  template: {
    id: "template-1",
    name: "Modern Hero Template",
  },
};

describe("Landing Pages API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/landing-pages", () => {
    it("should return all landing pages with product and template details", async () => {
      (
        mockPrisma.landingPage.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPage.findMany
        >
      ).mockResolvedValue([mockLandingPage]);

      const response = await GET();
      const data = await response.json();

      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
          template: true,
          sections: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(data).toEqual([mockLandingPage]);
    });

    it("should handle database errors", async () => {
      (
        mockPrisma.landingPage.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPage.findMany
        >
      ).mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch landing pages");
    });

    it("should handle empty landing pages list", async () => {
      (
        mockPrisma.landingPage.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPage.findMany
        >
      ).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual([]);
    });
  });

  describe("POST /api/admin/landing-pages", () => {
    const createLandingPageData = {
      title: "New Landing Page",
      slug: "new-landing-page",
      productId: "product-2",
      headline: "New Headline",
      description: "New description...",
      status: "draft",
      templateId: "template-2",
    };

    it("should create a new landing page", async () => {
      // Mock the template sections lookup
      (
        mockPrisma.landingPageTemplateSection.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPageTemplateSection.findMany
        >
      ).mockResolvedValue([]);

      (
        mockPrisma.landingPage.create as jest.MockedFunction<
          typeof mockPrisma.landingPage.create
        >
      ).mockResolvedValue({
        ...mockLandingPage,
        ...createLandingPageData,
        id: "landing-2",
        status: "DRAFT",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify(createLandingPageData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(
        mockPrisma.landingPageTemplateSection.findMany
      ).toHaveBeenCalledWith({
        where: { templateId: "template-2" },
        orderBy: { order: "asc" },
      });

      expect(mockPrisma.landingPage.create).toHaveBeenCalledWith({
        data: {
          title: "New Landing Page",
          slug: "new-landing-page",
          productId: "product-2",
          headline: "New Headline",
          description: "New description...",
          status: "DRAFT",
          templateId: "template-2",
          sections: {
            create: [],
          },
        },
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      });

      expect(data).toMatchObject({ ...createLandingPageData, status: "DRAFT" });
    });

    it("should reject landing page creation without template", async () => {
      const landingPageWithoutTemplate = {
        ...createLandingPageData,
        templateId: undefined,
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify(landingPageWithoutTemplate),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Template is required");
    });

    it("should handle database errors during creation", async () => {
      (
        mockPrisma.landingPage.create as jest.MockedFunction<
          typeof mockPrisma.landingPage.create
        >
      ).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify(createLandingPageData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create landing page");
    });

    it("should handle invalid request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: "invalid json",
        }
      );

      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create landing page");
    });
  });

  describe("PUT /api/admin/landing-pages", () => {
    const updateLandingPageData = {
      title: "Updated Landing Page",
      slug: "updated-landing-page",
      productId: "product-3",
      headline: "Updated Headline",
      description: "Updated description...",
      status: "published",
      templateId: "template-3",
    };

    it("should update an existing landing page", async () => {
      (
        mockPrisma.landingPage.update as jest.MockedFunction<
          typeof mockPrisma.landingPage.update
        >
      ).mockResolvedValue({
        ...mockLandingPage,
        ...updateLandingPageData,
        status: "PUBLISHED",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "landing-1",
            ...updateLandingPageData,
          }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(mockPrisma.landingPage.update).toHaveBeenCalledWith({
        where: { id: "landing-1" },
        data: { ...updateLandingPageData, status: "PUBLISHED" },
      });

      expect(data).toMatchObject({
        ...updateLandingPageData,
        status: "PUBLISHED",
      });
    });

    it("should handle partial updates", async () => {
      const partialUpdate = {
        title: "Partially Updated",
        status: "PUBLISHED",
        templateId: "template-1", // Template is required
      };

      (
        mockPrisma.landingPage.update as jest.MockedFunction<
          typeof mockPrisma.landingPage.update
        >
      ).mockResolvedValue({
        ...mockLandingPage,
        ...partialUpdate,
        status: partialUpdate.status as "DRAFT" | "PUBLISHED",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "landing-1",
            ...partialUpdate,
          }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      // Prisma should be called with uppercase status
      expect(mockPrisma.landingPage.update).toHaveBeenCalledWith({
        where: { id: "landing-1" },
        data: {
          ...partialUpdate,
          status: "PUBLISHED",
        },
      });

      // Response should have uppercase status
      expect(data).toMatchObject({ ...partialUpdate, status: "PUBLISHED" });
    });

    it("should handle database errors during update", async () => {
      (
        mockPrisma.landingPage.update as jest.MockedFunction<
          typeof mockPrisma.landingPage.update
        >
      ).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "landing-1",
            ...updateLandingPageData,
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
      (
        mockPrisma.landingPage.delete as jest.MockedFunction<
          typeof mockPrisma.landingPage.delete
        >
      ).mockResolvedValue(mockLandingPage);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "DELETE",
          body: JSON.stringify({ id: "landing-1" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(mockPrisma.landingPage.delete).toHaveBeenCalledWith({
        where: { id: "landing-1" },
      });

      expect(data).toEqual({ ok: true });
    });

    it("should handle database errors during deletion", async () => {
      (
        mockPrisma.landingPage.delete as jest.MockedFunction<
          typeof mockPrisma.landingPage.delete
        >
      ).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "DELETE",
          body: JSON.stringify({ id: "landing-1" }),
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete landing page");
    });

    it("should handle invalid request body during deletion", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "DELETE",
          body: "invalid json",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete landing page");
    });
  });

  describe("Edge Cases", () => {
    it("should handle landing page with null templateId", async () => {
      const landingPageWithNullTemplate = {
        ...mockLandingPage,
        templateId: null,
        template: null,
      };

      (
        mockPrisma.landingPage.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPage.findMany
        >
      ).mockResolvedValue([landingPageWithNullTemplate]);

      const response = await GET();
      const data = await response.json();

      expect(data[0].templateId).toBeNull();
      expect(data[0].template).toBeNull();
    });

    it("should handle landing page with empty string values", async () => {
      const landingPageWithEmptyValues = {
        ...mockLandingPage,
        description: null,
        heroImage: null,
      };

      // Mock the template sections lookup
      (
        mockPrisma.landingPageTemplateSection.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPageTemplateSection.findMany
        >
      ).mockResolvedValue([]);

      (
        mockPrisma.landingPage.create as jest.MockedFunction<
          typeof mockPrisma.landingPage.create
        >
      ).mockResolvedValue(landingPageWithEmptyValues);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Page with Empty Values",
            slug: "page-with-empty-values",
            productId: "product-1",
            headline: "Headline",
            description: "",
            status: "draft",
            templateId: "template-1", // Template is required
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.description).toBe("");
    });

    it("should handle status case conversion", async () => {
      const landingPageWithUpperCaseStatus = {
        ...mockLandingPage,
        status: "PUBLISHED" as "DRAFT" | "PUBLISHED",
        subheadline: null,
        description: null,
        heroImage: null,
      };

      // Mock the template sections lookup
      (
        mockPrisma.landingPageTemplateSection.findMany as jest.MockedFunction<
          typeof mockPrisma.landingPageTemplateSection.findMany
        >
      ).mockResolvedValue([]);

      (
        mockPrisma.landingPage.create as jest.MockedFunction<
          typeof mockPrisma.landingPage.create
        >
      ).mockResolvedValue(landingPageWithUpperCaseStatus);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/landing-pages",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Page with Upper Case Status",
            slug: "page-with-upper-case-status",
            productId: "product-1",
            headline: "Headline",
            description: "Description",
            status: "published", // lowercase input
            templateId: "template-1", // Template is required
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.status).toBe("PUBLISHED");
    });
  });
});

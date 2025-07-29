import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    landingPageTemplate: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    landingPageTemplateSection: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
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

describe("Templates API Route", () => {
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

  describe("GET /api/admin/templates", () => {
    it("should return all templates with sections", async () => {
      const mockTemplates = [
        {
          id: "template-1",
          name: "Modern Hero Template",
          description: "A modern hero section template",
          category: "HERO",
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

      mockPrisma.landingPageTemplate.findMany.mockResolvedValue(mockTemplates);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.templates).toEqual(mockTemplates);
      expect(mockPrisma.landingPageTemplate.findMany).toHaveBeenCalledWith({
        include: {
          sections: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should handle empty templates list", async () => {
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.templates).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockPrisma.landingPageTemplate.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch templates");
    });
  });

  describe("POST /api/admin/templates", () => {
    it("should create a new template with sections", async () => {
      const newTemplate = {
        name: "New Template",
        description: "A new template description",
        category: "FEATURES",
        sections: [
          {
            type: "HERO",
            title: "Hero Section",
            content: "Welcome to our new template",
            order: 1,
          },
        ],
      };

      const createdTemplate = { id: "new-template-1", ...newTemplate };
      mockPrisma.landingPageTemplate.create.mockResolvedValue(createdTemplate);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify(newTemplate),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.template).toEqual(createdTemplate);
      expect(mockPrisma.landingPageTemplate.create).toHaveBeenCalledWith({
        data: {
          name: "New Template",
          description: "A new template description",
          category: "FEATURES",
          sections: {
            create: [
              {
                type: "HERO",
                title: "Hero Section",
                content: "Welcome to our new template",
                order: 1,
              },
            ],
          },
        },
        include: {
          sections: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    it("should handle database errors during creation", async () => {
      mockPrisma.landingPageTemplate.create.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify({ name: "Test Template" }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create template");
    });
  });

  describe("PUT /api/admin/templates", () => {
    it("should update an existing template", async () => {
      const updateData = {
        id: "template-1",
        name: "Updated Template",
        description: "Updated description...",
        category: "UPDATED",
      };

      const updatedTemplate = { ...updateData };
      mockPrisma.landingPageTemplate.update.mockResolvedValue(updatedTemplate);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.template).toEqual(updatedTemplate);
      expect(mockPrisma.landingPageTemplate.update).toHaveBeenCalledWith({
        where: { id: "template-1" },
        data: {
          name: "Updated Template",
          description: "Updated description...",
          category: "UPDATED",
        },
        include: {
          sections: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    it("should return 400 error when template ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated Template" }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Template ID is required");
    });

    it("should handle template not found", async () => {
      mockPrisma.landingPageTemplate.update.mockRejectedValue(
        new Error("Template not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "PUT",
          body: JSON.stringify({
            id: "non-existent",
            name: "Updated Template",
          }),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update template");
    });
  });

  describe("DELETE /api/admin/templates", () => {
    it("should delete a template and its sections", async () => {
      mockPrisma.landingPageTemplate.delete.mockResolvedValue({
        id: "template-1",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Template deleted successfully");
      expect(mockPrisma.landingPageTemplate.delete).toHaveBeenCalledWith({
        where: { id: "template-1" },
      });
    });

    it("should return 400 error when template ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "DELETE",
        }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Template ID is required");
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.landingPageTemplate.delete.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        { method: "DELETE" }
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete template");
    });
  });
});

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  landingPageTemplate: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  landingPageTemplateSection: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  landingPage: {
    findMany: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma> & {
  landingPageTemplate: {
    findMany: jest.MockedFunction<typeof prisma.landingPageTemplate.findMany>;
    findFirst: jest.MockedFunction<typeof prisma.landingPageTemplate.findFirst>;
    findUnique: jest.MockedFunction<
      typeof prisma.landingPageTemplate.findUnique
    >;
    create: jest.MockedFunction<typeof prisma.landingPageTemplate.create>;
    update: jest.MockedFunction<typeof prisma.landingPageTemplate.update>;
    delete: jest.MockedFunction<typeof prisma.landingPageTemplate.delete>;
  };
  landingPageTemplateSection: {
    deleteMany: jest.MockedFunction<
      typeof prisma.landingPageTemplateSection.deleteMany
    >;
    createMany: jest.MockedFunction<
      typeof prisma.landingPageTemplateSection.createMany
    >;
  };
  landingPage: {
    findMany: jest.MockedFunction<typeof prisma.landingPage.findMany>;
  };
};

// Mock data
const mockSection = {
  id: "section-1",
  templateId: "template-1",
  type: "HERO" as const,
  title: "Hero Section",
  content: "Main hero section",
  image: null,
  settings: {},
  order: 0,
};

const mockTemplate = {
  id: "template-1",
  name: "Modern Hero Template",
  description: "A modern hero template",
  thumbnail: "/placeholder.svg",
  isDefault: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  sections: [mockSection],
};

describe("Templates API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/templates", () => {
    it("should return all templates with sections", async () => {
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([mockTemplate]);

      const response = await GET();
      const data = await response.json();

      expect(mockPrisma.landingPageTemplate.findMany).toHaveBeenCalledWith({
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(data).toEqual([mockTemplate]);
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
    const createTemplateData = {
      name: "New Template",
      description: "New template description",
      thumbnail: "/new-thumbnail.svg",
      isDefault: false,
      sections: [
        {
          name: "New Section",
          type: "hero",
          description: "New section description",
          content: { title: "Welcome" },
        },
      ],
    };

    it("should create a new template with sections", async () => {
      mockPrisma.landingPageTemplate.findFirst.mockResolvedValue(null);
      mockPrisma.landingPageTemplate.create.mockResolvedValue({
        ...mockTemplate,
        ...createTemplateData,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify(createTemplateData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.landingPageTemplate.findFirst).toHaveBeenCalledWith({
        where: { name: "New Template" },
      });

      expect(mockPrisma.landingPageTemplate.create).toHaveBeenCalledWith({
        data: {
          name: "New Template",
          description: "New template description",
          thumbnail: "/new-thumbnail.svg",
          isDefault: false,
          sections: {
            create: [
              {
                type: "HERO",
                title: "New Section",
                content: "New section description",
                order: 0,
                settings: {},
              },
            ],
          },
        },
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      });

      expect(data).toMatchObject(createTemplateData);
    });

    it("should return error if template name already exists", async () => {
      mockPrisma.landingPageTemplate.findFirst.mockResolvedValue(mockTemplate);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify(createTemplateData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Template with this name already exists");
    });

    it("should handle template creation without sections", async () => {
      const templateWithoutSections = {
        name: "Template Without Sections",
        description: "Description",
        thumbnail: "/thumbnail.svg",
        isDefault: false,
      };

      mockPrisma.landingPageTemplate.findFirst.mockResolvedValue(null);
      mockPrisma.landingPageTemplate.create.mockResolvedValue({
        ...mockTemplate,
        ...templateWithoutSections,
        sections: [],
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify(templateWithoutSections),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data).toMatchObject(templateWithoutSections);
    });
  });

  describe("PUT /api/admin/templates", () => {
    const updateTemplateData = {
      name: "Updated Template",
      description: "Updated description",
      thumbnail: "/updated-thumbnail.svg",
      isDefault: false,
      sections: [
        {
          name: "Updated Section",
          type: "hero",
          description: "Updated section description",
          content: { title: "Updated Welcome" },
        },
      ],
    };

    it("should update an existing template", async () => {
      mockPrisma.landingPageTemplate.update.mockResolvedValue({
        ...mockTemplate,
        ...updateTemplateData,
        updatedAt: new Date("2024-01-02"),
      });
      mockPrisma.landingPageTemplate.findUnique.mockResolvedValue({
        ...mockTemplate,
        ...updateTemplateData,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        {
          method: "PUT",
          body: JSON.stringify(updateTemplateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(mockPrisma.landingPageTemplate.update).toHaveBeenCalledWith({
        where: { id: "template-1" },
        data: {
          name: "Updated Template",
          description: "Updated description",
          thumbnail: "/updated-thumbnail.svg",
          isDefault: false,
          updatedAt: expect.any(Date),
        },
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      });

      expect(
        mockPrisma.landingPageTemplateSection.deleteMany
      ).toHaveBeenCalledWith({
        where: { templateId: "template-1" },
      });

      expect(
        mockPrisma.landingPageTemplateSection.createMany
      ).toHaveBeenCalledWith({
        data: [
          {
            templateId: "template-1",
            type: "HERO",
            title: "Updated Section",
            content: "Updated section description",
            order: 0,
            settings: {},
          },
        ],
      });

      expect(data).toMatchObject(updateTemplateData);
    });

    it("should return 400 error when template ID is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "PUT",
          body: JSON.stringify(updateTemplateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Template ID is required");
    });

    it("should update template without sections", async () => {
      const templateWithoutSections = {
        name: "Template Without Sections",
        description: "Description",
        thumbnail: "/thumbnail.svg",
        isDefault: false,
      };

      mockPrisma.landingPageTemplate.update.mockResolvedValue({
        ...mockTemplate,
        ...templateWithoutSections,
      });
      mockPrisma.landingPageTemplate.findUnique.mockResolvedValue({
        ...mockTemplate,
        ...templateWithoutSections,
        sections: [],
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        {
          method: "PUT",
          body: JSON.stringify(templateWithoutSections),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(
        mockPrisma.landingPageTemplateSection.deleteMany
      ).not.toHaveBeenCalled();
      expect(
        mockPrisma.landingPageTemplateSection.createMany
      ).not.toHaveBeenCalled();

      expect(data).toMatchObject(templateWithoutSections);
    });
  });

  describe("DELETE /api/admin/templates", () => {
    it("should delete a template and its sections", async () => {
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplateSection.deleteMany.mockResolvedValue({
        count: 2,
      });
      mockPrisma.landingPageTemplate.delete.mockResolvedValue(mockTemplate);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(mockPrisma.landingPage.findMany).toHaveBeenCalledWith({
        where: { templateId: "template-1" },
      });

      expect(
        mockPrisma.landingPageTemplateSection.deleteMany
      ).toHaveBeenCalledWith({
        where: { templateId: "template-1" },
      });

      expect(mockPrisma.landingPageTemplate.delete).toHaveBeenCalledWith({
        where: { id: "template-1" },
      });

      expect(data).toEqual({ success: true });
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

    it("should prevent deletion if template is being used by landing pages", async () => {
      mockPrisma.landingPage.findMany.mockResolvedValue([
        {
          id: "landing-1",
          title: "Landing Page 1",
          productId: "product-1",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "DRAFT" as const,
          templateId: null,
          slug: "landing-page-1",
          headline: null,
          subheadline: null,
          heroImage: null,
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Cannot delete template that is being used by landing pages"
      );

      expect(
        mockPrisma.landingPageTemplateSection.deleteMany
      ).not.toHaveBeenCalled();
      expect(mockPrisma.landingPageTemplate.delete).not.toHaveBeenCalled();
    });

    it("should handle database errors during deletion", async () => {
      mockPrisma.landingPage.findMany.mockResolvedValue([]);
      mockPrisma.landingPageTemplateSection.deleteMany.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates?id=template-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete template");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty templates list", async () => {
      mockPrisma.landingPageTemplate.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual([]);
    });

    it("should handle template with empty sections array", async () => {
      const templateWithEmptySections = {
        ...mockTemplate,
        sections: [],
      };

      mockPrisma.landingPageTemplate.create.mockResolvedValue(
        templateWithEmptySections
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Empty Sections Template",
            description: "Template with no sections",
            sections: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.sections).toEqual([]);
    });

    it("should handle invalid request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/templates",
        {
          method: "POST",
          body: "invalid json",
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create template");
    });
  });
});

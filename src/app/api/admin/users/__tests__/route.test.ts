import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "hashedPassword"),
}));

const mockPrisma = require("@/lib/prisma").default;
const mockBcrypt = require("bcryptjs");

describe("Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/users", () => {
    it("should return all sub-users", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          role: "ADMIN",
          parentId: "singleton",
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: [],
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { parentId: "singleton" },
        include: { permissions: true },
      });
    });

    it("should handle errors", async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch sub-users");
    });
  });

  describe("POST /api/admin/users", () => {
    it("should create a new sub-user", async () => {
      const userData = {
        name: "New User",
        email: "new@example.com",
        password: "password123",
        permissions: [
          {
            resource: "ORDER",
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        ],
      };

      const mockCreatedUser = {
        id: "user-2",
        name: userData.name,
        email: userData.email,
        role: "ADMIN",
        parentId: "singleton",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: userData.permissions,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        ...mockCreatedUser,
        password: undefined,
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: "hashedPassword",
          role: "ADMIN",
          parentId: "singleton",
          permissions: {
            create: userData.permissions,
          },
        },
        include: {
          permissions: true,
        },
      });
    });

    it("should return error if required fields are missing", async () => {
      const userData = {
        name: "New User",
        // Missing email and password
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name, email, and password are required");
    });

    it("should return error if email already exists", async () => {
      const userData = {
        name: "New User",
        email: "existing@example.com",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
        email: "existing@example.com",
      });

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User with this email already exists");
    });
  });

  describe("PUT /api/admin/users", () => {
    it("should update a sub-user", async () => {
      const updateData = {
        id: "user-1",
        name: "Updated User",
        email: "updated@example.com",
        permissions: [
          {
            resource: "PRODUCT",
            canView: true,
            canCreate: true,
            canEdit: false,
            canDelete: false,
          },
        ],
      };

      const mockExistingUser = {
        id: "user-1",
        parentId: "singleton",
      };

      const mockUpdatedUser = {
        id: "user-1",
        name: "Updated User",
        email: "updated@example.com",
        role: "ADMIN",
        parentId: "singleton",
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: updateData.permissions,
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockExistingUser);
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockUpdatedUser);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        ...mockUpdatedUser,
        password: undefined,
      });
      expect(mockPrisma.permission.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      expect(mockPrisma.permission.createMany).toHaveBeenCalledWith({
        data: updateData.permissions.map((perm: any) => ({
          userId: "user-1",
          resource: perm.resource,
          canView: perm.canView,
          canCreate: perm.canCreate,
          canEdit: perm.canEdit,
          canDelete: perm.canDelete,
        })),
      });
    });

    it("should return error if user ID is missing", async () => {
      const updateData = {
        name: "Updated User",
        email: "updated@example.com",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User ID is required");
    });

    it("should return error if sub-user not found", async () => {
      const updateData = {
        id: "non-existent",
        name: "Updated User",
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Sub-user not found");
    });
  });

  describe("DELETE /api/admin/users", () => {
    it("should delete a sub-user", async () => {
      const userId = "user-1";
      const mockExistingUser = {
        id: userId,
        parentId: "singleton",
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockExistingUser);
      mockPrisma.user.delete.mockResolvedValue({});

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users?id=${userId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Sub-user deleted successfully");
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should return error if user ID is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User ID is required");
    });

    it("should return error if sub-user not found", async () => {
      const userId = "non-existent";

      mockPrisma.user.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users?id=${userId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Sub-user not found");
    });
  });
});

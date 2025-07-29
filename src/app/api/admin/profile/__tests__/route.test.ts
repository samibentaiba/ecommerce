import { createMocks } from "node-mocks-http";
import { GET, PUT } from "../route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productImage: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock next-auth and ESM dependencies to avoid ESM import errors
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));
jest.mock("openid-client", () => ({}));
jest.mock("jose", () => ({}));
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const { getServerSession } = require("next-auth");

const mockUser = {
  id: "user-id",
  name: "Test User",
  email: "test@example.com",
  image: "image-url",
  role: "user",
  password: "hashed-password",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductImage = {
  id: "img-123",
  url: "/api/images/img-123",
  alt: "Test User",
  isPrimary: true,
  data: Buffer.from("test"),
};

describe("Profile API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if user not found", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com" },
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("User not found");
    });

    it("should return user data if authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com" },
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.email).toBe("test@example.com");
      expect(data).not.toHaveProperty("password");
    });

    it("should handle internal server error", async () => {
      (getServerSession as jest.Mock).mockImplementation(() => {
        throw new Error("fail");
      });
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("PUT", () => {
    const baseSession = { user: { email: "test@example.com" } };
    const baseForm = {
      name: "New Name",
      email: "new@example.com",
      currentPassword: "current",
      newPassword: "newpass",
      profileImage: null,
    };

    function createFormData(overrides = {}) {
      const data = { ...baseForm, ...overrides };
      return {
        get: (key: string) => data[key],
      };
    }

    it("should return 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const req = { formData: jest.fn() } as any;
      const res = await PUT(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if name or email missing", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      const req = {
        formData: jest
          .fn()
          .mockResolvedValue(createFormData({ name: "", email: "" })),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Name and email are required");
    });

    it("should return 404 if user not found", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const req = {
        formData: jest.fn().mockResolvedValue(createFormData()),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("User not found");
    });

    it("should return 400 if email already in use", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce({ ...mockUser, email: "new@example.com" }); // existing user
      const req = {
        formData: jest.fn().mockResolvedValue(createFormData()),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Email already in use");
    });

    it("should return 400 if changing password but no current password", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce(null); // email not in use
      const req = {
        formData: jest
          .fn()
          .mockResolvedValue(
            createFormData({ newPassword: "newpass", currentPassword: "" })
          ),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe(
        "Current password is required to change password"
      );
    });
    it("should return 400 if current password is incorrect", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce(null); // email not in use
      const bcrypt = require("bcryptjs");
      bcrypt.compare.mockResolvedValue(false);
      const req = {
        formData: jest.fn().mockResolvedValue(createFormData()),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Current password is incorrect");
    });
    it("should update user and return success (no password change, no image)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce(null); // email not in use
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: "New Name",
        email: "new@example.com",
      });
      const req = {
        formData: jest
          .fn()
          .mockResolvedValue(
            createFormData({ newPassword: "", profileImage: null })
          ),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Profile updated successfully");
      expect(data.user.name).toBe("New Name");
    });
    it("should update user and return success (with password change)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce(null); // email not in use
      const bcrypt = require("bcryptjs");
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashed-newpass");
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: "New Name",
        email: "new@example.com",
      });
      const req = {
        formData: jest.fn().mockResolvedValue(createFormData()),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Profile updated successfully");
    });
    it("should update user and return success (with image upload)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // current user
        .mockResolvedValueOnce(null); // email not in use
      (prisma.productImage.create as jest.Mock).mockResolvedValue({
        id: mockProductImage.id,
      });
      (prisma.productImage.update as jest.Mock).mockResolvedValue(
        mockProductImage
      );
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        profileImageId: mockProductImage.id,
        image: `/api/images/${mockProductImage.id}`,
      });
      const req = {
        formData: jest
          .fn()
          .mockResolvedValue(
            createFormData({
              profileImage: {
                arrayBuffer: async () => Buffer.from("test"),
                type: "image/png",
              },
            })
          ),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Profile updated successfully");
      expect(data.user.image).toBe(`/api/images/${mockProductImage.id}`);
      expect(data.user.profileImageId).toBe(mockProductImage.id);
    });

    it("should handle internal server error", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(baseSession);
      (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
        throw new Error("fail");
      });
      const req = {
        formData: jest.fn().mockResolvedValue(createFormData()),
      } as any;
      const res = await PUT(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Internal server error");
    });
  });
});

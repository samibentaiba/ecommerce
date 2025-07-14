import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  appSettings: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
}));

import prisma from "@/lib/prisma";
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Mock data
const mockSettings = {
  id: "singleton",
  payload: {
    storeName: "EcoStore",
    storeEmail: "contact@ecostore.com",
    currency: "USD",
    taxRate: "8.5",
    emailNotifications: true,
    darkMode: false,
  },
  updatedAt: new Date("2024-01-01"),
};

const mockEmptySettings = {
  id: "singleton",
  payload: {},
  updatedAt: new Date("2024-01-01"),
};

describe("Settings API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/settings", () => {
    it("should return existing settings", async () => {
      (mockPrisma.appSettings.findUnique as jest.Mock).mockResolvedValue(
        mockSettings
      );

      const response = await GET();
      const data = await response.json();

      expect(mockPrisma.appSettings.findUnique).toHaveBeenCalledWith({
        where: { id: "singleton" },
      });

      expect(data).toEqual(mockSettings);
    });

    it("should return empty payload when no settings exist", async () => {
      (mockPrisma.appSettings.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({ payload: {} });
    });

    it("should handle database errors", async () => {
      (mockPrisma.appSettings.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch settings");
    });
  });

  describe("POST /api/admin/settings", () => {
    const newSettings = {
      storeName: "NewStore",
      storeEmail: "new@store.com",
      currency: "EUR",
    };

    it("should create new settings when none exist", async () => {
      (mockPrisma.appSettings.upsert as jest.Mock).mockResolvedValue({
        ...mockSettings,
        payload: newSettings,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(newSettings),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { id: "singleton" },
        update: {
          payload: newSettings,
          updatedAt: expect.any(Date),
        },
        create: {
          id: "singleton",
          payload: newSettings,
        },
      });

      expect(data.payload).toEqual(newSettings);
    });

    it("should update existing settings", async () => {
      const updatedSettings = {
        ...mockSettings.payload,
        storeName: "UpdatedStore",
      };

      (mockPrisma.appSettings.upsert as jest.Mock).mockResolvedValue({
        ...mockSettings,
        payload: updatedSettings,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(updatedSettings),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.payload).toEqual(updatedSettings);
    });

    it("should handle invalid JSON in request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: "invalid json",
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to save settings");
    });

    it("should handle database errors", async () => {
      (mockPrisma.appSettings.upsert as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(newSettings),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to save settings");
    });
  });

  describe("PUT /api/admin/settings", () => {
    const updateSettings = {
      storeName: "UpdatedStore",
      currency: "GBP",
    };

    it("should update existing settings", async () => {
      (mockPrisma.appSettings.update as jest.Mock).mockResolvedValue({
        ...mockSettings,
        payload: updateSettings,
        updatedAt: new Date("2024-01-02"),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "PUT",
          body: JSON.stringify(updateSettings),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(mockPrisma.appSettings.update).toHaveBeenCalledWith({
        where: { id: "singleton" },
        data: {
          payload: updateSettings,
          updatedAt: expect.any(Date),
        },
      });

      expect(data.payload).toEqual(updateSettings);
    });

    it("should handle invalid JSON in request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "PUT",
          body: "invalid json",
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update settings");
    });

    it("should handle database errors", async () => {
      (mockPrisma.appSettings.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "PUT",
          body: JSON.stringify(updateSettings),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update settings");
    });
  });

  describe("DELETE /api/admin/settings", () => {
    it("should reset settings to empty payload", async () => {
      (mockPrisma.appSettings.update as jest.Mock).mockResolvedValue(
        mockEmptySettings
      );

      const response = await DELETE();
      const data = await response.json();

      expect(mockPrisma.appSettings.update).toHaveBeenCalledWith({
        where: { id: "singleton" },
        data: {
          payload: {},
          updatedAt: expect.any(Date),
        },
      });

      expect(data.payload).toEqual({});
    });

    it("should handle database errors", async () => {
      (mockPrisma.appSettings.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to reset settings");
    });
  });

  describe("Edge Cases", () => {
    it("should handle complex nested payload", async () => {
      const complexSettings = {
        store: {
          name: "ComplexStore",
          contact: {
            email: "contact@complex.com",
            phone: "+1234567890",
          },
        },
        features: {
          darkMode: true,
          notifications: {
            email: true,
            sms: false,
          },
        },
        array: [1, 2, 3, "test"],
      };

      (mockPrisma.appSettings.upsert as jest.Mock).mockResolvedValue({
        ...mockSettings,
        payload: complexSettings,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(complexSettings),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.payload).toEqual(complexSettings);
    });

    it("should handle empty payload", async () => {
      (mockPrisma.appSettings.upsert as jest.Mock).mockResolvedValue(
        mockEmptySettings
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.payload).toEqual({});
    });

    it("should handle null and undefined values in payload", async () => {
      const settingsWithNulls = {
        storeName: "TestStore",
        description: null,
        optionalField: undefined,
        emptyString: "",
        zero: 0,
        falseValue: false,
      };

      (mockPrisma.appSettings.upsert as jest.Mock).mockResolvedValue({
        ...mockSettings,
        payload: settingsWithNulls,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(settingsWithNulls),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(data.payload).toEqual(settingsWithNulls);
    });
  });
});

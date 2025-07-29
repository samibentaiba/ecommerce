import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "../hook";
import { useToast } from "@/hooks/use-toast";

// Mock the toast hook
jest.mock("@/hooks/use-toast");
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// Mock fetch
global.fetch = jest.fn();

describe("useSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize with default settings", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      // Store Settings
      storeName: "EcoStore",
      storeDescription: "Your trusted partner for quality products and exceptional service.",
      storeEmail: "contact@ecostore.com",
      storePhone: "+1 (555) 123-4567",
      storeAddress: "123 Commerce Street, Business City, BC 12345",

      // SEO Settings
      siteTitle: "EcoStore - Quality Products for Modern Life",
      siteDescription: "Discover amazing products with exceptional quality and service. Shop electronics, lifestyle products, and more.",
      siteKeywords: "ecommerce, electronics, lifestyle, quality products",

      // Email Settings
      emailNotifications: true,
      orderConfirmations: true,
      marketingEmails: false,
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUsername: "",
      smtpPassword: "",

      // Payment Settings
      currency: "USD",
      taxRate: "8.5",
      shippingRate: "9.99",
      freeShippingThreshold: "50.00",

      // Theme Settings
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
      darkMode: false,

      // Security Settings
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordRequirements: true,

      // Analytics
      googleAnalyticsId: "",
      facebookPixelId: "",
      enableTracking: true,
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.saving).toBe(false);
  });

  it("should fetch settings on mount", async () => {
    const mockSettings = {
      storeName: "Test Store",
      storeEmail: "test@example.com",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: mockSettings }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/settings");
    expect(result.current.settings.storeName).toBe("Test Store");
    expect(result.current.settings.storeEmail).toBe("test@example.com");
  });

  it("should handle fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load settings. Using default values.",
      variant: "destructive",
    });
  });

  it("should update a single setting", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSetting("storeName", "New Store Name");
    });

    expect(result.current.settings.storeName).toBe("New Store Name");
  });

  it("should update multiple settings", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSettings({
        storeName: "Updated Store",
        storeEmail: "updated@example.com",
        darkMode: true,
      });
    });

    expect(result.current.settings.storeName).toBe("Updated Store");
    expect(result.current.settings.storeEmail).toBe("updated@example.com");
    expect(result.current.settings.darkMode).toBe(true);
  });

  it("should save settings successfully", async () => {
    // Mock the initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: {} }),
    });
    // Mock the save operation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveSettings();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.current.settings),
    });
    expect(saveResult).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Settings Saved",
      description: "All settings have been saved successfully.",
    });
  });

  it("should save settings with section parameter", async () => {
    // Mock the initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: {} }),
    });
    // Mock the save operation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveSettings("Store");
    });

    expect(saveResult).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Settings Saved",
      description: "Store settings have been updated successfully.",
    });
  });

  it("should handle save error", async () => {
    // Mock the initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: {} }),
    });
    // Mock the save operation with error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveSettings();
    });

    expect(saveResult).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to save settings. Please try again.",
      variant: "destructive",
    });
  });

  it("should reset settings successfully", async () => {
    // Mock the initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: {} }),
    });
    // Mock the reset operation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First update some settings
    act(() => {
      result.current.updateSetting("storeName", "Custom Store");
    });

    expect(result.current.settings.storeName).toBe("Custom Store");

    // Then reset
    let resetResult: boolean | undefined;
    await act(async () => {
      resetResult = await result.current.resetSettings();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/settings", {
      method: "DELETE",
    });
    expect(resetResult).toBe(true);
    expect(result.current.settings.storeName).toBe("EcoStore");
    expect(mockToast).toHaveBeenCalledWith({
      title: "Settings Reset",
      description: "Settings have been reset to default values.",
    });
  });

  it("should handle reset error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useSettings());

    let resetResult: boolean | undefined;
    await act(async () => {
      resetResult = await result.current.resetSettings();
    });

    expect(resetResult).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to reset settings. Please try again.",
      variant: "destructive",
    });
  });

  it("should handle network error during save", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSettings());

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveSettings();
    });

    expect(saveResult).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to save settings. Please try again.",
      variant: "destructive",
    });
  });

  it("should handle network error during reset", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSettings());

    let resetResult: boolean | undefined;
    await act(async () => {
      resetResult = await result.current.resetSettings();
    });

    expect(resetResult).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to reset settings. Please try again.",
      variant: "destructive",
    });
  });

  it("should merge fetched settings with defaults", async () => {
    const partialSettings = {
      storeName: "Partial Store",
      storeEmail: "partial@example.com",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: partialSettings }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have the fetched values
    expect(result.current.settings.storeName).toBe("Partial Store");
    expect(result.current.settings.storeEmail).toBe("partial@example.com");
    
    // Should still have default values for other fields
    expect(result.current.settings.storePhone).toBe("+1 (555) 123-4567");
    expect(result.current.settings.currency).toBe("USD");
  });

  it("should use defaults when API returns empty payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payload: {} }),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings.storeName).toBe("EcoStore");
    expect(result.current.settings.storeEmail).toBe("contact@ecostore.com");
  });

  it("should use defaults when API returns no payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings.storeName).toBe("EcoStore");
    expect(result.current.settings.storeEmail).toBe("contact@ecostore.com");
  });

  it("should handle sub-user management operations", async () => {
    const mockSubUser = {
      id: "sub-user-1",
      name: "Test Sub-User",
      email: "test@example.com",
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: [
        {
          id: "perm-1",
          userId: "sub-user-1",
          resource: "PRODUCT" as const,
          canView: true,
          canCreate: true,
          canEdit: false,
          canDelete: false,
        },
      ],
    };

    // Mock create sub-user
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockSubUser, message: "Sub-user created successfully" }),
    });

    const { result } = renderHook(() => useSettings());

    let createResult: SubUser | null | undefined;
    await act(async () => {
      createResult = await result.current.createSubUser({
        name: "Test Sub-User",
        email: "test@example.com",
        password: "password123",
        permissions: mockSubUser.permissions,
      });
    });

    expect(createResult).toEqual(mockSubUser);
    expect(result.current.subUsers).toContain(mockSubUser);

    // Mock update sub-user
    const updatedUser = { ...mockSubUser, name: "Updated Sub-User" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: updatedUser, message: "Sub-user updated successfully" }),
    });

    let updateResult: SubUser | null | undefined;
    await act(async () => {
      updateResult = await result.current.updateSubUser({
        id: "sub-user-1",
        name: "Updated Sub-User",
      });
    });

    expect(updateResult).toEqual(updatedUser);
    expect(result.current.subUsers).toContain(updatedUser);

    // Mock delete sub-user
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Sub-user deleted successfully" }),
    });

    let deleteResult: boolean | undefined;
    await act(async () => {
      deleteResult = await result.current.deleteSubUser("sub-user-1");
    });

    expect(deleteResult).toBe(true);
    expect(result.current.subUsers).not.toContain(updatedUser);
  });

  it("should handle sub-user management errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email already exists" }),
    });

    const { result } = renderHook(() => useSettings());

    let createResult: SubUser | null | undefined;
    await act(async () => {
      createResult = await result.current.createSubUser({
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
        permissions: [],
      });
    });

    expect(createResult).toBeNull();
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Email already exists",
      variant: "destructive",
    });
  });
}); 
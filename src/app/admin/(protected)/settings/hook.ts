import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResourceType } from "@prisma/client";

export interface Settings {
  // Store Settings
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;

  // SEO Settings
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;

  // Email Settings
  emailNotifications: boolean;
  orderConfirmations: boolean;
  marketingEmails: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;

  // Payment Settings
  currency: string;
  taxRate: string;
  shippingRate: string;
  freeShippingThreshold: string;

  // Theme Settings
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;

  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordRequirements: boolean;

  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  enableTracking: boolean;
}

export interface SubUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  userId: string;
  resource: ResourceType;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateSubUserData {
  name: string;
  email: string;
  password: string;
  permissions: Permission[];
}

export interface UpdateSubUserData {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  permissions?: Permission[];
}

const defaultSettings: Settings = {
  // Store Settings
  storeName: "EcoStore",
  storeDescription:
    "Your trusted partner for quality products and exceptional service.",
  storeEmail: "contact@ecostore.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Commerce Street, Business City, BC 12345",

  // SEO Settings
  siteTitle: "EcoStore - Quality Products for Modern Life",
  siteDescription:
    "Discover amazing products with exceptional quality and service. Shop electronics, lifestyle products, and more.",
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
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sub-user management state
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [subUsersLoading, setSubUsersLoading] = useState(false);
  const [subUsersSaving, setSubUsersSaving] = useState(false);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      if (data.payload && Object.keys(data.payload).length > 0) {
        // Merge with defaults to ensure all fields are present
        setSettings({ ...defaultSettings, ...data.payload });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Using default values.",
        variant: "destructive",
      });
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Save settings to API
  const saveSettings = useCallback(
    async (section?: string) => {
      try {
        setSaving(true);
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        });

        if (!response.ok) {
          throw new Error("Failed to save settings");
        }

        toast({
          title: "Settings Saved",
          description: section
            ? `${section} settings have been updated successfully.`
            : "All settings have been saved successfully.",
        });

        return true;
      } catch (error) {
        console.error("Error saving settings:", error);
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [settings, toast]
  );

  // Update a single setting field
  const updateSetting = useCallback(
    (field: keyof Settings, value: string | boolean) => {
      setSettings((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple settings at once
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reset settings");
      }

      setSettings(defaultSettings);
      toast({
        title: "Settings Reset",
        description: "Settings have been reset to default values.",
      });

      return true;
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  // Fetch sub-users
  const fetchSubUsers = useCallback(async () => {
    try {
      setSubUsersLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to fetch sub-users");
      }

      const data = await response.json();
      setSubUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching sub-users:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-users.",
        variant: "destructive",
      });
    } finally {
      setSubUsersLoading(false);
    }
  }, [toast]);

  // Create sub-user
  const createSubUser = useCallback(
    async (userData: CreateSubUserData) => {
      try {
        setSubUsersSaving(true);
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create sub-user");
        }

        const data = await response.json();
        setSubUsers((prev) => [...prev, data.user]);

        toast({
          title: "Success",
          description: "Sub-user created successfully.",
        });

        return data.user;
      } catch (error) {
        console.error("Error creating sub-user:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to create sub-user.",
          variant: "destructive",
        });
        return null;
      } finally {
        setSubUsersSaving(false);
      }
    },
    [toast]
  );

  // Update sub-user
  const updateSubUser = useCallback(
    async (userData: UpdateSubUserData) => {
      try {
        setSubUsersSaving(true);
        const response = await fetch("/api/admin/users", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update sub-user");
        }

        const data = await response.json();
        setSubUsers((prev) =>
          prev.map((user) => (user.id === userData.id ? data.user : user))
        );

        toast({
          title: "Success",
          description: "Sub-user updated successfully.",
        });

        return data.user;
      } catch (error) {
        console.error("Error updating sub-user:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update sub-user.",
          variant: "destructive",
        });
        return null;
      } finally {
        setSubUsersSaving(false);
      }
    },
    [toast]
  );

  // Delete sub-user
  const deleteSubUser = useCallback(
    async (userId: string) => {
      try {
        setSubUsersSaving(true);
        const response = await fetch(`/api/admin/users?id=${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete sub-user");
        }

        setSubUsers((prev) => prev.filter((user) => user.id !== userId));

        toast({
          title: "Success",
          description: "Sub-user deleted successfully.",
        });

        return true;
      } catch (error) {
        console.error("Error deleting sub-user:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete sub-user.",
          variant: "destructive",
        });
        return false;
      } finally {
        setSubUsersSaving(false);
      }
    },
    [toast]
  );

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Load sub-users on mount
  useEffect(() => {
    fetchSubUsers();
  }, [fetchSubUsers]);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    fetchSettings,
    // Sub-user management
    subUsers,
    subUsersLoading,
    subUsersSaving,
    fetchSubUsers,
    createSubUser,
    updateSubUser,
    deleteSubUser,
  };
};

"use client";

import { useState, useEffect, useMemo } from "react";
import type { LandingPageTemplate, TemplateSection } from "@/lib/types";

export function useTemplates() {
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<LandingPageTemplate | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<LandingPageTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "/placeholder.svg?height=200&width=300",
    isDefault: false,
  });

  // Load templates from API
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.description) {
      setError("Please fill in all required fields: Name and Description");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingTemplate) {
        // Update
        const res = await fetch(
          `/api/admin/templates?id=${editingTemplate.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update template");
        }
        const updated = await res.json();
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        // Create
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create template");
        }
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: LandingPageTemplate) => {
    // Reset form first to clear any previous data
    resetForm();

    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      thumbnail: template.thumbnail,
      isDefault: template.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/templates?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete template");
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (template: LandingPageTemplate) => {
    try {
      setLoading(true);
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
      };
      const { id, createdAt, ...templateWithoutId } = duplicatedTemplate;

      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateWithoutId),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to duplicate template");
      }
      const created = await res.json();
      setTemplates((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildTemplate = (template?: LandingPageTemplate) => {
    setEditingTemplate(template || null);
    setIsBuilderOpen(true);
  };

  const handleSaveTemplate = async (template: Partial<LandingPageTemplate>) => {
    try {
      setLoading(true);
      setError(null);

      if (editingTemplate) {
        // Update existing template
        const res = await fetch(
          `/api/admin/templates?id=${editingTemplate.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(template),
          }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update template");
        }
        const updated = await res.json();
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        // Create new template
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(template),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create template");
        }
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
      }
      setIsBuilderOpen(false);
      setEditingTemplate(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (template: LandingPageTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      try {
        await handleDelete(templateToDelete.id.toString());
        setShowDeleteDialog(false);
        setTemplateToDelete(null);
      } catch (error) {
        console.error("Delete failed:", error);
        // Keep the dialog open so user can try again or cancel
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: false,
    });
  };

  // Filtered templates based on search and status
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "default" && template.isDefault) ||
        (statusFilter === "custom" && !template.isDefault);

      return matchesSearch && matchesStatus;
    });
  }, [templates, searchTerm, statusFilter]);

  return {
    // State
    templates: filteredTemplates,
    loading,
    error,
    isDialogOpen,
    isBuilderOpen,
    editingTemplate,
    formData,
    searchTerm,
    statusFilter,
    showDeleteDialog,
    templateToDelete,

    // Setters
    setIsDialogOpen,
    setIsBuilderOpen,
    setError,
    setFormData,
    setSearchTerm,
    setStatusFilter,
    setShowDeleteDialog,

    // Handlers
    handleSubmit,
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleBuildTemplate,
    handleSaveTemplate,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    resetForm,
  };
}

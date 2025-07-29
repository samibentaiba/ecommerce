"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  LandingPage,
  LandingPageTemplate,
  TemplateSection,
} from "@/lib/types";

export function useLandingPages() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<LandingPageTemplate | null>(null);
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>(
    []
  );
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<LandingPage | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    productId: "",
    headline: "",
    description: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    templateId: "",
  });

  // Load landing pages, templates, and products from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, templatesRes, productsRes] = await Promise.all([
        fetch("/api/admin/landing-pages"),
        fetch("/api/admin/templates"),
        fetch("/api/admin/products"),
      ]);
      if (!pagesRes.ok) throw new Error("Failed to fetch landing pages");
      if (!templatesRes.ok) throw new Error("Failed to fetch templates");
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const pages = await pagesRes.json();
      // Fix: handle both { landingPages: [...] } and array
      setLandingPages(
        Array.isArray(pages) ? pages : (pages.landingPages ?? [])
      );
      const templates = await templatesRes.json();
      const products = await productsRes.json();
      setTemplates(templates);
      setProducts(products.map((p: any) => ({ id: p.id, name: p.name })));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithTemplate = (template: LandingPageTemplate) => {
    setSelectedTemplate(template);
    setFormData({ ...formData, templateId: template.id.toString() });
    // Initialize sections from template
    setTemplateSections(
      template.sections?.map((section) => ({
        ...section,
        id: section.id || `temp-${Date.now()}-${Math.random()}`,
      })) || []
    );
    setIsTemplateSelectOpen(false);
    setIsSectionEditorOpen(true);
  };

  const handleCreateWithoutTemplate = () => {
    // Find the default template (Modern Hero Template)
    const defaultTemplate =
      templates.find((t) => t.isDefault) ||
      templates.find((t) => t.name === "Modern Hero Template");

    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate);
      setFormData({ ...formData, templateId: defaultTemplate.id.toString() });
      // Initialize sections from default template
      setTemplateSections(
        defaultTemplate.sections?.map((section) => ({
          ...section,
          id: section.id || `temp-${Date.now()}-${Math.random()}`,
        })) || []
      );
      setIsTemplateSelectOpen(false);
      setIsSectionEditorOpen(true);
    } else {
      // Fallback: create a basic hero template structure
      const basicTemplate: LandingPageTemplate = {
        id: "default-template",
        name: "Modern Hero Template",
        description: "Default hero template for landing pages",
        thumbnail: "/placeholder.svg",
        isDefault: true,
        createdAt: new Date().toISOString(),
        sections: [
          {
            id: "hero-section",
            type: "hero",
            title: "Welcome to Our Product",
            content:
              "Discover the amazing features and benefits of our product",
            order: 0,
            settings: {},
          },
          {
            id: "features-section",
            type: "features",
            title: "Key Features",
            content: "What makes our product special",
            order: 1,
            settings: {},
          },
          {
            id: "cta-section",
            type: "cta",
            title: "Get Started Today",
            content: "Join thousands of satisfied customers",
            order: 2,
            settings: {},
          },
        ],
      };

      setSelectedTemplate(basicTemplate);
      setFormData({ ...formData, templateId: "default-template" });
      setTemplateSections(basicTemplate.sections);
      setIsTemplateSelectOpen(false);
      setIsSectionEditorOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.slug ||
      !formData.productId ||
      !formData.headline ||
      !formData.templateId
    ) {
      setError(
        "Please fill in all required fields: Title, URL Slug, Product, Headline, and Template"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingPage) {
        // Update
        const res = await fetch("/api/admin/landing-pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPage.id, ...formData }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update landing page");
        }
        const updated = await res.json();
        setLandingPages((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        // Create
        const res = await fetch("/api/admin/landing-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            sections: templateSections,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create landing page");
        }
        const created = await res.json();
        setLandingPages((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: LandingPage) => {
    // Reset form first to clear any previous data
    resetForm();

    setEditingPage(page);

    // Ensure the page has a template - if not, use the default template
    let templateId = page.templateId?.toString() || "";
    if (!templateId) {
      const defaultTemplate =
        templates.find((t) => t.isDefault) ||
        templates.find((t) => t.name === "Modern Hero Template");
      if (defaultTemplate) {
        templateId = defaultTemplate.id;
      }
    }

    setFormData({
      title: page.title,
      slug: page.slug,
      productId: page.productId.toString(),
      headline: page.headline,
      description: page.description,
      status: page.status,
      templateId: templateId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/landing-pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete landing page");
      setLandingPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (page: LandingPage) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (pageToDelete) {
      try {
        await handleDelete(pageToDelete.id.toString());
        setShowDeleteDialog(false);
        setPageToDelete(null);
      } catch (error) {
        console.error("Delete failed:", error);
        // Keep the dialog open so user can try again or cancel
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setPageToDelete(null);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setIsTemplateSelectOpen(false);
    setIsSectionEditorOpen(false);
    setEditingPage(null);
    setSelectedTemplate(null);
    setTemplateSections([]);
    setSearchTerm("");
    setStatusFilter("all");
    setFormData({
      title: "",
      slug: "",
      productId: "",
      headline: "",
      description: "",
      status: "DRAFT",
      templateId: "",
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData({ ...formData, ...updates });
  };

  const updateFormDataWithSlug = (title: string) => {
    const slug = formData.slug || generateSlug(title);
    setFormData({ ...formData, title, slug });
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<TemplateSection>
  ) => {
    setTemplateSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  // Helper functions
  const getTemplateById = (id: string) => templates.find((t) => t.id === id);
  const getProductById = (id: string) => products.find((p) => p.id === id);

  // Filtered landing pages based on search and status
  const filteredLandingPages = useMemo(() => {
    return landingPages.filter((page) => {
      const product = getProductById(page.productId);
      const template = getTemplateById(page.templateId || "");

      const matchesSearch =
        (page.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.headline || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (product?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (template?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [landingPages, searchTerm, statusFilter, getProductById, getTemplateById]);

  return {
    // State
    landingPages: filteredLandingPages,
    loading,
    error,
    templates,
    products,
    isDialogOpen,
    isTemplateSelectOpen,
    editingPage,
    selectedTemplate,
    formData,
    searchTerm,
    statusFilter,

    // Actions
    setIsDialogOpen,
    setIsTemplateSelectOpen,
    setError,
    setFormData: updateFormData,
    updateFormDataWithSlug,
    setSearchTerm,
    setStatusFilter,

    // Handlers
    handleCreateWithTemplate,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    generateSlug,

    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    pageToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,

    // Computed values
    getTemplateById,
    getProductById,

    // Section editor
    templateSections,
    isSectionEditorOpen,
    setIsSectionEditorOpen,
    updateSection,

    // Template handling
    handleCreateWithoutTemplate,
  };
}

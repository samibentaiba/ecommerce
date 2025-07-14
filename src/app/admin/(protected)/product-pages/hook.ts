"use client";

import { useState, useEffect } from "react";
import type { Product, ProductPage } from "@/lib/types";

export function useProductPage() {
  const [productPages, setProductPages] = useState<ProductPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ProductPage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<ProductPage | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    productId: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
    status: "DRAFT" as "PUBLISHED" | "DRAFT",
  });

  // Load product pages and products from API
  useEffect(() => {
    fetchProductPages();
    fetchProducts();
  }, []);

  const fetchProductPages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/product-pages");
      if (!response.ok) {
        throw new Error("Failed to fetch product pages");
      }
      const data = await response.json();
      // Transform the API response to match our frontend types
      const transformedData = data.map((page: any) => ({
        ...page,
        id: page.id.toString(), // Ensure ID is always a string
        productId: page.productId.toString(), // Ensure productId is always a string
        productName: page.product?.name || "Unknown Product",
      }));
      setProductPages(transformedData);
    } catch (error) {
      console.error("Error fetching product pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);

      // Update product names in product pages
      setProductPages((prevPages) =>
        prevPages.map((page) => {
          const product = data.find((p: any) => p.id === page.productId);
          return {
            ...page,
            productName: product?.name || page.productName,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pageData = {
        ...formData,
        featuredImage: "/placeholder.svg?height=200&width=300", // Default image
      };

      if (editingPage) {
        // Update existing page
        const response = await fetch(
          `/api/admin/product-pages?id=${editingPage.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update product page");
        }

        const updatedPage = await response.json();
        // Transform the response to match our frontend types
        const transformedPage = {
          ...updatedPage,
          id: updatedPage.id.toString(),
          productId: updatedPage.productId.toString(),
          productName: updatedPage.product?.name || "Unknown Product",
        };
        setProductPages(
          productPages.map((page) =>
            page.id === editingPage.id ? transformedPage : page
          )
        );
      } else {
        // Create new page
        const response = await fetch("/api/admin/product-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });

        if (!response.ok) {
          throw new Error("Failed to create product page");
        }

        const newPage = await response.json();
        // Transform the response to match our frontend types
        const transformedPage = {
          ...newPage,
          id: newPage.id.toString(),
          productId: newPage.productId.toString(),
          productName: newPage.product?.name || "Unknown Product",
        };
        setProductPages([transformedPage, ...productPages]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product page:", error);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      const response = await fetch(`/api/admin/product-pages?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product page");
      }

      setProductPages(productPages.filter((page) => page.id !== id.toString()));
    } catch (error) {
      console.error("Error deleting product page:", error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  // Delete handlers
  const handleDeleteClick = (page: ProductPage) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (pageToDelete) {
      try {
        await handleDelete(pageToDelete.id);
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

  const handleEdit = (page: ProductPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      productId: page.productId,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      content: page.content,
      status: page.status,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    setSearchTerm("");
    setStatusFilter("all");
    setFormData({
      title: "",
      productId: "",
      metaTitle: "",
      metaDescription: "",
      content: "",
      status: "DRAFT",
    });
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredPages = productPages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    productPages: filteredPages,
    loading,
    isDialogOpen,
    searchTerm,
    statusFilter,
    editingPage,
    products,
    formData,
    setIsDialogOpen,
    setSearchTerm,
    setStatusFilter,
    handleDelete,
    handleEdit,
    setEditingPage,
    setProductPages,
    getSeoScoreColor,
    setFormData,
    handleSubmit,
    resetForm,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    pageToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}

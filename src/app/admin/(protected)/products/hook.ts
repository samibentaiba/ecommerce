"use client";

import { useState, useEffect } from "react";
import type { Product, ProductImage, ProductVariant } from "@/lib/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    stock: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    images: [] as ProductImage[],
    variants: [] as ProductVariant[],
  });

  // Load products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        // Update existing product
        const response = await fetch(
          `/api/admin/products?id=${editingProduct.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        const updatedProduct = await response.json();
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
        );
      } else {
        // Create new product
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          throw new Error("Failed to create product");
        }

        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("Delete failed with error data:", errorData);
        throw new Error(
          `Failed to delete product: ${response.status} ${
            response.statusText
          } - ${errorData.error || errorData.details || "Unknown error"}`
        );
      }

      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  // Delete handlers
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await handleDelete(String(productToDelete.id));
        setShowDeleteDialog(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Delete failed:", error);
        // Keep the dialog open so user can try again or cancel
        // The error is already logged in handleDelete
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      stock: product.stock.toString(),
      status: product.status,
      images: product.images || [],
      variants: product.variants || [],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSearchTerm("");
    setStatusFilter("all");
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      stock: "",
      status: "ACTIVE",
      images: [],
      variants: [],
    });
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          id: Date.now().toString(),
          url: "",
          alt: "",
          isPrimary: formData.images.length === 0,
        },
      ],
    });
  };

  const updateImage = (id: string, updates: Partial<ProductImage>) => {
    setFormData({
      ...formData,
      images: formData.images.map((img) => {
        if (img.id === id) {
          return { ...img, ...updates };
        }
        // If we're setting an image as primary, make all others non-primary
        if (updates.isPrimary) {
          return { ...img, isPrimary: false };
        }
        return img;
      }),
    });
  };

  const removeImage = (id: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img.id !== id),
    });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          id: Date.now().toString(),
          name: "",
          type: "COLOR",
          value: "",
          description: "",
          variantPrice: undefined,
          stockQuantity: 0,
          images: [],
        },
      ],
    });
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant) =>
        variant.id === id ? { ...variant, ...updates } : variant
      ),
    });
  };

  const removeVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((variant) => variant.id !== id),
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    products,
    filteredProducts,
    loading,
    isDialogOpen,
    editingProduct,
    searchTerm,
    statusFilter,
    formData,
    setIsDialogOpen,
    setSearchTerm,
    setStatusFilter,
    handleDelete,
    handleEdit,
    resetForm,
    setFormData,
    handleSubmit,
    addImage,
    updateImage,
    removeImage,
    addVariant,
    updateVariant,
    removeVariant,
    productImages: formData.images,
    setProductImages: (images: ProductImage[]) =>
      setFormData({ ...formData, images }),
    productVariants: formData.variants,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    productToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}

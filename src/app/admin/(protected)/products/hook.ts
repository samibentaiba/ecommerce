"use client";

import { useState, useEffect } from "react";
import type { Product, ProductVariant } from "@/lib/types";

// Extend ProductImage for local state to allow file
// Rename local ProductImage type to AdminProductImage to avoid confusion
export type AdminProductImage = {
  id: string;
  image?: ArrayBuffer; // Binary image data
  mimeType?: string; // To serve correct Content-Type
  alt: string;
  isPrimary: boolean;
  file?: File;
};

// Extend ProductVariant for local state to allow images with file
export type ProductVariantWithFile = Omit<ProductVariant, "images"> & {
  images: AdminProductImage[];
};

// Helper to check if an image is a new file
function isFileImage(img: AdminProductImage) {
  return img && img.file instanceof File;
}

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

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    category: string;
    stock: string;
    status: "ACTIVE" | "INACTIVE";
    images: AdminProductImage[];
    variants: ProductVariantWithFile[];
  }>({
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

  // Expose productImages and setProductImages for the images tab
  const productImages = formData.images;
  const setProductImages: React.Dispatch<
    React.SetStateAction<AdminProductImage[]>
  > = (value) => {
    setFormData((prev) => ({
      ...prev,
      images: typeof value === "function" ? value(prev.images) : value,
    }));
  };

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
      setProducts(Array.isArray(data.products) ? data.products : []);
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

      // Check if any product or variant images are files
      const hasFileImages =
        (formData.images as AdminProductImage[]).some((img) =>
          isFileImage(img as AdminProductImage)
        ) ||
        (formData.variants || []).some((variant) =>
          (variant.images as AdminProductImage[]).some((img) =>
            isFileImage(img as AdminProductImage)
          )
        );

      let response;
      if (hasFileImages) {
        // Use multipart/form-data
        const fd = new FormData();
        // Prepare product data without file objects
        const productDataForJson = {
          ...productData,
          images: (formData.images as AdminProductImage[]).map(
            (img: AdminProductImage) => {
              const { file, ...rest } = img;
              return rest;
            }
          ),
          variants: (formData.variants || []).map((variant) => ({
            ...variant,
            images: (variant.images || []).map((img: AdminProductImage) => {
              const { file, ...rest } = img;
              return rest;
            }),
          })),
        };
        fd.append("product", JSON.stringify(productDataForJson));
        // Attach product images
        formData.images.forEach((img: AdminProductImage, i) => {
          if (img.file instanceof File) {
            fd.append(`images`, img.file as File, img.file!.name);
          }
        });
        // Attach variant images
        const variantImagesMap: Record<string, File[]> = {};
        (formData.variants || []).forEach((variant) => {
          (variant.images || []).forEach((img: AdminProductImage) => {
            if (img.file instanceof File) {
              if (!variantImagesMap[variant.id])
                variantImagesMap[variant.id] = [];
              variantImagesMap[variant.id].push(img.file as File);
            }
          });
        });
        if (Object.keys(variantImagesMap).length > 0) {
          // Append variant images mapping as JSON
          fd.append("variantImages", JSON.stringify(variantImagesMap));
          // Append the actual files with keys like variantImages-<variantId>-<index>
          Object.entries(variantImagesMap).forEach(([variantId, files]) => {
            files.forEach((file, idx) => {
              fd.append(`variantImages-${variantId}-${idx}`, file, file.name);
            });
          });
        }
        if (editingProduct) {
          response = await fetch(
            `/api/admin/products?id=${editingProduct.id}`,
            {
              method: "PUT",
              body: fd,
            }
          );
        } else {
          response = await fetch("/api/admin/products", {
            method: "POST",
            body: fd,
          });
        }
      } else {
        // Fallback to JSON
        if (editingProduct) {
          response = await fetch(
            `/api/admin/products?id=${editingProduct.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(productData),
            }
          );
        } else {
          response = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });
        }
      }

      if (!response.ok) {
        throw new Error(
          editingProduct
            ? "Failed to update product"
            : "Failed to create product"
        );
      }

      const updatedOrNewProduct = await response.json();
      if (editingProduct) {
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? updatedOrNewProduct : p
          )
        );
      } else {
        setProducts([updatedOrNewProduct, ...products]);
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

  // Image management helpers
  const addImage = () => {
    const hasPrimaryImage = formData.images.some((img) => img.isPrimary);
    setProductImages([
      ...formData.images,
      {
        id: Math.random().toString(36).substring(2),
        alt: "",
        isPrimary: !hasPrimaryImage && formData.images.length === 0, // Only set as primary if no primary exists and it's the first image
      },
    ]);
  };

  const updateImage = (id: string, updates: Partial<AdminProductImage>) => {
    setProductImages(
      formData.images.map((img) => {
        if (img.id === id) {
          return { ...img, ...updates };
        }
        // If we're setting an image as primary, make all others non-primary
        if (updates.isPrimary) {
          return { ...img, isPrimary: false };
        }
        return img;
      })
    );
  };

  const removeImage = (id: string) => {
    let newImages = formData.images.filter((img) => img.id !== id);
    // If the removed image was primary, set the first image as primary
    if (!newImages.some((img) => img.isPrimary) && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setProductImages(newImages);
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

  // Variant image management helpers
  const addVariantImage = (variantId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant) => {
        if (variant.id === variantId) {
          const hasPrimaryImage = (variant.images || []).some(
            (img) => img.isPrimary
          );
          const newImage: AdminProductImage = {
            id: Math.random().toString(36).substring(2),
            alt: "",
            isPrimary: !hasPrimaryImage && (variant.images || []).length === 0, // Only set as primary if no primary exists and it's the first image
          };
          return {
            ...variant,
            images: [...(variant.images || []), newImage],
          };
        }
        return variant;
      }),
    });
  };

  const updateVariantImage = (
    variantId: string,
    imageId: string,
    updates: Partial<AdminProductImage>
  ) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant) => {
        if (variant.id === variantId) {
          return {
            ...variant,
            images: (variant.images || []).map((img) => {
              if (img.id === imageId) {
                return { ...img, ...updates };
              }
              // If we're setting an image as primary, make all others non-primary
              if (updates.isPrimary) {
                return { ...img, isPrimary: false };
              }
              return img;
            }),
          };
        }
        return variant;
      }),
    });
  };

  const removeVariantImage = (variantId: string, imageId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant) => {
        if (variant.id === variantId) {
          let newImages = (variant.images || []).filter(
            (img) => img.id !== imageId
          );
          // If the removed image was primary, set the first image as primary
          if (!newImages.some((img) => img.isPrimary) && newImages.length > 0) {
            newImages[0].isPrimary = true;
          }
          return {
            ...variant,
            images: newImages,
          };
        }
        return variant;
      }),
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
    addVariantImage,
    updateVariantImage,
    removeVariantImage,
    productImages,
    setProductImages,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    productToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}

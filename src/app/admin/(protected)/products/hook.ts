// Product/hook.ts
import { useState, useEffect } from "react";
import type { Product, ProductImage, ProductVariant } from "@/lib/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "active" as "active" | "inactive",
  });

  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  // Load products from the real API
  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
  ...formData,
  price: Number(formData.price),
  originalPrice: Number(formData.price),
  stock: Number(formData.stock),
  images: productImages,
  variants: productVariants.map((variant) => ({
    ...variant,
    type: variant.type.toUpperCase(), // 👈 FIX ENUM CASE
  })),
};


    try {
      if (editingProduct) {
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...productPayload }),
        });
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
        const newProduct = await res.json();
        setProducts((prev) => [newProduct, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to submit product", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      status: product.status.toLowerCase() as "active" | "inactive",
    });
    setProductImages(product.images || []);
    setProductVariants(product.variants || []);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      status: "active",
    });
    setProductImages([]);
    setProductVariants([]);
  };

  // Local helpers for form operations
  const addImage = () => {
    const newImage: ProductImage = {
      id: `img-${Date.now()}`,
      url: "/placeholder.svg?height=400&width=400",
      alt: "Product image",
      isPrimary: productImages.length === 0,
    };
    setProductImages([...productImages, newImage]);
  };

  const updateImage = (id: string, updates: Partial<ProductImage>) => {
    setProductImages(productImages.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  };

  const removeImage = (id: string) => {
    setProductImages(productImages.filter((img) => img.id !== id));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      name: "",
      type: "color",
      value: "",
      description: "",
      variantPrice: 0,
      stockQuantity: 0,
      images: [],
    };
    setProductVariants([...productVariants, newVariant]);
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setProductVariants(productVariants.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeVariant = (id: string) => {
    setProductVariants(productVariants.filter((v) => v.id !== id));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    products,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    isDialogOpen,
    setIsDialogOpen,
    formData,
    setFormData,
    productImages,
    setProductImages,
    addImage,
    updateImage,
    removeImage,
    productVariants,
    setProductVariants,
    addVariant,
    updateVariant,
    removeVariant,
    editingProduct,
    handleEdit,
    handleDelete,
    handleSubmit,
    resetForm,
  };
}

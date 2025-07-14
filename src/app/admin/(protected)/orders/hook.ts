// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/hook.ts

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  products: {
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  shippingAddress: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  variants: {
    id: string;
    value: string;
    type: "COLOR" | "SIZE" | "FEATURE";
    variantPrice?: number;
  }[];
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form state
  const [showEditor, setShowEditor] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantType, setSelectedVariantType] = useState<
    "COLOR" | "SIZE" | "FEATURE" | ""
  >("");
  const [selectedVariantValue, setSelectedVariantValue] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Form data
  const [form, setForm] = useState<Order>({
    id: "",
    customerName: "",
    customerPhone: "",
    products: [],
    total: 0,
    status: "pending",
    orderDate: new Date().toISOString().slice(0, 10),
    shippingAddress: "",
  });

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data: Product[]) => setProductsList(data))
      .catch(console.error);
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    await editOrder({ ...target, status: newStatus });
  };

  const addOrder = async (order: Order) => {
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const newOrder = await res.json();
    setOrders((prev) => [...prev, newOrder]);
  };

  const editOrder = async (updated: Order) => {
    const res = await fetch(`/api/admin/orders?id=${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const newOrder = await res.json();
    setOrders((prev) =>
      prev.map((order) => (order.id === updated.id ? newOrder : order))
    );
  };

  const deleteOrder = async (orderId: string) => {
    await fetch(`/api/admin/orders?id=${orderId}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  // Form handlers
  const handleCreate = () => {
    setEditingOrder(null);
    setForm({
      id: "",
      customerName: "",
      customerPhone: "",
      products: [],
      total: 0,
      status: "pending",
      orderDate: new Date().toISOString().slice(0, 10),
      shippingAddress: "",
    });
    setShowEditor(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setForm(order);
    setShowEditor(true);
  };

  const handleSave = async (order: Order) => {
    if (editingOrder) {
      await editOrder(order);
    } else {
      await addOrder(order);
    }
    setShowEditor(false);
  };

  const handleSaveOrder = () => {
    const orderToSave = editingOrder ? form : { ...form, id: uuidv4() };
    handleSave(orderToSave);
  };

  const handleFormChange = (field: keyof Order, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addProductToForm = () => {
    const product = productsList.find((p) => p.id === selectedProductId);
    if (!product) return;

    const variant = product.variants.find(
      (v) => v.value === selectedVariantValue && v.type === selectedVariantType
    );

    const price = variant?.variantPrice ?? product.price;

    const newItem = {
      name: product.name,
      quantity: selectedQuantity,
      price,
      variant: variant?.value ?? undefined,
    };

    const updatedProducts = [...form.products, newItem];
    const updatedTotal = updatedProducts.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    setForm((prev) => ({
      ...prev,
      products: updatedProducts,
      total: updatedTotal,
    }));

    // Reset selectors
    setSelectedProductId("");
    setSelectedVariantType("");
    setSelectedVariantValue("");
    setSelectedQuantity(1);
  };

  // Delete handlers
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.customerName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (order.customerPhone?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Computed values for form
  const selectedProduct = productsList.find((p) => p.id === selectedProductId);
  const variantTypes = Array.from(
    new Set(selectedProduct?.variants.map((v) => v.type) ?? [])
  );
  const filteredVariants =
    selectedProduct?.variants.filter((v) => v.type === selectedVariantType) ??
    [];

  return {
    loading,
    orders,
    filteredOrders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    addOrder,
    editOrder,
    deleteOrder,
    getStatusColor,
    // Form state
    showEditor,
    setShowEditor,
    editingOrder,
    form,
    productsList,
    selectedProductId,
    setSelectedProductId,
    selectedVariantType,
    setSelectedVariantType,
    selectedVariantValue,
    setSelectedVariantValue,
    selectedQuantity,
    setSelectedQuantity,
    // Form handlers
    handleCreate,
    handleEdit,
    handleSave,
    handleSaveOrder,
    handleFormChange,
    addProductToForm,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    orderToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    // Computed values
    selectedProduct,
    variantTypes,
    filteredVariants,
  };
}

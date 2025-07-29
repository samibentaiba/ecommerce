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

// Helper function to transform API order data to hook interface
function transformOrderData(apiOrder: any): Order {
  if (!apiOrder) {
    throw new Error("Invalid order data received");
  }

  return {
    id: apiOrder.id || "",
    customerName: apiOrder.customerName || "",
    customerPhone: apiOrder.customerPhone || "",
    total: apiOrder.total || 0,
    status: (apiOrder.status || "PENDING").toLowerCase() as Order["status"],
    orderDate: apiOrder.orderDate
      ? new Date(apiOrder.orderDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    shippingAddress: apiOrder.shippingAddress || "",
    products: (apiOrder.items || []).map((item: any) => ({
      name: item.productName || item.product?.name || "Unknown Product",
      quantity: item.quantity || 0,
      price: item.price || 0,
      variant: item.variant?.value || undefined,
    })),
  };
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
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.orders) {
          const transformedOrders = data.orders.map(transformOrderData);
          setOrders(transformedOrders);
        } else {
          setOrders([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.products) {
          setProductsList(data.products);
        } else {
          setProductsList([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProductsList([]);
      });
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
    try {
      // Transform hook order data to API format
      const apiOrderData = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        total: order.total,
        status: order.status.toUpperCase(),
        orderDate: new Date(order.orderDate),
        shippingAddress: order.shippingAddress,
        items: {
          create: order.products.map((product) => ({
            productId:
              productsList.find((p) => p.name === product.name)?.id || "",
            productName: product.name,
            quantity: product.quantity,
            price: product.price,
            variantId: product.variant
              ? productsList
                  .find((p) => p.name === product.name)
                  ?.variants.find((v) => v.value === product.variant)?.id
              : null,
          })),
        },
      };

    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiOrderData),
    });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const newOrderData = await res.json();
      if (newOrderData.order) {
        const transformedOrder = transformOrderData(newOrderData.order);
        setOrders((prev) => [...prev, transformedOrder]);
      }
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  const editOrder = async (updated: Order) => {
    try {
      // Transform hook order data to API format
      const apiOrderData = {
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        total: updated.total,
        status: updated.status.toUpperCase(),
        orderDate: new Date(updated.orderDate),
        shippingAddress: updated.shippingAddress,
      };

    const res = await fetch(`/api/admin/orders?id=${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiOrderData),
    });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const newOrderData = await res.json();
      if (newOrderData.order) {
        const transformedOrder = transformOrderData(newOrderData.order);
    setOrders((prev) =>
          prev.map((order) =>
            order.id === updated.id ? transformedOrder : order
          )
    );
      }
    } catch (error) {
      console.error("Error editing order:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
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

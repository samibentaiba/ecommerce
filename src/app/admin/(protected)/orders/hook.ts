// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/hook.ts

import { useEffect, useMemo, useState } from "react"

export interface Order {
  id: string
  customerName: string
  customerEmail: string
    products: { name: string; quantity: number; price: number; variant?: string }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  shippingAddress: string
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
  const target = orders.find((o) => o.id === orderId);
  if (!target) return;

  await editOrder({ ...target, status: newStatus });
};


  const addOrder = async (order: Order) => {
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    const newOrder = await res.json()
    setOrders((prev) => [...prev, newOrder])
  }

  const editOrder = async (updated: Order) => {
    const res = await fetch(`/api/admin/orders?id=${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    const newOrder = await res.json()
    setOrders((prev) =>
      prev.map((order) => (order.id === updated.id ? newOrder : order))
    )
  }

const deleteOrder = async (orderId: string) => {
  await fetch(`/api/admin/orders?id=${orderId}`, { method: "DELETE" }) // ✅ fixed
  setOrders((prev) => prev.filter((order) => order.id !== orderId))
}


  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "shipped":
        return "outline"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

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
  }
}


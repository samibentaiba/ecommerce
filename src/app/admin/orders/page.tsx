"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye, Search, Filter } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  products: { name: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  shippingAddress: string
}

export default function OrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      products: [{ name: "Premium Wireless Headphones", quantity: 1, price: 299.99 }],
      total: 299.99,
      status: "pending",
      orderDate: "2024-01-15",
      shippingAddress: "123 Main St, City, State 12345",
    },
    {
      id: "ORD-002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      products: [
        { name: "Smart Fitness Watch", quantity: 2, price: 199.99 },
        { name: "Eco-Friendly Water Bottle", quantity: 1, price: 29.99 },
      ],
      total: 429.97,
      status: "processing",
      orderDate: "2024-01-14",
      shippingAddress: "456 Oak Ave, Town, State 67890",
    },
    {
      id: "ORD-003",
      customerName: "Bob Johnson",
      customerEmail: "bob@example.com",
      products: [{ name: "Eco-Friendly Water Bottle", quantity: 3, price: 29.99 }],
      total: 89.97,
      status: "shipped",
      orderDate: "2024-01-13",
      shippingAddress: "789 Pine Rd, Village, State 13579",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("admin.orders")}</h2>
        <p className="text-muted-foreground">{t("admin.manageOrders")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchOrders")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("admin.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.allStatus")}</SelectItem>
              <SelectItem value="pending">{t("admin.pending")}</SelectItem>
              <SelectItem value="processing">{t("admin.processing")}</SelectItem>
              <SelectItem value="shipped">{t("admin.shipped")}</SelectItem>
              <SelectItem value="delivered">{t("admin.delivered")}</SelectItem>
              <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.orderList")}</CardTitle>
          <CardDescription>{t("admin.recentOrders")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order["status"]) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
                          <DialogDescription>Complete order information and customer details</DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold">Customer Information</h4>
                                <p>{selectedOrder.customerName}</p>
                                <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Order Date</h4>
                                <p>{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">Shipping Address</h4>
                              <p>{selectedOrder.shippingAddress}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Products</h4>
                              <div className="space-y-2">
                                {selectedOrder.products.map((product, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{product.name}</p>
                                      <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${(product.price * product.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Total:</span>
                                <span className="text-xl font-bold">${selectedOrder.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

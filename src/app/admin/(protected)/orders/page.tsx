// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/page.tsx

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
import { Eye, Search, Filter, Plus, Trash2, Pencil } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useOrders, Order } from "./hook"
import { OrderForm } from "./form"
import { v4 as uuidv4 } from "uuid"

export default function OrdersPage() {
  const { t } = useLanguage()
  const {
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
  } = useOrders()

  const [showEditor, setShowEditor] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const handleCreate = () => {
    setEditingOrder(null)
    setShowEditor(true)
  }

  const handleSave = (order: Order) => {
    if (editingOrder) {
      editOrder(order)
    } else {
      addOrder({ ...order, id: uuidv4() })
    }
    setShowEditor(false)
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setShowEditor(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("admin.orders")}</h2>
          <p className="text-muted-foreground">{t("admin.manageOrders")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.newOrder")}
        </Button>
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
                  <TableCell className="flex gap-2">
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
                        {/* Order Detail View from original code */}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteOrder(order.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOrder ? "Edit Order" : "Create Order"}</DialogTitle>
            </DialogHeader>
            <OrderForm
              defaultOrder={editingOrder}
              onSave={handleSave}
              onCancel={() => setShowEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


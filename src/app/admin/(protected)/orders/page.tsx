// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye, Search, Filter, Plus, Trash2, Pencil } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useOrders, Order } from "./hook";
import { OrderForm } from "./form";
import { v4 as uuidv4 } from "uuid";

export default function OrdersPage() {
  const { t } = useLanguage();
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
  } = useOrders();
  const statusClasses = {
    PENDING:
      "bg-yellow-200 hover:bg-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200 ",
    PROCESSING:
      "bg-blue-200 hover:bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
    SHIPPED:
      "bg-purple-200 hover:bg-purple-300 text-purple-900 dark:bg-purple-900 dark:text-purple-200",
    DELIVERED:
      "bg-green-200 hover:bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-200",
    CANCELLED:
      "bg-red-200 hover:bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-200",
  };

  const [showEditor, setShowEditor] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleCreate = () => {
    setEditingOrder(null);
    setShowEditor(true);
  };

  const handleSave = (order: Order) => {
    if (editingOrder) {
      editOrder(order);
    } else {
      addOrder({ ...order, id: uuidv4() });
    }
    setShowEditor(false);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("admin.orders")}
          </h2>
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
              <SelectItem value="processing">
                {t("admin.processing")}
              </SelectItem>
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
                      <div className="text-sm text-muted-foreground">
                        {order.customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${order.total?.toFixed?.(2) ?? "0.00"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusClasses[
                          order.status.toUpperCase() as keyof typeof statusClasses
                        ]
                      }
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
                          <DialogDescription>
                            Complete order information and customer details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <strong>Customer:</strong> {order.customerName} (
                            {order.customerEmail})
                          </div>

                          <div>
                            <strong>Shipping Address:</strong>{" "}
                            {order.shippingAddress}
                          </div>
                          <div>
                            <strong>Order Date:</strong>{" "}
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Items:</strong>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              {order.products.map((item, idx) => (
                                <li key={idx}>
                                  {item.name} × {item.quantity} - $
                                  {item.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Total:</strong> $
                            {order.total?.toFixed?.(2) ?? "0.00"}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(order)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                    >
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
              <DialogTitle>
                {editingOrder ? "Edit Order" : "Create Order"}
              </DialogTitle>
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
  );
}

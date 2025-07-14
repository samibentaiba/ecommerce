// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/page.tsx

"use client";

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
import { Label } from "@/components/ui/label";
import { Eye, Search, Filter, Plus, Trash2, Pencil } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useOrders } from "./hook";



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
        {/* Filter by status */}
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] text-foreground">
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
                        {order.customerPhone}
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
                            {order.customerPhone})
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
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(order)}
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

      {/* Order Form Dialog */}
      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? "Edit Order" : "Create Order"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) =>
                  handleFormChange("customerName", e.target.value)
                }
              />
              <Input
                placeholder="Customer Phone"
                value={form.customerPhone}
                onChange={(e) =>
                  handleFormChange("customerPhone", e.target.value)
                }
              />
              <Input
                placeholder="Shipping Address"
                value={form.shippingAddress}
                onChange={(e) =>
                  handleFormChange("shippingAddress", e.target.value)
                }
              />

              {/* Order Status Select */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => handleFormChange("status", value)}
                >
                  <SelectTrigger
                    className={`w-full rounded-md ${
                      statusClasses[
                        form.status.toUpperCase() as keyof typeof statusClasses
                      ]
                    }`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent >
                    {productsList.map((p) => (
                      <SelectItem  key={p.id} value={p.id} >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {variantTypes.length > 0 && (
                  <>
                    <Label>Select Variant Type</Label>
                    <Select
                      value={selectedVariantType}
                      onValueChange={(value) =>
                        setSelectedVariantType(value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose type (e.g. COLOR)" />
                      </SelectTrigger>
                      <SelectContent>
                        {variantTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {selectedVariantType && filteredVariants.length > 0 && (
                  <>
                    <Label>Select Variant</Label>
                    <Select
                      value={selectedVariantValue}
                      onValueChange={setSelectedVariantValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVariants.map((v) => (
                          <SelectItem key={v.id} value={v.value}>
                            {v.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Input
                  type="number"
                  placeholder="Quantity"
                  value={selectedQuantity}
                  onChange={(e) =>
                    setSelectedQuantity(parseInt(e.target.value))
                  }
                />

                <Button type="button" onClick={addProductToForm}>
                  Add Product
                </Button>

                {form.products.length > 0 && (
                  <ul className="text-sm list-disc list-inside text-muted-foreground">
                    {form.products.map((item, idx) => (
                      <li key={idx}>
                        {item.name} {item.variant ? `(${item.variant})` : ""} ×{" "}
                        {item.quantity} — $
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <strong>Total:</strong> ${form.total.toFixed(2)}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder}>
                  {editingOrder ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && orderToDelete && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete order {orderToDelete.id}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

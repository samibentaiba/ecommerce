// src\app\admin\(protected)\orders\form.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Order } from "./hook";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  defaultOrder?: Order | null;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

type Product = {
  id: string;
  name: string;
  price: number;
  variants: {
    id: string;
    value: string;
    type: "COLOR" | "SIZE" | "FEATURE";
    variantPrice?: number;
  }[];
};

const statusClasses = {
  PENDING:
    "bg-yellow-200 hover:bg-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200",
  PROCESSING:
    "bg-blue-200 hover:bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
  SHIPPED:
    "bg-purple-200 hover:bg-purple-300 text-purple-900 dark:bg-purple-900 dark:text-purple-200",
  DELIVERED:
    "bg-green-200 hover:bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-200",
  CANCELLED:
    "bg-red-200 hover:bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-200",
};

export function OrderForm({ defaultOrder, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Order>(
    defaultOrder ?? {
      id: "",
      customerName: "",
      customerEmail: "",
      products: [],
      total: 0,
      status: "pending",
      orderDate: new Date().toISOString().slice(0, 10),
      shippingAddress: "",
    }
  );

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantType, setSelectedVariantType] = useState<"COLOR" | "SIZE" | "FEATURE" | "">("");
  const [selectedVariantValue, setSelectedVariantValue] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data: Product[]) => setProductsList(data))
      .catch(console.error);
  }, []);

  const handleChange = (field: keyof Order, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
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

  const selectedProduct = productsList.find((p) => p.id === selectedProductId);
  const variantTypes = Array.from(
    new Set(selectedProduct?.variants.map((v) => v.type) ?? [])
  );
  const filteredVariants =
    selectedProduct?.variants.filter((v) => v.type === selectedVariantType) ?? [];

  return (
    <div className="space-y-4">
      <Input
        placeholder="Customer Name"
        value={form.customerName}
        onChange={(e) => handleChange("customerName", e.target.value)}
      />
      <Input
        placeholder="Customer Email"
        value={form.customerEmail}
        onChange={(e) => handleChange("customerEmail", e.target.value)}
      />
      <Input
        placeholder="Shipping Address"
        value={form.shippingAddress}
        onChange={(e) => handleChange("shippingAddress", e.target.value)}
      />

      {/* Order Status Select */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={form.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger
            className={`w-full rounded-md ${statusClasses[
              form.status.toUpperCase() as keyof typeof statusClasses
            ]}`}
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
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose product" />
          </SelectTrigger>
          <SelectContent>
            {productsList.map((p) => (
              <SelectItem key={p.id} value={p.id}>
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
              onValueChange={(value) => setSelectedVariantType(value as any)}
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
          onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
        />

        <Button type="button" onClick={addProduct}>
          Add Product
        </Button>

        {form.products.length > 0 && (
          <ul className="text-sm list-disc list-inside text-muted-foreground">
            {form.products.map((item, idx) => (
              <li key={idx}>
                {item.name} {item.variant ? `(${item.variant})` : ""} × {item.quantity} — $
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
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(form)}>
          {defaultOrder ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

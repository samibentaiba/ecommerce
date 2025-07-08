// /home/sami/Documents/GitHub/ecommerce/src/app/admin/(protected)/orders/form.tsx

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Order } from "./hook"

interface Props {
  defaultOrder?: Order | null
  onSave: (order: Order) => void
  onCancel: () => void
}

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
  )

  const handleChange = (field: keyof Order, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4" >
      <Input
        placeholder="Customer Name"
        value={form.customerName}
        onChange={(e) => handleChange("customerName", e.target.value)
        }
      />
      < Input
        placeholder="Customer Email"
        value={form.customerEmail}
        onChange={(e) => handleChange("customerEmail", e.target.value)}
      />
      < Input
        placeholder="Shipping Address"
        value={form.shippingAddress}
        onChange={(e) => handleChange("shippingAddress", e.target.value)}
      />
      < Input
        placeholder="Total"
        type="number"
        value={form.total}
        onChange={(e) => handleChange("total", parseFloat(e.target.value))}
      />
      < div className="flex justify-end gap-2 pt-4" >
        <Button variant="ghost" onClick={onCancel} > Cancel </Button>
        < Button onClick={() => onSave(form)}> {defaultOrder ? "Update" : "Create"} </Button>
      </div>
    </div>
  )
}

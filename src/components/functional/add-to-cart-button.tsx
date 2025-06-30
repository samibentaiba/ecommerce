
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  productId: number
  productName: string
  price: number
  inStock?: boolean
  maxQuantity?: number
  className?: string
}

export function AddToCartButton({
  productId,
  productName,
  price,
  inStock = true,
  maxQuantity = 10,
  className,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsAdding(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${productName} added to your cart.`,
      })
      setIsAdding(false)
    }, 500)
  }

  if (!inStock) {
    return (
      <Button disabled className={className}>
        Out of Stock
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button onClick={handleAddToCart} disabled={isAdding} className={className}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAdding ? "Adding..." : `Add to Cart - $${(price * quantity).toFixed(2)}`}
      </Button>
    </div>
  )
}

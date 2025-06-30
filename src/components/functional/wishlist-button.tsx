
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WishlistButtonProps {
  productId: number
  productName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WishlistButton({
  productId,
  productName,
  variant = "outline",
  size = "default",
  className,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleWishlist = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsInWishlist(!isInWishlist)
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${productName} ${isInWishlist ? "removed from" : "added to"} your wishlist.`,
      })
      setIsLoading(false)
    }, 500)
  }

  return (
    <Button variant={variant} size={size} onClick={toggleWishlist} disabled={isLoading} className={className}>
      <Heart
        className={`h-4 w-4 ${size !== "icon" ? "mr-2" : ""} ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
      />
      {size !== "icon" && (isInWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
    </Button>
  )
}

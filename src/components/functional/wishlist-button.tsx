
"use client"

import { useState, useEffect } from "react"
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

interface WishlistItem {
  id: number
  name: string
  price?: number
  image?: string
  addedAt: string
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

  // Check if item is in wishlist on mount
  useEffect(() => {
    const wishlist = getWishlistFromStorage()
    setIsInWishlist(wishlist.some(item => item.id === productId))
  }, [productId])

  const getWishlistFromStorage = (): WishlistItem[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('wishlist')
    return stored ? JSON.parse(stored) : []
  }

  const saveWishlistToStorage = (wishlist: WishlistItem[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }

  const toggleWishlist = async () => {
    setIsLoading(true)

    try {
      const wishlist = getWishlistFromStorage()
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter(item => item.id !== productId)
        saveWishlistToStorage(updatedWishlist)
        setIsInWishlist(false)
        toast({
          title: "Removed from Wishlist",
          description: `${productName} has been removed from your wishlist.`,
        })
      } else {
        // Add to wishlist
        const newItem: WishlistItem = {
          id: productId,
          name: productName,
          addedAt: new Date().toISOString(),
        }
        const updatedWishlist = [...wishlist, newItem]
        saveWishlistToStorage(updatedWishlist)
        setIsInWishlist(true)
        toast({
          title: "Added to Wishlist",
          description: `${productName} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, Share2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  inStock: boolean
  rating: number
  reviews: number
}

export default function WishlistPage() {
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      image: "/placeholder.svg?height=300&width=300",
      inStock: true,
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 3,
      name: "Eco-Friendly Water Bottle",
      price: 29.99,
      image: "/placeholder.svg?height=300&width=300",
      inStock: true,
      rating: 4.9,
      reviews: 256,
    },
    {
      id: 5,
      name: "Bluetooth Speaker",
      price: 89.99,
      image: "/placeholder.svg?height=300&width=300",
      inStock: false,
      rating: 4.7,
      reviews: 143,
    },
  ])

  const removeFromWishlist = (id: number) => {
    const item = wishlistItems.find((item) => item.id === id)
    setWishlistItems((items) => items.filter((item) => item.id !== id))
    toast({
      title: "Removed from Wishlist",
      description: `${item?.name} has been removed from your wishlist.`,
    })
  }

  const addToCart = (id: number) => {
    const item = wishlistItems.find((item) => item.id === id)
    toast({
      title: "Added to Cart",
      description: `${item?.name} has been added to your cart.`,
    })
  }

  const shareWishlist = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Wishlist Shared",
      description: "Wishlist link copied to clipboard!",
    })
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                EcoStore
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  Products
                </Link>
                <Link href="/collections" className="text-muted-foreground hover:text-foreground">
                  Collections
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </nav>
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link href="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              EcoStore
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link href="/collections" className="text-muted-foreground hover:text-foreground">
                Collections
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlistItems.length} items saved</p>
          </div>
          <Button variant="outline" onClick={shareWishlist}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Wishlist
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                  {!item.inStock && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Out of Stock
                    </Badge>
                  )}
                  {item.originalPrice && (
                    <Badge variant="destructive" className="absolute bottom-2 left-2">
                      Sale
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.name}</h3>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      {item.rating} ({item.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => addToCart(item.id)} disabled={!item.inStock}>
                      {item.inStock ? (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      ) : (
                        "Out of Stock"
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Link href={`/products/${item.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromWishlist(item.id)}
                        className="bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt="Recommended product"
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Recommended Product {i}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">$99.99</span>
                      <Button size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

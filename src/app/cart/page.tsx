
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, Heart, ArrowLeft, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  inStock: boolean
  maxQuantity: number
}

export default function CartPage() {
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      quantity: 1,
      image: "/placeholder.svg?height=100&width=100",
      inStock: true,
      maxQuantity: 5,
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      quantity: 2,
      image: "/placeholder.svg?height=100&width=100",
      inStock: true,
      maxQuantity: 3,
    },
  ])

  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }

    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) } : item)),
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    })
  }

  const moveToWishlist = (id: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      removeItem(id)
      toast({
        title: "Moved to Wishlist",
        description: `${item.name} has been moved to your wishlist.`,
      })
    }
  }

  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      WELCOME20: 20,
      STUDENT15: 15,
    }

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setAppliedPromo({
        code: promoCode,
        discount: validCodes[promoCode as keyof typeof validCodes],
      })
      toast({
        title: "Promo Code Applied!",
        description: `You saved ${validCodes[promoCode as keyof typeof validCodes]}% on your order.`,
      })
    } else {
      toast({
        title: "Invalid Promo Code",
        description: "Please check your promo code and try again.",
        variant: "destructive",
      })
    }
    setPromoCode("")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + shipping + tax

  if (cartItems.length === 0) {
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
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <div className="space-y-4">
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
            <div>
              <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
                Or check your wishlist
              </Link>
            </div>
          </div>
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
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl font-bold">${item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                            )}
                          </div>
                          <Badge variant={item.inStock ? "default" : "destructive"}>
                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                              max={item.maxQuantity}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveToWishlist(item.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Move to Wishlist
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={applyPromoCode} disabled={!promoCode}>
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Code: {appliedPromo.code}</span>
                    <span className="text-green-600">-{appliedPromo.discount}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.discount}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </div>
                )}

                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    <Lock className="mr-2 h-4 w-4" />
                    Secure Checkout
                  </Button>
                </Link>

                <div className="text-xs text-center text-muted-foreground">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Secure SSL encrypted checkout
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Free shipping on orders over $50
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    30-day return policy
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    2-year warranty included
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

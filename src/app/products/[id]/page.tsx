"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/functional/add-to-cart-button"
import { WishlistButton } from "@/components/functional/wishlist-button"

// Mock product data - in a real app, this would come from your database
const getProduct = (id: string) => {
  const products = {
    "1": {
      id: 1,
      name: "Premium Wireless Headphones",
      description:
        "Experience exceptional sound quality with our premium wireless headphones. Featuring advanced noise cancellation technology, premium materials, and up to 30 hours of battery life.",
      price: 299.99,
      originalPrice: 399.99,
      images: [
        "/placeholder.svg?height=500&width=500",
        "/placeholder.svg?height=500&width=500",
        "/placeholder.svg?height=500&width=500",
      ],
      rating: 4.8,
      reviews: 124,
      inStock: true,
      features: [
        "Active Noise Cancellation",
        "30-hour battery life",
        "Premium leather ear cups",
        "Bluetooth 5.0 connectivity",
        "Quick charge technology",
      ],
      specifications: {
        "Driver Size": "40mm",
        "Frequency Response": "20Hz - 20kHz",
        Impedance: "32 ohms",
        Weight: "250g",
        Connectivity: "Bluetooth 5.0, 3.5mm jack",
      },
    },
    "2": {
      id: 2,
      name: "Smart Fitness Watch",
      description:
        "Track your fitness journey with precision using our advanced smart fitness watch. Monitor heart rate, sleep patterns, and achieve your health goals.",
      price: 199.99,
      originalPrice: 249.99,
      images: ["/placeholder.svg?height=500&width=500", "/placeholder.svg?height=500&width=500"],
      rating: 4.6,
      reviews: 89,
      inStock: true,
      features: ["Heart rate monitoring", "Sleep tracking", "GPS tracking", "Water resistant", "7-day battery life"],
      specifications: {
        Display: "1.4 inch AMOLED",
        Battery: "7 days typical use",
        "Water Resistance": "5ATM",
        Sensors: "Heart rate, GPS, Accelerometer",
        Compatibility: "iOS and Android",
      },
    },
  }

  return products[id as keyof typeof products] || null
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/">
            <Button>Return Home</Button>
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
            </nav>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg border">
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded-lg border cursor-pointer hover:opacity-75"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <Badge variant="destructive">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    inStock={product.inStock}
                    className="w-full"
                  />
                </div>
                <WishlistButton productId={product.id} productName={product.name} size="icon" />
              </div>

              <div className="flex space-x-4">
                <Link href={`/landing/${product.id}`} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    View Product Story
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    navigator.share?.({
                      title: product.name,
                      text: product.description,
                      url: window.location.href,
                    }) || navigator.clipboard.writeText(window.location.href)
                  }}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <div className="font-medium">Free Shipping</div>
                      <div className="text-muted-foreground">Orders over $50</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <div className="font-medium">2 Year Warranty</div>
                      <div className="text-muted-foreground">Full coverage</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <RotateCcw className="h-5 w-5 mr-2 text-orange-600" />
                    <div>
                      <div className="font-medium">30-Day Returns</div>
                      <div className="text-muted-foreground">No questions asked</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Specifications</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

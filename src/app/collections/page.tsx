import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ArrowRight, Star, TrendingUp, Zap, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"

const collections = [
  {
    id: 1,
    name: "Tech & Electronics",
    description: "Latest technology and electronic devices for modern living",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 24,
    icon: Zap,
    color: "from-blue-500 to-purple-600",
    featured: true,
  },
  {
    id: 2,
    name: "Fitness & Wellness",
    description: "Everything you need for a healthy and active lifestyle",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 18,
    icon: Heart,
    color: "from-green-500 to-teal-600",
    featured: true,
  },
  {
    id: 3,
    name: "Eco-Friendly Living",
    description: "Sustainable products for environmentally conscious consumers",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 15,
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
    featured: false,
  },
  {
    id: 4,
    name: "Smart Home",
    description: "Transform your home with intelligent automation",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 12,
    icon: Zap,
    color: "from-orange-500 to-red-600",
    featured: false,
  },
  {
    id: 5,
    name: "Premium Collection",
    description: "Luxury items and premium quality products",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 8,
    icon: Star,
    color: "from-purple-500 to-pink-600",
    featured: true,
  },
  {
    id: 6,
    name: "Outdoor & Adventure",
    description: "Gear up for your next outdoor adventure",
    image: "/placeholder.svg?height=400&width=600",
    productCount: 21,
    icon: TrendingUp,
    color: "from-yellow-500 to-orange-600",
    featured: false,
  },
]

const featuredProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    collection: "Tech & Electronics",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    collection: "Fitness & Wellness",
  },
  {
    id: 3,
    name: "Eco Water Bottle",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    collection: "Eco-Friendly Living",
  },
]

export default function CollectionsPage() {
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
              <Link href="/collections" className="text-foreground font-medium">
                Collections
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeLanguageSwitcher />
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Product Collections</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover curated collections of products designed for every lifestyle and need
          </p>
          <Button size="lg">
            Explore All Collections
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Collections</h2>
            <p className="text-muted-foreground">Our most popular and trending product collections</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {collections
              .filter((collection) => collection.featured)
              .map((collection) => (
                <Card key={collection.id} className="group overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={collection.image || "/placeholder.svg"}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${collection.color} opacity-80`}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
                        <div>
                          <collection.icon className="h-12 w-12 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                          <p className="text-sm opacity-90 mb-4">{collection.description}</p>
                          <Badge variant="secondary" className="mb-4">
                            {collection.productCount} Products
                          </Badge>
                          <div>
                            <Button variant="secondary" size="sm">
                              Shop Collection
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* All Collections Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Collections</h2>
            <p className="text-muted-foreground">Browse our complete range of product collections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Card key={collection.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60`}></div>
                    <div className="absolute top-4 left-4">
                      <collection.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{collection.productCount} items</Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{collection.description}</p>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from Collections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular from Collections</h2>
            <p className="text-muted-foreground">Best-selling products from our featured collections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <Badge variant="outline" className="mb-2 text-xs">
                    {product.collection}
                  </Badge>

                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">{product.rating}</span>
                  </div>
                  <p className="text-xl font-bold mb-4">${product.price}</p>
                  <div className="space-y-2">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        View Product
                      </Button>
                    </Link>
                    <Button className="w-full">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">Get notified about new collections and exclusive offers</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">EcoStore</h5>
              <p className="text-gray-400">Your trusted partner for quality products and exceptional service.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Collections</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/collections" className="hover:text-white">
                    Tech & Electronics
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-white">
                    Fitness & Wellness
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-white">
                    Eco-Friendly
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EcoStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

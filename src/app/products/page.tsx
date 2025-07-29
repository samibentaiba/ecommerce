"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Star, Grid, List, ShoppingCart, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/functional/add-to-cart-button"

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 299.99,
    originalPrice: 399.99,
    category: "Electronics",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor",
    price: 199.99,
    originalPrice: 249.99,
    category: "Wearables",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: "Eco-Friendly Water Bottle",
    description: "Sustainable water bottle made from recycled materials",
    price: 29.99,
    category: "Lifestyle",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 256,
    inStock: true,
    featured: false,
  },
  {
    id: 4,
    name: "Wireless Charging Pad",
    description: "Fast wireless charging for all compatible devices",
    price: 49.99,
    originalPrice: 69.99,
    category: "Electronics",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 67,
    inStock: true,
    featured: false,
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    description: "Portable speaker with premium sound quality",
    price: 89.99,
    category: "Electronics",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 143,
    inStock: false,
    featured: false,
  },
  {
    id: 6,
    name: "Smart Home Hub",
    description: "Control all your smart devices from one place",
    price: 149.99,
    category: "Smart Home",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 92,
    inStock: true,
    featured: false,
  },
]

const categories = ["All", "Electronics", "Wearables", "Lifestyle", "Smart Home"]

export default function ProductsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              E-Store
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-foreground font-medium">
                {t("nav.products")}
              </Link>
              <Link href="/collections" className="text-muted-foreground hover:text-foreground">
                {t("nav.collections")}
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                {t("nav.about")}
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t("nav.products")}</h1>
          <p className="text-muted-foreground text-lg">Discover our complete collection of quality products</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder={t("common.search")} className="pl-10 pr-4" />
              </div>

              <Select defaultValue="All">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("common.category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="featured">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("search.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("product.featured")}</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{t("search.filters")}:</span>
            <Badge variant="secondary" className="cursor-pointer">
              Electronics ×
            </Badge>
            <Badge variant="secondary" className="cursor-pointer">
              {t("product.inStock")} ×
            </Badge>
            <Button variant="ghost" size="sm" className="text-sm">
              {t("search.clearFilters")}
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {products.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images && product.images[0]?.id ? `/api/images/${product.images[0].id}` : "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.featured && <Badge className="absolute top-2 left-2">{t("product.featured")}</Badge>}
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {t("product.outOfStock")}
                    </Badge>
                  )}
                  {product.originalPrice && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {t("product.sale")}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center mb-3">
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
                    <span className="text-sm text-muted-foreground ml-2">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        {t("common.viewDetails")}
                      </Button>
                    </Link>
                    <AddToCartButton
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      inStock={product.inStock}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="default">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">{t("footer.company")}</h5>
              <p className="text-muted-foreground">{t("footer.companyDesc")}</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">{t("footer.quickLinks")}</h6>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    {t("nav.products")}
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-foreground">
                    {t("nav.collections")}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    {t("nav.about")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">{t("footer.customerService")}</h6>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    {t("nav.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    {t("nav.faq")}
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-foreground">
                    {t("nav.shipping")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">{t("footer.connect")}</h6>
              <p className="text-muted-foreground">{t("footer.connectDesc")}</p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Star, Search, Filter, Grid, List, ShoppingCart, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const allProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 299.99,
    originalPrice: 399.99,
    category: "Electronics",
    brand: "AudioTech",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    tags: ["wireless", "noise-cancellation", "premium", "audio"],
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor",
    price: 199.99,
    originalPrice: 249.99,
    category: "Wearables",
    brand: "FitTech",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    tags: ["fitness", "smartwatch", "health", "tracking"],
  },
  {
    id: 3,
    name: "Eco-Friendly Water Bottle",
    description: "Sustainable water bottle made from recycled materials",
    price: 29.99,
    category: "Lifestyle",
    brand: "EcoLife",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 256,
    inStock: true,
    tags: ["eco-friendly", "sustainable", "water", "bottle"],
  },
  {
    id: 4,
    name: "Wireless Charging Pad",
    description: "Fast wireless charging for all compatible devices",
    price: 49.99,
    originalPrice: 69.99,
    category: "Electronics",
    brand: "ChargeTech",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 67,
    inStock: true,
    tags: ["wireless", "charging", "fast", "compatible"],
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    description: "Portable speaker with premium sound quality",
    price: 89.99,
    category: "Electronics",
    brand: "SoundWave",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 143,
    inStock: false,
    tags: ["bluetooth", "speaker", "portable", "sound"],
  },
  {
    id: 6,
    name: "Smart Home Hub",
    description: "Control all your smart devices from one place",
    price: 149.99,
    category: "Smart Home",
    brand: "HomeTech",
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 92,
    inStock: true,
    tags: ["smart-home", "hub", "control", "automation"],
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)

  const categories = [...new Set(allProducts.map((p) => p.category))]
  const brands = [...new Set(allProducts.map((p) => p.brand))]

  useEffect(() => {
    let filtered = allProducts

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category))
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand))
    }

    // Price range filter
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((product) => product.rating >= minRating)
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((product) => product.inStock)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, minRating, inStockOnly, sortBy])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 500])
    setMinRating(0)
    setInStockOnly(false)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
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
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {/* Active Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="cursor-pointer">
                    {category}
                    <X className="h-3 w-3 ml-1" onClick={() => toggleCategory(category)} />
                  </Badge>
                ))}
                {selectedBrands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="cursor-pointer">
                    {brand}
                    <X className="h-3 w-3 ml-1" onClick={() => toggleBrand(brand)} />
                  </Badge>
                ))}
                {(selectedCategories.length > 0 || selectedBrands.length > 0 || minRating > 0 || inStockOnly) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filters</h3>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Brands</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label htmlFor={brand} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-4">
                    <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={minRating === rating}
                          onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                        />
                        <label htmlFor={`rating-${rating}`} className="flex items-center text-sm cursor-pointer">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          {rating}+ stars
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
                    <label htmlFor="inStock" className="text-sm cursor-pointer">
                      In stock only
                    </label>
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </Card>
            ) : (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
              >
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`group hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}
                  >
                    <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "rounded-t-lg"
                        }`}
                      >
                        <Image
                          src={product.images && product.images[0]?.id ? `/api/images/${product.images[0].id}` : "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === "list" ? "w-full h-full" : "w-full h-64"
                          }`}
                        />
                        {!product.inStock && (
                          <Badge variant="destructive" className="absolute top-2 right-2">
                            Out of Stock
                          </Badge>
                        )}
                        {product.originalPrice && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Sale
                          </Badge>
                        )}
                      </div>

                      <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                        <div>
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs mb-2">
                              {product.category}
                            </Badge>
                          </div>

                          <h3
                            className={`font-semibold mb-2 ${viewMode === "list" ? "text-xl" : "text-lg"} line-clamp-2`}
                          >
                            {product.name}
                          </h3>

                          {viewMode === "list" && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                          )}

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

                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xl font-bold">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`${viewMode === "list" ? "flex" : ""} gap-2`}>
                          <Link href={`/products/${product.id}`} className={viewMode === "list" ? "flex-1" : ""}>
                            <Button
                              variant="outline"
                              className={`${viewMode === "list" ? "w-full" : "w-full"} bg-transparent`}
                            >
                              View Details
                            </Button>
                          </Link>
                          {viewMode === "list" && (
                            <Button className="flex-1" disabled={!product.inStock}>
                              {product.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>
                          )}
                        </div>

                        {viewMode === "grid" && (
                          <Button className="w-full mt-2" disabled={!product.inStock}>
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

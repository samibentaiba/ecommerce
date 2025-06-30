"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { ShoppingCart, Heart, Search, Star, ArrowRight, Truck, Shield, Headphones } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { t } = useLanguage()

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.8,
      reviews: 124,
      badge: t("product.bestSeller"),
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.6,
      reviews: 89,
      badge: t("product.new"),
    },
    {
      id: 3,
      name: "Eco-Friendly Water Bottle",
      price: 29.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.9,
      reviews: 203,
      badge: t("product.eco"),
    },
  ]

  const collections = [
    {
      name: t("collections.electronics"),
      description: t("collections.electronicsDesc"),
      image: "/placeholder.svg?height=200&width=300",
      productCount: 45,
    },
    {
      name: t("collections.lifestyle"),
      description: t("collections.lifestyleDesc"),
      image: "/placeholder.svg?height=200&width=300",
      productCount: 32,
    },
    {
      name: t("collections.fitness"),
      description: t("collections.fitnessDesc"),
      image: "/placeholder.svg?height=200&width=300",
      productCount: 28,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold">
                E-Store
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  {t("nav.products")}
                </Link>
                <Link href="/collections" className="text-muted-foreground hover:text-foreground">
                  {t("nav.collections")}
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  {t("nav.about")}
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  {t("nav.contact")}
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("common.search")} className="w-64" />
              </div>
              <ThemeLanguageSwitcher />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{t("home.hero.title")}</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{t("home.hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">
                {t("common.shopNow")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/collections">{t("nav.collections")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.freeShipping")}</h3>
              <p className="text-muted-foreground">{t("home.features.freeShippingDesc")}</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.securePayment")}</h3>
              <p className="text-muted-foreground">{t("home.features.securePaymentDesc")}</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.support")}</h3>
              <p className="text-muted-foreground">{t("home.features.supportDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("home.featuredProducts.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("home.featuredProducts.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute top-4 left-4">{product.badge}</Badge>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
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
                      ({product.reviews} {t("common.reviews")})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/products/${product.id}`}>{t("common.viewDetails")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                {t("common.viewAll")} {t("nav.products")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("home.collections.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("home.collections.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative overflow-hidden">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                      <p className="mb-4">{collection.description}</p>
                      <Badge variant="secondary">
                        {collection.productCount} {t("collections.products")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.newsletter.title")}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{t("home.newsletter.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input placeholder={t("home.newsletter.placeholder")} className="bg-white text-black" />
            <Button variant="secondary">{t("common.subscribe")}</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.company")}</h3>
              <p className="text-muted-foreground mb-4">{t("footer.companyDesc")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.quickLinks")}</h4>
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
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    {t("nav.contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.customerService")}</h4>
              <ul className="space-y-2 text-muted-foreground">
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
                <li>
                  <Link href="/orders" className="hover:text-foreground">
                    {t("nav.orders")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    {t("nav.contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.connect")}</h4>
              <p className="text-muted-foreground mb-4">{t("footer.connectDesc")}</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


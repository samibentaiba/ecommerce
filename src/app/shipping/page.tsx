import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Truck, Clock, Globe, Package, Shield, MapPin, Calculator } from "lucide-react"
import Link from "next/link"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"

const shippingOptions = [
  {
    name: "Standard Shipping",
    price: "$9.99",
    time: "5-7 business days",
    description: "Reliable delivery for most orders",
    icon: Truck,
    features: ["Tracking included", "Insurance up to $100", "Signature not required"],
  },
  {
    name: "Expedited Shipping",
    price: "$19.99",
    time: "2-3 business days",
    description: "Faster delivery when you need it sooner",
    icon: Clock,
    features: ["Priority handling", "Tracking included", "Insurance up to $500"],
  },
  {
    name: "Overnight Shipping",
    price: "$39.99",
    time: "1 business day",
    description: "Next-day delivery for urgent orders",
    icon: Package,
    features: ["Next business day delivery", "Signature required", "Full insurance coverage"],
  },
  {
    name: "Free Shipping",
    price: "FREE",
    time: "5-7 business days",
    description: "Free standard shipping on orders over $50",
    icon: Shield,
    features: ["Orders $50+", "Same as standard shipping", "Tracking included"],
  },
]

const internationalZones = [
  {
    zone: "Zone 1 (Canada)",
    countries: ["Canada"],
    time: "7-10 business days",
    startingPrice: "$15.99",
  },
  {
    zone: "Zone 2 (Europe)",
    countries: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands"],
    time: "10-14 business days",
    startingPrice: "$24.99",
  },
  {
    zone: "Zone 3 (Asia Pacific)",
    countries: ["Australia", "Japan", "South Korea", "Singapore", "New Zealand"],
    time: "12-16 business days",
    startingPrice: "$29.99",
  },
  {
    zone: "Zone 4 (Rest of World)",
    countries: ["Other supported countries"],
    time: "14-21 business days",
    startingPrice: "$34.99",
  },
]

export default function ShippingPage() {
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
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fast, reliable shipping options to get your orders delivered safely and on time.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Free shipping on orders over $50
          </Badge>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Shipping Options */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Domestic Shipping Options</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the shipping option that best fits your needs and timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingOptions.map((option, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                {option.name === "Free Shipping" && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <option.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{option.name}</CardTitle>
                  <div className="text-2xl font-bold text-blue-600">{option.price}</div>
                  <CardDescription>{option.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* International Shipping */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">International Shipping</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We ship to over 25 countries worldwide. Shipping costs and delivery times vary by destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internationalZones.map((zone, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{zone.zone}</CardTitle>
                    <Badge variant="outline">{zone.time}</Badge>
                  </div>
                  <div className="text-xl font-bold text-blue-600">Starting at {zone.startingPrice}</div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{zone.countries.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">International Shipping Notes</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Additional customs fees and taxes may apply depending on your country's regulations</li>
                  <li>• Delivery times are estimates and may vary due to customs processing</li>
                  <li>• Some products may have shipping restrictions to certain countries</li>
                  <li>• International orders cannot be expedited or shipped overnight</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Policies */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shipping Policies</h2>
            <p className="text-muted-foreground">Important information about our shipping process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Orders are typically processed within 1-2 business days. Orders placed after 2 PM EST will be
                  processed the next business day.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-600" />
                  Packaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  All items are carefully packaged to ensure safe delivery. We use eco-friendly packaging materials
                  whenever possible.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  All shipments include basic insurance. Additional insurance is available for high-value items at
                  checkout.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-orange-600" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  You'll receive a tracking number via email once your order ships. Track your package anytime on our
                  website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Most packages are delivered to your doorstep. Signature may be required for high-value or overnight
                  shipments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-teal-600" />
                  Shipping Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  Calculate exact shipping costs and delivery times for your location at checkout.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Calculate Shipping
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shipping FAQ</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my shipping address after placing an order?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can change your shipping address within 1 hour of placing your order. After this time, please
                  contact our customer service team immediately as we may not be able to make changes once the order is
                  processed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I'm not home for delivery?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For standard shipments, the carrier will typically leave the package at your door or with a neighbor.
                  For signature-required shipments, they'll leave a delivery notice and attempt redelivery or hold the
                  package at a local facility for pickup.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you ship to P.O. boxes?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we can ship to P.O. boxes for standard and expedited shipping. However, overnight shipping and
                  some large items cannot be delivered to P.O. boxes and require a physical address.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if my package is damaged or lost?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If your package arrives damaged or goes missing, please contact us immediately. We'll work with the
                  shipping carrier to resolve the issue and ensure you receive your order or a full refund. All
                  shipments include insurance coverage.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <Card className="max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold mb-4">Need Help with Shipping?</h2>
            <p className="text-muted-foreground mb-6">
              Our customer service team is here to help with any shipping questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">Contact Support</Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" size="lg">
                  Track Your Order
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">EcoStore</h5>
              <p className="text-gray-400">Your trusted partner for quality products and exceptional service.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-white">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
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
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Connect</h6>
              <p className="text-gray-400">Follow us for updates and special offers.</p>
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

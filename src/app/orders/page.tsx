"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Search, Package, Truck, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"

const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 299.99,
    items: [{ name: "Premium Wireless Headphones", quantity: 1, price: 299.99 }],
    tracking: "1Z999AA1234567890",
    estimatedDelivery: "2024-01-18",
    actualDelivery: "2024-01-17",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-20",
    status: "shipped",
    total: 229.98,
    items: [
      { name: "Smart Fitness Watch", quantity: 1, price: 199.99 },
      { name: "Eco-Friendly Water Bottle", quantity: 1, price: 29.99 },
    ],
    tracking: "1Z999AA1234567891",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-22",
    status: "processing",
    total: 149.99,
    items: [{ name: "Wireless Charging Pad", quantity: 3, price: 49.99 }],
    estimatedDelivery: "2024-01-28",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Track Your Orders</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Keep track of your orders and get real-time updates on shipping and delivery status.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Tracking Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Order Lookup</CardTitle>
                <CardDescription>Enter your order number or email to track your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    placeholder="ORD-2024-001"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </Button>
              </CardContent>
            </Card>

            {/* Order Status Guide */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Status Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-muted-foreground">Order is being prepared</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Shipped</p>
                    <p className="text-sm text-muted-foreground">Order is on its way</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-muted-foreground">Order has been delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Your Orders</h2>
              <p className="text-muted-foreground">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {filteredOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "You haven't placed any orders yet."}
                </p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} mb-2`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </Badge>
                          <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Tracking Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Tracking Number</h4>
                            <p className="text-sm text-muted-foreground">{order.tracking || "Not available yet"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              {order.status === "delivered" ? "Delivered" : "Estimated Delivery"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {order.status === "delivered"
                                ? new Date(order.actualDelivery!).toLocaleDateString()
                                : new Date(order.estimatedDelivery).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          {order.tracking && (
                            <Button variant="outline" size="sm">
                              <Truck className="mr-2 h-4 w-4" />
                              Track Package
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <Button variant="outline" size="sm">
                              Return Item
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help with Your Order?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our customer support team is here to help with any questions about your orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Order Issues</h3>
              <p className="text-muted-foreground text-sm mb-4">Problems with your order or need to make changes?</p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Get Help
                </Button>
              </Link>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Shipping Info</h3>
              <p className="text-muted-foreground text-sm mb-4">Learn about our shipping options and policies</p>
              <Link href="/shipping">
                <Button variant="outline" size="sm">
                  Shipping Info
                </Button>
              </Link>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Returns</h3>
              <p className="text-muted-foreground text-sm mb-4">Need to return or exchange an item?</p>
              <Link href="/faq">
                <Button variant="outline" size="sm">
                  Return Policy
                </Button>
              </Link>
            </Card>
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

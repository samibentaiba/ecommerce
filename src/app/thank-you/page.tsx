import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  // In a real app, you'd get order details from URL params or session
  const orderDetails = {
    orderNumber: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerName: "John Doe",
    email: "john@example.com",
    total: 299.99,
    estimatedDelivery: "3-5 business days",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
          <p className="text-xl text-gray-600">Your order has been successfully placed and is being processed.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Confirmation</CardTitle>
            <CardDescription>Order #{orderDetails.orderNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
                <p className="text-gray-600">{orderDetails.customerName}</p>
                <p className="text-gray-600">{orderDetails.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Order Total</h4>
                <p className="text-2xl font-bold text-gray-900">${orderDetails.total}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">You'll receive an email confirmation shortly</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="text-gray-600">Your order will be processed within 24 hours</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-600">Estimated delivery: {orderDetails.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg">Track Your Order</Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">Questions about your order? Contact us at support@ecostore.com</p>
        </div>
      </div>
    </div>
  )
}

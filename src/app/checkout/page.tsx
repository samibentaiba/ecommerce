"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Lock, CreditCard, ArrowLeft, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Shipping Information
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",

    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",

    // Options
    shippingMethod: "standard",
    paymentMethod: "card",
    saveInfo: false,
    sameAsBilling: true,
  })

  const cartItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = formData.shippingMethod === "standard" ? 0 : formData.shippingMethod === "expedited" ? 19.99 : 39.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate payment processing
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your order.",
    })

    // Simulate API call
    setTimeout(() => {
      router.push("/thank-you")
    }, 2000)
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
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
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm ${step >= stepNumber ? "text-blue-600" : "text-gray-600"}`}>
                  {stepNumber === 1 ? "Shipping" : stepNumber === 2 ? "Payment" : "Review"}
                </span>
                {stepNumber < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Where should we send your order?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                      <Input
                        id="apartment"
                        value={formData.apartment}
                        onChange={(e) => handleInputChange("apartment", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onCheckedChange={(checked) => handleInputChange("saveInfo", checked as boolean)}
                      />
                      <Label htmlFor="saveInfo">Save this information for next time</Label>
                    </div>

                    <Button type="button" onClick={nextStep} className="w-full">
                      Continue to Payment
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Shipping Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={formData.shippingMethod}
                        onValueChange={(value) => handleInputChange("shippingMethod", value)}
                      >
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">Standard Shipping</p>
                                <p className="text-sm text-muted-foreground">5-7 business days</p>
                              </div>
                              <span className="font-medium">FREE</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="expedited" id="expedited" />
                          <Label htmlFor="expedited" className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">Expedited Shipping</p>
                                <p className="text-sm text-muted-foreground">2-3 business days</p>
                              </div>
                              <span className="font-medium">$19.99</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="overnight" id="overnight" />
                          <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">Overnight Shipping</p>
                                <p className="text-sm text-muted-foreground">1 business day</p>
                              </div>
                              <span className="font-medium">$39.99</span>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) => handleInputChange("paymentMethod", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                      </RadioGroup>

                      {formData.paymentMethod === "card" && (
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                                required
                              />
                              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange("cvv", e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nameOnCard">Name on Card</Label>
                            <Input
                              id="nameOnCard"
                              value={formData.nameOnCard}
                              onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <Button type="button" variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                          Back to Shipping
                        </Button>
                        <Button type="button" onClick={nextStep} className="flex-1">
                          Review Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                    <CardDescription>Please review your order before completing your purchase</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p>{formData.address}</p>
                        {formData.apartment && <p>{formData.apartment}</p>}
                        <p>
                          {formData.city}, {formData.state} {formData.zipCode}
                        </p>
                        <p>{formData.phone}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <div className="text-sm text-muted-foreground">
                        {formData.paymentMethod === "card" ? (
                          <p>Credit Card ending in {formData.cardNumber.slice(-4)}</p>
                        ) : (
                          <p>PayPal</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                        Back to Payment
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Lock className="mr-2 h-4 w-4" />
                        Complete Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price}</p>
                      </div>
                      <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground pt-4">
                  <Shield className="h-4 w-4" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PasswordResetTemplate,
  WelcomeTemplate,
  OrderConfirmationTemplate,
} from "@/components/email/EmailTemplate";

export default function EmailPreviewPage() {
  const [email, setEmail] = useState("test@example.com");
  const [name, setName] = useState("John Doe");
  const [resetUrl, setResetUrl] = useState("https://example.com/reset?token=abc123");
  const [orderId, setOrderId] = useState("ORD-12345");
  const [orderTotal, setOrderTotal] = useState("99.99");
  const [orderStatus, setOrderStatus] = useState("Processing");

  const orderDetails = {
    total: orderTotal,
    status: orderStatus,
  };

  const handleSendTestEmail = async (type: string) => {
    try {
      let endpoint = "";
      let payload = {};

      switch (type) {
        case "password-reset":
          endpoint = "/api/auth/forgot-password";
          payload = { email };
          break;
        case "welcome":
          endpoint = "/api/orders/confirmation"; // Using this as a test endpoint
          payload = { email, orderId, orderDetails };
          break;
        case "order-confirmation":
          endpoint = "/api/orders/confirmation";
          payload = { email, orderId, orderDetails };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Test email sent successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("Failed to send test email");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Email Template Preview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="resetUrl">Reset URL</Label>
                <Input
                  id="resetUrl"
                  value={resetUrl}
                  onChange={(e) => setResetUrl(e.target.value)}
                  placeholder="https://example.com/reset?token=abc123"
                />
              </div>

              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORD-12345"
                />
              </div>

              <div>
                <Label htmlFor="orderTotal">Order Total</Label>
                <Input
                  id="orderTotal"
                  value={orderTotal}
                  onChange={(e) => setOrderTotal(e.target.value)}
                  placeholder="99.99"
                />
              </div>

              <div>
                <Label htmlFor="orderStatus">Order Status</Label>
                <Input
                  id="orderStatus"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  placeholder="Processing"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Test Emails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleSendTestEmail("password-reset")}
                className="w-full"
              >
                Send Password Reset Email
              </Button>
              <Button
                onClick={() => handleSendTestEmail("welcome")}
                className="w-full"
              >
                Send Welcome Email
              </Button>
              <Button
                onClick={() => handleSendTestEmail("order-confirmation")}
                className="w-full"
              >
                Send Order Confirmation Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password-reset" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
                  <TabsTrigger value="welcome">Welcome</TabsTrigger>
                  <TabsTrigger value="order-confirmation">Order Confirmation</TabsTrigger>
                </TabsList>

                <TabsContent value="password-reset" className="mt-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <PasswordResetTemplate resetUrl={resetUrl} />
                  </div>
                </TabsContent>

                <TabsContent value="welcome" className="mt-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <WelcomeTemplate name={name} />
                  </div>
                </TabsContent>

                <TabsContent value="order-confirmation" className="mt-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <OrderConfirmationTemplate
                      orderId={orderId}
                      orderDetails={orderDetails}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
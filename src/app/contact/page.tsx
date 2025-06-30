
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { ShoppingCart, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Package } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: t("message.messageSent"),
      description: "We'll get back to you within 24 hours.",
    })
    setFormData({ name: "", email: "", subject: "", category: "", message: "" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
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

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("contact.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("contact.subtitle")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">{t("contact.info.title")}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.info.email")}</h3>
                    <p className="text-muted-foreground">contact@estore.com</p>
                    <p className="text-muted-foreground">support@estore.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.info.phone")}</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.info.address")}</h3>
                    <p className="text-muted-foreground">123 Commerce Street</p>
                    <p className="text-muted-foreground">Business City, BC 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.info.hours")}</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help Cards */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t("contact.quickHelp.title")}</h3>
              <div className="space-y-3">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{t("contact.quickHelp.trackOrder")}</p>
                      <p className="text-sm text-muted-foreground">{t("contact.quickHelp.trackOrderDesc")}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t("contact.quickHelp.faq")}</p>
                      <p className="text-sm text-muted-foreground">{t("contact.quickHelp.faqDesc")}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">{t("contact.quickHelp.liveChat")}</p>
                      <p className="text-sm text-muted-foreground">{t("contact.quickHelp.liveChatDesc")}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.form.title")}</CardTitle>
                <CardDescription>{t("contact.form.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contact.form.fullName")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contact.form.emailAddress")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">{t("common.category")}</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Customer Support</SelectItem>
                          <SelectItem value="orders">Order Issues</SelectItem>
                          <SelectItem value="returns">Returns & Refunds</SelectItem>
                          <SelectItem value="products">Product Questions</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t("common.subject")} *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.form.messageText")} *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    {t("contact.form.sendMessage")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Response Time</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
                <p className="text-muted-foreground text-sm">
                  For urgent matters, please call our support line directly.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Order Support</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  For order-related questions, please include your order number in your message.
                </p>
                <p className="text-muted-foreground text-sm">
                  You can find your order number in your confirmation email.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-muted-foreground">Visit our headquarters or one of our retail locations</p>
          </div>

          <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive map would be displayed here</p>
              <p className="text-sm text-muted-foreground">123 Commerce Street, Business City, BC 12345</p>
            </div>
          </div>
        </div>
      </section>

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

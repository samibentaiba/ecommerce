"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, ExternalLink, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ProductPage {
  id: number
  title: string
  productId: number
  productName: string
  metaTitle: string
  metaDescription: string
  content: string
  featuredImage: string
  status: "published" | "draft"
  seoScore: number
  lastModified: string
}

export default function ProductPagesPage() {
  const [productPages, setProductPages] = useState<ProductPage[]>([
    {
      id: 1,
      title: "Premium Wireless Headphones - Product Page",
      productId: 1,
      productName: "Premium Wireless Headphones",
      metaTitle: "Premium Wireless Headphones | Best Audio Experience",
      metaDescription:
        "Experience exceptional sound quality with our premium wireless headphones featuring advanced noise cancellation.",
      content: "Detailed product description with specifications, features, and benefits...",
      featuredImage: "/placeholder.svg?height=200&width=300",
      status: "published",
      seoScore: 85,
      lastModified: "2024-01-15",
    },
    {
      id: 2,
      title: "Smart Fitness Watch - Product Page",
      productId: 2,
      productName: "Smart Fitness Watch",
      metaTitle: "Smart Fitness Watch | Track Your Health Goals",
      metaDescription: "Advanced fitness tracking with heart rate monitoring, GPS, and comprehensive health insights.",
      content: "Comprehensive product information including health tracking features...",
      featuredImage: "/placeholder.svg?height=200&width=300",
      status: "draft",
      seoScore: 72,
      lastModified: "2024-01-14",
    },
    {
      id: 3,
      title: "Eco-Friendly Water Bottle - Product Page",
      productId: 3,
      productName: "Eco-Friendly Water Bottle",
      metaTitle: "Eco-Friendly Water Bottle | Sustainable Hydration",
      metaDescription: "Sustainable water bottle made from recycled materials. Perfect for eco-conscious consumers.",
      content: "Environmental benefits and product sustainability information...",
      featuredImage: "/placeholder.svg?height=200&width=300",
      status: "published",
      seoScore: 90,
      lastModified: "2024-01-13",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<ProductPage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    productId: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
    status: "draft" as const,
  })

  const products = [
    { id: 1, name: "Premium Wireless Headphones" },
    { id: 2, name: "Smart Fitness Watch" },
    { id: 3, name: "Eco-Friendly Water Bottle" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedProduct = products.find((p) => p.id === Number.parseInt(formData.productId))

    if (editingPage) {
      setProductPages(
        productPages.map((page) =>
          page.id === editingPage.id
            ? {
                ...editingPage,
                ...formData,
                productId: Number.parseInt(formData.productId),
                productName: selectedProduct?.name || "",
                lastModified: new Date().toISOString().split("T")[0],
              }
            : page,
        ),
      )
    } else {
      const newPage: ProductPage = {
        id: Date.now(),
        ...formData,
        productId: Number.parseInt(formData.productId),
        productName: selectedProduct?.name || "",
        featuredImage: "/placeholder.svg?height=200&width=300",
        seoScore: Math.floor(Math.random() * 30) + 70,
        lastModified: new Date().toISOString().split("T")[0],
      }
      setProductPages([...productPages, newPage])
    }

    setIsDialogOpen(false)
    setEditingPage(null)
    setFormData({ title: "", productId: "", metaTitle: "", metaDescription: "", content: "", status: "draft" })
  }

  const handleEdit = (page: ProductPage) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      productId: page.productId.toString(),
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      content: page.content,
      status: page.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setProductPages(productPages.filter((page) => page.id !== id))
  }

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredPages = productPages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Pages</h2>
          <p className="text-muted-foreground">Manage individual product page content and SEO</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPage(null)
                setFormData({
                  title: "",
                  productId: "",
                  metaTitle: "",
                  metaDescription: "",
                  content: "",
                  status: "draft",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Product Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Product Page" : "Create New Product Page"}</DialogTitle>
              <DialogDescription>
                {editingPage ? "Update product page content and SEO" : "Create a custom page for a product"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="metaTitle">SEO Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO optimized title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="SEO meta description (150-160 characters)"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Page Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed product content, features, specifications..."
                    rows={6}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "published" | "draft") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingPage ? "Update Page" : "Create Page"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Pages</CardTitle>
          <CardDescription>Manage content and SEO for individual product pages</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Image
                      src={page.featuredImage || "/placeholder.svg"}
                      alt={page.title}
                      width={60}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{page.metaTitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>{page.productName}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getSeoScoreColor(page.seoScore)}`}>{page.seoScore}/100</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(page.lastModified).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/products/${page.productId}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

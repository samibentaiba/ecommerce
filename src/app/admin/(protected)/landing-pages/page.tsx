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
import { Plus, Edit, Trash2, ExternalLink, LayoutTemplateIcon as Template } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { LandingPage, LandingPageTemplate } from "@/lib/types"

export default function LandingPagesPage() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([
    {
      id: 1,
      title: "Premium Headphones Landing",
      slug: "premium-headphones",
      productId: 1,
      productName: "Premium Wireless Headphones",
      headline: "Experience Sound Like Never Before",
      description:
        "Discover the ultimate audio experience with our premium wireless headphones featuring advanced noise cancellation technology.",
      heroImage: "/placeholder.svg?height=400&width=800",
      status: "published",
      createdAt: "2024-01-15",
      templateId: 1,
    },
  ])

  const [templates] = useState<LandingPageTemplate[]>([
    {
      id: 1,
      name: "Modern Hero Template",
      description: "Clean and modern template with hero section, features, and CTA",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: true,
      createdAt: "2024-01-15",
      sections: [],
    },
    {
      id: 2,
      name: "Product Showcase",
      description: "Perfect for showcasing product details with gallery and testimonials",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: false,
      createdAt: "2024-01-14",
      sections: [],
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<LandingPageTemplate | null>(null)


  const [formData, setFormData] = useState<{
    title: string
    slug: string
    productId: string
    headline: string
    description: string
    status: "draft" | "published"
    templateId: string
  }>({
    title: "",
    slug: "",
    productId: "",
    headline: "",
    description: "",
    status: "draft",
    templateId: "",
  })


  const products = [
    { id: 1, name: "Premium Wireless Headphones" },
    { id: 2, name: "Smart Fitness Watch" },
    { id: 3, name: "Eco-Friendly Water Bottle" },
  ]

  const handleCreateWithTemplate = (template: LandingPageTemplate) => {
    setSelectedTemplate(template)
    setFormData({ ...formData, templateId: template.id.toString() })
    setIsTemplateSelectOpen(false)
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedProduct = products.find((p) => p.id === Number.parseInt(formData.productId))

    if (editingPage) {
      setLandingPages(
        landingPages.map((page) =>
          page.id === editingPage.id
            ? {
              ...editingPage,
              ...formData,
              productId: Number.parseInt(formData.productId),
              productName: selectedProduct?.name || "",
              templateId: formData.templateId ? Number.parseInt(formData.templateId) : undefined,
            }
            : page,
        ),
      )
    } else {
      const newPage: LandingPage = {
        id: Date.now(),
        ...formData,
        productId: Number.parseInt(formData.productId),
        productName: selectedProduct?.name || "",
        heroImage: "/placeholder.svg?height=400&width=800",
        createdAt: new Date().toISOString().split("T")[0],
        templateId: formData.templateId ? Number.parseInt(formData.templateId) : undefined,
      }
      setLandingPages([...landingPages, newPage])
    }

    resetForm()
  }

  const resetForm = () => {
    setIsDialogOpen(false)
    setIsTemplateSelectOpen(false)
    setEditingPage(null)
    setSelectedTemplate(null)
    setFormData({ title: "", slug: "", productId: "", headline: "", description: "", status: "draft", templateId: "" })
  }

  const handleEdit = (page: LandingPage) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      productId: page.productId.toString(),
      headline: page.headline,
      description: page.description,
      status: page.status,
      templateId: page.templateId?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setLandingPages(landingPages.filter((page) => page.id !== id))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Landing Pages</h2>
          <p className="text-muted-foreground">Create custom marketing pages for your products using templates</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isTemplateSelectOpen} onOpenChange={setIsTemplateSelectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Template className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>Select a template to create your landing page</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleCreateWithTemplate(template)}
                  >
                    <div className="relative">
                      <Image
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.name}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      {template.isDefault && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Default
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Landing Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? "Edit Landing Page" : "Create New Landing Page"}
                  {selectedTemplate && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      using {selectedTemplate.name}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingPage ? "Update landing page content" : "Create a custom marketing page for a product"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value
                        setFormData({
                          ...formData,
                          title,
                          slug: formData.slug || generateSlug(title),
                        })
                      }}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-name"
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
                  {!selectedTemplate && (
                    <div className="grid gap-2">
                      <Label htmlFor="template">Template (Optional)</Label>
                      <Select
                        value={formData.templateId}
                        onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Template</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="Compelling headline for your product"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed product story and benefits"
                      rows={4}
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
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingPage ? "Update Page" : "Create Page"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landing Pages</CardTitle>
          <CardDescription>Manage your custom product marketing pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landingPages.map((page) => {
                const template = templates.find((t) => t.id === page.templateId)
                return (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">{page.headline}</div>
                      </div>
                    </TableCell>
                    <TableCell>{page.productName}</TableCell>
                    <TableCell>
                      {template ? (
                        <Badge variant="outline">{template.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Custom</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        /landing/{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(page.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/landing/${page.slug}`} target="_blank">
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

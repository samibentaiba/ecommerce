"use client"

import type React from "react"
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
import { Plus, Edit, Trash2, ExternalLink, LayoutTemplateIcon as Template, Search, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLandingPages } from "./hook"
import { SectionEditor } from "@/components/admin/SectionEditor"

export default function LandingPagesPage() {
  const {
    landingPages,
    loading,
    error,
    templates,
    products,
    isDialogOpen,
    isTemplateSelectOpen,
    editingPage,
    selectedTemplate,
    formData,
    searchTerm,
    statusFilter,
    setIsDialogOpen,
    setIsTemplateSelectOpen,
    setError,
    setFormData,
    setSearchTerm,
    setStatusFilter,
    updateFormDataWithSlug,
    handleCreateWithTemplate,
    handleCreateWithoutTemplate,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    getTemplateById,
    getProductById,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    pageToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,

    // Section editor
    templateSections,
    isSectionEditorOpen,
    setIsSectionEditorOpen,
    updateSection,
  } = useLandingPages()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Landing Pages</h2>
          <p className="text-muted-foreground">Create custom marketing pages for your products using templates</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleCreateWithoutTemplate}
            className="mr-2"
          >
            <Template className="mr-2 h-4 w-4" />
            Create with Default Template
          </Button>
          
          <Dialog open={isTemplateSelectOpen} onOpenChange={setIsTemplateSelectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Template className="mr-2 h-4 w-4" />
                Choose Template
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
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      template.isDefault ? "ring-2 ring-primary/20" : ""
                    }`}
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
                        <Badge className="absolute top-2 right-2" variant="default">
                          Default Template
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      {template.isDefault && (
                        <p className="text-xs text-primary mt-2">
                          This template will be used automatically when no template is selected
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            // Auto-reset form when dialog closes
            if (!open) {
              resetForm()
            }
          }}>
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateFormDataWithSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product *</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => setFormData({ ...formData, productId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                    <div className="grid gap-2">
                    <Label>Template</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Template className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {selectedTemplate?.name || "Modern Hero Template (Default)"}
                      </span>
                      {selectedTemplate?.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="headline">Headline *</Label>
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
                      onValueChange={(value: "PUBLISHED" | "DRAFT") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingPage ? "Update Page" : "Create Page"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Section Editor Dialog */}
          <Dialog open={isSectionEditorOpen} onOpenChange={(open) => {
            setIsSectionEditorOpen(open)
            // Auto-reset form when dialog closes
            if (!open) {
              resetForm()
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Template className="h-5 w-5" />
                  Customize Template Sections
                </DialogTitle>
                <DialogDescription>
                  Fill in the content for each section of your landing page
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Template: {selectedTemplate?.name}</h3>
                  <p className="text-blue-700 text-sm">
                    Customize the content for each section below. You can expand each section to edit its content.
                  </p>
                </div>

                {templateSections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No sections found in this template.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templateSections.map((section, index) => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        index={index}
                        onUpdate={updateSection}
                      />
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSectionEditorOpen(false)
                    setIsTemplateSelectOpen(true)
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Template Selection
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsSectionEditorOpen(false)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Continue to Page Details
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landing Pages</CardTitle>
          <CardDescription>Manage your custom product marketing pages</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search landing pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            {/* Filter by status */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
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
                  const template = getTemplateById(page.templateId || "")
                  const product = getProductById(page.productId)
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{page.headline}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product?.name || page.productId}</TableCell>
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
                        <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>{page.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(page.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/landing/${page.slug}`} target="_blank">
                            <Button variant="outline" size="sm" aria-label="View landing page">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(page)} aria-label="Edit landing page">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(page)} aria-label="Delete landing page">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && pageToDelete && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete landing page "{pageToDelete.title}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

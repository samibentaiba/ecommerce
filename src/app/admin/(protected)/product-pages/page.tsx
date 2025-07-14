"use client";

import type React from "react";
import type { ProductPage } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";

import { useProductPage } from "./hook";
export default function ProductPagesPage() {
  const { t } = useLanguage();
  const {
    productPages,
    isDialogOpen,
    searchTerm,
    statusFilter,
    setStatusFilter,
    editingPage,
    products,
    formData,
    setSearchTerm,
    handleDelete,
    handleEdit,
    setEditingPage,
    setProductPages,
    setIsDialogOpen,
    getSeoScoreColor,
    setFormData,
    handleSubmit,
    // Delete handlers
    showDeleteDialog,
    setShowDeleteDialog,
    pageToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useProductPage();
  const statusClasses = {
    PUBLISHED:
      "bg-green-200 w-full hover:bg-green-300 text-green-900 dark:bg-green-900 dark:hover:bg-green-700 dark:text-green-200",
    DRAFT:
      "bg-red-200 w-full hover:bg-red-300 text-red-900 dark:bg-red-900  dark:hover:bg-red-700 dark:text-red-200",
  };
  const getProductStatusVariant = (status: "PUBLISHED" | "DRAFT") => {
    if (status === "PUBLISHED") return "status-active";
    if (status === "DRAFT") return "status-inactive";
    return "default";
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Pages</h2>
          <p className="text-muted-foreground">
            Manage individual product page content and SEO
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPage(null);
                setFormData({
                  title: "",
                  productId: "",
                  metaTitle: "",
                  metaDescription: "",
                  content: "",
                  status: "DRAFT",
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Product Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? "Edit Product Page" : "Create New Product Page"}
              </DialogTitle>
              <DialogDescription>
                {editingPage
                  ? "Update product page content and SEO"
                  : "Create a custom page for a product"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
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
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    placeholder="SEO optimized title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Detailed product content, features, specifications..."
                    rows={6}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "PUBLISHED" | "DRAFT") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger
                      className={`${statusClasses[formData.status]}`}
                    >
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
                <Button type="submit">
                  {editingPage ? "Update Page" : "Create Page"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Pages</CardTitle>
          <CardDescription>
            Manage content and SEO for individual product pages
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product pages..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPages.map((page: ProductPage) => (
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
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {page.metaTitle}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${getSeoScoreColor(
                        page.seoScore
                      )}`}
                    >
                      {page.seoScore}/100
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getProductStatusVariant(page.status)}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(page.lastModified).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${page.productId}`}
                        target="_blank"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(page)}
                      >
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && pageToDelete && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete product page "{pageToDelete.title}"? This
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
  );
}

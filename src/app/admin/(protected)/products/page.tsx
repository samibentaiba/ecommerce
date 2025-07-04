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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Search, X } from "lucide-react"
import Image from "next/image"
import type { Product, ProductImage, ProductVariant } from "@/lib/types"
import { useLanguage } from "@/components/providers/language-provider"

export default function ProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 299.99,
      category: "Electronics",
      stock: 50,
      status: "active",
      image: "/placeholder.svg?height=100&width=100",
      images: [
        {
          id: "img-1",
          url: "/placeholder.svg?height=400&width=400",
          alt: "Headphones front view",
          isPrimary: true,
        },
        {
          id: "img-2",
          url: "/placeholder.svg?height=400&width=400",
          alt: "Headphones side view",
          isPrimary: false,
        },
      ],
      variants: [
        {
          id: "var-1",
          name: "Black",
          type: "color",
          value: "#000000",
          description: "Classic black finish",
          images: [
            {
              id: "img-1-black",
              url: "/placeholder.svg?height=400&width=400",
              alt: "Black headphones",
              isPrimary: true,
              variantId: "var-1",
            },
          ],
          stockQuantity: 25,
        },
        {
          id: "var-2",
          name: "White",
          type: "color",
          value: "#FFFFFF",
          description: "Clean white finish",
          images: [
            {
              id: "img-1-white",
              url: "/placeholder.svg?height=400&width=400",
              alt: "White headphones",
              isPrimary: true,
              variantId: "var-2",
            },
          ],
          stockQuantity: 25,
        },
      ],
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState<{
    name: string,
    description: string,
    price: string,
    category: string,
    stock: string,
    status: "active" | "inactive",
  }>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "active",
  })

  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      ...formData,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      images: productImages,
      variants: productVariants,
      image: productImages.find((img) => img.isPrimary)?.url || "/placeholder.svg?height=100&width=100",
    }

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...productData } : p)))
    } else {
      const newProduct: Product = {
        id: Date.now(),
        ...productData,
      }
      setProducts([...products, newProduct])
    }

    resetForm()
  }

  const resetForm = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({ name: "", description: "", price: "", category: "", stock: "", status: "active" })
    setProductImages([])
    setProductVariants([])
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      status: product.status,
    })
    setProductImages(product.images || [])
    setProductVariants(product.variants || [])
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const addImage = () => {
    const newImage: ProductImage = {
      id: `img-${Date.now()}`,
      url: "/placeholder.svg?height=400&width=400",
      alt: "Product image",
      isPrimary: productImages.length === 0,
    }
    setProductImages([...productImages, newImage])
  }

  const updateImage = (id: string, updates: Partial<ProductImage>) => {
    setProductImages(productImages.map((img) => (img.id === id ? { ...img, ...updates } : img)))
  }

  const removeImage = (id: string) => {
    setProductImages(productImages.filter((img) => img.id !== id))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      name: "",
      type: "color",
      value: "",
      description: "",
      images: [],
      stockQuantity: 0,
    }
    setProductVariants([...productVariants, newVariant])
  }

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setProductVariants(productVariants.map((variant) => (variant.id === id ? { ...variant, ...updates } : variant)))
  }

  const removeVariant = (id: string) => {
    setProductVariants(productVariants.filter((variant) => variant.id !== id))
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("admin.products")}</h2>
          <p className="text-muted-foreground">{t("admin.manageProducts")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.addProduct")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t("admin.editProduct") : t("admin.addProduct")}</DialogTitle>
              <DialogDescription>
                {editingProduct ? t("admin.updateProductInfo") : t("admin.createNewProduct")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Product Images</h3>
                    <Button type="button" onClick={addImage}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {productImages.map((image) => (
                      <Card key={image.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt={image.alt}
                              width={100}
                              height={100}
                              className="rounded-md object-cover"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="grid gap-2">
                                <Label>Image URL</Label>
                                <Input
                                  value={image.url}
                                  onChange={(e) => updateImage(image.id, { url: e.target.value })}
                                  placeholder="/placeholder.svg?height=400&width=400"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Alt Text</Label>
                                <Input
                                  value={image.alt}
                                  onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                                  placeholder="Describe the image"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={image.isPrimary}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Make this primary and others not primary
                                      setProductImages(
                                        productImages.map((img) => ({
                                          ...img,
                                          isPrimary: img.id === image.id,
                                        })),
                                      )
                                    }
                                  }}
                                />
                                <Label>Primary Image</Label>
                              </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(image.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {productImages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No images added yet</p>
                        <p className="text-sm">Click &quot;Add Image&quot; to get started</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Product Variants</h3>
                    <Button type="button" onClick={addVariant}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {productVariants.map((variant) => (
                      <Card key={variant.id}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Variant {variant.name || "Unnamed"}</h4>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variant.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label>Variant Name</Label>
                                <Input
                                  value={variant.name}
                                  onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                                  placeholder="e.g., Red, Large, Premium"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select
                                  value={variant.type}
                                  onValueChange={(value: "color" | "size" | "feature") =>
                                    updateVariant(variant.id, { type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="color">Color</SelectItem>
                                    <SelectItem value="size">Size</SelectItem>
                                    <SelectItem value="feature">Feature</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label>Value</Label>
                                <Input
                                  value={variant.value}
                                  onChange={(e) => updateVariant(variant.id, { value: e.target.value })}
                                  placeholder={variant.type === "color" ? "#FF0000" : variant.type === "size" ? "XL" : "Feature"}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                  type="number"
                                  value={variant.stockQuantity}
                                  onChange={(e) =>
                                    updateVariant(variant.id, { stockQuantity: Number.parseInt(e.target.value) || 0 })
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label>Description</Label>
                              <Textarea
                                value={variant.description || ""}
                                onChange={(e) => updateVariant(variant.id, { description: e.target.value })}
                                placeholder="Describe this variant"
                                rows={2}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {productVariants.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No variants added yet</p>
                        <p className="text-sm">Click &quot;Add Variant&quot; to create color, size, or feature options</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <h3 className="text-lg font-medium">Product Preview</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          {productImages.length > 0 && (
                            <Image
                              src={productImages.find((img) => img.isPrimary)?.url || productImages[0].url}
                              alt={formData.name}
                              width={400}
                              height={400}
                              className="rounded-lg object-cover w-full"
                            />
                          )}
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold">{formData.name || "Product Name"}</h2>
                          <p className="text-3xl font-bold text-primary">${formData.price || "0.00"}</p>
                          <p className="text-muted-foreground">{formData.description || "Product description"}</p>

                          {productVariants.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Available Options:</h4>
                              <div className="flex flex-wrap gap-2">
                                {productVariants.map((variant) => (
                                  <Badge key={variant.id} variant="outline">
                                    {variant.name} ({variant.type})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            <p>Category: {formData.category || "Uncategorized"}</p>
                            <p>Stock: {formData.stock || "0"} units</p>
                            <p>Status: {formData.status}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">{editingProduct ? "Update Product" : "Create Product"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.productList")}</CardTitle>
          <CardDescription>{t("admin.productListDesc")}</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchProducts")}
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.variants?.slice(0, 2).map((variant) => (
                        <Badge key={variant.id} variant="secondary" className="text-xs">
                          {variant.name}
                        </Badge>
                      ))}
                      {(product.variants?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(product.variants?.length || 0) - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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

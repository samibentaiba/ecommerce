// src\app\admin\(protected)\products\page.tsx
"use client";

import React from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, X, Filter } from "lucide-react";
import Image from "next/image";

import { useLanguage } from "@/components/providers/language-provider";
import { useProducts, AdminProductImage } from "./hook";
import type { Product, ProductVariant } from "@/lib/types";
import { PrimaryImageBadge } from "@/components/ui/PrimaryImageBadge";

// --- ProductImagesForm ---
type ProductImagesFormProps = {
  productImages: AdminProductImage[];
  setProductImages: React.Dispatch<React.SetStateAction<AdminProductImage[]>>;
  addImage: () => void;
  updateImage: (id: string, data: Partial<AdminProductImage>) => void;
  removeImage: (id: string) => void;
  handleSetPrimaryImage: (id: string) => void;
};
function ProductImagesForm({ productImages, setProductImages, addImage, updateImage, removeImage, handleSetPrimaryImage }: ProductImagesFormProps) {
  const handleFileUpload = (imageId: string, file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    updateImage(imageId, { 
      file, 
      mimeType: file.type,
      alt: file.name.replace(/\.[^/.]+$/, "") // Use filename without extension as alt text
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent, imageId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(imageId, files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Images</h3>
        <Button type="button" onClick={addImage} data-testid="add-image-btn">
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>
      
      <div className="grid gap-4">
        {productImages.map((image: AdminProductImage) => (
          <Card key={image.id} data-testid="product-image-block">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Image Preview */}
                <div className="relative">
                  <Image
                    src={image.file ? URL.createObjectURL(image.file) : (image.id ? `/api/images/${image.id}` : "/placeholder.svg")}
                    alt={image.alt}
                    width={120}
                    height={120}
                    className="rounded-md object-cover border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                    data-testid="product-image"
                  />
                  {image.isPrimary && (
                    <Badge className="absolute -top-2 -right-2 bg-green-600">
                      Primary
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  {/* File Upload Section */}
                  <div className="grid gap-2">
                    <Label htmlFor={`product-image-upload-${image.id}`}>
                      {image.file ? 'Change Image' : 'Upload Image'}
                    </Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, image.id)}
                      onClick={() => document.getElementById(`product-image-upload-${image.id}`)?.click()}
                    >
                      <input
                        id={`product-image-upload-${image.id}`}
                        data-testid={`input-image-upload-${image.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(image.id, file);
                          }
                        }}
                      />
                      {image.file ? (
                        <div>
                          <p className="text-sm text-gray-600">{image.file.name}</p>
                          <p className="text-xs text-gray-500">Click or drag to change</p>
                        </div>
                      ) : image.id ? (
                        <div>
                          <p className="text-sm text-gray-600">Existing image loaded</p>
                          <p className="text-xs text-gray-500">Click or drag to replace</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">Click or drag image here</p>
                          <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Alt Text */}
                  <div className="grid gap-2">
                    <Label>Alt Text</Label>
                    <Input
                      value={image.alt}
                      data-testid={`input-image-alt-${image.id}`}
                      onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                  
                  {/* Primary Image Toggle */}
                  <div className="flex items-center space-x-2">
                    <PrimaryImageBadge
                      isPrimary={image.isPrimary}
                      onClick={() => handleSetPrimaryImage(image.id)}
                      data-testid={`primary-image-badge-${image.id}`}
                    />
                    <span className="text-sm text-gray-600">
                      Set as primary image
                    </span>
                  </div>
                </div>
                
                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                  data-testid={`remove-image-btn-${image.id}`}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {productImages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg" data-testid="empty-images">
            <p className="text-lg font-medium mb-2">No images added yet</p>
            <p className="text-sm mb-4">Add images to showcase your product</p>
            <Button onClick={addImage} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add First Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ProductVariantsForm ---
type ProductVariantsFormProps = {
  formData: any; // Should be the type of your formData, e.g. ProductFormData
  updateVariant: (id: string, data: Partial<ProductVariant>) => void;
  addVariant: () => void;
  removeVariant: (id: string) => void;
  addVariantImage: (variantId: string) => void;
  updateVariantImage: (variantId: string, imageId: string, data: Partial<AdminProductImage>) => void;
  removeVariantImage: (variantId: string, imageId: string) => void;
  handleSetPrimaryVariantImage: (variantId: string, imageId: string) => void;
};
function ProductVariantsForm({ formData, updateVariant, addVariant, removeVariant, addVariantImage, updateVariantImage, removeVariantImage, handleSetPrimaryVariantImage }: ProductVariantsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <Button type="button" onClick={addVariant} data-testid="add-variant-btn">
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>
      <div className="grid gap-4">
        {(formData.variants || []).map((variant: ProductVariant) => (
          <Card key={variant.id} data-testid={`variant-block-${variant.id}`}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Variant {variant.name || "Unnamed"}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    data-testid={`remove-variant-btn-${variant.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Variant Name</Label>
                    <Input
                      value={variant.name}
                      data-testid={`input-variant-name-${variant.id}`}
                      onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                      placeholder="e.g., Red, Large, Premium"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={variant.type}
                      onValueChange={(value: "COLOR" | "SIZE" | "FEATURE") => updateVariant(variant.id, { type: value })}
                    >
                      <SelectTrigger data-testid={`select-variant-type-${variant.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COLOR">Color</SelectItem>
                        <SelectItem value="SIZE">Size</SelectItem>
                        <SelectItem value="FEATURE">Feature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Value</Label>
                    <Input
                      value={variant.value}
                      data-testid={`input-variant-value-${variant.id}`}
                      onChange={(e) => updateVariant(variant.id, { value: e.target.value })}
                      placeholder={variant.type === "COLOR" ? "#FF0000" : variant.type === "SIZE" ? "XL" : "Feature"}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={variant.stockQuantity}
                      data-testid={`input-variant-stock-${variant.id}`}
                      onChange={(e) => updateVariant(variant.id, { stockQuantity: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Variant price</Label>
                  <Input
                    type="number"
                    value={variant.variantPrice || ""}
                    data-testid={`input-variant-price-${variant.id}`}
                    onChange={(e) => updateVariant(variant.id, { variantPrice: Number.parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={variant.description || ""}
                    data-testid={`input-variant-description-${variant.id}`}
                    onChange={(e) => updateVariant(variant.id, { description: e.target.value })}
                    placeholder="Describe this variant"
                    rows={2}
                  />
                </div>
                {/* Variant Images Management */}
                <div className="grid gap-2 mt-4">
                  <Label>Variant Images</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addVariantImage(variant.id)}
                    data-testid={`add-variant-image-btn-${variant.id}`}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Image
                  </Button>
                  <div className="grid gap-2">
                    {(variant.images || []).map((image: AdminProductImage) => (
                      <Card key={image.id} className="mt-2" data-testid={`variant-image-block-${image.id}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            {/* Image Preview */}
                            <div className="relative">
                              <Image
                                src={image.file ? URL.createObjectURL(image.file) : (image.id ? `/api/images/${image.id}` : "/placeholder.svg")}
                                alt={image.alt}
                                width={80}
                                height={80}
                                className="rounded-md object-cover border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                                data-testid={`variant-image-${image.id}`}
                              />
                              {image.isPrimary && (
                                <Badge className="absolute -top-1 -right-1 bg-green-600 text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              {/* File Upload Section */}
                              <div className="grid gap-1">
                                <Label className="text-sm">
                                  {image.file ? 'Change Image' : 'Upload Image'}
                                </Label>
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded p-2 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                                  }}
                                  onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                    const files = Array.from(e.dataTransfer.files);
                                    if (files.length > 0) {
                                      const file = files[0];
                                      if (!file.type.startsWith('image/')) {
                                        alert('Please select a valid image file');
                                        return;
                                      }
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert('Image file size must be less than 5MB');
                                        return;
                                      }
                                      updateVariantImage(variant.id, image.id, { 
                                        file, 
                                        mimeType: file.type,
                                        alt: file.name.replace(/\.[^/.]+$/, "")
                                      });
                                    }
                                  }}
                                  onClick={() => document.getElementById(`variant-image-upload-${image.id}`)?.click()}
                                >
                                  <input
                                    id={`variant-image-upload-${image.id}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    data-testid={`input-variant-image-upload-${image.id}`}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (!file.type.startsWith('image/')) {
                                          alert('Please select a valid image file');
                                          return;
                                        }
                                        if (file.size > 5 * 1024 * 1024) {
                                          alert('Image file size must be less than 5MB');
                                          return;
                                        }
                                        updateVariantImage(variant.id, image.id, { 
                                          file, 
                                          mimeType: file.type,
                                          alt: file.name.replace(/\.[^/.]+$/, "")
                                        });
                                      }
                                    }}
                                  />
                                  {image.file ? (
                                    <div>
                                      <p className="text-xs text-gray-600">{image.file.name}</p>
                                      <p className="text-xs text-gray-500">Click or drag to change</p>
                                    </div>
                                  ) : image.id ? (
                                    <div>
                                      <p className="text-xs text-gray-600">Existing image</p>
                                      <p className="text-xs text-gray-500">Click or drag to replace</p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-xs text-gray-600">Click or drag image here</p>
                                      <p className="text-xs text-gray-500">Max 5MB</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Alt Text */}
                              <div className="grid gap-1">
                                <Label className="text-sm">Alt Text</Label>
                                <Input
                                  value={image.alt}
                                  data-testid={`input-variant-image-alt-${image.id}`}
                                  onChange={e => {
                                    updateVariantImage(variant.id, image.id, { alt: e.target.value });
                                  }}
                                  placeholder="Describe the image"
                                  className="text-sm"
                                />
                              </div>
                              
                              {/* Primary Image Toggle */}
                              <div className="flex items-center space-x-2">
                                <PrimaryImageBadge
                                  isPrimary={image.isPrimary}
                                  onClick={() => handleSetPrimaryVariantImage(variant.id, image.id)}
                                  data-testid={`primary-variant-image-badge-${image.id}`}
                                />
                                <span className="text-xs text-gray-600">
                                  Set as primary
                                </span>
                              </div>
                            </div>
                            
                            {/* Remove Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantImage(variant.id, image.id)}
                              data-testid={`remove-variant-image-btn-${image.id}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(variant.images || []).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg" data-testid={`empty-variant-images-${variant.id}`}>
                        <p className="text-sm font-medium mb-1">No images for this variant</p>
                        <p className="text-xs mb-2">Add images to showcase this variant</p>
                        <Button 
                          onClick={() => addVariantImage(variant.id)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(formData.variants || []).length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg" data-testid="empty-variants">
            <p className="text-lg font-medium mb-2">No variants added yet</p>
            <p className="text-sm mb-4">Create color, size, or feature options for your product</p>
            <Button onClick={addVariant} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add First Variant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ProductPreview ---
type ProductPreviewProps = {
  productImages: AdminProductImage[];
  formData: any; // Should be the type of your formData, e.g. ProductFormData
};
function ProductPreview({ productImages, formData }: ProductPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Preview</h3>
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {productImages.length > 0 && (
                <Image
                  src={productImages.find((img: AdminProductImage) => img.isPrimary)?.id ? `/api/images/${productImages.find((img: AdminProductImage) => img.isPrimary)?.id}` : productImages[0].id ? `/api/images/${productImages[0].id}` : "/placeholder.svg"}
                  alt={formData.name}
                  width={400}
                  height={400}
                  className="rounded-lg object-cover w-full"
                  data-testid="preview-image"
                />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold" data-testid="preview-name">
                {formData.name || "Product Name"}
              </h2>
              <p className="text-3xl font-bold text-primary" data-testid="preview-price">
                ${formData.price || "0.00"}
              </p>
              <p className="text-muted-foreground" data-testid="preview-description">
                {formData.description || "Product description"}
              </p>
              {(formData.variants || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Available Options:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(formData.variants || []).map((variant: ProductVariant) => (
                      <Badge key={variant.id} variant="outline" data-testid={`preview-variant-badge-${variant.id}`}>
                        {variant.name} ({variant.type})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p data-testid="preview-category">Category: {formData.category || "Uncategorized"}</p>
                <p data-testid="preview-stock">Stock: {formData.stock || "0"} units</p>
                <p data-testid="preview-status">Status : {formData.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- ProductDialog ---
type ProductDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  productImages: AdminProductImage[];
  setProductImages: React.Dispatch<React.SetStateAction<AdminProductImage[]>>;
  addImage: () => void;
  updateImage: (id: string, data: Partial<AdminProductImage>) => void;
  removeImage: (id: string) => void;
  addVariant: () => void;
  updateVariant: (id: string, data: Partial<ProductVariant>) => void;
  removeVariant: (id: string) => void;
  addVariantImage: (variantId: string) => void;
  updateVariantImage: (variantId: string, imageId: string, data: Partial<AdminProductImage>) => void;
  removeVariantImage: (variantId: string, imageId: string) => void;
  editingProduct: Product | null;
  handleSetPrimaryImage: (id: string) => void;
  handleSetPrimaryVariantImage: (variantId: string, imageId: string) => void;
  t: (key: string) => string;
};
function ProductDialog({
  isDialogOpen,
  setIsDialogOpen,
  resetForm,
  handleSubmit,
  formData,
  setFormData,
  productImages,
  setProductImages,
  addImage,
  updateImage,
  removeImage,
  addVariant,
  updateVariant,
  removeVariant,
  addVariantImage,
  updateVariantImage,
  removeVariantImage,
  editingProduct,
  handleSetPrimaryImage,
  handleSetPrimaryVariantImage,
  t
}: ProductDialogProps) {
  const [tabValue, setTabValue] = React.useState("basic");
  React.useEffect(() => {
    if (isDialogOpen) {
      setTabValue("basic");
    }
  }, [isDialogOpen]);
  const statusClasses: Record<string, string> = {
    ACTIVE: "bg-green-200 w-full hover:bg-green-300 text-green-900 dark:bg-green-900 dark:hover:bg-green-700 dark:text-green-200",
    INACTIVE: "bg-red-200 w-full hover:bg-red-300 text-red-900 dark:bg-red-900  dark:hover:bg-red-700 dark:text-red-200",
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} data-testid="product-dialog">
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} data-testid="add-product-btn">
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.addProduct")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? t("admin.editProduct") : t("admin.addProduct")}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? t("admin.updateProductInfo") : t("admin.createNewProduct")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} data-testid="product-form">
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" data-testid="tab-basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images" data-testid="tab-images">Images</TabsTrigger>
              <TabsTrigger value="variants" data-testid="tab-variants">Variants</TabsTrigger>
              <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4" data-testid="tab-content-basic">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-description"
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
                      data-testid="input-price"
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
                      data-testid="input-stock"
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
                      data-testid="input-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ACTIVE" | "INACTIVE") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className={`${statusClasses[formData.status]}`} data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="images" className="space-y-4" data-testid="tab-content-images">
              <ProductImagesForm
                productImages={productImages}
                setProductImages={setProductImages}
                addImage={addImage}
                updateImage={updateImage}
                removeImage={removeImage}
                handleSetPrimaryImage={handleSetPrimaryImage}
              />
            </TabsContent>
            <TabsContent value="variants" className="space-y-4" data-testid="tab-content-variants">
              <ProductVariantsForm
                formData={formData}
                updateVariant={updateVariant}
                addVariant={addVariant}
                removeVariant={removeVariant}
                addVariantImage={addVariantImage}
                updateVariantImage={updateVariantImage}
                removeVariantImage={removeVariantImage}
                handleSetPrimaryVariantImage={handleSetPrimaryVariantImage}
              />
            </TabsContent>
            <TabsContent value="preview" className="space-y-4" data-testid="tab-content-preview">
              <ProductPreview productImages={productImages} formData={formData} />
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={resetForm} data-testid="cancel-btn">
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-btn">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- ProductTable ---
type ProductTableProps = {
  filteredProducts: Product[];
  handleEdit: (product: Product) => void;
  handleDeleteClick: (product: Product) => void;
  getProductStatusVariant: (status: "ACTIVE" | "INACTIVE") => "status-active" | "status-inactive" | "default";
  t: (key: string) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
};
function ProductTable({ filteredProducts, handleEdit, handleDeleteClick, getProductStatusVariant, t, searchTerm, setSearchTerm, statusFilter, setStatusFilter }: ProductTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.productList")}</CardTitle>
        <CardDescription>{t("admin.productListDesc")}</CardDescription>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchProducts")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="search-input"
            />
          </div>
          {/* Filter by status */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] text-foreground" data-testid="status-filter-trigger">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
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
            {(filteredProducts || []).map((product: Product) => (
              <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                <TableCell>
                  <Image
                    src={product.images && product.images.length > 0 ? (product.images.find((img: AdminProductImage) => img.isPrimary)?.id ? `/api/images/${product.images.find((img: AdminProductImage) => img.isPrimary)?.id}` : product.images[0].id ? `/api/images/${product.images[0].id}` : "/placeholder.svg") : "/placeholder.svg"}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                    data-testid={`product-table-image-${product.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.variants?.slice(0, 2).map((variant: ProductVariant) => (
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
                  <Badge variant={getProductStatusVariant(product.status)}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      data-testid={`edit-btn-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      data-testid={`delete-btn-${product.id}`}
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
  );
}

// --- DeleteProductDialog ---
type DeleteProductDialogProps = {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;
  productToDelete: Product | null;
  handleCancelDelete: () => void;
  handleConfirmDelete: () => void;
};
function DeleteProductDialog({ showDeleteDialog, setShowDeleteDialog, productToDelete, handleCancelDelete, handleConfirmDelete }: DeleteProductDialogProps) {
  if (!showDeleteDialog || !productToDelete) return null;
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} data-testid="delete-dialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete product {productToDelete.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancelDelete} data-testid="cancel-delete-btn">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete} data-testid="confirm-delete-btn">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---
export default function Page() {
  const { t } = useLanguage();
  const {
    setSearchTerm,
    searchTerm,
    statusFilter,
    setStatusFilter,
    filteredProducts,
    isDialogOpen,
    setIsDialogOpen,
    resetForm,
    handleSubmit,
    formData,
    setFormData,
    productImages,
    setProductImages,
    addImage,
    updateImage,
    removeImage,
    editingProduct,
    handleEdit,
    handleDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    productToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    addVariant,
    updateVariant,
    removeVariant,
    addVariantImage,
    updateVariantImage,
    removeVariantImage,
  } = useProducts();

  // Helper for primary image selection - ensures only one primary image
  const handleSetPrimaryImage = (id: string) => {
    setProductImages((prev: AdminProductImage[]) =>
      prev.map((img: AdminProductImage) => ({ 
        ...img, 
        isPrimary: img.id === id 
      }))
    );
  };
  // Helper for primary variant image selection - ensures only one primary image per variant
  const handleSetPrimaryVariantImage = (variantId: string, imageId: string) => {
    const variant = formData.variants.find(v => v.id === variantId);
    if (!variant) return;
    updateVariant(variantId, {
      images: (variant.images || []).map(img => ({ 
        ...img, 
        isPrimary: img.id === imageId 
      })) as any
    });
  };
  const getProductStatusVariant = (status: "ACTIVE" | "INACTIVE"): "status-active" | "status-inactive" | "default" => {
    if (status === "ACTIVE") return "status-active";
    if (status === "INACTIVE") return "status-inactive";
    return "default";
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("admin.products")}</h2>
          <p className="text-muted-foreground">{t("admin.manageProducts")}</p>
        </div>
        <ProductDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          productImages={productImages}
          setProductImages={setProductImages}
          addImage={addImage}
          updateImage={updateImage}
          removeImage={removeImage}
          addVariant={addVariant}
          updateVariant={updateVariant}
          removeVariant={removeVariant}
          addVariantImage={addVariantImage}
          updateVariantImage={updateVariantImage}
          removeVariantImage={removeVariantImage}
          editingProduct={editingProduct}
          handleSetPrimaryImage={handleSetPrimaryImage}
          handleSetPrimaryVariantImage={handleSetPrimaryVariantImage}
          t={t}
        />
      </div>
      <ProductTable
        filteredProducts={filteredProducts}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        getProductStatusVariant={getProductStatusVariant}
        t={t}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <DeleteProductDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        productToDelete={productToDelete}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}

export { ProductImagesForm, ProductVariantsForm, ProductPreview, ProductDialog, ProductTable, DeleteProductDialog };

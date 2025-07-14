"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Image as ImageIcon, Upload, X } from "lucide-react"
import Image from "next/image"
import type { TemplateSection } from "@/lib/types"

type SectionType = "hero" | "features" | "testimonials" | "cta" | "text" | "image" | "gallery"

interface SectionEditorProps {
  section: TemplateSection
  index: number
  onUpdate: (sectionId: string, updates: Partial<TemplateSection>) => void
}

const getSectionIcon = (type: SectionType) => {
  const icons = {
    hero: "🎯",
    features: "⭐",
    testimonials: "💬",
    cta: "📢",
    text: "📝",
    image: "🖼️",
    gallery: "🎨",
  }
  return icons[type] || "📄"
}

const getSectionColor = (type: SectionType) => {
  const colors = {
    hero: "bg-gradient-to-br from-blue-50 to-indigo-100",
    features: "bg-gradient-to-br from-green-50 to-emerald-100",
    testimonials: "bg-gradient-to-br from-purple-50 to-violet-100",
    cta: "bg-gradient-to-br from-orange-50 to-red-100",
    text: "bg-gradient-to-br from-gray-50 to-slate-100",
    image: "bg-gradient-to-br from-pink-50 to-rose-100",
    gallery: "bg-gradient-to-br from-yellow-50 to-amber-100",
  }
  return colors[type] || "bg-gradient-to-br from-gray-50 to-slate-100"
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ 
  section, 
  index, 
  onUpdate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const sectionType = section.type.toLowerCase() as SectionType

  const handleUpdate = (field: keyof TemplateSection, value: any) => {
    onUpdate(section.id, { [field]: value })
  }

  const renderHeroFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`hero-title-${section.id}`}>Hero Title</Label>
        <Input
          id={`hero-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="Enter compelling hero title"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`hero-content-${section.id}`}>Hero Description</Label>
        <Textarea
          id={`hero-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Describe your product's main benefit"
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`hero-image-${section.id}`}>Hero Image URL</Label>
        <div className="flex gap-2">
          <Input
            id={`hero-image-${section.id}`}
            value={section.image || ""}
            onChange={(e) => handleUpdate("image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderFeaturesFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`features-title-${section.id}`}>Section Title</Label>
        <Input
          id={`features-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="Key Features"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`features-content-${section.id}`}>Section Description</Label>
        <Textarea
          id={`features-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Describe what makes your product special"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Feature List (JSON format)</Label>
        <Textarea
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder='["Feature 1", "Feature 2", "Feature 3"]'
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter features as a JSON array of strings
        </p>
      </div>
    </div>
  )

  const renderTestimonialsFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`testimonials-title-${section.id}`}>Section Title</Label>
        <Input
          id={`testimonials-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="What Our Customers Say"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`testimonials-content-${section.id}`}>Section Description</Label>
        <Textarea
          id={`testimonials-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Real reviews from satisfied customers"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Testimonials (JSON format)</Label>
        <Textarea
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder='[{"name": "John Doe", "role": "Customer", "content": "Great product!", "rating": 5}]'
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Enter testimonials as JSON array with name, role, content, and rating fields
        </p>
      </div>
    </div>
  )

  const renderCTAFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`cta-title-${section.id}`}>Call-to-Action Title</Label>
        <Input
          id={`cta-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="Ready to Get Started?"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`cta-content-${section.id}`}>Call-to-Action Message</Label>
        <Textarea
          id={`cta-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Join thousands of satisfied customers today"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`cta-button-${section.id}`}>Button Text</Label>
        <Input
          id={`cta-button-${section.id}`}
          value={section.settings?.buttonText || ""}
          onChange={(e) => handleUpdate("settings", { ...section.settings, buttonText: e.target.value })}
          placeholder="Shop Now"
        />
      </div>
    </div>
  )

  const renderTextFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`text-title-${section.id}`}>Section Title</Label>
        <Input
          id={`text-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="About Our Product"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`text-content-${section.id}`}>Content</Label>
        <Textarea
          id={`text-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Write detailed content about your product..."
          rows={6}
        />
      </div>
    </div>
  )

  const renderImageFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`image-title-${section.id}`}>Section Title</Label>
        <Input
          id={`image-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="Product Showcase"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`image-content-${section.id}`}>Image Description</Label>
        <Textarea
          id={`image-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Describe what the image shows"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`image-url-${section.id}`}>Image URL</Label>
        <div className="flex gap-2">
          <Input
            id={`image-url-${section.id}`}
            value={section.image || ""}
            onChange={(e) => handleUpdate("image", e.target.value)}
            placeholder="https://example.com/product-image.jpg"
          />
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {section.image && (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={section.image}
            alt={section.title || "Product image"}
            fill
            className="object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => handleUpdate("image", "")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  const renderGalleryFields = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`gallery-title-${section.id}`}>Gallery Title</Label>
        <Input
          id={`gallery-title-${section.id}`}
          value={section.title || ""}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="Product Gallery"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`gallery-content-${section.id}`}>Gallery Description</Label>
        <Textarea
          id={`gallery-content-${section.id}`}
          value={section.content || ""}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Explore every detail of our product"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Image URLs (JSON array)</Label>
        <Textarea
          value={section.settings?.images ? JSON.stringify(section.settings.images, null, 2) : ""}
          onChange={(e) => {
            try {
              const images = JSON.parse(e.target.value)
              handleUpdate("settings", { ...section.settings, images })
            } catch {
              // Invalid JSON, store as string
              handleUpdate("settings", { ...section.settings, images: e.target.value })
            }
          }}
          placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter image URLs as a JSON array of strings
        </p>
      </div>
    </div>
  )

  const renderFields = () => {
    switch (sectionType) {
      case "hero":
        return renderHeroFields()
      case "features":
        return renderFeaturesFields()
      case "testimonials":
        return renderTestimonialsFields()
      case "cta":
        return renderCTAFields()
      case "text":
        return renderTextFields()
      case "image":
        return renderImageFields()
      case "gallery":
        return renderGalleryFields()
      default:
        return renderTextFields()
    }
  }

  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${getSectionColor(sectionType)} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl" role="img" aria-label={sectionType}>
                {getSectionIcon(sectionType)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">
                {section.title || `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Section {index + 1} • {sectionType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{sectionType}</Badge>
            <Button variant="ghost" size="sm">
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <Separator />
          <CardContent className="pt-6">
            {renderFields()}
          </CardContent>
        </>
      )}
    </Card>
  )
} 
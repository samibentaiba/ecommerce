"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Copy } from "lucide-react"
import Image from "next/image"
import type { LandingPageTemplate } from "@/lib/types"
import { TemplateBuilder } from "@/components/admin/template-builder"
import { useLanguage } from "@/components/providers/language-provider"

export default function TemplatesPage() {
  const { t } = useLanguage()
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([
    {
      id: 1,
      name: "Modern Hero Template",
      description: "Clean and modern template with hero section, features, and CTA",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: true,
      createdAt: "2024-01-15",
      sections: [
        {
          id: "hero-1",
          type: "hero",
          title: "Hero Section",
          content: "Main headline and description",
          image: "/placeholder.svg?height=400&width=800",
          settings: { backgroundColor: "#ffffff", textColor: "#000000" },
          order: 1,
        },
        {
          id: "features-1",
          type: "features",
          title: "Features Section",
          content: "Product features and benefits",
          settings: { columns: 3, showIcons: true },
          order: 2,
        },
        {
          id: "cta-1",
          type: "cta",
          title: "Call to Action",
          content: "Get started today",
          settings: { buttonColor: "#007bff", buttonText: "Shop Now" },
          order: 3,
        },
      ],
    },
    {
      id: 2,
      name: "Product Showcase",
      description: "Perfect for showcasing product details with gallery and testimonials",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: false,
      createdAt: "2024-01-14",
      sections: [
        {
          id: "hero-2",
          type: "hero",
          title: "Product Hero",
          content: "Product showcase hero",
          image: "/placeholder.svg?height=400&width=800",
          settings: { layout: "split", backgroundColor: "#f8f9fa" },
          order: 1,
        },
        {
          id: "gallery-1",
          type: "gallery",
          title: "Product Gallery",
          content: "Product images showcase",
          settings: { columns: 4, showThumbnails: true },
          order: 2,
        },
        {
          id: "testimonials-1",
          type: "testimonials",
          title: "Customer Reviews",
          content: "What customers say",
          settings: { showRatings: true, layout: "carousel" },
          order: 3,
        },
      ],
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<LandingPageTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTemplate) {
      setTemplates(
        templates.map((template) =>
          template.id === editingTemplate.id ? { ...editingTemplate, ...formData } : template,
        ),
      )
    } else {
      const newTemplate: LandingPageTemplate = {
        id: Date.now(),
        ...formData,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isDefault: false,
        createdAt: new Date().toISOString().split("T")[0],
        sections: [],
      }
      setTemplates([...templates, newTemplate])
    }

    setIsDialogOpen(false)
    setEditingTemplate(null)
    setFormData({ name: "", description: "" })
  }

  const handleEdit = (template: LandingPageTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setTemplates(templates.filter((template) => template.id !== id))
  }

  const handleDuplicate = (template: LandingPageTemplate) => {
    const duplicatedTemplate: LandingPageTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setTemplates([...templates, duplicatedTemplate])
  }

  const handleBuildTemplate = (template?: LandingPageTemplate) => {
    setEditingTemplate(template || null)
    setIsBuilderOpen(true)
  }

  const handleSaveTemplate = (template: LandingPageTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? template : t)))
    } else {
      setTemplates([...templates, { ...template, id: Date.now() }])
    }
    setIsBuilderOpen(false)
    setEditingTemplate(null)
  }

  return (
    <div className="space-y-6">
      {isBuilderOpen ? (
        <TemplateBuilder
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setIsBuilderOpen(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t("admin.landingPageTemplates")}</h2>
              <p className="text-muted-foreground">{t("admin.createManageTemplates")}</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(null)
                      setFormData({ name: "", description: "" })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("admin.quickTemplate")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("admin.createQuickTemplate")}</DialogTitle>
                    <DialogDescription>{t("admin.basicTemplateCustomize")}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("admin.templateName")}</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">{t("common.description")}</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{t("admin.createTemplate")}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={() => handleBuildTemplate()}>
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.buildTemplate")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {template.isDefault && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      Default
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleBuildTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!template.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{template.sections.length} sections</span>
                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

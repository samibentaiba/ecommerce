

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Eye, Settings, Edit, Trash2, Copy, Loader2, ArrowLeft, Save, GripVertical, Sparkles, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import SectionModal from "./SectionModal"
import { SectionPreview } from "./SectionPreview"
import type { LandingPageTemplate, TemplateSection } from "@/lib/types"

type SectionType = "hero" | "features" | "testimonials" | "cta" | "text" | "image" | "gallery"

interface Section {
  id: string
  name: string
  type: SectionType
  description: string
}

interface TemplateBuilderProps {
  template?: LandingPageTemplate | null
  onSave: (template: Partial<LandingPageTemplate>) => void
  onClose: () => void
}

const validTypes: SectionType[] = ["hero", "features", "testimonials", "cta", "text", "image", "gallery"]

const isValidType = (value: string): value is SectionType => {
  return validTypes.includes(value as SectionType)
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
  return icons[type]
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
  return colors[type]
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onSave, onClose }) => {
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSectionPreviewOpen, setIsSectionPreviewOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "")
      setDescription(template.description || "")
      setSections(
        template.sections?.map(
          (s: TemplateSection, index: number): Section => ({
            id: s.id || `section-${index}`,
            name: s.title || `Section ${index + 1}`,
            type: isValidType(s.type.toLowerCase()) ? s.type.toLowerCase() as SectionType : "text",
            description: s.content || "",
          }),
        ) || [],
      )
    }
  }, [template])

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", sectionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      return
    }

    const draggedIndex = sections.findIndex((s) => s.id === draggedItem)
    const targetIndex = sections.findIndex((s) => s.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSections = [...sections]
    const [draggedSection] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedSection)

    setSections(newSections)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const addSection = (sectionType: string, sectionName: string, sectionDescription: string) => {
    const validTypes: SectionType[] = ["hero", "features", "testimonials", "cta", "text", "image", "gallery"]
    const fallbackType: SectionType = "text"

    const type: SectionType = validTypes.includes(sectionType as SectionType)
      ? (sectionType as SectionType)
      : fallbackType

    const newSection: Section = {
      id: Date.now().toString(),
      name: sectionName,
      type,
      description: sectionDescription,
    }

    setSections([...sections, newSection])
    setIsAddSectionOpen(false)
  }

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId))
  }

  const duplicateSection = (section: Section) => {
    const duplicatedSection: Section = {
      ...section,
      id: Date.now().toString(),
      name: `${section.name} (Copy)`,
    }
    setSections([...sections, duplicatedSection])
  }

  const handleSave = async () => {
    if (!templateName.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const newTemplate: Partial<LandingPageTemplate> = {
      name: templateName,
      description,
        thumbnail: template?.thumbnail || "/placeholder.svg?height=200&width=300",
      isDefault: template?.isDefault || false,
      sections: sections.map(
          (s: Section, i: number): Omit<TemplateSection, 'id'> => ({
          title: s.name,
          type: s.type,
          content: s.description,
          order: i + 1,
          settings: {},
        }),
        ) as any,
    }

      await onSave(newTemplate)
    } catch (error) {
      console.error("Error saving template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSettingsOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Template Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              {template ? "Edit your template" : "Create and customize your landing page template"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Preview Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Template Preview
                </DialogTitle>
                <DialogDescription>
                  See how your template will look to customers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No sections to preview. Add some sections first.</p>
                  </div>
                ) : (
                  sections.map((section, index) => (
                    <SectionPreview
                      key={section.id}
                      type={section.type}
                      title={section.name}
                      content={section.description}
                    />
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSectionPreviewOpen} onOpenChange={setIsSectionPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Section Preview
                </DialogTitle>
                <DialogDescription>
                  Preview of "{selectedSection?.name}" section
                </DialogDescription>
              </DialogHeader>
              {selectedSection && (
                <SectionPreview
                  type={selectedSection.type}
                  title={selectedSection.name}
                  content={selectedSection.description}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Template Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Template Settings
                </DialogTitle>
                <DialogDescription>
                  Configure your template name and description
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSettingsSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="templateDescription">Description *</Label>
                    <Textarea
                      id="templateDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this template is for"
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Settings</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <SectionModal onAddSection={addSection} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Template Info Card */}
      {templateName && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{templateName}</span>
              <Badge variant="secondary">Draft</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{sections.length} sections</span>
                <span>•</span>
                <span>Created {new Date().toLocaleDateString()}</span>
              </div>
            </CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Template Sections</h2>
          <p className="text-sm text-muted-foreground">
            Drag sections to reorder • Click to edit
          </p>
        </div>

        {sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Plus className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No sections added yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start building your template by adding sections. You can choose from different types like hero, features, testimonials, and more.
              </p>
              <Button onClick={() => setIsAddSectionOpen(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, index) => (
          <Card
            key={section.id}
                className={`group cursor-move transition-all duration-200 hover:shadow-lg ${
                  draggedItem === section.id ? "opacity-50 scale-95" : ""
              }`}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="relative">
                  <div className={`w-full h-32 ${getSectionColor(section.type)} rounded-t-lg flex items-center justify-center`}>
                    <span className="text-4xl" role="img" aria-label={section.name}>
                      {getSectionIcon(section.type)}
                    </span>
                  </div>
                  
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {/* Section Type Badge */}
                  <Badge className="absolute top-2 right-2" variant="secondary">
                {section.type}
              </Badge>
                  
                  {/* Order Badge */}
                  <Badge className="absolute bottom-2 left-2" variant="outline">
                    #{index + 1}
                  </Badge>
            </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start justify-between">
                    <span className="line-clamp-1">{section.name}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setSelectedSection(section)
                          setIsSectionPreviewOpen(true)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                  </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                  </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => duplicateSection(section)}
                      >
                        <Copy className="h-3 w-3" />
                  </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {section.description || "No description"}
                  </CardDescription>
            </CardHeader>
          </Card>
        ))}
              </div>
        )}
      </div>

      <Separator />

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6">
        <div className="text-sm text-muted-foreground">
          {sections.length > 0 ? (
            <span>Template ready to save with {sections.length} sections</span>
          ) : (
            <span>Add at least one section to save your template</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
          <Button 
            onClick={handleSave} 
            disabled={!templateName || sections.length === 0 || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Template"}
        </Button>
        </div>
      </div>
    </div>
  )
}


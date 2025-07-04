

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Eye, Settings, Edit, Trash2, Copy } from "lucide-react"
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
import Image from "next/image"
import SectionModal from "./SectionModal"
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
  onSave: (template: LandingPageTemplate) => void
  onClose: () => void
}

const validTypes: SectionType[] = ["hero", "features", "testimonials", "cta", "text", "image", "gallery"]

const isValidType = (value: string): value is SectionType => {
  return validTypes.includes(value as SectionType)
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onSave, onClose }) => {
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "")
      setDescription(template.description || "")
      setSections(
        template.sections.map(
          (s: TemplateSection, index: number): Section => ({
            id: s.id || `section-${index}`,
            name: s.title || `Section ${index + 1}`,
            type: isValidType(s.type) ? s.type : "text",
            description: s.content || "",
          }),
        ),
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

  const handleSave = () => {
    const newTemplate: LandingPageTemplate = {
      ...template,
      id: template?.id || Date.now(),
      name: templateName,
      description,
      thumbnail: template?.thumbnail || "/placeholder.svg",
      isDefault: template?.isDefault || false,
      createdAt: template?.createdAt || new Date().toISOString().split("T")[0],
      sections: sections.map(
        (s: Section, i: number): TemplateSection => ({
          id: s.id,
          title: s.name,
          type: s.type,
          content: s.description,
          order: i + 1,
          settings: {},
        }),
      ),
    }

    onSave(newTemplate)
  }

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSettingsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Template Builder</h2>
          <p className="text-muted-foreground">Create and customize your landing page template</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Template Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Template Settings</DialogTitle>
                <DialogDescription>Configure your template name and description</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSettingsSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <SectionModal onAddSection={addSection} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {templateName && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {templateName}
              <Badge variant="secondary">Draft</Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{sections.length} sections</span>
              <span>Created {new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card
            key={section.id}
            className={`overflow-hidden cursor-move transition-all duration-200 ${draggedItem === section.id ? "opacity-50 scale-95" : "hover:shadow-md"
              }`}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="relative">
              <Image
                src="/placeholder.svg"
                alt={section.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover bg-gradient-to-br from-blue-50 to-indigo-100"
              />
              <Badge className="absolute top-2 right-2" variant="outline">
                {section.type}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {section.name}
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => duplicateSection(section)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Order: {index + 1}</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">Drag to reorder</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No sections added yet</h3>
              <p className="text-sm text-slate-500 text-center mb-4">
                Click "Add Section" to get started building your template
              </p>
              <Button onClick={() => setIsAddSectionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!templateName || sections.length === 0}>
          Save Template
        </Button>
      </div>
    </div>
  )
}


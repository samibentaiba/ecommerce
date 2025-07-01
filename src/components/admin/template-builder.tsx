"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Settings, Eye } from "lucide-react"
import type { LandingPageTemplate, TemplateSection } from "@/lib/types"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface TemplateBuilderProps {
  template?: LandingPageTemplate | null
  onSave: (template: LandingPageTemplate) => void
  onClose: () => void
}

export function TemplateBuilder({ template, onSave, onClose }: TemplateBuilderProps) {
  const [templateData, setTemplateData] = useState<LandingPageTemplate>(
    template || {
      id: 0,
      name: "",
      description: "",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
      sections: [],
    },
  )

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<TemplateSection | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const sectionTypes = [
    { value: "hero", label: "Hero Section", description: "Main banner with headline and CTA" },
    { value: "features", label: "Features", description: "Product features grid" },
    { value: "testimonials", label: "Testimonials", description: "Customer reviews and ratings" },
    { value: "cta", label: "Call to Action", description: "Action button section" },
    { value: "text", label: "Text Block", description: "Rich text content" },
    { value: "image", label: "Image", description: "Single image with caption" },
    { value: "gallery", label: "Gallery", description: "Multiple images grid" },
  ]

  const handleAddSection = (type: string) => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      type: type as TemplateSection["type"],
      title: `New ${type} Section`,
      content: "",
      settings: {},
      order: templateData.sections.length + 1,
    }

    setTemplateData({
      ...templateData,
      sections: [...templateData.sections, newSection],
    })
    setIsAddSectionOpen(false)
  }

  const handleEditSection = (section: TemplateSection) => {
    setEditingSection(section)
  }

  const handleUpdateSection = (updatedSection: TemplateSection) => {
    setTemplateData({
      ...templateData,
      sections: templateData.sections.map((section) => (section.id === updatedSection.id ? updatedSection : section)),
    })
    setEditingSection(null)
  }

  const handleDeleteSection = (sectionId: string) => {
    setTemplateData({
      ...templateData,
      sections: templateData.sections.filter((section) => section.id !== sectionId),
    })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(templateData.sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order numbers
    const updatedSections = items.map((section, index) => ({
      ...section,
      order: index + 1,
    }))

    setTemplateData({
      ...templateData,
      sections: updatedSections,
    })
  }

  const handleSave = () => {
    if (!templateData.name.trim()) {
      alert("Please enter a template name")
      return
    }
    onSave(templateData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Build New Template"}</DialogTitle>
          <DialogDescription>Create sections and customize your landing page template</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Settings */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={templateData.description}
                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    placeholder="Describe this template"
                  />
                </div>
                <Button onClick={() => setIsAddSectionOpen(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
                <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Template
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sections Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Sections ({templateData.sections.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {templateData.sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index} className="relative left-50 right-0">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className=" border rounded-lg p-4 bg-white shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-muted-foreground ">{section.title}</h4>
                                    <p className="text-sm text-muted-foreground capitalize">{section.type} Section</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(section.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {templateData.sections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No sections added yet</p>
                    <p className="text-sm">Click "Add Section" to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Template</Button>
        </DialogFooter>

        {/* Add Section Dialog */}
        <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>Choose a section type to add to your template</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {sectionTypes.map((type) => (
                <Card
                  key={type.value}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleAddSection(type.value)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Section Dialog */}
        {editingSection && (
          <SectionEditor
            section={editingSection}
            onSave={handleUpdateSection}
            onClose={() => setEditingSection(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Section Editor Component
function SectionEditor({
  section,
  onSave,
  onClose,
}: {
  section: TemplateSection
  onSave: (section: TemplateSection) => void
  onClose: () => void
}) {
  const [sectionData, setSectionData] = useState(section)

  const handleSave = () => {
    onSave(sectionData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {section.type} Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={sectionData.title}
              onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={sectionData.content || ""}
              onChange={(e) => setSectionData({ ...sectionData, content: e.target.value })}
              rows={4}
            />
          </div>
          {section.type === "image" && (
            <div>
              <Label>Image URL</Label>
              <Input
                value={sectionData.image || ""}
                onChange={(e) => setSectionData({ ...sectionData, image: e.target.value })}
                placeholder="/placeholder.svg?height=400&width=800"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

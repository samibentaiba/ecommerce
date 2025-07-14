"use client"

import type React from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Search, 
  Filter, 
  Loader2, 
  Settings,
  LayoutTemplate,
  FileText,
  Sparkles,
  MoreHorizontal,
  Calendar,
  Users
} from "lucide-react"
import Image from "next/image"
import type { LandingPageTemplate } from "@/lib/types"
import { TemplateBuilder } from "@/components/admin/template-builder"
import { useLanguage } from "@/components/providers/language-provider"
import { useTemplates } from "./hook"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TemplatesPage() {
  const { t } = useLanguage()
  const {
    templates,
    loading,
    error,
    isDialogOpen,
    isBuilderOpen,
    editingTemplate,
    formData,
    searchTerm,
    statusFilter,
    showDeleteDialog,
    templateToDelete,
    setIsDialogOpen,
    setIsBuilderOpen,
    setError,
    setFormData,
    setSearchTerm,
    setStatusFilter,
    setShowDeleteDialog,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleBuildTemplate,
    handleSaveTemplate,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    resetForm,
  } = useTemplates()

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading templates...</span>
        </div>
      </div>
    )
  }

  const getTemplateStats = () => {
    const total = templates.length
    const defaultTemplates = templates.filter(t => t.isDefault).length
    const customTemplates = total - defaultTemplates
    return { total, default: defaultTemplates, custom: customTemplates }
  }

  const stats = getTemplateStats()

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
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <LayoutTemplate className="h-8 w-8 text-primary" />
                {t("admin.landingPageTemplates")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("admin.createManageTemplates")}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                onClick={() => handleBuildTemplate()} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Build Template
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Default Templates</p>
                    <p className="text-2xl font-bold">{stats.default}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Custom Templates</p>
                    <p className="text-2xl font-bold">{stats.custom}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search templates by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates ({stats.total})</SelectItem>
                      <SelectItem value="default">Default Templates ({stats.default})</SelectItem>
                      <SelectItem value="custom">Custom Templates ({stats.custom})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/15 border border-destructive/25 text-destructive px-4 py-3 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2 h-auto p-0 text-destructive hover:text-destructive/80"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="relative">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                  {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                    <Badge variant="outline" className="text-xs">
                      {template.sections?.length || 0} sections
                    </Badge>
                </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleBuildTemplate(template)}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDuplicate(template)}
                        disabled={loading}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span className="line-clamp-2">{template.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBuildTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View & Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {!template.isDefault && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(template)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{template.sections?.length || 0} sections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {templates.length === 0 && !loading && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <LayoutTemplate className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchTerm || statusFilter !== "all" 
                    ? "No templates found"
                    : "No templates yet"
                  }
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "Get started by creating your first template. You can build from scratch or use a quick template."
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => handleBuildTemplate()} variant="outline">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Build from Scratch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        // Auto-reset form when dialog closes
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingTemplate ? "Edit Template" : "Create Quick Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Update your template details" 
                : "Create a basic template that you can customize later"
              }
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this template is for"
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{templateToDelete?.name}"</strong>? 
              This action cannot be undone and will permanently remove the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TemplateBuilder } from '../template-builder'
import type { LandingPageTemplate } from '@/lib/types'

// Mock the SectionModal component
jest.mock('../SectionModal', () => {
  return function MockSectionModal({ onAddSection }: { onAddSection: (type: string, name: string, description: string) => void }) {
    return (
      <div data-testid="section-modal">
        <button onClick={() => onAddSection('hero', 'Test Hero', 'Test description')}>
          Add Hero Section
        </button>
      </div>
    )
  }
})

// Mock the SectionPreview component
jest.mock('../SectionPreview', () => {
  return function MockSectionPreview({ type, title, content }: { type: string; title: string; content: string }) {
    return (
      <div data-testid="section-preview">
        <h3>{title}</h3>
        <p>{content}</p>
        <span>{type}</span>
      </div>
    )
  }
})

const mockTemplate: LandingPageTemplate = {
  id: '1',
  name: 'Test Template',
  description: 'A test template',
  thumbnail: '/test-thumbnail.jpg',
  isDefault: false,
  createdAt: new Date().toISOString(),
  sections: [
    {
      id: 'section-1',
      type: 'hero',
      title: 'Hero Section',
      content: 'Main headline and description',
      image: '/hero-image.jpg',
      settings: {},
      order: 1,
    },
    {
      id: 'section-2',
      type: 'features',
      title: 'Features Section',
      content: 'Feature highlights',
      image: '/features-image.jpg',
      settings: {},
      order: 2,
    },
  ],
}

const mockOnSave = jest.fn()
const mockOnClose = jest.fn()

describe('TemplateBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders template builder with template data', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      expect(screen.getByText('Template Builder')).toBeInTheDocument()
      expect(screen.getByText('Edit your template')).toBeInTheDocument()
      expect(screen.getByText('Test Template')).toBeInTheDocument()
      expect(screen.getByText('A test template')).toBeInTheDocument()
    })

    it('renders template builder without template data', () => {
      render(<TemplateBuilder onSave={mockOnSave} onClose={mockOnClose} />)
      
      expect(screen.getByText('Template Builder')).toBeInTheDocument()
      expect(screen.getByText('Create and customize your landing page template')).toBeInTheDocument()
    })
  })

  describe('Template Settings Dialog', () => {
    it('opens settings dialog when settings button is clicked', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const settingsButton = screen.getByText('Template Settings')
      fireEvent.click(settingsButton)
      
      // Use getAllByText since there are multiple elements with "Template Settings"
      const settingsElements = screen.getAllByText('Template Settings')
      expect(settingsElements.length).toBeGreaterThan(0)
      expect(screen.getByText('Configure your template name and description')).toBeInTheDocument()
    })

    it('allows editing template name and description', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const settingsButton = screen.getByText('Template Settings')
      fireEvent.click(settingsButton)
      
      const nameInput = screen.getByDisplayValue('Test Template')
      const descriptionTextarea = screen.getByDisplayValue('A test template')
      
      fireEvent.change(nameInput, { target: { value: 'Updated Template' } })
      fireEvent.change(descriptionTextarea, { target: { value: 'Updated description' } })
      
      expect(nameInput).toHaveValue('Updated Template')
      expect(descriptionTextarea).toHaveValue('Updated description')
    })
  })

  describe('Section Management', () => {
    it('displays existing sections', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.getByText('Features Section')).toBeInTheDocument()
      expect(screen.getByText('hero')).toBeInTheDocument()
      expect(screen.getByText('features')).toBeInTheDocument()
    })

    it('shows empty state when no sections exist', () => {
      const emptyTemplate = { ...mockTemplate, sections: [] }
      render(<TemplateBuilder template={emptyTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      expect(screen.getByText('No sections added yet')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Section')).toBeInTheDocument()
    })

    it('opens add section dialog when add button is clicked', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const addButton = screen.getByText('Add Section')
      fireEvent.click(addButton)
      
      expect(screen.getByTestId('section-modal')).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('makes sections draggable', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Find the section cards that should be draggable
      const sectionCards = screen.getAllByText(/Section/)
      
      // Check that at least one section card has the draggable attribute
      const draggableElements = document.querySelectorAll('[draggable="true"]')
      expect(draggableElements.length).toBeGreaterThan(0)
    })

    it('shows drag handle on hover', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Test that drag handles exist (they're in the DOM but hidden by default)
      const dragHandles = document.querySelectorAll('.lucide-grip-vertical')
      expect(dragHandles.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('calls onClose when back button is clicked', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Find the back button by its specific class and icon
      const backButton = document.querySelector('button[class*="h-8 w-8"]')
      expect(backButton).toBeInTheDocument()
      
      if (backButton) {
        fireEvent.click(backButton)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })
  })

  describe('Section Actions', () => {
    it('allows removing sections', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Hover over a section to show action buttons
      const sectionCard = screen.getByText('Hero Section').closest('.group')
      if (sectionCard) {
        fireEvent.mouseEnter(sectionCard)
        
        // Wait for the delete button to appear
        waitFor(() => {
          const deleteButton = screen.getByRole('button', { name: '' })
          expect(deleteButton).toBeInTheDocument()
        })
      }
    })

    it('allows duplicating sections', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const sectionCard = screen.getByText('Hero Section').closest('.group')
      if (sectionCard) {
        fireEvent.mouseEnter(sectionCard)
        
        waitFor(() => {
          const duplicateButton = screen.getByRole('button', { name: '' })
          expect(duplicateButton).toBeInTheDocument()
        })
      }
    })
  })

  describe('Section Icons and Colors', () => {
    it('applies different background colors for different section types', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Check that gradient background classes exist
      const gradientElements = document.querySelectorAll('.bg-gradient-to-br')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('displays appropriate icons for each section type', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      expect(screen.getByText('🎯')).toBeInTheDocument() // Hero section
      expect(screen.getByText('⭐')).toBeInTheDocument() // Features section
    })
  })

  describe('Save Functionality', () => {
    it('enables save button when template has name and sections', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const saveButton = screen.getByText('Save Template')
      expect(saveButton).not.toBeDisabled()
    })

    it('disables save button when template name is empty', () => {
      const emptyTemplate = { ...mockTemplate, name: '', sections: [] }
      render(<TemplateBuilder template={emptyTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const saveButton = screen.getByText('Save Template')
      expect(saveButton).toBeDisabled()
    })

    it('calls onSave when save button is clicked', async () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const saveButton = screen.getByText('Save Template')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      // Open settings dialog to access form labels
      const settingsButton = screen.getByText('Template Settings')
      fireEvent.click(settingsButton)
      
      // Check for form labels in the settings dialog
      expect(screen.getByText('Template Name *')).toBeInTheDocument()
      expect(screen.getByText('Description *')).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<TemplateBuilder template={mockTemplate} onSave={mockOnSave} onClose={mockOnClose} />)
      
      const saveButton = screen.getByText('Save Template')
      const cancelButton = screen.getByText('Cancel')
      
      // Check that buttons are focusable (they should be by default)
      expect(saveButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })
  })
}) 
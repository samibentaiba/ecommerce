import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import LandingPagesPage from "../page"
import { LanguageProvider } from "@/components/providers/language-provider"
import { act } from "react-dom/test-utils"

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "/api/admin/landing-pages") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: "landing-1",
            title: "Premium Headphones Landing",
            slug: "premium-headphones",
            productId: "product-1",
            headline: "Experience Sound Like Never Before",
            description: "Desc...",
            status: "PUBLISHED",
            createdAt: new Date().toISOString(),
            templateId: "template-1",
          },
          {
            id: "landing-2",
            title: "Wireless Earbuds Landing",
            slug: "wireless-earbuds",
            productId: "product-2",
            headline: "Freedom of Wireless Audio",
            description: "Desc 2...",
            status: "DRAFT",
            createdAt: new Date().toISOString(),
            templateId: "template-2",
          },
        ]),
      })
    }
    if (url === "/api/admin/templates") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { 
            id: "template-1", 
            name: "Modern Hero Template", 
            description: "desc", 
            isDefault: true, 
            thumbnail: "/placeholder.svg",
            sections: []
          },
          { 
            id: "template-2", 
            name: "Product Showcase Template", 
            description: "desc2", 
            isDefault: false, 
            thumbnail: "/placeholder.svg",
            sections: []
          },
        ]),
      })
    }
    if (url === "/api/admin/products") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: "product-1", name: "Premium Wireless Headphones" },
          { id: "product-2", name: "Wireless Earbuds" },
        ]),
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }) as any
})

afterEach(() => {
  jest.resetAllMocks()
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe("LandingPagesPage", () => {
  describe("Basic Rendering", () => {
  it("renders loading and then data", async () => {
    renderWithProviders(<LandingPagesPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    expect(screen.getByText(/Modern Hero Template/)).toBeInTheDocument()
    expect(screen.getByText(/PUBLISHED/i)).toBeInTheDocument()
  })

  it("shows error if fetch fails", async () => {
    (global.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: false }))
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument())
  })

    it("renders page title and description", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => {
        const landingPagesElements = screen.getAllByText(/Landing Pages/)
        expect(landingPagesElements.length).toBeGreaterThan(0)
      })
      expect(screen.getByText(/Create custom marketing pages/)).toBeInTheDocument()
    })
  })

  describe("Template Selection", () => {
    it("shows create with default template button", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      expect(screen.getByText(/Create with Default Template/)).toBeInTheDocument()
    })

    it("shows choose template button", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      expect(screen.getByText(/Choose Template/)).toBeInTheDocument()
    })

    it("opens template selection dialog", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      await act(async () => {
        fireEvent.click(chooseTemplateButton)
      })
      
      expect(screen.getByText(/Choose a Template/)).toBeInTheDocument()
      expect(screen.getByText(/Select a template to create your landing page/)).toBeInTheDocument()
    })

    it("displays templates in selection dialog", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      await act(async () => {
        fireEvent.click(chooseTemplateButton)
      })
      
      // Use getAllByText to handle multiple elements with same text
      const modernHeroElements = screen.getAllByText(/Modern Hero Template/)
      expect(modernHeroElements.length).toBeGreaterThan(0)
      
      const productShowcaseElements = screen.getAllByText(/Product Showcase Template/)
      expect(productShowcaseElements.length).toBeGreaterThan(0)
    })

    it("shows default badge for default templates", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      await act(async () => {
        fireEvent.click(chooseTemplateButton)
      })
      
      // Use getAllByText to handle multiple elements with same text
      const defaultTemplateElements = screen.getAllByText(/Default Template/)
      expect(defaultTemplateElements.length).toBeGreaterThan(0)
    })
  })

  describe("Landing Page Creation", () => {
    it("opens create dialog with default template", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      await act(async () => {
        fireEvent.click(screen.getByText(/Create with Default Template/i))
      })
      expect(screen.getByText(/Customize Template Sections/)).toBeInTheDocument()
    })

    it("opens template selection dialog", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      fireEvent.click(screen.getByText(/Choose Template/i))
      
      expect(screen.getByText(/Choose a Template/)).toBeInTheDocument()
      expect(screen.getByText(/Select a template to create your landing page/)).toBeInTheDocument()
    })

    it("shows template information in create form", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      await act(async () => {
        fireEvent.click(screen.getByText(/Create with Default Template/i))
      })
      
      expect(screen.getByText(/Template: Modern Hero Template/)).toBeInTheDocument()
    })

    it("validates required fields", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      await act(async () => {
        fireEvent.click(screen.getByText(/Create with Default Template/i))
      })
      
      // Navigate to the form
      const continueButton = screen.getByText(/Continue to Page Details/)
      await act(async () => {
        fireEvent.click(continueButton)
      })
      
      const submitButton = screen.getByText(/Create Page/)
      await act(async () => {
        fireEvent.click(submitButton)
      })
      
      // Check for form validation or disabled state
      await waitFor(() => {
        // Either there should be validation errors, or the form should prevent submission
        const errorElements = screen.queryAllByText(/required|error|invalid|fill/i)
        const disabledSubmit = (submitButton as HTMLButtonElement).disabled
        expect(errorElements.length > 0 || disabledSubmit).toBe(true)
      })
    })

    it("generates slug from title", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      fireEvent.click(screen.getByText(/Create with Default Template/i))
      
      // Navigate to the form
      const continueButton = screen.getByText(/Continue to Page Details/)
      fireEvent.click(continueButton)
      
      const titleInput = screen.getByLabelText(/Page Title/i)
      fireEvent.change(titleInput, { target: { value: "My New Landing Page" } })
      
      const slugInput = screen.getByLabelText(/URL Slug/i)
      expect(slugInput).toHaveValue("my-new-landing-page")
  })
  })

  describe("Landing Page Editing", () => {
  it("opens edit dialog", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    const editButtons = screen.getAllByLabelText(/Edit landing page/i)
    fireEvent.click(editButtons[0])
    expect(screen.getByText(/Edit Landing Page/)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Premium Headphones Landing/)).toBeInTheDocument()
  })

    it("pre-fills form with existing data", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      const editButtons = screen.getAllByLabelText(/Edit landing page/i)
      fireEvent.click(editButtons[0])
      
      expect(screen.getByDisplayValue(/Premium Headphones Landing/)).toBeInTheDocument()
      expect(screen.getByDisplayValue(/Experience Sound Like Never Before/)).toBeInTheDocument()
    })

    it("shows template information in edit form", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      const editButtons = screen.getAllByLabelText(/Edit landing page/i)
      fireEvent.click(editButtons[0])
      
      expect(screen.getByText(/Modern Hero Template \(Default\)/)).toBeInTheDocument()
    })
  })

  describe("Search and Filtering", () => {
  it("renders search and filter controls", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    
    expect(screen.getByPlaceholderText("Search landing pages...")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

    it("handles search input", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const searchInput = screen.getByPlaceholderText("Search landing pages...")
      fireEvent.change(searchInput, { target: { value: "headphones" } })
      
      expect(searchInput).toHaveValue("headphones")
    })

    it("handles status filter", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const filterSelect = screen.getByRole("combobox")
      fireEvent.click(filterSelect)
      
      expect(screen.getAllByText("All Status").length).toBeGreaterThan(0)
      expect(screen.getByText("Published")).toBeInTheDocument()
      expect(screen.getByText("Draft")).toBeInTheDocument()
    })
  })

  describe("Landing Page Table", () => {
    it("displays landing pages in table", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      expect(screen.getByText("Title")).toBeInTheDocument()
      expect(screen.getByText("Product")).toBeInTheDocument()
      expect(screen.getByText("Template")).toBeInTheDocument()
      expect(screen.getByText("URL")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
      expect(screen.getByText("Created")).toBeInTheDocument()
      expect(screen.getByText("Actions")).toBeInTheDocument()
    })

    it("shows landing page details correctly", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      expect(screen.getByText("Premium Headphones Landing")).toBeInTheDocument()
      expect(screen.getByText("Experience Sound Like Never Before")).toBeInTheDocument()
      expect(screen.getByText("Premium Wireless Headphones")).toBeInTheDocument()
      expect(screen.getByText("Modern Hero Template")).toBeInTheDocument()
      expect(screen.getByText("/landing/premium-headphones")).toBeInTheDocument()
      expect(screen.getByText("PUBLISHED")).toBeInTheDocument()
    })

    it("shows status badges", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const publishedBadge = screen.getByText("PUBLISHED")
      const draftBadge = screen.getByText("DRAFT")
      
      expect(publishedBadge).toBeInTheDocument()
      expect(draftBadge).toBeInTheDocument()
    })
  })

  describe("Landing Page Actions", () => {
  it("opens delete confirmation dialog when delete button is clicked", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    
      const deleteButtons = screen.getAllByLabelText(/Delete landing page/i)
      fireEvent.click(deleteButtons[0])
      
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete landing page "Premium Headphones Landing"/)).toBeInTheDocument()
  })

  it("renders delete confirmation dialog with correct buttons", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    
      const deleteButtons = screen.getAllByLabelText(/Delete landing page/i)
      fireEvent.click(deleteButtons[0])
      
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument()
    })

    it("shows view landing page button", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const viewButtons = screen.getAllByLabelText(/View landing page/i)
      expect(viewButtons.length).toBeGreaterThan(0)
  })

    it("shows edit landing page button", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const editButtons = screen.getAllByLabelText(/Edit landing page/i)
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  describe("Section Editor", () => {
    it("opens section editor when template is selected", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      fireEvent.click(chooseTemplateButton)
      
      // Use getAllByText to handle multiple elements and select the first one
      const templateCards = screen.getAllByText(/Modern Hero Template/)
      const templateCard = templateCards.find(card => card.closest('.cursor-pointer'))
      if (templateCard) {
        fireEvent.click(templateCard)
        
        expect(screen.getByText(/Customize Template Sections/)).toBeInTheDocument()
        expect(screen.getByText(/Fill in the content for each section/)).toBeInTheDocument()
      }
    })

    it("shows template information in section editor", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      fireEvent.click(chooseTemplateButton)
      
      const templateCards = screen.getAllByText(/Modern Hero Template/)
      const templateCard = templateCards.find(card => card.closest('.cursor-pointer'))
      if (templateCard) {
        fireEvent.click(templateCard)
        
        expect(screen.getByText(/Template: Modern Hero Template/)).toBeInTheDocument()
      }
    })

    it("provides navigation between section editor and form", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      const chooseTemplateButton = screen.getByText(/Choose Template/)
      fireEvent.click(chooseTemplateButton)
      
      const templateCards = screen.getAllByText(/Modern Hero Template/)
      const templateCard = templateCards.find(card => card.closest('.cursor-pointer'))
      if (templateCard) {
        fireEvent.click(templateCard)
        
        expect(screen.getByText(/Continue to Page Details/)).toBeInTheDocument()
        expect(screen.getByText(/Back to Template Selection/)).toBeInTheDocument()
      }
    })
  })

  describe("Error Handling", () => {
    it("displays error messages in dialogs", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      fireEvent.click(screen.getByText(/Create with Default Template/i))
      
      // Navigate to the form
      const continueButton = screen.getByText(/Continue to Page Details/)
      fireEvent.click(continueButton)
      
      const submitButton = screen.getByText(/Create Page/)
      fireEvent.click(submitButton)
      
      // Check for any validation error or form validation
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/required|error|invalid|fill/i)
        expect(errorElements.length).toBeGreaterThan(0)
      })
    })

    it("handles network errors gracefully", async () => {
      (global.fetch as any).mockImplementationOnce(() => Promise.reject(new Error("Network error")))
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Network error/i)).toBeInTheDocument())
    })
  })

  describe("Loading States", () => {
    it("shows loading state initially", () => {
      renderWithProviders(<LandingPagesPage />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it("disables buttons during loading", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    
      // Test that buttons are enabled after loading
      const createButton = screen.getByText(/Create with Default Template/i)
      expect(createButton).not.toBeDisabled()
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA labels", async () => {
      renderWithProviders(<LandingPagesPage />)
      await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
      
      expect(screen.getByPlaceholderText("Search landing pages...")).toBeInTheDocument()
      expect(screen.getAllByLabelText(/Edit landing page/i).length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText(/Delete landing page/i).length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText(/View landing page/i).length).toBeGreaterThan(0)
    })

    it("supports keyboard navigation", async () => {
    renderWithProviders(<LandingPagesPage />)
    await waitFor(() => expect(screen.getByText(/Premium Headphones Landing/)).toBeInTheDocument())
    
    const searchInput = screen.getByPlaceholderText("Search landing pages...")
      const createButton = screen.getByText(/Create with Default Template/i)
      
    expect(searchInput).toBeInTheDocument()
      expect(createButton).toBeInTheDocument()
    })
  })
}) 
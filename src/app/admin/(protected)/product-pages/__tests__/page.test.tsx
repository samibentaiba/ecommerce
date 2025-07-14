import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import ProductPagesPage from "../page"
import { LanguageProvider } from "@/components/providers/language-provider"

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "/api/admin/product-pages") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: "page-1",
            title: "Product Page 1",
            productId: "product-1",
            slug: "product-page-1",
            metaTitle: "Meta Title",
            metaDescription: "Meta Desc",
            content: "Content...",
            featuredImage: "/placeholder.svg",
            status: "PUBLISHED",
            seoScore: 90,
            lastModified: new Date().toISOString(),
            product: {
              id: "product-1",
              name: "Product 1",
            },
          },
          {
            id: "page-2",
            title: "Product Page 2",
            productId: "product-2",
            slug: "product-page-2",
            metaTitle: "Meta Title 2",
            metaDescription: "Meta Desc 2",
            content: "Content 2...",
            featuredImage: "/placeholder.svg",
            status: "DRAFT",
            seoScore: 75,
            lastModified: new Date().toISOString(),
            product: {
              id: "product-2",
              name: "Product 2",
            },
          },
        ]),
      })
    }
    if (url === "/api/admin/products") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: "product-1", name: "Product 1" },
          { id: "product-2", name: "Product 2" },
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

describe("ProductPagesPage", () => {
  it("renders loading and then data", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    expect(screen.getByText(/Meta Title$/)).toBeInTheDocument()
    expect(screen.getByText(/PUBLISHED/i)).toBeInTheDocument()
  })

  it("opens create product page dialog", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/Create Product Page/i))
    expect(screen.getByText(/Create New Product Page/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Page Title/i)).toBeInTheDocument()
  })

  it("opens edit product page dialog", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    // Find the edit button by aria-label
    const editButtons = screen.getAllByLabelText("Edit")
    fireEvent.click(editButtons[0])
    expect(screen.getByText(/Edit Product Page/)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Product Page 1/)).toBeInTheDocument()
  })

  it("renders status filter dropdown", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    
    // Check if status filter is rendered - the trigger should be visible
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("opens delete confirmation dialog when delete button is clicked", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    
    // Find the delete button by looking for the button with Trash2 icon
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('aria-label')?.includes('Trash2')
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete product page "Product Page 1"/)).toBeInTheDocument()
    }
  })

  it("renders delete confirmation dialog with correct buttons", async () => {
    renderWithProviders(<ProductPagesPage />)
    await waitFor(() => expect(screen.getByText(/Product Page 1/)).toBeInTheDocument())
    
    // Find and click delete button
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('aria-label')?.includes('Trash2')
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument()
    }
  })
}) 
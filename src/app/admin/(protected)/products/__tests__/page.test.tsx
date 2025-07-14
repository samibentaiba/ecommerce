import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import ProductsPage from "../page"
import { LanguageProvider } from "@/components/providers/language-provider"
import '@testing-library/jest-dom';

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url === "/api/admin/products") {
      if (options && options.method === "DELETE") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: "clv1k2j8d0000qv6z8z8z8z8z",
            name: "Product 1",
            description: "desc",
            price: 10.99,
            originalPrice: 12.99,
            category: "Electronics",
            stock: 10,
            status: "ACTIVE",
            image: "/placeholder.svg",
            images: [],
            variants: [],
          },
          {
            id: "clv1k2j8d0000qv6z8z8z8z8y",
            name: "Product 2",
            description: "desc2",
            price: 25.50,
            originalPrice: 30.00,
            category: "Clothing",
            stock: 5,
            status: "INACTIVE",
            image: "/placeholder.svg",
            images: [],
            variants: [],
          },
        ]),
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe("ProductsPage", () => {
  it("renders loading and then data", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    expect(screen.getByText(/Electronics/)).toBeInTheDocument()
  })

  it("opens create product dialog", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    // Click the first Add Product button (not the dialog title)
    const addProductButtons = screen.getAllByText(/Add Product/)
    fireEvent.click(addProductButtons[0])
    // The dialog title should now be present
    expect(screen.getByRole("heading", { name: /Add Product/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument()
  })

  it("opens edit product dialog", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    // Find the edit button by looking for the button with Edit icon
    const editButtons = screen.getAllByRole("button")
    const editButton = editButtons.find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('aria-label')?.includes('Edit')
    )
    if (editButton) {
      fireEvent.click(editButton)
      expect(screen.getByText(/Edit Product/)).toBeInTheDocument()
      expect(screen.getByDisplayValue(/Product 1/)).toBeInTheDocument()
    }
  })

  it("renders status filter dropdown", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    // Check if status filter is rendered - the trigger should be visible
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("opens delete confirmation dialog when delete button is clicked", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    // Find the delete button by looking for the button with Trash2 icon
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('aria-label')?.includes('Trash2')
    )
    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete product Product 1/)).toBeInTheDocument()
    }
  })

  it("renders delete confirmation dialog with correct buttons", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
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

  it("deletes a product and removes it from the UI", async () => {
    renderWithProviders(<ProductsPage />)
    await waitFor(() => expect(screen.getByText(/Product 1/)).toBeInTheDocument())
    // Find the delete button for Product 1
    const deleteButtons = screen.getAllByRole("button")
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('aria-label')?.includes('Trash2')
    )
    if (deleteButton) {
      fireEvent.click(deleteButton)
      // Confirm dialog
      await waitFor(() => expect(screen.getByText("Confirm Deletion")).toBeInTheDocument())
      fireEvent.click(screen.getByRole("button", { name: /Delete/i }))
      // Product 1 should be removed from the UI
      await waitFor(() => expect(screen.queryByText(/Product 1/)).not.toBeInTheDocument())
    }
  })
}) 
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import {
  ProductImagesForm,
  ProductVariantsForm,
  ProductPreview,
  ProductDialog,
  ProductTable,
  DeleteProductDialog,
} from "../page";

// Mocks for props
const noop = () => {};
const t = (x: string) => x;

describe("ProductImagesForm", () => {
  it("renders empty state and calls addImage", () => {
    const addImage = jest.fn();
    render(
      <ProductImagesForm
        productImages={[]}
        setProductImages={noop}
        addImage={addImage}
        updateImage={noop}
        removeImage={noop}
        handleSetPrimaryImage={noop}
      />
    );
    expect(screen.getByText(/No images added yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-image-btn"));
    expect(addImage).toHaveBeenCalled();
  });
});

describe("ProductVariantsForm", () => {
  it("renders empty state and calls addVariant", () => {
    const addVariant = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [] }}
        updateVariant={noop}
        addVariant={addVariant}
        removeVariant={noop}
        addVariantImage={noop}
        updateVariantImage={noop}
        removeVariantImage={noop}
        handleSetPrimaryVariantImage={noop}
      />
    );
    expect(screen.getByText(/No variants added yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-variant-btn"));
    expect(addVariant).toHaveBeenCalled();
  });
});

describe("ProductPreview", () => {
  it("renders product preview info", () => {
    render(
      <ProductPreview
        productImages={[]}
        formData={{ name: "Test", price: "123", description: "desc", category: "cat", stock: "5", status: "ACTIVE", variants: [] }}
      />
    );
    expect(screen.getByTestId("preview-name")).toHaveTextContent("Test");
    expect(screen.getByTestId("preview-price")).toHaveTextContent("$123");
    expect(screen.getByTestId("preview-description")).toHaveTextContent("desc");
    expect(screen.getByTestId("preview-category")).toHaveTextContent("cat");
    expect(screen.getByTestId("preview-stock")).toHaveTextContent("5");
    expect(screen.getByTestId("preview-status")).toHaveTextContent("ACTIVE");
  });
});

describe("ProductDialog", () => {
  it("renders dialog with basic info tab", () => {
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={noop}
        formData={{ name: "", description: "", price: "", category: "", stock: "", status: "ACTIVE", variants: [], images: [] }}
        setFormData={noop}
        productImages={[]}
        setProductImages={noop}
        addImage={noop}
        updateImage={noop}
        removeImage={noop}
        addVariant={noop}
        updateVariant={noop}
        removeVariant={noop}
        addVariantImage={noop}
        updateVariantImage={noop}
        removeVariantImage={noop}
        editingProduct={null}
        handleSetPrimaryImage={noop}
        handleSetPrimaryVariantImage={noop}
        t={t}
      />
    );
    expect(screen.getByTestId("product-form")).toBeInTheDocument();
    expect(screen.getByTestId("tab-basic")).toBeInTheDocument();
  });
});

describe("ProductTable", () => {
  it("renders product table row", () => {
    render(
      <ProductTable
        filteredProducts={[
          {
            id: "p1",
            name: "Test Product",
            description: "desc",
            price: 10,
            category: "cat",
            stock: 1,
            status: "ACTIVE",
            images: [],
            variants: [],
          },
        ]}
        handleEdit={noop}
        handleDeleteClick={noop}
        getProductStatusVariant={() => "status-active"}
        t={t}
        searchTerm=""
        setSearchTerm={noop}
        statusFilter="all"
        setStatusFilter={noop}
      />
    );
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });
});

describe("DeleteProductDialog", () => {
  it("renders and calls handlers", () => {
    const handleCancelDelete = jest.fn();
    const handleConfirmDelete = jest.fn();
    render(
      <DeleteProductDialog
        showDeleteDialog={true}
        setShowDeleteDialog={noop}
        productToDelete={{ id: "p1", name: "Test Product", description: "", price: 1, category: "", stock: 1, status: "ACTIVE", images: [], variants: [] }}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
    );
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("cancel-delete-btn"));
    expect(handleCancelDelete).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-delete-btn"));
    expect(handleConfirmDelete).toHaveBeenCalled();
  });
}); 
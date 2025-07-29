import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import {
  ProductImagesForm,
  ProductVariantsForm,
  ProductPreview,
  ProductDialog,
  ProductTable,
  DeleteProductDialog,
  default as Page,
} from "../page";
import type { Product } from "@/lib/types";

// Global mock object for useProducts
let mockUseProducts: any = {};

jest.mock("../hook", () => ({
  useProducts: () => mockUseProducts,
}));
jest.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({ t: (x: string) => x }),
}));

// Mocks for props
const noop = () => {};
const t = (x: string) => x;

describe("ProductImagesForm - Full Coverage", () => {
  const baseImage = { id: "img1", url: "", alt: "", isPrimary: true };
  it("renders empty state", () => {
    render(
      <ProductImagesForm
        productImages={[]}
        setProductImages={jest.fn()}
        addImage={jest.fn()}
        updateImage={jest.fn()}
        removeImage={jest.fn()}
        handleSetPrimaryImage={jest.fn()}
      />
    );
    expect(screen.getByText(/No images added yet/i)).toBeInTheDocument();
  });
  it("calls addImage when Add Image button is clicked", () => {
    const addImage = jest.fn();
    render(
      <ProductImagesForm
        productImages={[]}
        setProductImages={jest.fn()}
        addImage={addImage}
        updateImage={jest.fn()}
        removeImage={jest.fn()}
        handleSetPrimaryImage={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("add-image-btn"));
    expect(addImage).toHaveBeenCalled();
  });
  it("renders multiple images and calls removeImage", () => {
    const removeImage = jest.fn();
    render(
      <ProductImagesForm
        productImages={[baseImage, { id: "img2", url: "", alt: "", isPrimary: false }]}
        setProductImages={jest.fn()}
        addImage={jest.fn()}
        updateImage={jest.fn()}
        removeImage={removeImage}
        handleSetPrimaryImage={jest.fn()}
      />
    );
    expect(screen.getAllByTestId("product-image-block").length).toBe(2);
    fireEvent.click(screen.getByTestId("remove-image-btn-img1"));
    expect(removeImage).toHaveBeenCalledWith("img1");
  });
  it("calls updateImage when alt text is changed", () => {
    const updateImage = jest.fn();
    render(
      <ProductImagesForm
        productImages={[baseImage]}
        setProductImages={jest.fn()}
        addImage={jest.fn()}
        updateImage={updateImage}
        removeImage={jest.fn()}
        handleSetPrimaryImage={jest.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("input-image-alt-img1"), { target: { value: "new alt" } });
    expect(updateImage).toHaveBeenCalledWith("img1", { alt: "new alt" });
  });
  it("calls setProductImages when file is uploaded", () => {
    const setProductImages = jest.fn();
    render(
      <ProductImagesForm
        productImages={[baseImage]}
        setProductImages={setProductImages}
        addImage={jest.fn()}
        updateImage={jest.fn()}
        removeImage={jest.fn()}
        handleSetPrimaryImage={jest.fn()}
      />
    );
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("input-image-upload-img1"), { target: { files: [file] } });
    expect(setProductImages).toHaveBeenCalled();
  });
  it("calls handleSetPrimaryImage when primary badge is clicked", () => {
    const handleSetPrimaryImage = jest.fn();
    render(
      <ProductImagesForm
        productImages={[baseImage]}
        setProductImages={jest.fn()}
        addImage={jest.fn()}
        updateImage={jest.fn()}
        removeImage={jest.fn()}
        handleSetPrimaryImage={handleSetPrimaryImage}
      />
    );
    fireEvent.click(screen.getByTestId("primary-image-badge-img1"));
    expect(handleSetPrimaryImage).toHaveBeenCalledWith("img1");
    });
  });

describe("ProductVariantsForm - Full Coverage", () => {
  const baseVariant = {
            id: "v1",
            name: "Red",
            type: "COLOR",
            value: "#FF0000",
            stockQuantity: 5,
    variantPrice: 10.5,
    description: "desc",
    images: [],
  };
  it("renders empty state", () => {
    render(
      <ProductVariantsForm
        formData={{ variants: [] }}
        updateVariant={jest.fn()}
        addVariant={jest.fn()}
        removeVariant={jest.fn()}
        addVariantImage={jest.fn()}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    expect(screen.getByText(/No variants added yet/i)).toBeInTheDocument();
  });
  it("calls addVariant when Add Variant button is clicked", () => {
    const addVariant = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [] }}
        updateVariant={jest.fn()}
        addVariant={addVariant}
        removeVariant={jest.fn()}
        addVariantImage={jest.fn()}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("add-variant-btn"));
    expect(addVariant).toHaveBeenCalled();
  });
  it("renders a variant and calls removeVariant", () => {
    const removeVariant = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [baseVariant] }}
        updateVariant={jest.fn()}
        addVariant={jest.fn()}
        removeVariant={removeVariant}
        addVariantImage={jest.fn()}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("remove-variant-btn-v1"));
    expect(removeVariant).toHaveBeenCalledWith("v1");
  });
  it("calls updateVariant for all fields", () => {
    const updateVariant = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [baseVariant] }}
        updateVariant={updateVariant}
        addVariant={jest.fn()}
        removeVariant={jest.fn()}
        addVariantImage={jest.fn()}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("input-variant-name-v1"), { target: { value: "Blue" } });
    expect(updateVariant).toHaveBeenCalledWith("v1", { name: "Blue" });
    fireEvent.change(screen.getByTestId("input-variant-value-v1"), { target: { value: "XL" } });
    expect(updateVariant).toHaveBeenCalledWith("v1", { value: "XL" });
    fireEvent.change(screen.getByTestId("input-variant-stock-v1"), { target: { value: "7" } });
    expect(updateVariant).toHaveBeenCalledWith("v1", { stockQuantity: 7 });
    fireEvent.change(screen.getByTestId("input-variant-price-v1"), { target: { value: "123" } });
    expect(updateVariant).toHaveBeenCalledWith("v1", { variantPrice: 123 });
    fireEvent.change(screen.getByTestId("input-variant-description-v1"), { target: { value: "desc2" } });
    expect(updateVariant).toHaveBeenCalledWith("v1", { description: "desc2" });
  });
  it("calls updateVariant when type is changed", () => {
    const updateVariant = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [baseVariant] }}
        updateVariant={updateVariant}
        addVariant={jest.fn()}
        removeVariant={jest.fn()}
        addVariantImage={jest.fn()}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("select-variant-type-v1"));
    fireEvent.click(screen.getByText("Size"));
    expect(updateVariant).toHaveBeenCalledWith("v1", { type: "SIZE" });
  });
  it("calls addVariantImage when Add Image is clicked", () => {
    const addVariantImage = jest.fn();
    render(
      <ProductVariantsForm
        formData={{ variants: [baseVariant] }}
        updateVariant={jest.fn()}
        addVariant={jest.fn()}
        removeVariant={jest.fn()}
        addVariantImage={addVariantImage}
        updateVariantImage={jest.fn()}
        removeVariantImage={jest.fn()}
        handleSetPrimaryVariantImage={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("add-variant-image-btn-v1"));
    expect(addVariantImage).toHaveBeenCalledWith("v1");
  });
  it("calls updateVariantImage and removeVariantImage for variant images", () => {
    const updateVariantImage = jest.fn();
    const removeVariantImage = jest.fn();
    const handleSetPrimaryVariantImage = jest.fn();
    const variantWithImage = {
      ...baseVariant,
      images: [{ id: "img1", url: "", alt: "", isPrimary: true }],
    };
    render(
      <ProductVariantsForm
        formData={{ variants: [variantWithImage] }}
        updateVariant={jest.fn()}
        addVariant={jest.fn()}
        removeVariant={jest.fn()}
        addVariantImage={jest.fn()}
        updateVariantImage={updateVariantImage}
        removeVariantImage={removeVariantImage}
        handleSetPrimaryVariantImage={handleSetPrimaryVariantImage}
      />
    );
    fireEvent.change(screen.getByTestId("input-variant-image-alt-img1"), { target: { value: "alt2" } });
    expect(updateVariantImage).toHaveBeenCalledWith("v1", "img1", { alt: "alt2" });
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("input-variant-image-upload-img1"), { target: { files: [file] } });
    expect(updateVariantImage).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("remove-variant-image-btn-img1"));
    expect(removeVariantImage).toHaveBeenCalledWith("v1", "img1");
    fireEvent.click(screen.getByTestId("primary-variant-image-badge-img1"));
    expect(handleSetPrimaryVariantImage).toHaveBeenCalledWith("v1", "img1");
  });
});

describe("ProductPreview - Full Coverage", () => {
  const baseFormData = {
    name: "Test Product",
    price: "123.45",
    description: "A great product",
    category: "Electronics",
    stock: "10",
    status: "ACTIVE",
    variants: [],
  };
  it("renders with all fields and no images/variants", () => {
    render(<ProductPreview productImages={[]} formData={baseFormData} />);
    expect(screen.getByTestId("preview-name")).toHaveTextContent("Test Product");
    expect(screen.getByTestId("preview-price")).toHaveTextContent("$123.45");
    expect(screen.getByTestId("preview-description")).toHaveTextContent("A great product");
    expect(screen.getByTestId("preview-category")).toHaveTextContent("Electronics");
    expect(screen.getByTestId("preview-stock")).toHaveTextContent("10");
    expect(screen.getByTestId("preview-status")).toHaveTextContent("ACTIVE");
  });
  it("renders with a primary image", () => {
    render(
      <ProductPreview
        productImages={[{ id: "img1", alt: "Main", isPrimary: true }]}
        formData={baseFormData}
      />
    );
    expect(screen.getByTestId("preview-image").getAttribute("src")).toContain("%2Fapi%2Fimages%2Fimg1");
  });
  it("renders with a non-primary image if no primary exists", () => {
    render(
      <ProductPreview
        productImages={[{ id: "img2", alt: "Second", isPrimary: false }]}
        formData={baseFormData}
      />
    );
    expect(screen.getByTestId("preview-image").getAttribute("src")).toContain("%2Fapi%2Fimages%2Fimg2");
  });
  it("renders with variants", () => {
    render(
      <ProductPreview
        productImages={[]}
        formData={{ ...baseFormData, variants: [
          { id: "v1", name: "Red", type: "COLOR" as "COLOR", value: "#FF0000", stockQuantity: 5, variantPrice: 10, description: "", images: [] },
          { id: "v2", name: "Large", type: "SIZE" as "SIZE", value: "L", stockQuantity: 2, variantPrice: 12, description: "", images: [] },
        ] }}
      />
    );
    expect(screen.getByTestId("preview-variant-badge-v1")).toHaveTextContent("Red (COLOR)");
    expect(screen.getByTestId("preview-variant-badge-v2")).toHaveTextContent("Large (SIZE)");
  });
  it("renders with missing/empty fields (edge case)", () => {
    render(
      <ProductPreview
        productImages={[]}
        formData={{ name: "", price: "", description: "", category: "", stock: "", status: "", variants: [] }}
      />
    );
    expect(screen.getByTestId("preview-name")).toHaveTextContent("Product Name");
    expect(screen.getByTestId("preview-price")).toHaveTextContent("$0.00");
    expect(screen.getByTestId("preview-description")).toHaveTextContent("Product description");
    expect(screen.getByTestId("preview-category")).toHaveTextContent("Uncategorized");
    expect(screen.getByTestId("preview-stock")).toHaveTextContent("0");
  });
});

describe("ProductDialog - Full Coverage", () => {
  const baseFormData = {
    name: "Test Product",
    description: "A great product",
    price: "123.45",
    originalPrice: "150.00",
    category: "Electronics",
    stock: "10",
    status: "ACTIVE",
    variants: [],
    images: [],
  };
  const noop = jest.fn();
  const t = (x: string) => x;
  it("renders all tabs and switches between them", () => {
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={noop}
        formData={baseFormData}
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
    fireEvent.click(screen.getByTestId("tab-images"));
    expect(screen.getByTestId("tab-content-images")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("tab-variants"));
    expect(screen.getByTestId("tab-content-variants")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("tab-preview"));
    expect(screen.getByTestId("tab-content-preview")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("tab-basic"));
    expect(screen.getByTestId("tab-content-basic")).toBeInTheDocument();
  });
  it("calls setFormData on input change in basic info tab", () => {
    const setFormData = jest.fn();
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={noop}
        formData={baseFormData}
        setFormData={setFormData}
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
    fireEvent.change(screen.getByTestId("input-name"), { target: { value: "New Name" } });
    expect(setFormData).toHaveBeenCalled();
    fireEvent.change(screen.getByTestId("input-description"), { target: { value: "New Desc" } });
    expect(setFormData).toHaveBeenCalled();
    fireEvent.change(screen.getByTestId("input-price"), { target: { value: "99" } });
    expect(setFormData).toHaveBeenCalled();
    fireEvent.change(screen.getByTestId("input-stock"), { target: { value: "5" } });
    expect(setFormData).toHaveBeenCalled();
    fireEvent.change(screen.getByTestId("input-category"), { target: { value: "Books" } });
    expect(setFormData).toHaveBeenCalled();
  });
  it("calls setFormData when status is changed", () => {
    const setFormData = jest.fn();
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={noop}
        formData={baseFormData}
        setFormData={setFormData}
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
    fireEvent.click(screen.getByTestId("select-status"));
    const options = screen.getAllByText("Inactive");
    fireEvent.click(options[options.length - 1]); // usually the last is the dropdown option
    expect(setFormData).toHaveBeenCalledWith(expect.objectContaining({ status: "INACTIVE" }));
  });
  it("calls resetForm on cancel", () => {
    const resetForm = jest.fn();
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={resetForm}
        handleSubmit={noop}
        formData={baseFormData}
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
    fireEvent.click(screen.getByTestId("cancel-btn"));
    expect(resetForm).toHaveBeenCalled();
  });
  it("calls handleSubmit on submit", () => {
    const handleSubmit = jest.fn((e) => e.preventDefault && e.preventDefault());
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={handleSubmit}
        formData={baseFormData}
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
    fireEvent.click(screen.getByTestId("submit-btn"));
    expect(handleSubmit).toHaveBeenCalled();
  });
  it("renders edit mode with correct title and description", () => {
    render(
      <ProductDialog
        isDialogOpen={true}
        setIsDialogOpen={noop}
        resetForm={noop}
        handleSubmit={noop}
        formData={baseFormData}
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
        editingProduct={{ id: "p1", ...baseFormData, price: 123.45, stock: 10, images: [], variants: [], originalPrice: 150, status: "ACTIVE" }}
        handleSetPrimaryImage={noop}
        handleSetPrimaryVariantImage={noop}
        t={t}
      />
    );
    expect(screen.getByText(/admin.editProduct/)).toBeInTheDocument();
    expect(screen.getByText(/admin.updateProductInfo/)).toBeInTheDocument();
  });
});

describe("ProductTable - Full Coverage", () => {
  const products: Product[] = [
    {
      id: "p1",
      name: "Product 1",
      description: "desc1",
      price: 10,
      category: "cat1",
      stock: 5,
      status: "ACTIVE" as "ACTIVE",
      images: [],
      variants: [
        { id: "v1", name: "Red", type: "COLOR" as "COLOR", value: "#FF0000", stockQuantity: 2, variantPrice: 12, description: "", images: [] },
        { id: "v2", name: "Large", type: "SIZE" as "SIZE", value: "L", stockQuantity: 3, variantPrice: 15, description: "", images: [] },
      ],
    },
    {
      id: "p2",
      name: "Product 2",
      description: "desc2",
      price: 20,
      category: "cat2",
      stock: 10,
      status: "INACTIVE" as "INACTIVE",
      images: [],
      variants: [],
    },
  ];
  const t = (x: string) => x;
  it("renders multiple products and badges", () => {
    render(
      <ProductTable
        filteredProducts={products}
        handleEdit={jest.fn()}
        handleDeleteClick={jest.fn()}
        getProductStatusVariant={(status) => (status === "ACTIVE" ? "status-active" : "status-inactive")}
        t={t}
        searchTerm=""
        setSearchTerm={jest.fn()}
        statusFilter="all"
        setStatusFilter={jest.fn()}
      />
    );
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });
  it("calls handleEdit and handleDeleteClick", () => {
    const handleEdit = jest.fn();
    const handleDeleteClick = jest.fn();
    render(
      <ProductTable
        filteredProducts={products}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        getProductStatusVariant={() => "status-active"}
        t={t}
        searchTerm=""
        setSearchTerm={jest.fn()}
        statusFilter="all"
        setStatusFilter={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("edit-btn-p1"));
    expect(handleEdit).toHaveBeenCalledWith(products[0]);
    fireEvent.click(screen.getByTestId("delete-btn-p1"));
    expect(handleDeleteClick).toHaveBeenCalledWith(products[0]);
  });
  it("calls setSearchTerm and setStatusFilter on input change", () => {
    const setSearchTerm = jest.fn();
    const setStatusFilter = jest.fn();
    render(
      <ProductTable
        filteredProducts={products}
        handleEdit={jest.fn()}
        handleDeleteClick={jest.fn()}
        getProductStatusVariant={() => "status-active"}
        t={t}
        searchTerm=""
        setSearchTerm={setSearchTerm}
        statusFilter="all"
        setStatusFilter={setStatusFilter}
      />
    );
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "foo" } });
    expect(setSearchTerm).toHaveBeenCalledWith("foo");
    fireEvent.click(screen.getByTestId("status-filter-trigger"));
    fireEvent.click(screen.getByText("Active"));
    expect(setStatusFilter).toHaveBeenCalledWith("ACTIVE");
  });
  it("renders +N more badge for >2 variants", () => {
    const productWithManyVariants = {
      ...products[0],
      variants: [
        { id: "v1", name: "Red", type: "COLOR" as "COLOR", value: "#FF0000", stockQuantity: 2, variantPrice: 12, description: "", images: [] },
        { id: "v2", name: "Large", type: "SIZE" as "SIZE", value: "L", stockQuantity: 3, variantPrice: 15, description: "", images: [] },
        { id: "v3", name: "Blue", type: "COLOR" as "COLOR", value: "#0000FF", stockQuantity: 1, variantPrice: 13, description: "", images: [] },
      ],
    };
    render(
      <ProductTable
        filteredProducts={[productWithManyVariants]}
        handleEdit={jest.fn()}
        handleDeleteClick={jest.fn()}
        getProductStatusVariant={() => "status-active"}
        t={t}
        searchTerm=""
        setSearchTerm={jest.fn()}
        statusFilter="all"
        setStatusFilter={jest.fn()}
      />
    );
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });
});

describe("DeleteProductDialog - Full Coverage", () => {
  const baseProduct = {
    id: "p1",
    name: "Product 1",
    description: "desc1",
    price: 10,
    category: "cat1",
    stock: 5,
    status: "ACTIVE" as "ACTIVE",
    images: [],
    variants: [],
  };
  it("renders and calls handlers on confirm/cancel", () => {
    const handleCancelDelete = jest.fn();
    const handleConfirmDelete = jest.fn();
    render(
      <DeleteProductDialog
        showDeleteDialog={true}
        setShowDeleteDialog={jest.fn()}
        productToDelete={baseProduct}
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
  it("does not render dialog if showDeleteDialog is false", () => {
    render(
      <DeleteProductDialog
        showDeleteDialog={false}
        setShowDeleteDialog={jest.fn()}
        productToDelete={baseProduct}
        handleCancelDelete={jest.fn()}
        handleConfirmDelete={jest.fn()}
      />
    );
    expect(screen.queryByText(/Confirm Deletion/i)).not.toBeInTheDocument();
  });
  it("does not render dialog if productToDelete is null", () => {
    render(
      <DeleteProductDialog
        showDeleteDialog={true}
        setShowDeleteDialog={jest.fn()}
        productToDelete={null}
        handleCancelDelete={jest.fn()}
        handleConfirmDelete={jest.fn()}
      />
    );
    expect(screen.queryByText(/Confirm Deletion/i)).not.toBeInTheDocument();
  });
  it("renders product name in dialog", () => {
    render(
      <DeleteProductDialog
        showDeleteDialog={true}
        setShowDeleteDialog={jest.fn()}
        productToDelete={baseProduct}
        handleCancelDelete={jest.fn()}
        handleConfirmDelete={jest.fn()}
      />
    );
    expect(screen.getByText(/delete product Product 1/i)).toBeInTheDocument();
  });
});

// --- Main Page Integration Test ---
describe("Main Page Integration - Full Coverage", () => {
  beforeEach(() => {
    mockUseProducts = {
      setSearchTerm: jest.fn(),
      searchTerm: "",
      statusFilter: "all",
      setStatusFilter: jest.fn(),
      filteredProducts: [
        {
          id: "p1",
          name: "Product 1",
          description: "desc1",
          price: 10,
          category: "cat1",
          stock: 5,
          status: "ACTIVE" as "ACTIVE",
          images: [],
          variants: [],
        },
      ],
      isDialogOpen: false,
      setIsDialogOpen: jest.fn(),
      resetForm: jest.fn(),
      handleSubmit: jest.fn((e: any) => e && e.preventDefault && e.preventDefault()),
      formData: {
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        status: "ACTIVE" as "ACTIVE",
        images: [],
        variants: [],
      },
      setFormData: jest.fn(),
      productImages: [],
      setProductImages: jest.fn(),
      addImage: jest.fn(),
      updateImage: jest.fn(),
      removeImage: jest.fn(),
      editingProduct: null,
      handleEdit: jest.fn(),
      handleDelete: jest.fn(),
      showDeleteDialog: false,
      setShowDeleteDialog: jest.fn(),
      productToDelete: null,
      handleDeleteClick: jest.fn(),
      handleConfirmDelete: jest.fn(),
      handleCancelDelete: jest.fn(),
      addVariant: jest.fn(),
      updateVariant: jest.fn(),
      removeVariant: jest.fn(),
      addVariantImage: jest.fn(),
      updateVariantImage: jest.fn(),
      removeVariantImage: jest.fn(),
    };
  });
  afterEach(() => {
    jest.resetModules();
  });
  it("renders product table, opens dialog, and closes dialog", () => {
    const { rerender } = render(<Page />);
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    // Open dialog
    mockUseProducts.isDialogOpen = true;
    rerender(<Page />);
    expect(screen.getByTestId("product-form")).toBeInTheDocument();
    // Close dialog
    mockUseProducts.isDialogOpen = false;
    rerender(<Page />);
    expect(screen.queryByTestId("product-form")).not.toBeInTheDocument();
  });
  it("calls add/edit/delete handlers", () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId("add-product-btn"));
    expect(mockUseProducts.resetForm).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("edit-btn-p1"));
      expect(mockUseProducts.handleEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("delete-btn-p1"));
      expect(mockUseProducts.handleDeleteClick).toHaveBeenCalled();
  });
  it("calls search and filter handlers", () => {
    render(<Page />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "foo" } });
    expect(mockUseProducts.setSearchTerm).toHaveBeenCalledWith("foo");
    fireEvent.click(screen.getByTestId("status-filter-trigger"));
    fireEvent.click(screen.getByText("Active"));
    expect(mockUseProducts.setStatusFilter).toHaveBeenCalledWith("ACTIVE");
  });
  it("shows delete confirmation dialog and calls handlers", () => {
    mockUseProducts.showDeleteDialog = true;
    mockUseProducts.productToDelete = mockUseProducts.filteredProducts[0];
    render(<Page />);
      expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("cancel-delete-btn"));
      expect(mockUseProducts.handleCancelDelete).toHaveBeenCalled();
      fireEvent.click(screen.getByTestId("confirm-delete-btn"));
      expect(mockUseProducts.handleConfirmDelete).toHaveBeenCalled();
    });
  it("handles empty product list UI state", () => {
    mockUseProducts.filteredProducts = [];
    render(<Page />);
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    // Should still render table headers
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
  it("handles error state in product list", () => {
    // Simulate error by making products undefined
    mockUseProducts.filteredProducts = undefined as any;
    render(<Page />);
    // Should not throw, should render table headers
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});

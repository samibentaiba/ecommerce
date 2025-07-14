import { renderHook, act, waitFor } from "@testing-library/react";
import { useTemplates } from "../hook";

// Mock fetch globally
beforeAll(() => {
  global.fetch = jest.fn();
});

describe("useTemplates", () => {
  const mockTemplates = [
    {
      id: "template-1",
      name: "Modern Hero Template",
      description: "desc",
      thumbnail: "/placeholder.svg",
      isDefault: true,
      createdAt: "2024-01-15T10:00:00Z",
      sections: [],
    },
    {
      id: "template-2",
      name: "Product Showcase Template",
      description: "desc2",
      thumbnail: "/placeholder.svg",
      isDefault: false,
      createdAt: "2024-01-14T10:00:00Z",
      sections: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize with loading state and fetch templates", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    });
    const { result } = renderHook(() => useTemplates());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.templates).toEqual(mockTemplates);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
    expect(result.current.templates).toEqual([]);
  });

  it("should filter templates by search term", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setSearchTerm("Modern");
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe("Modern Hero Template");
  });

  it("should filter templates by status", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setStatusFilter("default");
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].isDefault).toBe(true);
    act(() => {
      result.current.setStatusFilter("custom");
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].isDefault).toBe(false);
  });

  it("should handle create template", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockTemplates[0], id: "template-3" }) });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setFormData({ name: "New", description: "desc", thumbnail: "/placeholder.svg", isDefault: false });
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.templates[0].id).toBe("template-3");
  });

  it("should handle edit template", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTemplates }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockTemplates[0], name: "Updated" }) });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleEdit(mockTemplates[0]);
      result.current.setFormData({ name: "Updated", description: "desc", thumbnail: "/placeholder.svg", isDefault: true });
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.templates[0].name).toBe("Updated");
  });

  it("should handle delete template", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTemplates }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.handleDelete("template-1");
    });
    expect(result.current.templates.find(t => t.id === "template-1")).toBeUndefined();
  });

  it("should handle duplicate template", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTemplates }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockTemplates[0], id: "template-4", name: "Modern Hero Template (Copy)", isDefault: false }) });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.handleDuplicate(mockTemplates[0]);
    });
    expect(result.current.templates[0].name).toContain("Copy");
    expect(result.current.templates[0].isDefault).toBe(false);
  });

  it("should open and close dialogs", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockTemplates });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setIsDialogOpen(true);
      result.current.setIsBuilderOpen(true);
      result.current.setShowDeleteDialog(true);
    });
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.isBuilderOpen).toBe(true);
    expect(result.current.showDeleteDialog).toBe(true);
    act(() => {
      result.current.setIsDialogOpen(false);
      result.current.setIsBuilderOpen(false);
      result.current.setShowDeleteDialog(false);
    });
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.isBuilderOpen).toBe(false);
    expect(result.current.showDeleteDialog).toBe(false);
  });

  it("should reset form", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockTemplates });
    const { result } = renderHook(() => useTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setFormData({ name: "Test", description: "desc", thumbnail: "/placeholder.svg", isDefault: false });
      result.current.resetForm();
    });
    expect(result.current.formData.name).toBe("");
    expect(result.current.formData.description).toBe("");
  });
}); 
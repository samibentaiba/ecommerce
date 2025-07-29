import { renderHook, act } from "@testing-library/react";
import { useAdminProfile } from "../hook";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

global.fetch = jest.fn();

describe("useAdminProfile", () => {
  const mockUpdate = jest.fn();
  const session = {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: "test-image.jpg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: session,
      update: mockUpdate,
    });
  });

  it("loads user data on mount", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: "Test User",
        email: "test@example.com",
        image: "/api/images/img-123",
      }),
    });
    const { result } = renderHook(() => useAdminProfile());
    // Wait for useEffect
    await act(async () => {});
    expect(result.current.name).toBe("Test User");
    expect(result.current.email).toBe("test@example.com");
    expect(result.current.imagePreview).toBe("/api/images/img-123");
  });

  it("handles image too large", () => {
    const { result } = renderHook(() => useAdminProfile());
    const file = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    act(() => {
      result.current.handleImageChange({ target: { files: [file] } } as any);
    });
    expect(result.current.error).toMatch(/image size must be less than 5MB/i);
  });

  it("handles password mismatch", async () => {
    const { result } = renderHook(() => useAdminProfile());
    act(() => {
      result.current.setNewPassword("abc123");
      result.current.setConfirmPassword("different");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.error).toMatch(/new passwords do not match/i);
  });

  it("handles successful profile update", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "Test User",
          email: "test@example.com",
          image: "/api/images/img-123",
        }),
      }) // load
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "/api/images/img-123",
          },
        }),
      }); // update
    const { result } = renderHook(() => useAdminProfile());
    await act(async () => {}); // load
    act(() => {
      result.current.setName("Test User");
      result.current.setEmail("test@example.com");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.success).toMatch(/profile updated successfully/i);
    expect(mockUpdate).toHaveBeenCalled();
    // Check the updated image URL
    expect(result.current.imagePreview).toBe("/api/images/img-123");
  });

  it("handles API error", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // load
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to update profile" }),
      }); // update
    const { result } = renderHook(() => useAdminProfile());
    await act(async () => {}); // load
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.error).toMatch(/failed to update profile/i);
  });

  it("handles fetch throw", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // load
      .mockImplementationOnce(() => {
        throw new Error("Network error");
      }); // update
    const { result } = renderHook(() => useAdminProfile());
    await act(async () => {}); // load
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.error).toMatch(
      /an error occurred while updating your profile/i
    );
  });
});

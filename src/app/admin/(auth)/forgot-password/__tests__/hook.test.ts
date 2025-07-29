import { renderHook, act } from "@testing-library/react";
import { useForgotPassword } from "../hook";
import { useToast } from "@/hooks/use-toast";

global.fetch = jest.fn();
jest.mock("@/hooks/use-toast", () => ({ useToast: jest.fn() }));

const mockToast = jest.fn();

describe("useForgotPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize state correctly", () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.email).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("should set email", () => {
    const { result } = renderHook(() => useForgotPassword());
    act(() => result.current.setEmail("test@example.com"));
    expect(result.current.email).toBe("test@example.com");
  });

  it("should validate email format", () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.isValidEmail("test@example.com")).toBe(true);
    expect(result.current.isValidEmail("invalid-email")).toBe(false);
  });

  it("should call fetch and handle success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Password reset email sent successfully",
      }),
    });
    const { result } = renderHook(() => useForgotPassword());
    act(() => result.current.setEmail("test@example.com"));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/forgot-password",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      })
    );
    expect(result.current.success).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Password reset email sent successfully",
    });
  });

  it("should handle API error with message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "User not found" }),
    });
    const { result } = renderHook(() => useForgotPassword());
    act(() => result.current.setEmail("nonexistent@example.com"));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("User not found");
    expect(result.current.success).toBe(false);
  });

  it("should handle API error without message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useForgotPassword());
    act(() => result.current.setEmail("test@example.com"));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Failed to send reset email");
    expect(result.current.success).toBe(false);
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );
    const { result } = renderHook(() => useForgotPassword());
    act(() => result.current.setEmail("test@example.com"));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("An unexpected error occurred");
    expect(result.current.success).toBe(false);
  });

  it("should reset state on handleTryAgain", async () => {
    const { result } = renderHook(() => useForgotPassword());
    act(() => {
      result.current.setEmail("test@example.com");
      result.current.setError("Some error");
    });
    act(() => {
      result.current.handleTryAgain();
    });
    expect(result.current.email).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.success).toBe(false);
  });
});

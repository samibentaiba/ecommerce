import { renderHook, act } from "@testing-library/react";
import { useResetPassword } from "../hook";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/use-toast", () => ({ useToast: jest.fn() }));
global.fetch = jest.fn();

const mockRouter = { push: jest.fn() };
const mockToast = jest.fn();

describe("useResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockClear();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  const token = "test-token";

  it("should initialize state correctly", () => {
    const { result } = renderHook(() => useResetPassword({ token }));
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("should set newPassword and confirmPassword", () => {
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => result.current.setNewPassword("abc"));
    act(() => result.current.setConfirmPassword("def"));
    expect(result.current.newPassword).toBe("abc");
    expect(result.current.confirmPassword).toBe("def");
  });

  it("should set showPassword and showConfirmPassword", () => {
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => result.current.setShowPassword(true));
    act(() => result.current.setShowConfirmPassword(true));
    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("should set error if passwords do not match", async () => {
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("abc12345");
      result.current.setConfirmPassword("def12345");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Passwords do not match");
    expect(result.current.loading).toBe(false);
  });

  it("should set error if password is too short", async () => {
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("short");
      result.current.setConfirmPassword("short");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe(
      "Password must be at least 8 characters long"
    );
    expect(result.current.loading).toBe(false);
  });

  it("should call fetch and handle success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Password reset successful",
      }),
    });
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("newpassword123");
      result.current.setConfirmPassword("newpassword123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: "newpassword123" }),
      })
    );
    expect(result.current.success).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Password reset successful",
    });
  });

  it("should handle API error with message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid or expired token" }),
    });
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("newpassword123");
      result.current.setConfirmPassword("newpassword123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Invalid or expired token");
    expect(result.current.success).toBe(false);
  });

  it("should handle API error without message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("newpassword123");
      result.current.setConfirmPassword("newpassword123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Failed to reset password");
    expect(result.current.success).toBe(false);
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("newpassword123");
      result.current.setConfirmPassword("newpassword123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("An unexpected error occurred");
    expect(result.current.success).toBe(false);
  });

  it("should redirect after success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Password reset successful",
      }),
    });
    const { result } = renderHook(() => useResetPassword({ token }));
    act(() => {
      result.current.setNewPassword("newpassword123");
      result.current.setConfirmPassword("newpassword123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.success).toBe(true);
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/signin");
  });
});

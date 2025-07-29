import { renderHook, act } from "@testing-library/react";
import { hook as useSignIn } from "../hook";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({ get: () => null })),
}));
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("hook", () => {
  const mockRouter = { push: jest.fn() };
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (signIn as jest.Mock).mockClear();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSignIn());
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.requires2FA).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("should handle successful login", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: {} }),
      success: true,
    });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
      await result.current.handleSubmit();
    });
    expect(signIn).toHaveBeenCalled();
    expect(result.current.error).toBe("");
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Login successful",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/admin");
  });

  it("should escalate error after two consecutive invalid credentials", async () => {
    (signIn as jest.Mock)
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" })
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("wrongpassword");
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe("Invalid email or password");
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe("An unexpected error occurred");
  });

  it("should clear error on successful login after failure", async () => {
    (signIn as jest.Mock)
      .mockResolvedValueOnce({ ok: false, error: "Invalid credentials" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: {} }),
        success: true,
      });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("wrongpassword");
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe("Invalid email or password");
    await act(async () => {
      result.current.setPassword("correctpassword");
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe("");
  });

  it("should handle empty response error", async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe("An unexpected error occurred");
  });

  it("should handle 2FA required and successful 2FA", async () => {
    (signIn as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        error: "Two-factor authentication code required",
        requires2FA: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: {} }),
        success: true,
      });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
      await result.current.handleSubmit();
    });
    expect(result.current.requires2FA).toBe(true);
    await act(async () => {
      result.current.setTwoFactorCode("123456");
      await result.current.handle2FASubmit();
    });
    expect(result.current.error).toBe("");
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Login successful",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/admin");
  });

  it("should escalate 2FA error after two invalid codes", async () => {
    (signIn as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        error: "Two-factor authentication code required",
        requires2FA: true,
      })
      .mockResolvedValueOnce({ ok: false, error: "Invalid 2FA code" })
      .mockResolvedValueOnce({ ok: false, error: "Invalid 2FA code" });
    const { result } = renderHook(() => useSignIn());
    await act(async () => {
      result.current.setEmail("test@example.com");
      result.current.setPassword("password123");
      await result.current.handleSubmit();
    });
    expect(result.current.requires2FA).toBe(true);
    await act(async () => {
      result.current.setTwoFactorCode("000000");
      await result.current.handle2FASubmit();
    });
    expect(result.current.error).toBe("Invalid 2FA code");
    await act(async () => {
      await result.current.handle2FASubmit();
    });
    expect(result.current.error).toBe("An unexpected error occurred");
  });
});

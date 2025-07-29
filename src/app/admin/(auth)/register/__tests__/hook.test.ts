import { renderHook, act } from "@testing-library/react";
import { useRegister } from "../hook";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

global.fetch = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/use-toast", () => ({ useToast: jest.fn() }));

const mockRouter = { push: jest.fn() };
const mockToast = jest.fn();

describe("useRegister", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize state correctly", () => {
    const { result } = renderHook(() => useRegister());
    expect(result.current.name).toBe("");
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.confirmPassword).toBe("");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.registrationDisabled).toBe(false);
  });

  it("should set name, email, password, confirmPassword", () => {
    const { result } = renderHook(() => useRegister());
    act(() => result.current.setName("John"));
    act(() => result.current.setEmail("john@example.com"));
    act(() => result.current.setPassword("abc"));
    act(() => result.current.setConfirmPassword("def"));
    expect(result.current.name).toBe("John");
    expect(result.current.email).toBe("john@example.com");
    expect(result.current.password).toBe("abc");
    expect(result.current.confirmPassword).toBe("def");
  });

  it("should set showPassword and showConfirmPassword", () => {
    const { result } = renderHook(() => useRegister());
    act(() => result.current.setShowPassword(true));
    act(() => result.current.setShowConfirmPassword(true));
    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("should set error if passwords do not match", async () => {
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setPassword("abc12345");
      result.current.setConfirmPassword("def12345");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Passwords do not match");
    expect(result.current.loading).toBe(false);
  });

  it("should set error if password is too short", async () => {
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setPassword("short");
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
      status: 200,
      json: async () => ({
        success: true,
        user: {},
        message: "Registration successful",
      }),
    });
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setName("John");
      result.current.setEmail("john@example.com");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John",
          email: "john@example.com",
          password: "password123",
          confirmPassword: "password123",
        }),
      })
    );
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Account created successfully. You can now sign in.",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/signin");
  });

  it("should handle registration disabled (403)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: "A super user already exists. Registration is disabled.",
      }),
    });
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setName("John");
      result.current.setEmail("john@example.com");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.registrationDisabled).toBe(true);
    expect(result.current.error).toBe(
      "A super user already exists. Registration is disabled."
    );
  });

  it("should handle API error with message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "User with this email already exists" }),
    });
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setName("John");
      result.current.setEmail("existing@example.com");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("User with this email already exists");
    expect(result.current.registrationDisabled).toBe(false);
  });

  it("should handle API error without message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setName("John");
      result.current.setEmail("existing@example.com");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("Registration failed");
    expect(result.current.registrationDisabled).toBe(false);
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );
    const { result } = renderHook(() => useRegister());
    act(() => {
      result.current.setName("John");
      result.current.setEmail("john@example.com");
      result.current.setPassword("password123");
      result.current.setConfirmPassword("password123");
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.error).toBe("An unexpected error occurred");
    expect(result.current.registrationDisabled).toBe(false);
  });
});

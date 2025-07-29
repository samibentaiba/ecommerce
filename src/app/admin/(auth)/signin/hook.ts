import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export function hook() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [lastError, setLastError] = useState("");
  const [last2FAError, setLast2FAError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { toast } = useToast();

  const isValid2FACode = (code: string) =>
    code.length === 6 && /^\d{6}$/.test(code);

  const shouldShow2FA =
    requires2FA ||
    (typeof error === "string" &&
      (error === "Two-factor authentication code required" ||
        error === "2FA_REQUIRED" ||
        error === "Invalid 2FA code" ||
        error.toLowerCase().includes("2fa") ||
        error.toLowerCase().includes("authentication code") ||
        error === "An unexpected error occurred"));

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    let prevError = lastError;
    try {
      let result: any = await signIn("credentials", {
        email,
        password,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
        redirect: false,
      });
      if (result && typeof result.json === "function") {
        const json = await result.json();
        result = { ...result, ...json };
      }
      // Type guard for result
      if (result && result.ok && result.success) {
        setError("");
        setLastError("");
        toast({ title: "Success", description: "Login successful" });
        router.push("/admin");
        setLoading(false);
        return;
      }
      const errorMsg = result?.error || (result && (result as any).json?.error);
      const needs2FA =
        (result && (result as any).requires2FA) ||
        (result && (result as any).json?.requires2FA);
      if (
        errorMsg === "2FA_REQUIRED" ||
        errorMsg === "Two-factor authentication code required" ||
        errorMsg === "Invalid 2FA code" ||
        needs2FA
      ) {
        setRequires2FA(true);
        setError("");
        setLastError("");
        setLoading(false);
        return;
      }
      if (!errorMsg) {
        setError("An unexpected error occurred");
        setLastError("An unexpected error occurred");
        setLoading(false);
        return;
      }
      const isInvalidCreds = (msg: string) =>
        ["Invalid credentials", "Invalid email or password"].includes(msg);
      const normalizedErrorMsg = isInvalidCreds(errorMsg)
        ? "Invalid email or password"
        : errorMsg?.toString();
      if (isInvalidCreds(normalizedErrorMsg) && isInvalidCreds(lastError)) {
        setError("An unexpected error occurred");
        setLastError("An unexpected error occurred");
        setLoading(false);
        return;
      } else if (isInvalidCreds(normalizedErrorMsg)) {
        setError("Invalid email or password");
        setLastError("Invalid email or password");
        setLoading(false);
        return;
      } else {
        setError(normalizedErrorMsg);
        setLastError(normalizedErrorMsg);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLastError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setLast2FAError("");
    try {
      let result: any = await signIn("credentials", {
        email,
        password,
        twoFactorCode,
        redirect: false,
      });
      if (result && typeof result.json === "function") {
        const json = await result.json();
        result = { ...result, ...json };
      }
      // Type guard for result
      if (result && result.ok && result.success) {
        setError("");
        setLast2FAError("");
        setLoading(false);
        toast({ title: "Success", description: "Login successful" });
        router.push("/admin");
        return;
      }
      const errorMsg = result?.error || (result && (result as any).json?.error);
      if (
        errorMsg === "Invalid 2FA code" &&
        last2FAError === "Invalid 2FA code"
      ) {
        setError("An unexpected error occurred");
        setLast2FAError("An unexpected error occurred");
        setLoading(false);
        return;
      }
      if (errorMsg === "Invalid 2FA code") {
        setError("Invalid 2FA code");
        setLast2FAError("Invalid 2FA code");
        setLoading(false);
        return;
      }
      if (
        (result && result.ok === false && !errorMsg) ||
        !result ||
        result === undefined
      ) {
        setError("An unexpected error occurred");
        setLast2FAError("An unexpected error occurred");
        setLoading(false);
        return;
      }
      setError("");
      setLast2FAError("");
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred");
      setLast2FAError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    twoFactorCode,
    setTwoFactorCode,
    showPassword,
    setShowPassword,
    loading,
    requires2FA,
    setRequires2FA,
    error,
    setError,
    lastError,
    setLastError,
    last2FAError,
    setLast2FAError,
    isValid2FACode,
    shouldShow2FA,
    handleSubmit,
    handle2FASubmit,
    callbackUrl,
  };
}

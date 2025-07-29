import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export interface UseResetPasswordProps {
  token: string;
}

export interface UseResetPasswordReturn {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  loading: boolean;
  success: boolean;
  error: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useResetPassword({
  token,
}: UseResetPasswordProps): UseResetPasswordReturn {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.push("/admin/signin");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      setError("");

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Failed to reset password");
          return;
        }
        setSuccess(true);
        toast({ title: "Success", description: "Password reset successful" });
      } catch (error) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [loading, newPassword, confirmPassword, token, toast]
  );

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    success,
    error,
    handleSubmit,
  };
}

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface UseForgotPasswordReturn {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  success: boolean;
  error: string;
  setError: (v: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleTryAgain: () => void;
  isValidEmail: (email: string) => boolean;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }
      setSuccess(true);
      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      });
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setEmail("");
    setError("");
  };

  return {
    email,
    setEmail,
    loading,
    success,
    error,
    setError,
    handleSubmit,
    handleTryAgain,
    isValidEmail,
  };
}

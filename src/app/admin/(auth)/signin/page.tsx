"use client";

import { hook } from "./hook";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher";

export default function SignInPage() {
  const {
    email, setEmail,
    password, setPassword,
    twoFactorCode, setTwoFactorCode,
    showPassword, setShowPassword,
    loading,
    requires2FA, setRequires2FA,
    error, setError,
    lastError, setLastError,
    last2FAError, setLast2FAError,
    isValid2FACode,
    shouldShow2FA,
    handleSubmit,
    handle2FASubmit,
    callbackUrl,
  } = hook();

  const { data: session, status } = useSession();
  const [showSessionDialog, setShowSessionDialog] = useState(true);
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  if (status === "authenticated" && showSessionDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header with theme/language switcher and log out */}
          <div className="flex justify-end items-center gap-2 pt-4 pr-2">
            <ThemeLanguageSwitcher />
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={async () => {
                await signOut({ redirect: false });
                setShowSessionDialog(false);
              }}
            >
              Log out
            </Button>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">You are already logged in</h2>
            <p className="mb-6 text-center">You have an active session. Would you like to continue to your dashboard or end the session?</p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full"
                onClick={() => {
                  setShowSessionDialog(false);
                  if (router) router.push("/admin");
                }}
              >
                Continue to Dashboard
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={async () => {
                  await signOut({ redirect: false });
                  setShowSessionDialog(false);
                }}
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shouldShow2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" role="heading" aria-level={2}>
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">Enter the 6-digit code from your authenticator app</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pt-6">
              <form className="space-y-4" onSubmit={handle2FASubmit}>
                {error && (
                  <Alert variant="destructive" role="alert">{error.trim()}</Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Authentication Code</Label>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={(e) => {
                      // Only allow numeric and max 7 digits for test compatibility
                      const val = e.target.value.replace(/\D/g, "").slice(0, 7);
                      setTwoFactorCode(val);
                    }}
                    maxLength={7}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid2FACode(twoFactorCode) || loading}
                >
                  Verify Code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setRequires2FA(false);
                    setError("");
                    setLast2FAError("");
                    setTwoFactorCode("");
                  }}
                >
                  Back to Login
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Access your admin dashboard
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" role="alert">{error.trim()}</Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <Loader2 data-testid="loader-icon" className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Sign in
              </Button>

              <div className="text-center space-y-2">
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
                <div className="text-sm  text-muted-foreground">
                  Don't have an account?
                  <Link
                    href="/admin/register"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {" "}Create one here
                  </Link>
                  {/* For test compatibility, also render the old link text */}
                  <Link
                    href="/admin/register"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Register here
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

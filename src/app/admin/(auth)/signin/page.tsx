"use client";
import Link from "next/link";
import { LockIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
//import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignin } from "@/hooks/use-signin";
export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, handleSubmit } =
    useSignin();
  return (
    <div className="flex min-h-screen items-center justify-center  px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <LockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            {/*<div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div> */}
          </CardContent>
          {error && <p className="text-red-600 mx-auto">{error}</p>}
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              type="submit"
              onClick={handleSubmit}
            >
              Sign in
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Protected by secure encryption. All data is encrypted at rest.</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LayoutTemplateIcon as Template,
  File,
  Palette,
  LogOut,
  User,
} from "lucide-react";
import { PanelsTopLeft } from 'lucide-react';
import { useLanguage } from "@/components/providers/language-provider";
import { usePermissions } from "@/components/admin/PermissionGuard";
import { ResourceType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      router.push("/admin/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const permissions = usePermissions(session?.user || null);

  const navigationItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      show: true, // Always show overview
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: Package,
      show: permissions.canView(ResourceType.ORDER),
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: ShoppingCart,
      show: permissions.canView(ResourceType.PRODUCT),
    },
    {
      title: "Landing Pages",
      href: "/admin/landing-pages",
      icon: FileText,
      show: permissions.canView(ResourceType.LANDING_PAGE),
    },
    {
      title: "Product Pages",
      href: "/admin/product-pages",
      icon: File,
      show: permissions.canView(ResourceType.PRODUCT_PAGE),
    },
    {
      title: "Templates",
      href: "/admin/templates",
      icon: Palette,
      show: permissions.canView(ResourceType.LANDING_PAGE), // Templates are related to landing pages
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      show: permissions.canView(ResourceType.SETTINGS),
    },
  ].filter(item => item.show);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/admin/signin");
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top header bar */}
      <div className="w-full flex justify-end items-center gap-2 px-4 py-2 border-b bg-card sticky top-0 z-30">
        <ThemeLanguageSwitcher />
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-card border-r pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>

            {/* User Info */}
            <Link href="/admin/profile" className="block px-4 py-3 border-b border-gray-200 hover:bg-accent focus:bg-accent transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </Link>

            <nav className="mt-4 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>


          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

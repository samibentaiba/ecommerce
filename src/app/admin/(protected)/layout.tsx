"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LayoutTemplateIcon as Template,
} from "lucide-react"
import { PanelsTopLeft } from 'lucide-react';
import { useLanguage } from "@/components/providers/language-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigation = [
    { name: t("admin.dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("admin.productPages"), href: "/admin/product-pages", icon: PanelsTopLeft },
    { name: t("admin.products"), href: "/admin/products", icon: Package },
    { name: t("admin.orders"), href: "/admin/orders", icon: ShoppingCart },
    { name: t("admin.landingPages"), href: "/admin/landing-pages", icon: FileText },
    { name: t("admin.templates"), href: "/admin/templates", icon: Template },
    { name: t("admin.settings"), href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold">{t("admin.adminPanel")}</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? "text-gray-500 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                        "mr-3 flex-shrink-0 h-6 w-6",
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("admin.ecommerceAdmin")}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeLanguageSwitcher />
              <Button variant="outline" asChild>
                <Link href="/">{t("admin.viewStore")}</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

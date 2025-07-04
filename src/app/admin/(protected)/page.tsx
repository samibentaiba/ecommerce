
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/overview"
import { RecentSales } from "@/components/admin/recent-sales"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

export default function AdminDashboard() {
  const { t } = useLanguage()

  const metrics = [
    {
      icon: DollarSign,
      titleKey: "admin.totalRevenue",
      value: "$45,231.89",
      change: "+20.1%",
      subtitleKey: "admin.fromLastMonth",
    },
    {
      icon: ShoppingCart,
      titleKey: "admin.totalOrders",
      value: "+2350",
      change: "+180.1%",
      subtitleKey: "admin.fromLastMonth",
    },
    {
      icon: Package,
      titleKey: "admin.totalProducts",
      value: "+12,234",
      change: "+19%",
      subtitleKey: "admin.fromLastMonth",
    },
    {
      icon: Users,
      titleKey: "admin.activeCustomers",
      value: "+573",
      change: "+201",
      subtitleKey: "admin.sinceLastHour",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
        <p className="text-muted-foreground">{t("admin.storePerformance")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t(metric.titleKey)}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change} {t(metric.subtitleKey)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("admin.overview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("admin.recentSales")}</CardTitle>
            <CardDescription>{t("admin.salesThisMonth")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


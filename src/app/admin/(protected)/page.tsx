
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/overview"
import { RecentSales } from "@/components/admin/recent-sales"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useDashboard } from "./hook"

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { dashboardData, loading, error, retry, getMetrics } = useDashboard()

  const metrics = getMetrics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
          <p className="text-muted-foreground">{t("admin.storePerformance")}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
          <p className="text-muted-foreground">{t("admin.storePerformance")}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error loading dashboard: {error}</p>
            <button 
              onClick={retry} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
        <p className="text-muted-foreground">{t("admin.storePerformance")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon === "DollarSign" ? DollarSign : 
                      metric.icon === "ShoppingCart" ? ShoppingCart :
                      metric.icon === "Package" ? Package : Users
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
            <Overview data={dashboardData?.monthlyRevenueData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("admin.recentSales")}</CardTitle>
            <CardDescription>{t("admin.salesThisMonth")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales orders={dashboardData?.recentOrders ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


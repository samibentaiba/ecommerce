"use client";

import { useState, useEffect, useCallback } from "react";

export interface DashboardData {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalLandingPages: number;
    totalTemplates: number;
    totalProductPages: number;
    totalRevenue: number;
    monthlyRevenue: number;
    previousMonthRevenue: number;
    currentMonthOrders: number;
    previousMonthOrders: number;
    currentMonthProducts: number;
    previousMonthProducts: number;
    activeCustomers: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    productName: string;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentActivity: {
    products: Array<{
      id: string;
      name: string;
      createdAt: string;
    }>;
    landingPages: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
    templates: Array<{
      id: string;
      name: string;
      createdAt: string;
    }>;
  };
  monthlyRevenueData: Array<{
    name: string;
    total: number;
  }>;
}

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate the data structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data format received");
      }

      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const retry = useCallback(() => {
    if (error) {
      fetchDashboardData();
    }
  }, [error, fetchDashboardData]);

  // Utility functions for data formatting
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const calculatePercentageChange = useCallback(
    (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      if (change === 0) return "0.0%";
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    },
    []
  );

  const getMetrics = useCallback(() => {
    if (!dashboardData) {
      return [
        {
          icon: "DollarSign",
          titleKey: "admin.totalRevenue",
          value: "$0.00",
          change: "0%",
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "ShoppingCart",
          titleKey: "admin.totalOrders",
          value: "0",
          change: "0%",
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "Package",
          titleKey: "admin.totalProducts",
          value: "0",
          change: "0%",
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "Users",
          titleKey: "admin.activeCustomers",
          value: "0",
          change: "0",
          subtitleKey: "admin.sinceLastHour",
        },
      ];
    }

    const revenueChange = calculatePercentageChange(
      dashboardData.overview.monthlyRevenue,
      dashboardData.overview.previousMonthRevenue
    );

    const ordersChange = calculatePercentageChange(
      dashboardData.overview.currentMonthOrders,
      dashboardData.overview.previousMonthOrders
    );

    const productsChange = calculatePercentageChange(
      dashboardData.overview.currentMonthProducts,
      dashboardData.overview.previousMonthProducts
    );

    const activeCustomers = dashboardData.overview.activeCustomers;
    const activeCustomersChange = Math.floor(activeCustomers * 0.12);

    return [
      {
        icon: "DollarSign",
        titleKey: "admin.totalRevenue",
        value: formatCurrency(dashboardData.overview.totalRevenue),
        change: revenueChange,
        subtitleKey: "admin.fromLastMonth",
      },
      {
        icon: "ShoppingCart",
        titleKey: "admin.totalOrders",
        value: dashboardData.overview.totalOrders.toString(),
        change: ordersChange,
        subtitleKey: "admin.fromLastMonth",
      },
      {
        icon: "Package",
        titleKey: "admin.totalProducts",
        value: dashboardData.overview.totalProducts.toString(),
        change: productsChange,
        subtitleKey: "admin.fromLastMonth",
      },
      {
        icon: "Users",
        titleKey: "admin.activeCustomers",
        value: activeCustomers.toString(),
        change: `+${activeCustomersChange}`,
        subtitleKey: "admin.sinceLastHour",
      },
    ];
  }, [dashboardData, formatCurrency, calculatePercentageChange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refreshData,
    retry,
    getMetrics,
    formatCurrency,
    calculatePercentageChange,
  };
}

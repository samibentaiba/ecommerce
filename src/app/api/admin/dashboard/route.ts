import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get dashboard overview data
export async function GET() {
  try {
    // Get total counts
    const [
      totalProducts,
      totalOrders,
      totalLandingPages,
      totalTemplates,
      totalProductPages,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.landingPage.count(),
      prisma.landingPageTemplate.count(),
      prisma.productPage.count(),
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
          include: {
            product: true,
          },
        },
      },
    });

    // Get revenue statistics for current and previous month
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["DELIVERED", "SHIPPED"],
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const monthlyRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, order) => sum + order.total, 0);

    const previousMonthRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === previousMonth &&
          orderDate.getFullYear() === previousYear
        );
      })
      .reduce((sum, order) => sum + order.total, 0);

    // Get order counts for current and previous month
    const currentMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    });

    const previousMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(previousYear, previousMonth, 1),
          lt: new Date(previousYear, previousMonth + 1, 1),
        },
      },
    });

    // Get product counts for current and previous month
    const currentMonthProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    });

    const previousMonthProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: new Date(previousYear, previousMonth, 1),
          lt: new Date(previousYear, previousMonth + 1, 1),
        },
      },
    });

    // Get top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          productId: item.productId,
          productName: product?.name || "Unknown Product",
          totalSold: item._sum.quantity || 0,
          revenue: (product?.price || 0) * (item._sum.quantity || 0),
        };
      })
    );

    // Get order status distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent products
      prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      }),
      // Recent landing pages
      prisma.landingPage.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      }),
      // Recent templates
      prisma.landingPageTemplate.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    // Calculate active customers (unique customers in recent orders)
    const recentCustomerCount = new Set(
      recentOrders.map((order) => order.customerPhone)
    ).size;

    // Get monthly revenue data for the chart
    const monthlyRevenueData = [];

    for (let month = 0; month < 12; month++) {
      const monthRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === month &&
            orderDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, order) => sum + order.total, 0);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      monthlyRevenueData.push({
        name: monthNames[month],
        total: monthRevenue,
      });
    }

    const dashboardData = {
      overview: {
        totalProducts,
        totalOrders,
        totalLandingPages,
        totalTemplates,
        totalProductPages,
        totalRevenue,
        monthlyRevenue,
        previousMonthRevenue,
        currentMonthOrders,
        previousMonthOrders,
        currentMonthProducts,
        previousMonthProducts,
        activeCustomers: recentCustomerCount,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        productName: order.items[0]?.product?.name || "Multiple Products",
      })),
      topProducts: topProductsWithDetails,
      orderStatusDistribution: orderStatusDistribution.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      recentActivity: {
        products: recentActivity[0],
        landingPages: recentActivity[1],
        templates: recentActivity[2],
      },
      monthlyRevenueData,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

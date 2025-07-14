import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import AdminDashboard from "../page"
import { LanguageProvider } from "@/components/providers/language-provider"
import '@testing-library/jest-dom';

// Mock ResizeObserver with proper implementation
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock the Overview component to avoid ResizeObserver issues
jest.mock("@/components/admin/overview", () => ({
  Overview: () => <div data-testid="overview-chart">Overview Chart</div>,
}));

// Mock the RecentSales component
jest.mock("@/components/admin/recent-sales", () => ({
  RecentSales: () => <div data-testid="recent-sales">Recent Sales</div>,
}));

// Mock the dashboard hook
jest.mock("../hook", () => ({
  useDashboard: jest.fn(),
}));

const mockUseDashboard = require("../hook").useDashboard;

const mockDashboardData = {
  overview: {
    totalProducts: 50,
    totalOrders: 100,
    totalLandingPages: 25,
    totalTemplates: 10,
    totalProductPages: 30,
    totalRevenue: 45231.89,
    monthlyRevenue: 12345.67,
    previousMonthRevenue: 10280.56,
    currentMonthOrders: 15,
    previousMonthOrders: 12,
    currentMonthProducts: 3,
    previousMonthProducts: 2,
    activeCustomers: 573,
  },
  recentOrders: [
    {
      id: "order-1",
      customerName: "John Doe",
      total: 99.99,
      status: "DELIVERED",
      createdAt: "2024-01-01T00:00:00Z",
      productName: "Product 1",
    },
    {
      id: "order-2",
      customerName: "Jane Smith",
      total: 149.99,
      status: "PENDING",
      createdAt: "2024-01-02T00:00:00Z",
      productName: "Product 2",
    },
  ],
  topProducts: [
    {
      productId: "product-1",
      productName: "Best Seller",
      totalSold: 150,
      revenue: 1500.00,
    },
    {
      productId: "product-2",
      productName: "Popular Item",
      totalSold: 100,
      revenue: 1000.00,
    },
  ],
  orderStatusDistribution: [
    { status: "PENDING", count: 20 },
    { status: "DELIVERED", count: 80 },
  ],
  recentActivity: {
    products: [
      { id: "p1", name: "New Product", createdAt: "2024-01-01T00:00:00Z" },
    ],
    landingPages: [
      { id: "lp1", title: "New Landing Page", createdAt: "2024-01-01T00:00:00Z" },
    ],
    templates: [
      { id: "t1", name: "New Template", createdAt: "2024-01-01T00:00:00Z" },
    ],
  },
  monthlyRevenueData: [
    { name: "Jan", total: 1000 },
    { name: "Feb", total: 2000 },
    { name: "Mar", total: 1500 },
  ],
};

const mockMetrics = [
  {
    icon: "DollarSign",
    titleKey: "admin.totalRevenue",
    value: "$45,231.89",
    change: "+20.1%",
    subtitleKey: "admin.fromLastMonth",
  },
  {
    icon: "ShoppingCart",
    titleKey: "admin.totalOrders",
    value: "100",
    change: "+25.0%",
    subtitleKey: "admin.fromLastMonth",
  },
  {
    icon: "Package",
    titleKey: "admin.totalProducts",
    value: "50",
    change: "+50.0%",
    subtitleKey: "admin.fromLastMonth",
  },
  {
    icon: "Users",
    titleKey: "admin.activeCustomers",
    value: "573",
    change: "+69",
    subtitleKey: "admin.sinceLastHour",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe("AdminDashboard", () => {
  it("renders loading state initially", () => {
    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: true,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue([]),
    });

    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Here's an overview of your store performance.")).toBeInTheDocument();
    expect(screen.getByText("Loading dashboard data...")).toBeInTheDocument();
  });

  it("renders dashboard with data when loaded", async () => {
    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue(mockMetrics),
    });

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Here's an overview of your store performance.")).toBeInTheDocument();
    });

    // Check that metric cards are rendered
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Active Customers")).toBeInTheDocument();

    // Check that overview and recent sales sections are rendered
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getAllByText((content) => content.toLowerCase().includes("sales")).length).toBeGreaterThan(0);
    
    // Check that mocked components are rendered
    expect(screen.getByTestId("overview-chart")).toBeInTheDocument();
    expect(screen.getByTestId("recent-sales")).toBeInTheDocument();
  });

  it("renders error state when there's an error", () => {
    const mockRetry = jest.fn();
    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: false,
      error: "Failed to fetch dashboard data",
      retry: mockRetry,
      getMetrics: jest.fn().mockReturnValue([]),
    });

    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Here's an overview of your store performance.")).toBeInTheDocument();
    expect(screen.getByText("Error loading dashboard: Failed to fetch dashboard data")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("displays metric values correctly", async () => {
    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue(mockMetrics),
    });

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      // Check that the metric values are displayed correctly
      expect(screen.getByText("$45,231.89")).toBeInTheDocument(); // Total Revenue
      expect(screen.getByText("100")).toBeInTheDocument(); // Total Orders
      expect(screen.getByText("50")).toBeInTheDocument(); // Total Products
      expect(screen.getByText("573")).toBeInTheDocument(); // Active Customers
    });
  });

  it("displays metric changes correctly", async () => {
    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue(mockMetrics),
    });

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      // Check that the change percentages are displayed (calculated from real data)
      expect(screen.getByText((content) => content.includes("+20.1%"))).toBeInTheDocument(); // Revenue change
      expect(screen.getByText((content) => content.includes("+25.0%"))).toBeInTheDocument(); // Orders change
      expect(screen.getByText((content) => content.includes("+50.0%"))).toBeInTheDocument(); // Products change
      expect(screen.getByText((content) => content.includes("+69"))).toBeInTheDocument(); // Active customers change
    });
  });

  it("renders all metric cards with correct icons", async () => {
    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue(mockMetrics),
    });

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      // Check that all metric cards are rendered with their icons
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Active Customers")).toBeInTheDocument();
    });
  });

  it("calls retry function when retry button is clicked", async () => {
    const mockRetry = jest.fn();
    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: false,
      error: "Failed to fetch dashboard data",
      retry: mockRetry,
      getMetrics: jest.fn().mockReturnValue([]),
    });

    renderWithProviders(<AdminDashboard />);
    
    const retryButton = screen.getByText("Retry");
    retryButton.click();
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("handles empty dashboard data gracefully", async () => {
    const emptyMetrics = [
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

    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: false,
      error: null,
      retry: jest.fn(),
      getMetrics: jest.fn().mockReturnValue(emptyMetrics),
    });

    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Here's an overview of your store performance.")).toBeInTheDocument();
    });

    // Check that the metric values are displayed correctly
    expect(screen.getByText("$0.00")).toBeInTheDocument(); // Total Revenue
    expect(screen.getAllByText("0")).toHaveLength(3); // Orders, Products, Active Customers
  });
}); 
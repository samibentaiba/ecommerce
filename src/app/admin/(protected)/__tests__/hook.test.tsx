import { renderHook, waitFor, act } from "@testing-library/react"
import { useDashboard } from "../hook"

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock data
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
  ],
  topProducts: [
    {
      productId: "product-1",
      productName: "Best Seller",
      totalSold: 150,
      revenue: 1500.00,
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
}

describe("useDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    mockFetch.mockReset()
  })

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      expect(result.current.dashboardData).toBeNull()
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.refreshData).toBe("function")
      expect(typeof result.current.retry).toBe("function")
      expect(typeof result.current.getMetrics).toBe("function")
      expect(typeof result.current.formatCurrency).toBe("function")
      expect(typeof result.current.calculatePercentageChange).toBe("function")
    })
  })

  describe("Data Fetching", () => {
    it("should fetch dashboard data successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toEqual(mockDashboardData)
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/dashboard")
    })

    it("should handle HTTP error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toBeNull()
      expect(result.current.error).toBe("HTTP error! status: 500")
    })

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toBeNull()
      expect(result.current.error).toBe("Network error")
    })

    it("should handle invalid data format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve("invalid data"),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toBeNull()
      expect(result.current.error).toBe("Invalid data format received")
    })

    it("should handle null data response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toBeNull()
      expect(result.current.error).toBe("Invalid data format received")
    })
  })

  describe("Utility Functions", () => {
    it("should format currency correctly", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      expect(result.current.formatCurrency(1234.56)).toBe("$1,234.56")
      expect(result.current.formatCurrency(0)).toBe("$0.00")
      expect(result.current.formatCurrency(1000000)).toBe("$1,000,000.00")
    })

    it("should calculate percentage change correctly", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      // Positive change
      expect(result.current.calculatePercentageChange(120, 100)).toBe("+20.0%")
      
      // Negative change
      expect(result.current.calculatePercentageChange(80, 100)).toBe("-20.0%")
      
      // No change
      expect(result.current.calculatePercentageChange(100, 100)).toBe("0.0%")
      
      // From zero to positive
      expect(result.current.calculatePercentageChange(50, 0)).toBe("+100%")
      
      // From zero to zero
      expect(result.current.calculatePercentageChange(0, 0)).toBe("0%")
    })
  })

  describe("Metrics Calculation", () => {
    it("should return default metrics when no data is available", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      const metrics = result.current.getMetrics()

      expect(metrics).toEqual([
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
      ])
    })

    it("should calculate metrics correctly with dashboard data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const metrics = result.current.getMetrics()

      expect(metrics).toEqual([
        {
          icon: "DollarSign",
          titleKey: "admin.totalRevenue",
          value: "$45,231.89",
          change: "+20.1%", // (12345.67 - 10280.56) / 10280.56 * 100
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "ShoppingCart",
          titleKey: "admin.totalOrders",
          value: "100",
          change: "+25.0%", // (15 - 12) / 12 * 100
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "Package",
          titleKey: "admin.totalProducts",
          value: "50",
          change: "+50.0%", // (3 - 2) / 2 * 100
          subtitleKey: "admin.fromLastMonth",
        },
        {
          icon: "Users",
          titleKey: "admin.activeCustomers",
          value: "573",
          change: "+68", // Math.floor(573 * 0.12)
          subtitleKey: "admin.sinceLastHour",
        },
      ])
    })

    it("should handle edge cases in metrics calculation", async () => {
      const edgeCaseData = {
        ...mockDashboardData,
        overview: {
          ...mockDashboardData.overview,
          monthlyRevenue: 0,
          previousMonthRevenue: 0,
          currentMonthOrders: 0,
          previousMonthOrders: 0,
          currentMonthProducts: 0,
          previousMonthProducts: 0,
          activeCustomers: 0,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(edgeCaseData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const metrics = result.current.getMetrics()

      expect(metrics[0].change).toBe("0%") // Revenue change
      expect(metrics[1].change).toBe("0%") // Orders change
      expect(metrics[2].change).toBe("0%") // Products change
      expect(metrics[3].change).toBe("+0") // Active customers change
    })
  })

  describe("Retry and Refresh", () => {
    it("should retry fetching data when retry is called with error", async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"))
      
      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("Network error")

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      await act(async () => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toEqual(mockDashboardData)
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it("should not retry when there is no error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockFetch.mock.calls.length

      await act(async () => {
        result.current.retry()
      })

      // Should not make additional fetch calls when there's no error
      expect(mockFetch).toHaveBeenCalledTimes(initialCallCount)
    })

    it("should refresh data when refreshData is called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newData = { ...mockDashboardData, overview: { ...mockDashboardData.overview, totalProducts: 75 } }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newData),
      } as Response)

      await act(async () => {
        result.current.refreshData()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.dashboardData).toEqual(newData)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe("Error Handling", () => {
    it("should handle non-Error exceptions", async () => {
      mockFetch.mockRejectedValueOnce("String error")

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("An error occurred")
    })

    it("should handle JSON parsing errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("JSON parse error")),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("JSON parse error")
    })
  })

  describe("Loading States", () => {
    it("should set loading to true when fetching starts", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useDashboard())

      expect(result.current.loading).toBe(true)
    })

    it("should set loading to false after successful fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it("should set loading to false after failed fetch", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useDashboard())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe("Hook Dependencies", () => {
    it("should call fetchDashboardData on mount", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      renderHook(() => useDashboard())

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/dashboard")
    })

    it("should not create new function references on every render", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response)

      const { result, rerender } = renderHook(() => useDashboard())

      const initialRefreshData = result.current.refreshData
      const initialRetry = result.current.retry
      const initialGetMetrics = result.current.getMetrics
      const initialFormatCurrency = result.current.formatCurrency
      const initialCalculatePercentageChange = result.current.calculatePercentageChange

      rerender()

      expect(result.current.refreshData).toBe(initialRefreshData)
      expect(result.current.retry).toBe(initialRetry)
      expect(result.current.getMetrics).toBe(initialGetMetrics)
      expect(result.current.formatCurrency).toBe(initialFormatCurrency)
      expect(result.current.calculatePercentageChange).toBe(initialCalculatePercentageChange)
    })
  })
}) 
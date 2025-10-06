"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Radio, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Download,
  Filter,
  Calendar,
  MapPin,
  Target,
  Zap,
  Star,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Globe,
  UserCheck,
  Clock,
  Bell,
  Plus,
  Upload,
  History,
  Settings
} from "lucide-react"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart"
import CreateShowDialog from "@/components/create-show-dialog"
import ImportCSVDialog from "@/components/import-csv-dialog"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Pie,
  Cell
} from "recharts"

// Types based on actual backend data structure
type LedgerItem = {
  show_name: string
  customer: string
  invoice_date: string | null
  invoice_description: string
  invoice_amount: number | null
  evergreen_percentage: number | null
  partner_percentage: number | null
  evergreen_compensation: number | null
  partner_compensation: number | null
  effective_payment_received: number | null
  outstanding_balance: number | null
  partner_comp_waiting: number | null
}

type PartnerPayout = {
  bill_number: string | null
  bill_date: string
  partner_name: string
  bill_amount: number | null
  payment_id: string | null
  date_of_payment: string | null
  effective_billed_amount_paid: number | null
  billed_amount_outstanding: number | null
  show_name: string
}

type Show = {
  id: string
  title: string | null
  show_type: string | null
  relationship_level: string | null
  is_rate_card: boolean
  media_type: string | null
  revenue_2024: number | null
  latest_cpm_usd: number | null
  minimum_guarantee: number | null
  genre_name: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  evergreen: {
    label: "Evergreen Share",
  },
  count: {
    label: "Count",
  },
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function EnhancedDashboard() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
  const [shows, setShows] = useState<Show[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [showFilters, setShowFilters] = useState(false)
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState({
    showType: '',
    relationship: '',
    rate_card: '',
    format: ''
  })
  const [isCreateShowDialogOpen, setIsCreateShowDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.role === "partner") {
      router.push("/revenue-ledger")
    } else if (user?.role === "internal_show_access") {
      router.push("/shows-management")
    }
  }, [user, router])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!token) {
        setLedger([])
        setPayouts([])
        setShows([])
        return
      }
      setFetching(true)
      setError(null)
      try {
        const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        const base = API_URL?.replace(/\/$/, "") || ""
        const [ledgerRes, payoutRes, showsRes] = await Promise.all([
          fetch(`${base}/ledger`, { headers }),
          fetch(`${base}/partner_payouts`, { headers }),
          fetch(`${base}/podcasts`, { headers }),
        ])
        if (!ledgerRes.ok) throw new Error(await readErr(ledgerRes, "Ledger request failed"))
        if (!payoutRes.ok) throw new Error(await readErr(payoutRes, "Partner payouts request failed"))
        if (!showsRes.ok) throw new Error(await readErr(showsRes, "Shows request failed"))
        const ledgerJson: LedgerItem[] = await ledgerRes.json()
        const payoutsJson: PartnerPayout[] = await payoutRes.json()
        const showsJson: Show[] = await showsRes.json()
        if (!isMounted) return


        setLedger(Array.isArray(ledgerJson) ? ledgerJson : [])
        setPayouts(Array.isArray(payoutsJson) ? payoutsJson : [])
        setShows(Array.isArray(showsJson) ? showsJson : [])

        // Generate real revenue trend data from ledger
        generateRevenueTrendData(ledgerJson, selectedTimeRange)

        // Generate real activity feed from ledger and payouts
        generateActivityFeed(ledgerJson, payoutsJson)
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || "Failed to load dashboard summary")
      } finally {
        if (isMounted) setFetching(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [token])

  // Regenerate revenue trend data when time range changes
  useEffect(() => {
    if (ledger.length > 0) {
      generateRevenueTrendData(ledger, selectedTimeRange)
    }
  }, [selectedTimeRange, ledger])

  // Generate real revenue trend data from ledger
  const generateRevenueTrendData = (ledgerData: LedgerItem[], timeRange: string) => {
    const monthlyData: { [key: string]: { revenue: number; evergreen: number } } = {}
    const now = new Date()
    
    // Filter data based on time range
    const filteredData = ledgerData.filter(item => {
      if (!item.invoice_date) return false
      const itemDate = new Date(item.invoice_date)
      
      switch (timeRange) {
        case '7d':
          return itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d':
          return itemDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case '90d':
          return itemDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        case '1y':
          return itemDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        default:
          return true
      }
    })
    
    filteredData.forEach(item => {
      if (item.invoice_date) {
        const date = new Date(item.invoice_date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, evergreen: 0 }
        }
        
        monthlyData[monthKey].revenue += num(item.effective_payment_received)
        monthlyData[monthKey].evergreen += num(item.evergreen_compensation)
      }
    })
    
    // Convert to chart format and sort by date
    const trendData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: data.revenue,
        evergreen: data.evergreen
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6) // Last 6 months
    
    // If no data, show empty chart
    if (trendData.length === 0) {
      setRevenueTrendData([
        { month: 'Jan', revenue: 0, evergreen: 0 },
        { month: 'Feb', revenue: 0, evergreen: 0 },
        { month: 'Mar', revenue: 0, evergreen: 0 },
        { month: 'Apr', revenue: 0, evergreen: 0 },
        { month: 'May', revenue: 0, evergreen: 0 },
        { month: 'Jun', revenue: 0, evergreen: 0 },
      ])
    } else {
      setRevenueTrendData(trendData)
    }
  }

  // Generate real activity feed from ledger and payouts
  const generateActivityFeed = (ledgerData: LedgerItem[], payoutsData: PartnerPayout[]) => {
    const activities: any[] = []

    // Add recent ledger entries
    ledgerData
      .filter(item => item.invoice_date)
      .sort((a, b) => new Date(b.invoice_date!).getTime() - new Date(a.invoice_date!).getTime())
      .slice(0, 5)
      .forEach(item => {
        activities.push({
          action: "Revenue recorded",
          show: item.show_name || "Unknown Show",
          amount: formatCurrency(num(item.effective_payment_received)),
          time: getTimeAgo(new Date(item.invoice_date!)),
          icon: DollarSign,
          date: new Date(item.invoice_date!)
        })
      })

    // Add recent payouts
    payoutsData
      .filter(payout => payout.effective_billed_amount_paid)
      .slice(0, 3)
      .forEach(payout => {
        activities.push({
          action: "Payment processed",
          show: payout.show_name || "Partner Payment",
          amount: formatCurrency(num(payout.effective_billed_amount_paid)),
          time: getTimeAgo(new Date(payout.date_of_payment || payout.bill_date || new Date())),
          icon: CreditCard,
          date: new Date(payout.date_of_payment || payout.bill_date || new Date())
        })
      })

    // Sort by date and take most recent
    activities.sort((a, b) => b.date.getTime() - a.date.getTime())
    setActivityFeed(activities.slice(0, 8))
  }

  // Helper function to get time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  }

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        summary: {
          totalShows: shows.length,
          totalNetRevenue: summary.totalNetRevenue,
          averageCPM: analytics.averageCPM,
          rateCardShows: analytics.rateCardShows,
        },
        shows: shows.slice(0, 10),
        revenueTrend: revenueTrendData,
        activityFeed: activityFeed,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-show':
        setIsCreateShowDialogOpen(true)
        break
      case 'import-shows':
        setIsImportDialogOpen(true)
        break
      case 'split-history':
        router.push('/split-history')
        break
      case 'user-management':
        router.push('/user-management')
        break
      case 'record-revenue':
        router.push('/revenue-ledger')
        break
      case 'contact-partner':
        // Could open a modal or redirect to partner management
        console.log('Contact partner functionality')
        break
      case 'export-data':
        handleExport()
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  // Show creation handler
  const createShow = async (showData: any) => {
    try {
      const newShow = await apiClient.createPodcast(showData)
      if (newShow) {
        toast.success("Show created successfully!")
        setIsCreateShowDialogOpen(false)
        // Redirect to shows management page
        router.push('/shows-management')
      }
    } catch (error) {
      toast.error("Failed to create show")
      console.error('Error creating show:', error)
    }
    return null
  }

  // Show update handler
  const updateShow = async (showId: string, showData: any) => {
    try {
      const updatedShow = await apiClient.updatePodcast(showId, showData)
      if (updatedShow) {
        toast.success("Show updated successfully!")
        setIsCreateShowDialogOpen(false)
        // Refresh shows data
        window.location.reload()
      }
    } catch (error) {
      toast.error("Failed to update show")
      console.error('Error updating show:', error)
    }
    return null
  }

  // Import completion handler
  const handleImportComplete = (result: { success: boolean, message: string, errors?: string[] }) => {
    if (result.success) {
      toast.success(result.message)
      setIsImportDialogOpen(false)
      // Redirect to shows management page
      router.push('/shows-management')
    } else {
      toast.error(result.message)
    }
  }

  const summary = useMemo(() => {
    const totalNetRevenue = ledger.reduce((s, i) => s + num(i.effective_payment_received), 0)
    const totalEvergreenShare = ledger.reduce((s, i) => s + num(i.evergreen_compensation), 0)
    const seen = new Set<string>()
    const totalPaymentsMade = payouts.reduce((s, i) => {
      if (i.payment_id && !seen.has(i.payment_id)) {
        seen.add(i.payment_id)
        return s + num(i.effective_billed_amount_paid)
      }
      return s
    }, 0)
    return { totalNetRevenue, totalEvergreenShare, totalPaymentsMade }
  }, [ledger, payouts])

  // Enhanced analytics calculations with filtering
  const analytics = useMemo(() => {
    // Apply filters to shows
    const filteredShows = shows.filter(show => {
      if (filters.showType && show.show_type !== filters.showType) return false
      if (filters.relationship && show.relationship_level !== filters.relationship) return false
      if (filters.rate_card === 'true' && !show.is_rate_card) return false
      if (filters.rate_card === 'false' && show.is_rate_card) return false
      if (filters.format && show.media_type !== filters.format) return false
      return true
    })

    const totalShows = filteredShows.length
    const activeShows = filteredShows.filter(show => show.revenue_2024 && show.revenue_2024 > 0).length
    const rateCardShows = filteredShows.filter(show => show.is_rate_card).length
    const originalShows = filteredShows.filter(show => show.show_type === 'Original').length
    
    // Calculate average CPM
    const showsWithCPM = filteredShows.filter(show => show.latest_cpm_usd && show.latest_cpm_usd > 0)
    const averageCPM = showsWithCPM.length > 0 
      ? showsWithCPM.reduce((sum, show) => sum + num(show.latest_cpm_usd), 0) / showsWithCPM.length 
      : 0

    // Show type distribution
    const showTypeDistribution = filteredShows.reduce((acc, show) => {
      const type = show.show_type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top 3 genres
    const genreCount = filteredShows.reduce((acc, show) => {
      const genre = show.genre_name || 'Unknown'
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count }))

    // Top performers (shows with highest revenue)
    const topPerformers = [...filteredShows]
      .filter(show => show.revenue_2024 && show.revenue_2024 > 0)
      .sort((a, b) => num(b.revenue_2024) - num(a.revenue_2024))
      .slice(0, 5)

    // Shows needing attention (below minimum guarantee)
    const needsAttention = filteredShows.filter(show => {
      const revenue = num(show.revenue_2024)
      const guarantee = num(show.minimum_guarantee)
      return guarantee > 0 && revenue < guarantee * 0.8 // 80% of guarantee
    })

    // Show type revenue distribution
    const showTypeRevenue = filteredShows.reduce((acc, show) => {
      const type = show.show_type || 'Unknown'
      const revenue = num(show.revenue_2024)
      if (!acc[type]) acc[type] = 0
      acc[type] += revenue
      return acc
    }, {} as Record<string, number>)

    const showTypeRevenueArray = Object.entries(showTypeRevenue).map(([show_type, revenue]) => ({
      show_type,
      revenue
    }))

    return {
      totalShows,
      activeShows,
      rateCardShows,
      originalShows,
      averageCPM,
      showTypeDistribution,
      topGenres,
      topPerformers,
      needsAttention,
      showTypeRevenue: showTypeRevenueArray
    }
  }, [shows, filters])

  // Calculate payments summary
  const paymentsSummary = useMemo(() => {
    const pendingPayments = payouts.filter(payout => 
      payout.billed_amount_outstanding && payout.billed_amount_outstanding > 0
    )
    
    const totalPendingAmount = pendingPayments.reduce((sum, payout) => 
      sum + num(payout.billed_amount_outstanding), 0
    )
    
    const totalRevenueEntries = ledger.length
    const totalPaymentEntries = payouts.length
    
    return {
      pendingPaymentsCount: pendingPayments.length,
      pendingPaymentsAmount: totalPendingAmount,
      totalRevenueEntries,
      totalPaymentEntries
    }
  }, [payouts, ledger])

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error loading dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Comprehensive view of your show network performance
        </p>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="evergreen-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Shows</CardTitle>
            <Radio className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{analytics.totalShows}</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{user?.role === "admin" ? "Network shows" : "Network shows"}</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Total Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatCurrency(summary.totalNetRevenue)}</div>
            <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70">Across all shows</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Evergreen Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEvergreenShare)}</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              {summary.totalNetRevenue > 0 ? ((summary.totalEvergreenShare / summary.totalNetRevenue) * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalPaymentsMade)}</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Sum of unique partner payments</p>
          </CardContent>
        </Card>
      </div>


      {/* Top Row: Recent Activity, Network Health, Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity Feed */}
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.length > 0 ? (
                activityFeed.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <activity.icon className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.show}</p>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-xs font-medium text-emerald-600">{activity.amount}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shows Overview */}
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-600" />
              Shows
            </CardTitle>
            <CardDescription>Network shows breakdown and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Shows Stats - Single Row */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="text-lg font-bold text-emerald-600">{analytics.totalShows}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">Total</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-600">{analytics.activeShows}</div>
                  <div className="text-xs text-green-700 dark:text-green-300">Active</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-lg font-bold text-red-600">{analytics.totalShows - analytics.activeShows}</div>
                  <div className="text-xs text-red-700 dark:text-red-300">Inactive</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="text-lg font-bold text-teal-600">{analytics.rateCardShows}</div>
                  <div className="text-xs text-teal-700 dark:text-teal-300">Rate Card</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-bold text-blue-600">{analytics.originalShows}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Original</div>
                </div>
              </div>

              {/* Show Type - Single Row with Stretch */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Show Types</div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(analytics.showTypeDistribution).slice(0, 3).map(([type, count], index) => {
                    const getColorClasses = (index: number) => {
                      switch (index) {
                        case 0:
                          return 'text-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800'
                        case 1:
                          return 'text-center p-2 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800'
                        case 2:
                          return 'text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'
                        default:
                          return 'text-center p-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800'
                      }
                    }
                    
                    const getTextClasses = (index: number) => {
                      switch (index) {
                        case 0:
                          return 'text-emerald-700 dark:text-emerald-300'
                        case 1:
                          return 'text-cyan-700 dark:text-cyan-300'
                        case 2:
                          return 'text-blue-700 dark:text-blue-300'
                        default:
                          return 'text-slate-700 dark:text-slate-300'
                      }
                    }
                    
                    return (
                      <div key={type} className={getColorClasses(index)}>
                        <div className={`text-sm font-bold ${getTextClasses(index)}`}>{count}</div>
                        <div className={`text-xs ${getTextClasses(index)} truncate`} title={type}>{type}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top 3 Genres - Single Row */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Top Genres</div>
                <div className="grid grid-cols-3 gap-2">
                  {analytics.topGenres.map(({ genre, count }, index) => {
                    const getColorClasses = (index: number) => {
                      switch (index) {
                        case 0:
                          return 'text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'
                        case 1:
                          return 'text-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800'
                        case 2:
                          return 'text-center p-2 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800'
                        default:
                          return 'text-center p-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800'
                      }
                    }
                    
                    const getTextClasses = (index: number) => {
                      switch (index) {
                        case 0:
                          return 'text-purple-700 dark:text-purple-300'
                        case 1:
                          return 'text-indigo-700 dark:text-indigo-300'
                        case 2:
                          return 'text-pink-700 dark:text-pink-300'
                        default:
                          return 'text-slate-700 dark:text-slate-300'
                      }
                    }
                    
                    return (
                      <div key={genre} className={getColorClasses(index)}>
                        <div className={`text-sm font-bold ${getTextClasses(index)}`}>{count}</div>
                        <div className={`text-xs ${getTextClasses(index)} truncate`} title={genre}>{genre}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Payments
            </CardTitle>
            <CardDescription>Payment status and details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
                <div>
                  <p className="text-xs font-medium">Pending Payments</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(paymentsSummary.pendingPaymentsAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-orange-600">{paymentsSummary.pendingPaymentsCount}</p>
                  <p className="text-xs text-muted-foreground">bills</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                <div>
                  <p className="text-xs font-medium">Total Revenue Entries</p>
                  <p className="text-xs text-muted-foreground">From ledger</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-blue-600">{paymentsSummary.totalRevenueEntries}</p>
                  <p className="text-xs text-muted-foreground">entries</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <div>
                  <p className="text-xs font-medium">Total Payment Entries</p>
                  <p className="text-xs text-muted-foreground">From payouts</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-green-600">{paymentsSummary.totalPaymentEntries}</p>
                  <p className="text-xs text-muted-foreground">entries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Admin Only */}
      {user?.role === "admin" && (
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30"
                onClick={() => handleQuickAction('add-show')}
              >
                <Plus className="h-6 w-6 text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300">Add Show</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30"
                onClick={() => handleQuickAction('import-shows')}
              >
                <Upload className="h-6 w-6 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">Import Shows</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30"
                onClick={() => handleQuickAction('split-history')}
              >
                <History className="h-6 w-6 text-purple-600" />
                <span className="text-sm text-purple-700 dark:text-purple-300">Split History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30"
                onClick={() => handleQuickAction('user-management')}
              >
                <Settings className="h-6 w-6 text-indigo-600" />
                <span className="text-sm text-indigo-700 dark:text-indigo-300">User Management</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateShowDialog
        open={isCreateShowDialogOpen}
        onOpenChange={setIsCreateShowDialogOpen}
        editingShow={null}
        onShowUpdated={() => {}}
        createShow={createShow}
        updateShow={updateShow}
        existingShows={shows}
      />
      <ImportCSVDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}

function num(v: any): number {
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

async function readErr(res: Response, fallback: string): Promise<string> {
  try {
    return await res.text()
  } catch {
    return fallback
  }
}
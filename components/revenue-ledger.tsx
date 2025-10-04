"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader2,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
  RotateCcw,
  Download,
  Radio,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type SortDirection = "asc" | "desc" | null
type SortConfig = { key: string; direction: SortDirection }

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

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 10

export default function RevenueLedger() {
  const { token, isLoading } = useAuth()

  const [selectedShow, setSelectedShow] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false)

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isSlideOutOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSlideOutOpen])

  // Handle escape key to close filter panel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSlideOutOpen) {
        setIsSlideOutOpen(false)
      }
    }

    if (isSlideOutOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isSlideOutOpen])

  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
  // Removed static stats state - now calculated from filtered data
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [revenueSortConfig, setRevenueSortConfig] = useState<SortConfig>({ key: "", direction: null })
  const [paymentsSortConfig, setPaymentsSortConfig] = useState<SortConfig>({ key: "", direction: null })

  // Pagination
  const [revenuePage, setRevenuePage] = useState<number>(1)
  const [paymentsPage, setPaymentsPage] = useState<number>(1)
  const [revenuePageInput, setRevenuePageInput] = useState<string>("1")
  const [paymentsPageInput, setPaymentsPageInput] = useState<string>("1")

  const handleClearFilters = () => {
    setSelectedShow("all")
    setDateFrom("")
    setDateTo("")
  }

  // unified fetch for initial load + refresh
  const fetchData = async () => {
    if (!token) {
      setLedger([])
      setPayouts([])
      return
    }
    setFetching(true)
    setError(null)
    try {
      const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      const base = API_URL?.replace(/\/$/, "") || ""
      const [ledgerRes, payoutRes] = await Promise.all([
        fetch(`${base}/ledger`, { headers }),
        fetch(`${base}/partner_payouts`, { headers }),
      ])
      if (!ledgerRes.ok) throw new Error(await readErr(ledgerRes, "Ledger request failed"))
      if (!payoutRes.ok) throw new Error(await readErr(payoutRes, "Partner payouts request failed"))

      const ledgerJson: LedgerItem[] = await ledgerRes.json()
      const payoutsJson: PartnerPayout[] = await payoutRes.json()
      
      
      setLedger(Array.isArray(ledgerJson) ? ledgerJson : [])
      setPayouts(Array.isArray(payoutsJson) ? payoutsJson : [])
    } catch (e: any) {
      setError(e?.message || "Failed to load ledger data")
    } finally {
      setFetching(false)
    }
  }

  const onRefresh = async () => {
    await fetchData()
  }

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      setLedger([])
      setPayouts([])
      return
    }
    fetchData()
  }, [isLoading, token])

  const availableShows = useMemo(() => {
    const set = new Set<string>()
    for (const r of ledger) if (r.show_name) set.add(r.show_name)
    for (const p of payouts) if (p.show_name) set.add(p.show_name)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [ledger, payouts])

  const filteredRevenueData = useMemo(() => {
    let filtered = ledger
    if (selectedShow !== "all") filtered = filtered.filter((i) => i.show_name === selectedShow)
    if (dateFrom || dateTo) {
      filtered = filtered.filter((i) => {
        const d = toDate(i.invoice_date)
        const from = dateFrom ? toDate(dateFrom) : new Date("1900-01-01")
        const to = dateTo ? toDate(dateTo, true) : new Date("2100-12-31")
        return d >= from && d <= to
      })
    }
    return filtered
  }, [ledger, selectedShow, dateFrom, dateTo])

  const filteredPartnerPayments = useMemo(() => {
    let filtered = payouts
    if (selectedShow !== "all") filtered = filtered.filter((i) => i.show_name === selectedShow)
    if (dateFrom || dateTo) {
      filtered = filtered.filter((i) => {
        const bill = toDate(i.bill_date)
        const pay = i.date_of_payment ? toDate(i.date_of_payment) : null
        const from = dateFrom ? toDate(dateFrom) : new Date("1900-01-01")
        const to = dateTo ? toDate(dateTo, true) : new Date("2100-12-31")
        const billIn = bill >= from && bill <= to
        const payIn = pay ? pay >= from && pay <= to : false
        return billIn || payIn
      })
    }
    return filtered
  }, [payouts, selectedShow, dateFrom, dateTo])

  useEffect(() => setRevenuePage(1), [selectedShow, dateFrom, dateTo, ledger])
  useEffect(() => setPaymentsPage(1), [selectedShow, dateFrom, dateTo, payouts])

  const sortData = <T extends Record<string, any>>(data: T[], cfg: SortConfig): T[] => {
    if (!cfg.direction || !cfg.key) return data
    return [...data].sort((a, b) => {
      const av = a[cfg.key]
      const bv = b[cfg.key]
      if (av == null && bv == null) return 0
      if (av == null) return cfg.direction === "asc" ? -1 : 1
      if (bv == null) return cfg.direction === "asc" ? 1 : -1

      const isDate =
        typeof av === "string" && /^\d{4}-\d{2}-\d{2}/.test(av) &&
        typeof bv === "string" && /^\d{4}-\d{2}-\d{2}/.test(bv)

      let cmp = 0
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv
      else if (isDate) cmp = toDate(av).getTime() - toDate(bv).getTime()
      else if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv)
      else cmp = String(av).localeCompare(String(bv))
      return cfg.direction === "asc" ? cmp : -cmp
    })
  }

  const handleSort = (key: string, isRevenue: boolean) => {
    const cfg = isRevenue ? revenueSortConfig : paymentsSortConfig
    const setCfg = isRevenue ? setRevenueSortConfig : setPaymentsSortConfig
    let dir: SortDirection = "asc"
    if (cfg.key === key) dir = cfg.direction === "asc" ? "desc" : cfg.direction === "desc" ? null : "asc"
    setCfg({ key: dir ? key : "", direction: dir })
  }

  const sortedRevenueData = useMemo(() => sortData(filteredRevenueData, revenueSortConfig), [filteredRevenueData, revenueSortConfig])
  const sortedPartnerPayments = useMemo(() => sortData(filteredPartnerPayments, paymentsSortConfig), [filteredPartnerPayments, paymentsSortConfig])

  useEffect(() => setRevenuePage(1), [revenueSortConfig])
  useEffect(() => setPaymentsPage(1), [paymentsSortConfig])

  const revenueTotal = sortedRevenueData.length
  const revenueTotalPages = Math.max(1, Math.ceil(revenueTotal / PAGE_SIZE))
  const revenuePageSafe = Math.min(Math.max(1, revenuePage), revenueTotalPages)
  const revenueSlice = useMemo(() => {
    const start = (revenuePageSafe - 1) * PAGE_SIZE
    return sortedRevenueData.slice(start, start + PAGE_SIZE)
  }, [sortedRevenueData, revenuePageSafe])

  const paymentsTotal = sortedPartnerPayments.length
  const paymentsTotalPages = Math.max(1, Math.ceil(paymentsTotal / PAGE_SIZE))
  const paymentsPageSafe = Math.min(Math.max(1, paymentsPage), paymentsTotalPages)
  const paymentsSlice = useMemo(() => {
    const start = (paymentsPageSafe - 1) * PAGE_SIZE
    return sortedPartnerPayments.slice(start, start + PAGE_SIZE)
  }, [sortedPartnerPayments, paymentsPageSafe])

  useEffect(() => setRevenuePageInput(String(revenuePageSafe)), [revenuePageSafe])
  useEffect(() => setPaymentsPageInput(String(paymentsPageSafe)), [paymentsPageSafe])

  const summaryData = useMemo(() => {
    const totalNetRevenue = filteredRevenueData.reduce((s, i) => s + num(i.effective_payment_received), 0)
    const totalPartnerCompensation = filteredRevenueData.reduce((s, i) => s + num(i.partner_compensation), 0)
    const seen = new Set<string>()
    const totalPaymentsMade = filteredPartnerPayments.reduce((s, i) => {
      if (i.payment_id && !seen.has(i.payment_id)) {
        seen.add(i.payment_id)
        return s + num(i.effective_billed_amount_paid)
      }
      return s
    }, 0)
    return { totalNetRevenue, totalPartnerCompensation, totalPaymentsMade }
  }, [filteredRevenueData, filteredPartnerPayments])

  // Calculate totals for revenue table
  const revenueTotals = useMemo(() => {
    return {
      invoice_amount: filteredRevenueData.reduce((sum, item) => sum + num(item.invoice_amount), 0),
      evergreen_compensation: filteredRevenueData.reduce((sum, item) => sum + num(item.evergreen_compensation), 0),
      partner_compensation: filteredRevenueData.reduce((sum, item) => sum + num(item.partner_compensation), 0),
      effective_payment_received: filteredRevenueData.reduce((sum, item) => sum + num(item.effective_payment_received), 0),
      outstanding_balance: filteredRevenueData.reduce((sum, item) => sum + num(item.outstanding_balance), 0),
      partner_comp_waiting: filteredRevenueData.reduce((sum, item) => sum + num(item.partner_comp_waiting), 0),
    }
  }, [filteredRevenueData])

  // Calculate totals for partner payments table
  const paymentsTotals = useMemo(() => {
    return {
      bill_amount: filteredPartnerPayments.reduce((sum, item) => sum + num(item.bill_amount), 0),
      effective_billed_amount_paid: filteredPartnerPayments.reduce((sum, item) => sum + num(item.effective_billed_amount_paid), 0),
      billed_amount_outstanding: filteredPartnerPayments.reduce((sum, item) => sum + num(item.billed_amount_outstanding), 0),
    }
  }, [filteredPartnerPayments])

  // Calculate filtered stats based on the same logic as the database view
  const filteredStats = useMemo(() => {
    // total_effective_billed_paid: sum of effective_billed_amount_paid from filtered partner payouts
    const total_effective_billed_paid = filteredPartnerPayments.reduce((sum, payout) => 
      sum + num(payout.effective_billed_amount_paid), 0
    )
    
    // total_billed_outstanding: sum of billed_amount_outstanding from filtered partner payouts
    const total_billed_outstanding = filteredPartnerPayments.reduce((sum, payout) => 
      sum + num(payout.billed_amount_outstanding), 0
    )
    
    // total_comp_waiting: sum of partner_comp_waiting from filtered revenue ledger
    const total_comp_waiting = filteredRevenueData.reduce((sum, item) => 
      sum + num(item.partner_comp_waiting), 0
    )
    
    
    return {
      total_effective_billed_paid,
      total_billed_outstanding,
      total_comp_waiting
    }
  }, [filteredRevenueData, filteredPartnerPayments])

  const formatCurrency = (v: number | null | undefined) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(v))
  const formatDate = (s: string | null) => (s ? toDate(s).toLocaleDateString() : "-")
  const formatPct = (f: number | null | undefined) => (f == null ? "-" : `${Math.round(num(f) * 100)}%`)
  
  const formatPaymentId = (paymentId: string | null) => {
    if (!paymentId) return "-"
    try {
      const parsed = JSON.parse(paymentId)
      if (parsed.TxnId && Array.isArray(parsed.TxnId)) {
        return parsed.TxnId.join(", ")
      }
      return paymentId
    } catch {
      return paymentId
    }
  }
  
  const formatPaymentDates = (dates: string | null) => {
    if (!dates) return "-"
    try {
      const parsed = JSON.parse(dates)
      if (Array.isArray(parsed)) {
        return parsed.map(date => toDate(date).toLocaleDateString()).join(", ")
      }
      return toDate(dates).toLocaleDateString()
    } catch {
      return toDate(dates).toLocaleDateString()
    }
  }
  const renderSortIcon = (key: string, isRevenue: boolean) => {
    const cfg = isRevenue ? revenueSortConfig : paymentsSortConfig
    if (cfg.key !== key || !cfg.direction) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
    return cfg.direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4 text-primary" />
    )
  }
  const rangeLabel = (page: number, total: number) => {
    if (total === 0) return "0–0 of 0"
    const start = (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, total)
    return `${start}–${end} of ${total}`
  }
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val || 1))
  const tryJumpRevenue = () => setRevenuePage(clamp(parseInt(revenuePageInput, 10), 1, revenueTotalPages))
  const tryJumpPayments = () => setPaymentsPage(clamp(parseInt(paymentsPageInput, 10), 1, paymentsTotalPages))

  // Export to Excel with two sheets
  const exportToExcel = async () => {
    const XLSX = await import("xlsx")

    const revenueRows = sortedRevenueData.map((i) => ({
      "Show Name": i.show_name,
      Customer: i.customer,
      Description: i.invoice_description,
      "Invoice Date": i.invoice_date ? toDate(i.invoice_date).toISOString().slice(0, 10) : "",
      "Invoice Amount": num(i.invoice_amount),
      "% Evergreen": i.evergreen_percentage != null ? num(i.evergreen_percentage) : null,
      "Evergreen Comp": num(i.evergreen_compensation),
      "% Partner": i.partner_percentage != null ? num(i.partner_percentage) : null,
      "Partner Comp": num(i.partner_compensation),
      "Effective Payment Received": num(i.effective_payment_received),
      "Outstanding Balance": num(i.outstanding_balance),
      "Partner Comp Waiting": num(i.partner_comp_waiting),
    }))

    const partnerRows = sortedPartnerPayments.map((i) => ({
      "Show Name": i.show_name,
      "Partner Name": i.partner_name,
      "Bill Number": i.bill_number || "",
      "Bill Date": i.bill_date ? toDate(i.bill_date).toISOString().slice(0, 10) : "",
      "Bill Amount": num(i.bill_amount),
      "Payment ID": formatPaymentId(i.payment_id),
      "Payment Date": formatPaymentDates(i.date_of_payment),
      "Effective Billed Amount Paid": num(i.effective_billed_amount_paid),
      "Billed Amount Outstanding": num(i.billed_amount_outstanding),
    }))

    const revenueSheet = XLSX.utils.json_to_sheet(revenueRows)
    const partnerSheet = XLSX.utils.json_to_sheet(partnerRows)

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, revenueSheet, "Revenue")
    XLSX.utils.book_append_sheet(wb, partnerSheet, "Partner Payments")

    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const fname = `revenue_ledger_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}.xlsx`

    XLSX.writeFile(wb, fname)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking authentication…
      </div>
    )
  }
  if (!token) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Not authenticated
            </CardTitle>
            <CardDescription>Please log in to view the Revenue Ledger.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Revenue Ledger
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">Track revenue transactions and partner payments</p>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Refresh and Export - Above stats */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onRefresh} disabled={fetching} className="flex-1">
              {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button className="evergreen-button flex-1" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Mobile Stats Cards - Above pills */}
          <div className="space-y-3">
            <Card className="evergreen-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-3">
                <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-tight">Completed Partner Payments</CardTitle>
                <DollarSign className="h-3 w-3 text-emerald-600 flex-shrink-0 ml-2" />
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(filteredStats.total_effective_billed_paid)}</div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Billed and Paid</p>
              </CardContent>
            </Card>

            <Card className="evergreen-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-3">
                <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300 leading-tight">Partner Payments to be included Next Payout</CardTitle>
                <TrendingUp className="h-3 w-3 text-blue-600 flex-shrink-0 ml-2" />
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(filteredStats.total_billed_outstanding)}</div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Revenue Received and awaiting Partner Payment</p>
              </CardContent>
            </Card>

            <Card className="evergreen-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-3">
                <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300 leading-tight">Pending Invoices from Customers</CardTitle>
                <CreditCard className="h-3 w-3 text-green-600 flex-shrink-0 ml-2" />
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="text-lg font-bold text-green-600">{formatCurrency(filteredStats.total_comp_waiting)}</div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">Partner share awaiting for Invoice Payment from Customer</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Pills - Full width on mobile */}
          <div className="flex items-center gap-2 w-full">
            <Badge className="flex-1 px-3 py-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-300 text-center justify-center">
              {filteredRevenueData.length} Revenue Entries
            </Badge>
            <Badge className="flex-1 px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 text-center justify-center">
              {filteredPartnerPayments.length} Partner Payments
            </Badge>
          </div>

          {/* Filters and Clear Filters - Same line on mobile, 50/50 when both visible */}
          <div className="flex items-center">
            {/* Filter Button - 50% when clear filters is visible, 100% when not */}
            <Button 
              variant="outline" 
              onClick={() => setIsSlideOutOpen(true)}
              className={`flex items-center gap-2 ${(selectedShow !== "all" || dateFrom || dateTo) ? 'w-1/2 mr-2' : 'w-full'}`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            {/* Clear Filters Button - Only show when filters are applied, 50% width */}
            <div className={`transition-all duration-300 ease-in-out ${(selectedShow !== "all" || dateFrom || dateTo) ? 'w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 w-full"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-2">
          {/* Stats Pills */}
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-300">
              {filteredRevenueData.length} Revenue Entries
            </Badge>
            <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50 dark:hover:text-blue-300">
              {filteredPartnerPayments.length} Partner Payments
            </Badge>
          </div>

          {/* Filter Button */}
          <Button 
            variant="outline" 
            onClick={() => setIsSlideOutOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {/* Clear Filters Button - Only show when filters are applied */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${(selectedShow !== "all" || dateFrom || dateTo) ? 'max-w-36 opacity-100' : 'max-w-0 opacity-0 -ml-2'}`}>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          <Button variant="outline" onClick={onRefresh} disabled={fetching}>
            {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>

          <Button className="evergreen-button" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards - Desktop Only */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <Card className="evergreen-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Completed Partner Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(filteredStats.total_effective_billed_paid)}</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Billed and Paid</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Partner Payments to be included Next Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(filteredStats.total_billed_outstanding)}</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Revenue Received and awaiting Partner Payment</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Pending Invoices from Customers</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(filteredStats.total_comp_waiting)}</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Partner share awaiting for Invoice Payment from Customer</p>
          </CardContent>
        </Card>
      </div>


      {/* Loading / Error banners */}
      {fetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading Show Revenue and Partner Payments…
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Revenue Table */}
      <Card className={cn(fetching ? "opacity-60" : "")}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Show Revenue</CardTitle>
            <CardDescription className="text-sm sm:text-base">Transactions between Evergreen and Customers (Starting July 1, 2025)</CardDescription>
          </div>
          {/* Desktop Pagination */}
          <div className="hidden md:block">
            <PaginationControls
              page={revenuePageSafe}
              totalPages={revenueTotalPages}
              totalItems={revenueTotal}
              pageInput={revenuePageInput}
              setPage={setRevenuePage}
              setPageInput={setRevenuePageInput}
              onGo={tryJumpRevenue}
              rangeText={rangeLabel(revenuePageSafe, revenueTotal)}
            />
          </div>
        </CardHeader>
        
        {/* Mobile Pagination - Next line, centered */}
        <div className="md:hidden flex justify-center w-full px-6 pb-4">
          <PaginationControls
            page={revenuePageSafe}
            totalPages={revenueTotalPages}
            totalItems={revenueTotal}
            pageInput={revenuePageInput}
            setPage={setRevenuePage}
            setPageInput={setRevenuePageInput}
            onGo={tryJumpRevenue}
            rangeText={rangeLabel(revenuePageSafe, revenueTotal)}
            isMobile={true}
          />
        </div>

        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table className="table-fixed w-[1800px]">
              <colgroup>
                <col className="w-[200px]" />
                <col className="w-[150px]" />
                <col className="w-[100px]" />
                <col className="w-[130px]" />
                <col className="w-[100px]" />
                <col className="w-[120px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[150px]" />
                <col className="w-[120px]" />
                <col className="w-[500px]" />
              </colgroup>

              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("show_name", true)}>
                      Show Name {renderSortIcon("show_name", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("customer", true)}>
                      Customer {renderSortIcon("customer", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("invoice_date", true)} title="Invoice Date">
                      Date {renderSortIcon("invoice_date", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("invoice_amount", true)} title="Invoice Amount">
                      Amount {renderSortIcon("invoice_amount", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("evergreen_percentage", true)} title="Evergreen Percentage">
                      EG % {renderSortIcon("evergreen_percentage", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("evergreen_compensation", true)} title="Effective Evergreen Compensation">
                      EEC {renderSortIcon("evergreen_compensation", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("partner_percentage", true)}>
                      Partner % {renderSortIcon("partner_percentage", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("partner_compensation", true)} title="Effective Partner Compensation">
                      EPC {renderSortIcon("partner_compensation", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("effective_payment_received", true)} title="Effective Payment Received">
                      EPR {renderSortIcon("effective_payment_received", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("outstanding_balance", true)}>
                      Outstanding {renderSortIcon("outstanding_balance", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("partner_comp_waiting", true)} title="Partner Compensation Awaiting Customer Payment">
                      PCACP {renderSortIcon("partner_comp_waiting", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("invoice_description", true)}>
                      Description {renderSortIcon("invoice_description", true)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {revenueSlice.length > 0 ? (
                  <>
                    {revenueSlice.map((item, index) => (
                      <TableRow key={`${item.show_name}-${item.customer}-${item.invoice_date}-${index}`}>
                        <TableCell className="font-medium border-r px-4 py-3">{item.show_name}</TableCell>
                        <TableCell className="border-r px-4 py-3">{item.customer}</TableCell>
                        <TableCell className="border-r px-4 py-3">{formatDate(item.invoice_date)}</TableCell>
                        <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.invoice_amount)}</TableCell>
                        <TableCell className="text-right border-r px-4 py-3">{formatPct(item.evergreen_percentage)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 border-r px-4 py-3">{formatCurrency(item.evergreen_compensation)}</TableCell>
                        <TableCell className="text-right border-r px-4 py-3">{formatPct(item.partner_percentage)}</TableCell>
                        <TableCell className="border-r text-right font-mono text-blue-600 px-4 py-3">{formatCurrency(item.partner_compensation)}</TableCell>
                        <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3">{formatCurrency(item.effective_payment_received)}</TableCell>
                        <TableCell className="text-right font-mono text-orange-600 border-r px-4 py-3">{formatCurrency(item.outstanding_balance)}</TableCell>
                        <TableCell className="text-right font-mono text-purple-600 border-r px-4 py-3">{formatCurrency(item.partner_comp_waiting)}</TableCell>
                        <TableCell className="px-4 py-3 whitespace-normal break-words">{item.invoice_description}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/30 border-t-2 border-muted-foreground/20 font-semibold">
                      <TableCell className="font-bold border-r px-4 py-3 text-muted-foreground">TOTALS</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="text-right font-mono border-r px-4 py-3 text-foreground font-bold">{formatCurrency(revenueTotals.invoice_amount)}</TableCell>
                      <TableCell className="text-right border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 border-r px-4 py-3 font-bold">{formatCurrency(revenueTotals.evergreen_compensation)}</TableCell>
                      <TableCell className="text-right border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="border-r text-right font-mono text-blue-600 px-4 py-3 font-bold">{formatCurrency(revenueTotals.partner_compensation)}</TableCell>
                      <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3 font-bold">{formatCurrency(revenueTotals.effective_payment_received)}</TableCell>
                      <TableCell className="text-right font-mono text-orange-600 border-r px-4 py-3 font-bold">{formatCurrency(revenueTotals.outstanding_balance)}</TableCell>
                      <TableCell className="text-right font-mono text-purple-600 border-r px-4 py-3 font-bold">{formatCurrency(revenueTotals.partner_comp_waiting)}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">-</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center">
                      No revenue data found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            {/* Desktop Layout */}
            <div className="hidden md:flex md:items-center md:justify-between w-full">
              <span className="text-xs text-muted-foreground">{rangeLabel(revenuePageSafe, revenueTotal)}</span>
              <PaginationControls
                page={revenuePageSafe}
                totalPages={revenueTotalPages}
                totalItems={revenueTotal}
                pageInput={revenuePageInput}
                setPage={setRevenuePage}
                setPageInput={setRevenuePageInput}
                onGo={tryJumpRevenue}
              />
            </div>
            {/* Mobile Layout - Centered */}
            <div className="md:hidden flex flex-col items-center gap-3">
              <span className="text-xs text-muted-foreground text-center">{rangeLabel(revenuePageSafe, revenueTotal)}</span>
              <PaginationControls
                page={revenuePageSafe}
                totalPages={revenueTotalPages}
                totalItems={revenueTotal}
                pageInput={revenuePageInput}
                setPage={setRevenuePage}
                setPageInput={setRevenuePageInput}
                onGo={tryJumpRevenue}
                isMobile={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Payments */}
      <Card className={cn(fetching ? "opacity-60" : "")}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Partner Payments</CardTitle>
            <CardDescription className="text-sm sm:text-base">Transactions between Evergreen and Partners</CardDescription>
          </div>
          {/* Desktop Pagination */}
          <div className="hidden md:block">
            <PaginationControls
              page={paymentsPageSafe}
              totalPages={paymentsTotalPages}
              totalItems={paymentsTotal}
              pageInput={paymentsPageInput}
              setPage={setPaymentsPage}
              setPageInput={setPaymentsPageInput}
              onGo={tryJumpPayments}
              rangeText={rangeLabel(paymentsPageSafe, paymentsTotal)}
            />
          </div>
        </CardHeader>
        
        {/* Mobile Pagination - Next line, centered */}
        <div className="md:hidden flex justify-center w-full px-6 pb-4">
          <PaginationControls
            page={paymentsPageSafe}
            totalPages={paymentsTotalPages}
            totalItems={paymentsTotal}
            pageInput={paymentsPageInput}
            setPage={setPaymentsPage}
            setPageInput={setPaymentsPageInput}
            onGo={tryJumpPayments}
            rangeText={rangeLabel(paymentsPageSafe, paymentsTotal)}
            isMobile={true}
          />
        </div>

        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("show_name", false)}>
                      Show Name {renderSortIcon("show_name", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("partner_name", false)}>
                      Partner Name {renderSortIcon("partner_name", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("bill_number", false)}>
                      Bill Number {renderSortIcon("bill_number", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("bill_date", false)}>
                      Bill Date {renderSortIcon("bill_date", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("bill_amount", false)}>
                      Bill Amount {renderSortIcon("bill_amount", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("payment_id", false)}>
                      Payment ID {renderSortIcon("payment_id", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("date_of_payment", false)} title="Date of Payment">
                      DoP {renderSortIcon("date_of_payment", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("effective_billed_amount_paid", false)} title="Effective Billed Payment Completed">
                      EBPC {renderSortIcon("effective_billed_amount_paid", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0 bg-muted/50">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-4" onClick={() => handleSort("billed_amount_outstanding", false)} title="Billed Amount Outstanding">
                      BAO {renderSortIcon("billed_amount_outstanding", false)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsSlice.length > 0 ? (
                  <>
                    {paymentsSlice.map((item, index) => (
                      <TableRow key={`${item.show_name}-${item.bill_number}-${item.bill_date}-${index}`}>
                        <TableCell className="font-medium border-r px-4 py-3">{item.show_name}</TableCell>
                        <TableCell className="border-r px-4 py-3">{item.partner_name}</TableCell>
                        <TableCell className="border-r px-4 py-3">{item.bill_number || "-"}</TableCell>
                        <TableCell className="border-r px-4 py-3">{formatDate(item.bill_date)}</TableCell>
                        <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.bill_amount)}</TableCell>
                        <TableCell className="border-r px-4 py-3">{formatPaymentId(item.payment_id)}</TableCell>
                        <TableCell className="border-r px-4 py-3">{formatPaymentDates(item.date_of_payment)}</TableCell>
                        <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3">{formatCurrency(item.effective_billed_amount_paid)}</TableCell>
                        <TableCell className="text-right font-mono text-orange-600 px-4 py-3">{formatCurrency(item.billed_amount_outstanding)}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/30 border-t-2 border-muted-foreground/20 font-semibold">
                      <TableCell className="font-bold border-r px-4 py-3 text-muted-foreground">TOTALS</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="text-right font-mono border-r px-4 py-3 text-foreground font-bold">{formatCurrency(paymentsTotals.bill_amount)}</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="border-r px-4 py-3 text-muted-foreground">-</TableCell>
                      <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3 font-bold">{formatCurrency(paymentsTotals.effective_billed_amount_paid)}</TableCell>
                      <TableCell className="text-right font-mono text-orange-600 px-4 py-3 font-bold">{formatCurrency(paymentsTotals.billed_amount_outstanding)}</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No partner payment data found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            {/* Desktop Layout */}
            <div className="hidden md:flex md:items-center md:justify-between w-full">
              <span className="text-xs text-muted-foreground">{rangeLabel(paymentsPageSafe, paymentsTotal)}</span>
              <PaginationControls
                page={paymentsPageSafe}
                totalPages={paymentsTotalPages}
                totalItems={paymentsTotal}
                pageInput={paymentsPageInput}
                setPage={setPaymentsPage}
                setPageInput={setPaymentsPageInput}
                onGo={tryJumpPayments}
              />
            </div>
            {/* Mobile Layout - Centered */}
            <div className="md:hidden flex flex-col items-center gap-3">
              <span className="text-xs text-muted-foreground text-center">{rangeLabel(paymentsPageSafe, paymentsTotal)}</span>
              <PaginationControls
                page={paymentsPageSafe}
                totalPages={paymentsTotalPages}
                totalItems={paymentsTotal}
                pageInput={paymentsPageInput}
                setPage={setPaymentsPage}
                setPageInput={setPaymentsPageInput}
                onGo={tryJumpPayments}
                isMobile={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide-out Filter Panel */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSlideOutOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ margin: 0, padding: 0 }}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isSlideOutOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSlideOutOpen(false)}
        />
        
        {/* Slide-out Panel */}
        <div className={`absolute top-0 right-0 w-96 h-screen bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isSlideOutOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ margin: 0, padding: 0, top: 0 }}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSlideOutOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Filter Stats */}
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-300">
                  {filteredRevenueData.length} Revenue Entries
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50 dark:hover:text-blue-300">
                  {filteredPartnerPayments.length} Partner Payments
                </Badge>
              </div>

              {/* Filter Controls */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Show Name</Label>
                  <ShowCombobox
                    value={selectedShow}
                    onChange={(val) => setSelectedShow(val)}
                    options={["all", ...availableShows]}
                    placeholder="Search shows…"
                  />
                </div>

                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
                <Button onClick={() => setIsSlideOutOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageInput,
  setPage,
  setPageInput,
  onGo,
  rangeText,
  isMobile = false,
}: {
  page: number
  totalPages: number
  totalItems: number
  pageInput: string
  setPage: (n: number) => void
  setPageInput: (s: string) => void
  onGo: () => void
  rangeText?: string
  isMobile?: boolean
}) {
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {rangeText ? <span className="hidden sm:inline text-xs text-muted-foreground">{rangeText}</span> : null}
      <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <span className="text-xs text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 ml-2">
        <Label htmlFor={`page-input-${rangeText ?? ""}`} className="text-xs text-muted-foreground">Go to</Label>
        <Input
          id={`page-input-${rangeText ?? ""}`}
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGo()
          }}
          className="h-8 w-20"
        />
        <Button variant="outline" size="sm" onClick={onGo}>Go</Button>
      </div>
    </div>
  )
}

function ShowCombobox({
  value,
  onChange,
  options,
  placeholder = "Search…"
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  const labelFor = (v: string) => (v === "all" ? "All Shows" : v)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? labelFor(value) : "Select show"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No shows found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {labelFor(opt)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function num(v: any): number {
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function toDate(dateStr: string | null, endOfDay = false): Date {
  if (!dateStr) return new Date("1900-01-01T00:00:00Z")
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10))
    return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d)
  }
  const d = new Date(dateStr)
  if (endOfDay) d.setHours(23, 59, 59, 999)
  return d
}

async function readErr(res: Response, prefix = "Request failed") {
  try {
    const text = await res.text()
    return `${prefix}: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
  } catch {
    return `${prefix}: ${res.status} ${res.statusText}`
  }
}
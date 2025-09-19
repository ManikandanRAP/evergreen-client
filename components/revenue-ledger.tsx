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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Revenue Ledger
          </h1>
          <p className="text-muted-foreground">Track revenue transactions and partner payments</p>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Filters */}
      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-lg group px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{filteredRevenueData.length} revenue entries</Badge>
                  <Badge variant="outline">{filteredPartnerPayments.length} payment entries</Badge>
                  {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Loading / Error banners */}
      {fetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading ledger & payouts…
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Revenue Table */}
      <Card className={cn(fetching ? "opacity-60" : "")}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Transactions between Evergreen and Ad Agencies</CardDescription>
          </div>
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
        </CardHeader>

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
                  revenueSlice.map((item, index) => (
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
                  ))
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
        </CardContent>
      </Card>

      {/* Partner Payments */}
      <Card className={cn(fetching ? "opacity-60" : "")}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Partner Payments</CardTitle>
            <CardDescription>Transactions between Evergreen and Partners</CardDescription>
          </div>
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
        </CardHeader>

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
                  paymentsSlice.map((item, index) => (
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
                  ))
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
        </CardContent>
      </Card>
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
}: {
  page: number
  totalPages: number
  totalItems: number
  pageInput: string
  setPage: (n: number) => void
  setPageInput: (s: string) => void
  onGo: () => void
  rangeText?: string
}) {
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
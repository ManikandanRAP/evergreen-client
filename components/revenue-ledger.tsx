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
  payment_id: number
  payment_line_linkedtxn_txnid: string | null
  customer: string
  invoice_doc_number: string | null
  payment_amount: number | null
  invoice_amount: number | null
  pending_payments: number | null
  invoice_date: string | null
  invoice_description: string
  invoice_classref_name: string
  invoice_classref_value: string | null
  invoice_itemrefname: string | null
  split_evergreen_pct_ads?: number | null
  split_evergreen_pct_programmatic?: number | null
  effective_date?: string | null
  vendor_qbo_id?: number | null
  evergreen_percentage?: number | null
  partner_percentage?: number | null
  evergreen_compensation?: number | null
  partner_compensation?: number | null
}

type PartnerPayout = {
  bill_id: number
  docnumber: string | null
  txndate: string
  vendor_qbo_id: number
  vendor_qbo_name: string
  bill_line_classref_value: string | null
  linked_paymentid: string | null
  bill_amount: number | null
  sum_of_related_bill_amts: number | null
  paid_amount: number | null
  payment_date: string | null
  balance_billpayments: number | null
  show_qbo_id: number | null
  show_qbo_name: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 10

export default function RevenueLedger() {
  const { user, token, loading } = useAuth()

  const [selectedShow, setSelectedShow] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
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

  useEffect(() => {
    if (loading) return
    if (!token) {
      setLedger([])
      setPayouts([])
      return
    }

    let isMounted = true
    const run = async () => {
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
        if (!isMounted) return
        setLedger(Array.isArray(ledgerJson) ? ledgerJson : [])
        setPayouts(Array.isArray(payoutsJson) ? payoutsJson : [])
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || "Failed to load ledger data")
      } finally {
        if (isMounted) setFetching(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [loading, token])

  const availableShows = useMemo(() => {
    const set = new Set<string>()
    for (const r of ledger) if (r.invoice_classref_name) set.add(r.invoice_classref_name)
    for (const p of payouts) if (p.show_qbo_name) set.add(p.show_qbo_name)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [ledger, payouts])

  const filteredRevenueData = useMemo(() => {
    let filtered = ledger
    if (selectedShow !== "all") filtered = filtered.filter((i) => i.invoice_classref_name === selectedShow)
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
    if (selectedShow !== "all") filtered = filtered.filter((i) => i.show_qbo_name === selectedShow)
    if (dateFrom || dateTo) {
      filtered = filtered.filter((i) => {
        const bill = toDate(i.txndate)
        const pay = i.payment_date ? toDate(i.payment_date) : null
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
    const totalNetRevenue = filteredRevenueData.reduce((s, i) => s + num(i.payment_amount), 0)
    const totalPartnerCompensation = filteredRevenueData.reduce((s, i) => s + num(i.partner_compensation), 0)
    const seen = new Set<string>()
    const totalPaymentsMade = filteredPartnerPayments.reduce((s, i) => {
      if (i.linked_paymentid && !seen.has(i.linked_paymentid)) {
        seen.add(i.linked_paymentid)
        return s + num(i.paid_amount)
      }
      return s
    }, 0)
    return { totalNetRevenue, totalPartnerCompensation, totalPaymentsMade }
  }, [filteredRevenueData, filteredPartnerPayments])

  const formatCurrency = (v: number | null | undefined) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(v))
  const formatDate = (s: string | null) => (s ? toDate(s).toLocaleDateString() : "-")
  const formatPct = (f: number | null | undefined) => (f == null ? "-" : `${Math.round(f * 100)}%`)
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

  if (loading) {
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Revenue Ledger
          </h1>
          <p className="text-muted-foreground">Track revenue transactions and partner payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summaryData.totalNetRevenue)}</div>
            <p className="text-xs text-muted-foreground">Sum of all payment amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partner Compensation</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryData.totalPartnerCompensation)}</div>
            <p className="text-xs text-muted-foreground">Sum of partner compensation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryData.totalPaymentsMade)}</div>
            <p className="text-xs text-muted-foreground">Sum of unique payment amounts</p>
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
                <Button variant="ghost" onClick={handleClearFilters}>
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
            {/* table-fixed + colgroup -> enforces widths */}
            <Table className="table-fixed min-w-[1880px]">
              <colgroup>
                <col className="w-[150px]" />
                <col className="w-[150px]" />
                <col className="w-[250px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
                <col className="w-[100px]" />
                <col className="w-[120px]" />
              </colgroup>
              {/* ...thead / tbody... */}

              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("invoice_classref_name", true)}>
                      Show Name {renderSortIcon("invoice_classref_name", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("customer", true)}>
                      Customer {renderSortIcon("customer", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("invoice_description", true)}>
                      Description {renderSortIcon("invoice_description", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("invoice_date", true)}>
                      Invoice Date {renderSortIcon("invoice_date", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("payment_amount", true)}>
                      Payment Amt {renderSortIcon("payment_amount", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("invoice_itemrefname", true)}>
                      Comp Type {renderSortIcon("invoice_itemrefname", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("evergreen_percentage", true)}>
                      % Evergreen {renderSortIcon("evergreen_percentage", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("evergreen_compensation", true)}>
                      Evergreen Comp {renderSortIcon("evergreen_compensation", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("partner_percentage", true)}>
                      % Partner {renderSortIcon("partner_percentage", true)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("partner_compensation", true)}>
                      Partner Comp {renderSortIcon("partner_compensation", true)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {revenueSlice.length > 0 ? (
                  revenueSlice.map((item) => (
                    <TableRow key={`${item.payment_id}-${item.invoice_doc_number}-${item.invoice_date}`}>
                      <TableCell className="font-medium border-r px-4 py-3">{item.invoice_classref_name}</TableCell>
                      <TableCell className="border-r px-4 py-3">{item.customer}</TableCell>

                      {/* Description: wrap long text */}
                      <TableCell className="border-r px-4 py-3 whitespace-normal break-words">
                        {item.invoice_description}
                      </TableCell>

                      <TableCell className="border-r px-4 py-3">{formatDate(item.invoice_date)}</TableCell>
                      <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.payment_amount)}</TableCell>
                      <TableCell className="border-r px-4 py-3">{item.invoice_itemrefname || "-"}</TableCell>
                      <TableCell className="text-right border-r px-4 py-3">{formatPct(item.evergreen_percentage)}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 border-r px-4 py-3">{formatCurrency(item.evergreen_compensation)}</TableCell>
                      <TableCell className="text-right border-r px-4 py-3">{formatPct(item.partner_percentage)}</TableCell>
                      <TableCell className="text-right font-mono text-blue-600 px-4 py-3">{formatCurrency(item.partner_compensation)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
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

      {/* Partner Payments (unchanged layout) */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("show_qbo_name", false)}>
                      Show Name {renderSortIcon("show_qbo_name", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("vendor_qbo_name", false)}>
                      Partner Name {renderSortIcon("vendor_qbo_name", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("docnumber", false)}>
                      Bill Number {renderSortIcon("docnumber", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("txndate", false)}>
                      Bill Date {renderSortIcon("txndate", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("bill_amount", false)}>
                      Bill Amount {renderSortIcon("bill_amount", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("linked_paymentid", false)}>
                      Payment ID {renderSortIcon("linked_paymentid", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("payment_date", false)}>
                      Payment Date {renderSortIcon("payment_date", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("paid_amount", false)}>
                      Amount Paid {renderSortIcon("paid_amount", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("sum_of_related_bill_amts", false)}>
                      Related Bills Sum {renderSortIcon("sum_of_related_bill_amts", false)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort("balance_billpayments", false)}>
                      Balance {renderSortIcon("balance_billpayments", false)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsSlice.length > 0 ? (
                  paymentsSlice.map((item) => (
                    <TableRow key={`${item.bill_id}-${item.docnumber}-${item.txndate}`}>
                      <TableCell className="font-medium border-r px-4 py-3">{item.show_qbo_name}</TableCell>
                      <TableCell className="border-r px-4 py-3">{item.vendor_qbo_name}</TableCell>
                      <TableCell className="border-r px-4 py-3">{item.docnumber || "-"}</TableCell>
                      <TableCell className="border-r px-4 py-3">{formatDate(item.txndate)}</TableCell>
                      <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.bill_amount)}</TableCell>
                      <TableCell className="border-r px-4 py-3">{item.linked_paymentid || "-"}</TableCell>
                      <TableCell className="border-r px-4 py-3">{formatDate(item.payment_date)}</TableCell>
                      <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3">{formatCurrency(item.paid_amount)}</TableCell>
                      <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.sum_of_related_bill_amts)}</TableCell>
                      <TableCell className="text-right font-mono px-4 py-3">{formatCurrency(item.balance_billpayments)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
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
        <Label htmlFor={`page-input-${rangeText ?? ""}`} className="text-xs text-muted-foreground">Go to page</Label>
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

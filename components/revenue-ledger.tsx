"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, CreditCard, Filter, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

// Mock data for Revenue transactions (Evergreen <-> Ad Agencies)
const mockRevenueData = [
  {
    id: "1",
    invoice_classref_name: "Five Minute News",
    customer: "News Network Ads",
    invoice_description: "January 2024 Advertising Revenue",
    invoice_date: "2024-01-15",
    payment_amount: 5000,
    invoice_itemrefname: "Sponsorship",
    evergreen_percentage: 40,
    evergreen_compensation: 2000,
    partner_percentage: 60,
    partner_compensation: 3000,
  },
  {
    id: "2",
    invoice_classref_name: "Banking Transformed",
    customer: "Financial Services Corp",
    invoice_description: "Q1 2024 Branded Content",
    invoice_date: "2024-02-01",
    payment_amount: 8500,
    invoice_itemrefname: "Branded Content",
    evergreen_percentage: 100,
    evergreen_compensation: 8500,
    partner_percentage: 0,
    partner_compensation: 0,
  },
  {
    id: "3",
    invoice_classref_name: "Disturbed",
    customer: "Crime Network Media",
    invoice_description: "February 2024 Programmatic Ads",
    invoice_date: "2024-02-15",
    payment_amount: 3200,
    invoice_itemrefname: "Programmatic",
    evergreen_percentage: 100,
    evergreen_compensation: 3200,
    partner_percentage: 0,
    partner_compensation: 0,
  },
  {
    id: "4",
    invoice_classref_name: "Five Minute News",
    customer: "Political Action Committee",
    invoice_description: "March 2024 Election Coverage Ads",
    invoice_date: "2024-03-01",
    payment_amount: 4200,
    invoice_itemrefname: "Sponsorship",
    evergreen_percentage: 40,
    evergreen_compensation: 1680,
    partner_percentage: 60,
    partner_compensation: 2520,
  },
  {
    id: "5",
    invoice_classref_name: "Banking Transformed",
    customer: "Tech Startup Inc",
    invoice_description: "April 2024 Product Launch Campaign",
    invoice_date: "2024-04-10",
    payment_amount: 6800,
    invoice_itemrefname: "Branded Content",
    evergreen_percentage: 100,
    evergreen_compensation: 6800,
    partner_percentage: 0,
    partner_compensation: 0,
  },
]

// Mock data for Partner Payments (Evergreen <-> Partners)
const mockPartnerPayments = [
  {
    id: "1",
    show_qbo_name: "Five Minute News",
    vendor_qbo_name: "News Partner LLC",
    docnumber: "BILL-001",
    txndate: "2024-01-20",
    bill_amount: 3000,
    linked_paymentid: "PAY-001",
    payment_date: "2024-02-01",
    paid_amount: 3000,
    sum_of_related_bill_amts: 3000,
    balance_billpayments: 0,
  },
  {
    id: "2",
    show_qbo_name: "Five Minute News",
    vendor_qbo_name: "News Partner LLC",
    docnumber: "BILL-002",
    txndate: "2024-03-05",
    bill_amount: 2520,
    linked_paymentid: "PAY-002",
    payment_date: "2024-03-15",
    paid_amount: 2520,
    sum_of_related_bill_amts: 2520,
    balance_billpayments: 0,
  },
  {
    id: "3",
    show_qbo_name: "Banking Transformed",
    vendor_qbo_name: "Finance Expert Inc",
    docnumber: "BILL-003",
    txndate: "2024-02-10",
    bill_amount: 0,
    linked_paymentid: null,
    payment_date: null,
    paid_amount: 0,
    sum_of_related_bill_amts: 0,
    balance_billpayments: 0,
  },
  {
    id: "4",
    show_qbo_name: "Disturbed",
    vendor_qbo_name: "Crime Stories Media",
    docnumber: "BILL-004",
    txndate: "2024-02-20",
    bill_amount: 1500,
    linked_paymentid: "PAY-003",
    payment_date: "2024-03-01",
    paid_amount: 1500,
    sum_of_related_bill_amts: 1500,
    balance_billpayments: 0,
  },
]

// Mock user-show mappings (for partner users)
const mockUserShowMappings = {
  "partner-1": ["Five Minute News"],
  "partner-2": ["Banking Transformed"],
  "partner-3": ["Disturbed"],
}

type SortDirection = 'asc' | 'desc' | null
type SortConfig = {
  key: string
  direction: SortDirection
}

export default function RevenueLedger() {
  const { user } = useAuth()
  const [selectedShow, setSelectedShow] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Sorting states
  const [revenueSortConfig, setRevenueSortConfig] = useState<SortConfig>({ key: '', direction: null })
  const [paymentsSortConfig, setPaymentsSortConfig] = useState<SortConfig>({ key: '', direction: null })

  // Get available shows based on user role
  const availableShows = useMemo(() => {
    if (user?.role === "admin") {
      // Admin sees all shows
      const allShows = [...new Set([
        ...mockRevenueData.map(item => item.invoice_classref_name),
        ...mockPartnerPayments.map(item => item.show_qbo_name)
      ])]
      return allShows
    } else if (user?.role === "partner") {
      // Partner sees only their mapped shows
      const userShows = mockUserShowMappings[user.id as keyof typeof mockUserShowMappings] || []
      return userShows
    }
    return []
  }, [user])

  // Filter revenue data
  const filteredRevenueData = useMemo(() => {
    let filtered = mockRevenueData

    // Filter by user role
    if (user?.role === "partner") {
      const userShows = mockUserShowMappings[user.id as keyof typeof mockUserShowMappings] || []
      filtered = filtered.filter(item => userShows.includes(item.invoice_classref_name))
    }

    // Filter by selected show
    if (selectedShow !== "all") {
      filtered = filtered.filter(item => item.invoice_classref_name === selectedShow)
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.invoice_date)
        const fromDate = dateFrom ? new Date(dateFrom) : new Date("1900-01-01")
        const toDate = dateTo ? new Date(dateTo) : new Date("2100-12-31")
        return itemDate >= fromDate && itemDate <= toDate
      })
    }

    return filtered
  }, [user, selectedShow, dateFrom, dateTo])

  // Filter partner payments data
  const filteredPartnerPayments = useMemo(() => {
    let filtered = mockPartnerPayments

    // Filter by user role
    if (user?.role === "partner") {
      const userShows = mockUserShowMappings[user.id as keyof typeof mockUserShowMappings] || []
      filtered = filtered.filter(item => userShows.includes(item.show_qbo_name))
    }

    // Filter by selected show
    if (selectedShow !== "all") {
      filtered = filtered.filter(item => item.show_qbo_name === selectedShow)
    }

    // Filter by date range (applies to both bill date and payment date)
    if (dateFrom || dateTo) {
      filtered = filtered.filter(item => {
        const billDate = new Date(item.txndate)
        const paymentDate = item.payment_date ? new Date(item.payment_date) : null
        const fromDate = dateFrom ? new Date(dateFrom) : new Date("1900-01-01")
        const toDate = dateTo ? new Date(dateTo) : new Date("2100-12-31")
        
        const billInRange = billDate >= fromDate && billDate <= toDate
        const paymentInRange = paymentDate ? (paymentDate >= fromDate && paymentDate <= toDate) : false
        
        return billInRange || paymentInRange
      })
    }

    return filtered
  }, [user, selectedShow, dateFrom, dateTo])

  // Sorting function
  const sortData = <T extends Record<string, any>>(data: T[], sortConfig: SortConfig): T[] => {
    if (!sortConfig.direction || !sortConfig.key) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1

      // Handle different data types
      let comparison = 0
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Check if it's a date string
        if (aValue.match(/^\d{4}-\d{2}-\d{2}$/) && bValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          comparison = new Date(aValue).getTime() - new Date(bValue).getTime()
        } else {
          comparison = aValue.localeCompare(bValue)
        }
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }

  // Handle sorting clicks
  const handleSort = (key: string, isRevenueTable: boolean) => {
    const currentConfig = isRevenueTable ? revenueSortConfig : paymentsSortConfig
    const setConfig = isRevenueTable ? setRevenueSortConfig : setPaymentsSortConfig

    let newDirection: SortDirection = 'asc'
    
    if (currentConfig.key === key) {
      if (currentConfig.direction === 'asc') {
        newDirection = 'desc'
      } else if (currentConfig.direction === 'desc') {
        newDirection = null
      } else {
        newDirection = 'asc'
      }
    }

    setConfig({ key: newDirection ? key : '', direction: newDirection })
  }

  // Get sorted data
  const sortedRevenueData = useMemo(() => {
    return sortData(filteredRevenueData, revenueSortConfig)
  }, [filteredRevenueData, revenueSortConfig])

  const sortedPartnerPayments = useMemo(() => {
    return sortData(filteredPartnerPayments, paymentsSortConfig)
  }, [filteredPartnerPayments, paymentsSortConfig])

  // Calculate summary values
  const summaryData = useMemo(() => {
    const totalNetRevenue = filteredRevenueData.reduce((sum, item) => sum + item.payment_amount, 0)
    const totalPartnerCompensation = filteredRevenueData.reduce((sum, item) => sum + item.partner_compensation, 0)
    
    // Calculate total payments made (sum of unique payment IDs)
    const uniquePaymentIds = new Set()
    const totalPaymentsMade = filteredPartnerPayments.reduce((sum, item) => {
      if (item.linked_paymentid && !uniquePaymentIds.has(item.linked_paymentid)) {
        uniquePaymentIds.add(item.linked_paymentid)
        return sum + item.paid_amount
      }
      return sum
    }, 0)

    return {
      totalNetRevenue,
      totalPartnerCompensation,
      totalPaymentsMade,
    }
  }, [filteredRevenueData, filteredPartnerPayments])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    // Add a day to the date to correct for timezone issues if necessary
    const date = new Date(dateString)
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString()
  }

  // Render sort icon
  const renderSortIcon = (columnKey: string, isRevenueTable: boolean) => {
    const currentConfig = isRevenueTable ? revenueSortConfig : paymentsSortConfig
    
    if (currentConfig.key !== columnKey || !currentConfig.direction) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
    }
    
    return currentConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" />
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" />
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
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summaryData.totalNetRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of all payment amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partner Compensation</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summaryData.totalPartnerCompensation)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of partner compensation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryData.totalPaymentsMade)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of unique payment amounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Collapsible Filters */}
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
                  <Badge variant="secondary">
                    {filteredRevenueData.length} revenue entries
                  </Badge>
                  <Badge variant="outline">
                    {filteredPartnerPayments.length} payment entries
                  </Badge>
                  {isFiltersOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Show Name</Label>
                  <Select value={selectedShow} onValueChange={setSelectedShow}>
                    <SelectTrigger>
                      <SelectValue placeholder="All shows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shows</SelectItem>
                      {availableShows.map((show) => (
                        <SelectItem key={show} value={show}>
                          {show}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Transactions between Evergreen and Ad Agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('invoice_classref_name', true)}>
                      Show Name {renderSortIcon('invoice_classref_name', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('customer', true)}>
                      Customer {renderSortIcon('customer', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('invoice_description', true)}>
                      Description {renderSortIcon('invoice_description', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('invoice_date', true)}>
                      Invoice Date {renderSortIcon('invoice_date', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('payment_amount', true)}>
                      Payment Amt {renderSortIcon('payment_amount', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('invoice_itemrefname', true)}>
                      Comp Type {renderSortIcon('invoice_itemrefname', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('evergreen_percentage', true)}>
                      % Evergreen {renderSortIcon('evergreen_percentage', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('evergreen_compensation', true)}>
                      Evergreen Comp {renderSortIcon('evergreen_compensation', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('partner_percentage', true)}>
                      % Partner {renderSortIcon('partner_percentage', true)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('partner_compensation', true)}>
                      Partner Comp {renderSortIcon('partner_compensation', true)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRevenueData.length > 0 ? sortedRevenueData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium border-r px-4 py-3">{item.invoice_classref_name}</TableCell>
                    <TableCell className="border-r px-4 py-3">{item.customer}</TableCell>
                    <TableCell className="max-w-xs truncate border-r px-4 py-3">{item.invoice_description}</TableCell>
                    <TableCell className="border-r px-4 py-3">{formatDate(item.invoice_date)}</TableCell>
                    <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.payment_amount)}</TableCell>
                    <TableCell className="border-r px-4 py-3">{item.invoice_itemrefname}</TableCell>
                    <TableCell className="text-right border-r px-4 py-3">{item.evergreen_percentage}%</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 border-r px-4 py-3">{formatCurrency(item.evergreen_compensation)}</TableCell>
                    <TableCell className="text-right border-r px-4 py-3">{item.partner_percentage}%</TableCell>
                    <TableCell className="text-right font-mono text-blue-600 px-4 py-3">{formatCurrency(item.partner_compensation)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No revenue data found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Partner Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Payments</CardTitle>
          <CardDescription>Transactions between Evergreen and Partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('show_qbo_name', false)}>
                      Show Name {renderSortIcon('show_qbo_name', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('vendor_qbo_name', false)}>
                      Partner Name {renderSortIcon('vendor_qbo_name', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('docnumber', false)}>
                      Bill Number {renderSortIcon('docnumber', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('txndate', false)}>
                      Bill Date {renderSortIcon('txndate', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('bill_amount', false)}>
                      Bill Amount {renderSortIcon('bill_amount', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('linked_paymentid', false)}>
                      Payment ID {renderSortIcon('linked_paymentid', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-start text-left font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('payment_date', false)}>
                      Payment Date {renderSortIcon('payment_date', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('paid_amount', false)}>
                      Amount Paid {renderSortIcon('paid_amount', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('sum_of_related_bill_amts', false)}>
                      Related Bills Sum {renderSortIcon('sum_of_related_bill_amts', false)}
                    </Button>
                  </TableHead>
                  <TableHead className="p-0">
                    <Button variant="ghost" className="w-full justify-end text-right font-semibold hover:bg-transparent px-4 py-2" onClick={() => handleSort('balance_billpayments', false)}>
                      Balance {renderSortIcon('balance_billpayments', false)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPartnerPayments.length > 0 ? sortedPartnerPayments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium border-r px-4 py-3">{item.show_qbo_name}</TableCell>
                    <TableCell className="border-r px-4 py-3">{item.vendor_qbo_name}</TableCell>
                    <TableCell className="border-r px-4 py-3">{item.docnumber}</TableCell>
                    <TableCell className="border-r px-4 py-3">{formatDate(item.txndate)}</TableCell>
                    <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.bill_amount)}</TableCell>
                    <TableCell className="border-r px-4 py-3">{item.linked_paymentid || "-"}</TableCell>
                    <TableCell className="border-r px-4 py-3">{formatDate(item.payment_date)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600 border-r px-4 py-3">{formatCurrency(item.paid_amount)}</TableCell>
                    <TableCell className="text-right font-mono border-r px-4 py-3">{formatCurrency(item.sum_of_related_bill_amts)}</TableCell>
                    <TableCell className="text-right font-mono px-4 py-3">{formatCurrency(item.balance_billpayments)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No partner payment data found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
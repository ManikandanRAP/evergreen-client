"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, CreditCard, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"

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
]

// Mock user-show mappings (for partner users)
const mockUserShowMappings = {
  "partner-1": ["Five Minute News"],
  "partner-2": ["Banking Transformed"],
  "partner-3": ["Disturbed"],
}

export default function RevenueLedger() {
  const { user } = useAuth()
  const [selectedShow, setSelectedShow] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter the revenue and payment data</CardDescription>
        </CardHeader>
        <CardContent>
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
      </Card>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Transactions between Evergreen and Ad Agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date of Invoice</TableHead>
                  <TableHead className="text-right">Payment Amount</TableHead>
                  <TableHead>Compensation Type</TableHead>
                  <TableHead className="text-right">% - Evergreen</TableHead>
                  <TableHead className="text-right">Evergreen Compensation</TableHead>
                  <TableHead className="text-right">% - Partner</TableHead>
                  <TableHead className="text-right">Partner Compensation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRevenueData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.invoice_classref_name}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.invoice_description}</TableCell>
                    <TableCell>{formatDate(item.invoice_date)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.payment_amount)}</TableCell>
                    <TableCell>{item.invoice_itemrefname}</TableCell>
                    <TableCell className="text-right">{item.evergreen_percentage}%</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">
                      {formatCurrency(item.evergreen_compensation)}
                    </TableCell>
                    <TableCell className="text-right">{item.partner_percentage}%</TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      {formatCurrency(item.partner_compensation)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRevenueData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No revenue data found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Payments</CardTitle>
          <CardDescription>Transactions between Evergreen and Partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show Name</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead className="text-right">Bill Amount</TableHead>
                  <TableHead>Linked Payment ID</TableHead>
                  <TableHead>Date of Payment</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Sum of Related Bills</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartnerPayments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.show_qbo_name}</TableCell>
                    <TableCell>{item.vendor_qbo_name}</TableCell>
                    <TableCell>{item.docnumber}</TableCell>
                    <TableCell>{formatDate(item.txndate)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.bill_amount)}</TableCell>
                    <TableCell>{item.linked_paymentid || "-"}</TableCell>
                    <TableCell>{item.payment_date ? formatDate(item.payment_date) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatCurrency(item.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.sum_of_related_bill_amts)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.balance_billpayments)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPartnerPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No partner payment data found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

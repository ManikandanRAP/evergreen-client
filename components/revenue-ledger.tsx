"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockLedgerEntries, mockShows } from "@/lib/show-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { DollarSign, TrendingUp, Calendar, Filter } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function RevenueLedger() {
  const { user } = useAuth()
  const [selectedShow, setSelectedShow] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [agencyFilter, setAgencyFilter] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Filter shows based on user role
  const availableShows = useMemo(() => {
    if (user?.role === "admin") {
      return mockShows
    }
    return mockShows.filter((show) => show.partnerUsers.includes(user?.id || ""))
  }, [user])

  // Filter ledger entries
  const filteredEntries = useMemo(() => {
    let entries = mockLedgerEntries

    // Filter by user role - partners only see their show entries
    if (user?.role === "partner") {
      const userShowIds = availableShows.map((show) => show.id)
      entries = entries.filter((entry) => userShowIds.includes(entry.showId))
    }

    // Apply filters
    if (selectedShow !== "all") {
      entries = entries.filter((entry) => entry.showId === selectedShow)
    }
    if (dateFilter) {
      entries = entries.filter((entry) => entry.dates.includes(dateFilter))
    }
    if (agencyFilter) {
      entries = entries.filter(
        (entry) =>
          entry.agency.toLowerCase().includes(agencyFilter.toLowerCase()) ||
          entry.advertiser.toLowerCase().includes(agencyFilter.toLowerCase()),
      )
    }

    return entries
  }, [mockLedgerEntries, selectedShow, dateFilter, agencyFilter, user, availableShows])

  // Calculate totals
  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => ({
        totalNet: acc.totalNet + entry.totalNet,
        evergreenComp: acc.evergreenComp + entry.evergreenComp,
        partnerComp: acc.partnerComp + entry.partnerComp,
        amountPaid: acc.amountPaid + (entry.amountPaid || 0),
      }),
      { totalNet: 0, evergreenComp: 0, partnerComp: 0, amountPaid: 0 },
    )
  }, [filteredEntries])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getShowName = (showId: string) => {
    const show = mockShows.find((s) => s.id === showId)
    return show?.name || "Unknown Show"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Revenue Ledger
          </h1>
          <p className="text-muted-foreground">Track advertising revenue and partner splits</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.totalNet)}</div>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evergreen Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatCurrency(totals.evergreenComp)}</div>
            <p className="text-xs text-muted-foreground">
              {totals.totalNet > 0 ? ((totals.evergreenComp / totals.totalNet) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.partnerComp)}</div>
            <p className="text-xs text-muted-foreground">
              {totals.totalNet > 0 ? ((totals.partnerComp / totals.totalNet) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.amountPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEntries.filter((e) => e.amountPaid).length} payments made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="evergreen-card">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Badge variant="secondary">
                  {filteredEntries.length} entr{filteredEntries.length !== 1 ? "ies" : "y"}
                </Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Show</Label>
                  <Select value={selectedShow} onValueChange={setSelectedShow}>
                    <SelectTrigger>
                      <SelectValue placeholder="All shows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shows</SelectItem>
                      {availableShows.map((show) => (
                        <SelectItem key={show.id} value={show.id}>
                          {show.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Filter</Label>
                  <Input
                    placeholder="e.g., 1/1/25, 2024..."
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agency/Advertiser</Label>
                  <Input
                    placeholder="Search agency or advertiser..."
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Ledger Table */}
      <Card className="evergreen-card">
        <CardHeader>
          <CardTitle>Revenue Entries</CardTitle>
          <CardDescription>Detailed breakdown of advertising revenue and splits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show</TableHead>
                  <TableHead>Agency/Company</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Total Net</TableHead>
                  <TableHead className="text-right">EG Comp. (40%)</TableHead>
                  <TableHead className="text-right">Partner Comp. (60%)</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Date Paid</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{getShowName(entry.showId)}</TableCell>
                    <TableCell>{entry.agency}</TableCell>
                    <TableCell>{entry.advertiser}</TableCell>
                    <TableCell>{entry.campaign}</TableCell>
                    <TableCell>{entry.dates}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.totalNet)}</TableCell>
                    <TableCell className="text-right text-cyan-600">{formatCurrency(entry.evergreenComp)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(entry.partnerComp)}</TableCell>
                    <TableCell className="text-right">
                      {entry.amountPaid ? formatCurrency(entry.amountPaid) : "-"}
                    </TableCell>
                    <TableCell>{entry.datePaid || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-accent/20">
                  <TableCell colSpan={5} className="font-medium">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totals.totalNet)}</TableCell>
                  <TableCell className="text-right font-bold text-cyan-600">
                    {formatCurrency(totals.evergreenComp)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totals.partnerComp)}
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totals.amountPaid)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredEntries.length === 0 && (
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No revenue entries found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see revenue data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

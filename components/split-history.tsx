"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Loader2,
  History,
  Calendar,
  Percent,
  Building,
  Radio
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

type SplitHistoryProps = {
  onBack: () => void
}

type SplitHistoryRow = {
  split_id: number
  show_qbo_id: number
  show_name: string | null
  vendor_qbo_id: number | null
  vendor_name: string | null
  partner_pct_ads: number | null
  partner_pct_programmatic: number | null
  effective_date: string | null
}

type SortField = keyof SplitHistoryRow | null
type SortDirection = "asc" | "desc" | "original"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 10

export default function SplitHistory({ onBack }: SplitHistoryProps) {
  const { user: currentUser, token } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [splits, setSplits] = useState<SplitHistoryRow[]>([])

  // Search, sorting, and pagination state
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("original")
  const [originalOrder, setOriginalOrder] = useState<SplitHistoryRow[]>([])


  // Filter and sort splits
  const filteredAndSortedSplits = useMemo(() => {
    const filtered = splits.filter((split) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const showName = (split.show_name || "").toLowerCase()
        const vendorName = (split.vendor_name || "").toLowerCase()
        const splitId = split.split_id.toString()
        
        if (!showName.includes(searchLower) && 
            !vendorName.includes(searchLower) && 
            !splitId.includes(searchLower)) {
          return false
        }
      }

      return true
    })

    if (sortDirection === "original") {
      // We need to filter the original order as well to match search terms
      const originalIds = new Set(filtered.map((s) => s.split_id))
      return originalOrder.filter((s) => originalIds.has(s.split_id))
    }

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortField] ?? "").toLowerCase()
        const bValue = String(b[sortField] ?? "").toLowerCase()

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [splits, originalOrder, searchTerm, sortField, sortDirection])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAndSortedSplits.length / PAGE_SIZE)), [filteredAndSortedSplits.length])

  const paginatedSplits = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredAndSortedSplits.slice(start, start + PAGE_SIZE)
  }, [filteredAndSortedSplits, page])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // Load splits on mount
  useEffect(() => {
    const run = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/split-management/split-history`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        if (!res.ok) throw new Error("Failed to fetch split history")
        const data = (await res.json()) as SplitHistoryRow[]
        setSplits(data)
        setOriginalOrder(data)
      } catch (e: any) {
        toast({ title: "Failed to load split history", description: e?.message ?? String(e), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [token, toast])


  // Export splits function
  const handleExportSplits = () => {
    const csvContent = [
      // CSV headers
      ["Split ID", "Show QBO ID", "Show Name", "Vendor QBO ID", "Vendor Name", "Ads %", "Prog %", "Effective Date"].join(","),
      // CSV data
      ...filteredAndSortedSplits.map((split) =>
        [
          split.split_id,
          split.show_qbo_id,
          `"${(split.show_name || "").replace(/"/g, '""')}"`,
          split.vendor_qbo_id || "",
          `"${(split.vendor_name || "").replace(/"/g, '""')}"`,
          split.partner_pct_ads ? (split.partner_pct_ads * 100).toFixed(2) : "",
          split.partner_pct_programmatic ? (split.partner_pct_programmatic * 100).toFixed(2) : "",
          split.effective_date || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `split-history-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: `${filteredAndSortedSplits.length} split records exported successfully.`,
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> original
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection("original")
        setSortField(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }

    switch (sortDirection) {
      case "asc":
        return <ArrowUp className="h-4 w-4 text-blue-600" />
      case "desc":
        return <ArrowDown className="h-4 w-4 text-blue-600" />
      case "original":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="px-4 py-2 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {getSortIcon(field)}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Header with back button - Desktop: back button before title, Mobile: below title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Desktop: back button before title, Mobile: title first */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Back button - Desktop: show before title, Mobile: hide here */}
          <Button variant="outline" onClick={onBack} className="gap-2 w-fit hidden md:flex">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Split History</h1>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2">
          {/* Back button - Mobile: show here, Desktop: hide */}
          <Button variant="outline" onClick={onBack} className="gap-2 w-fit md:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {/* Export button for mobile - only show on mobile */}
          <Button variant="outline" onClick={handleExportSplits} disabled={filteredAndSortedSplits.length === 0} className="md:hidden gap-2 w-fit">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {/* Export button for desktop - only show on desktop */}
          <Button variant="outline" onClick={handleExportSplits} disabled={filteredAndSortedSplits.length === 0} className="hidden md:flex gap-2 w-fit">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics - Hidden on mobile, visible on desktop */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Splits</p>
                <p className="text-2xl font-bold text-slate-600">{splits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Unique Shows</p>
                <p className="text-2xl font-bold text-emerald-600">{new Set(splits.map(s => s.show_qbo_id)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Unique Vendors</p>
                <p className="text-2xl font-bold text-purple-600">{new Set(splits.map(s => s.vendor_qbo_id).filter(Boolean)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Splits</p>
                <p className="text-2xl font-bold text-orange-600">{splits.filter(s => s.effective_date && new Date(s.effective_date) <= new Date()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          {/* Mobile: Search and count on same line, Desktop: Keep horizontal */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-row md:flex-row md:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search splits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              {/* Mobile: Non-clickable split count on same line, Desktop: Regular text */}
              <div className="md:hidden flex-shrink-0">
                <div className="h-10 px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 border border-border rounded-md bg-background">
                  <span className="text-sm font-bold leading-none">{filteredAndSortedSplits.length}</span>
                  <span className="text-xs text-muted-foreground leading-none">Splits</span>
                </div>
              </div>
              <div className="hidden md:block">
                <Badge variant="outline" className="text-xs font-normal">
                  {filteredAndSortedSplits.length} split{filteredAndSortedSplits.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading split history…
            </div>
          ) : (
            <>
              {/* Mobile Table View - Simplified columns without QBO IDs */}
              <div className="md:hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/6 border-r whitespace-nowrap">Split ID</TableHead>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/3 border-r">Show Name</TableHead>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/3 border-r">Vendor Name</TableHead>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/6 border-r">Ads %</TableHead>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/6 border-r">Prog %</TableHead>
                      <TableHead className="px-3 py-2 font-semibold bg-muted/50 w-1/4">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSplits.map((split) => (
                      <TableRow key={split.split_id}>
                        <TableCell className="font-medium px-3 py-2 whitespace-nowrap border-r">
                          #{split.split_id}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap border-r">{split.show_name || "—"}</TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap border-r">{split.vendor_name || "—"}</TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap border-r">
                          {split.partner_pct_ads ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 pointer-events-none whitespace-nowrap">
                              {(split.partner_pct_ads * 100).toFixed(2)}%
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap border-r">
                          {split.partner_pct_programmatic ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700 pointer-events-none whitespace-nowrap">
                              {(split.partner_pct_programmatic * 100).toFixed(2)}%
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          {split.effective_date ? new Date(split.effective_date).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Desktop Table View - Full columns with QBO IDs */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="split_id">Split ID</SortableHeader>
                      <SortableHeader field="show_qbo_id">Show QBO ID</SortableHeader>
                      <SortableHeader field="show_name">Show Name</SortableHeader>
                      <SortableHeader field="vendor_qbo_id">Vendor QBO ID</SortableHeader>
                      <SortableHeader field="vendor_name">Vendor Name</SortableHeader>
                      <SortableHeader field="partner_pct_ads">Ads %</SortableHeader>
                      <SortableHeader field="partner_pct_programmatic">Prog %</SortableHeader>
                      <SortableHeader field="effective_date">Effective Date</SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSplits.map((split) => (
                      <TableRow key={split.split_id}>
                        <TableCell className="font-medium border-r px-4 py-2">
                          #{split.split_id}
                        </TableCell>
                        <TableCell className="font-mono border-r px-4 py-2">{split.show_qbo_id}</TableCell>
                        <TableCell className="border-r px-4 py-2">{split.show_name || "—"}</TableCell>
                        <TableCell className="font-mono border-r px-4 py-2">{split.vendor_qbo_id || "—"}</TableCell>
                        <TableCell className="border-r px-4 py-2">{split.vendor_name || "—"}</TableCell>
                        <TableCell className="border-r px-4 py-2">
                          {split.partner_pct_ads ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 pointer-events-none">
                              {(split.partner_pct_ads * 100).toFixed(2)}%
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="border-r px-4 py-2">
                          {split.partner_pct_programmatic ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700 pointer-events-none">
                              {(split.partner_pct_programmatic * 100).toFixed(2)}%
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {split.effective_date ? new Date(split.effective_date).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginatedSplits.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">📊</div>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No splits found matching your search." : "No split history found."}
                  </p>
                </div>
              )}

              {/* Pagination controls - Centered for mobile */}
              {filteredAndSortedSplits.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  <span className="text-xs text-muted-foreground text-center sm:text-left">
                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredAndSortedSplits.length)} to {Math.min(page * PAGE_SIZE, filteredAndSortedSplits.length)} of {filteredAndSortedSplits.length} splits
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(Math.max(1, page - 1))} 
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} / {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(Math.min(totalPages, page + 1))} 
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

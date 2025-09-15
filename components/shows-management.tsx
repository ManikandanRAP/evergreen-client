"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useShows } from "@/hooks/use-shows"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Filter,
  Edit,
  Eye,
  Radio,
  Trash2,
  Grid3X3,
  List,
  Download,
  Check,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MoreVertical,
  AlertTriangle,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateShowDialog from "@/components/create-show-dialog"
import DeleteShowDialog from "@/components/delete-show-dialog"
import ImportCSVDialog from "@/components/import-csv-dialog"
import ShowViewDialog from "@/components/show-view-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Show } from "@/lib/show-types"
import { Checkbox } from "@/components/ui/checkbox"

/** FILTER MODEL */
interface ShowFilters {
  search: string
  minimumGuarantee: string
  subnetwork: string
  format: string
  tentpole: string
  relationship: string
  show_type: string
  genre_name: string
  hasSponsorshipRevenue: string
  hasNonEvergreenRevenue: string
  requiresPartnerLedgerAccess: string
  isOriginal: string
  is_active: string
  age_demographic: string
  genderDemographic: string
  ownershipPercentage: string
  region: string
  is_undersized: string
  showsPerYear: string
  averageLength: string
  adSlots: string
  revenue2023: string
  revenue2024: string
  revenue2025: string
  hasBrandedRevenue: string
  hasMarketingRevenue: string
  hasWebManagementRevenue: string
}

const initialFilters: ShowFilters = {
  search: "",
  minimumGuarantee: "",
  subnetwork: "",
  format: "",
  tentpole: "",
  relationship: "",
  show_type: "",
  genre_name: "",
  hasSponsorshipRevenue: "",
  hasNonEvergreenRevenue: "",
  requiresPartnerLedgerAccess: "",
  isOriginal: "",
  is_active: "",
  age_demographic: "",
  genderDemographic: "",
  ownershipPercentage: "",
  region: "",
  is_undersized: "",
  showsPerYear: "",
  averageLength: "",
  adSlots: "",
  revenue2023: "",
  revenue2024: "",
  revenue2025: "",
  hasBrandedRevenue: "",
  hasMarketingRevenue: "",
  hasWebManagementRevenue: "",
}

interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

/** Small labeled divider for filter sections */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="my-4 first:mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="h-px bg-border" />
      <span className="text-md font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="h-px bg-border" />
    </div>
  )
}

/** Helpers for Standard/Programmatic Splits displayed in views */
const formatPercentage = (n: number | null | undefined) =>
  n === null || typeof n === "undefined" ? "N/A" : `${n}%`

const getStandardSplit = (show: Show) =>
  (show as any).standardAdsPercent ?? null

const getProgrammaticSplit = (show: Show) =>
  (show as any).programmaticAdsPercent ??
  (show as any).programmaticAdsSpanPercent ??
  null

export default function ShowsManagement() {
  const { user } = useAuth()
  const { shows, loading, error, createShow, updateShow, deleteShow, fetchShows } = useShows()

  const [filters, setFilters] = useState<ShowFilters>(initialFilters)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [viewingShowIndex, setViewingShowIndex] = useState<number | null>(null)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [deletingShow, setDeletingShow] = useState<Show | null>(null)

  /** Default to LIST view (as per earlier change) */
  const [viewMode, setViewMode] = useState<"cards" | "list">("list")

  const [selectedShows, setSelectedShows] = useState<Set<string>>(new Set())
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const handleClearFilters = () => {
    setFilters(initialFilters)
  }

  const handleViewShow = (show: Show) => {
    const index = filteredShows.findIndex((s) => s.id === show.id)
    if (index !== -1) setViewingShowIndex(index)
  }

  const handleEditShow = (show: Show) => {
    setEditingShow(show)
    setIsCreateDialogOpen(true)
  }

  const handleEditExistingShow = (show: Show) => {
    console.log("handleEditExistingShow called with:", show)
    setEditingShow(show)
    setIsCreateDialogOpen(true)
    console.log("Dialog should now be open with editingShow:", show)
  }

  const handleDeleteShow = (show: Show) => setDeletingShow(show)

  const handleShowUpdated = async () => {
    setEditingShow(null)
    await fetchShows()
  }

  const handleShowDeleted = async () => {
    setDeletingShow(null)
    await fetchShows()
  }

  const handleCreateNew = () => {
    setEditingShow(null)
    setIsCreateDialogOpen(true)
  }

  const handleSelectAll = () => {
    if (selectedShows.size === filteredShows.length) {
      setSelectedShows(new Set())
    } else {
      setSelectedShows(new Set(filteredShows.map((show) => show.id)))
    }
  }

  const handleSelectShow = (showId: string) => {
    const next = new Set(selectedShows)
    next.has(showId) ? next.delete(showId) : next.add(showId)
    setSelectedShows(next)
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true)
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedShows.size === 0) return

    setIsBulkDeleting(true)
    try {
      const selectedShowIds = Array.from(selectedShows)
      
      // Use the new bulk delete API
      const result = await apiClient.bulkDeletePodcasts(selectedShowIds)
      
      // Clear selection after deletion
      setSelectedShows(new Set())
      
      // Show appropriate success/error message
      if (result.failed === 0) {
        toast.success(`Successfully deleted all ${result.successful} selected shows!`)
      } else if (result.successful > 0) {
        toast.warning(`Deleted ${result.successful} shows, ${result.failed} failed`)
      } else {
        toast.error(`Failed to delete any shows. ${result.errors.join(', ')}`)
      }

      // Refresh the shows list
      await fetchShows()
    } catch (error: any) {
      console.error("Bulk delete failed:", error)
      toast.error(error.message || "Failed to delete selected shows")
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  const handleExportCSV = () => {
    const showsToExport =
      selectedShows.size > 0
        ? filteredShows.filter((show) => selectedShows.has(show.id))
        : filteredShows

    if (showsToExport.length === 0) {
      alert("No shows available to export")
      return
    }

    const csvHeaders = [
      "Show Name",
      "Show Type",
      "Select Type",
      "Subnetwork",
      "Format",
      "Relationship",
      "Age (Months)",
      "Genre",
      "Shows per Year",
      "Minimum Guarantee",
      "Ownership %",
      "Revenue 2023",
      "Revenue 2024",
      "Revenue 2025",
      "Is Tentpole",
      "Is Original",
      "Is Active",
      "Age Demographic",
      "Gender Demographic",
      "Branded Revenue Amount",
      "Marketing Revenue Amount",
      "Web Management Revenue",
      "Latest CPM",
      "Has Sponsorship Revenue",
      "Has Non Evergreen Revenue",
      "Requires Partner Ledger Access",
      "Ad Slots",
      "Average Length",
      "Primary Contact Host",
      "Primary Contact Show",
      "Is Undersized",
    ]

    const csvData = showsToExport.map((show) => [
      show.name,
      show.show_type,
      show.subnetwork_id,
      show.format,
      show.relationship,
      show.ageMonths,
      show.genre_name,
      show.showsPerYear,
      show.minimumGuarantee,
      show.ownershipPercentage,
      show.revenue2023,
      show.revenue2024,
      show.revenue2025,
      show.isTentpole ? "Yes" : "No",
      show.isOriginal ? "Yes" : "No",
      show.is_active ? "Yes" : "No",
      show.age_demographic,
      show.genderDemographic,
      show.brandedRevenueAmount,
      show.marketingRevenueAmount,
      show.webManagementRevenue,
      show.latestCPM,
      show.hasSponsorshipRevenue ? "Yes" : "No",
      show.hasNonEvergreenRevenue ? "Yes" : "No",
      show.requiresPartnerLedgerAccess ? "Yes" : "No",
      show.adSlots,
      show.averageLength,
      show.primaryContactHost,
      show.primaryContactShow,
      show.is_undersized ? "Yes" : "No",
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `evergreen-shows-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result)
    if (result.success) {
      fetchShows()
    }
  }

  /** Filtering */
  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableFields = [
          show.name,
          show.show_type,
          show.subnetwork_id,
          show.genre_name,
          show.primaryContactHost,
          show.primaryContactShow,
          show.host?.name,
          show.host?.email,
          show.host?.phone,
          show.showPrimaryContact?.name,
          show.showPrimaryContact?.email,
          show.showPrimaryContact?.phone,
          show.relationship,
          show.format,
          show.age_demographic,
          show.genderDemographic,
        ]
        const matchesSearch = searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(searchTerm),
        )
        if (!matchesSearch) return false
      }

      if (filters.subnetwork && filters.subnetwork !== "all" && show.subnetwork_id !== filters.subnetwork)
        return false
      if (filters.format && filters.format !== "all" && show.format !== filters.format) return false
      if (filters.relationship && filters.relationship !== "all" && show.relationship !== filters.relationship)
        return false
      if (filters.show_type && filters.show_type !== "all" && show.show_type.toLowerCase() !== filters.show_type)
        return false
      if (filters.genre_name && filters.genre_name !== "all" && show.genre_name !== filters.genre_name)
        return false
      if (filters.age_demographic && filters.age_demographic !== "all" && show.age_demographic !== filters.age_demographic)
        return false
      if (filters.genderDemographic && filters.genderDemographic !== "all" && show.genderDemographic !== filters.genderDemographic)
        return false
      if (filters.region && filters.region !== "all" && show.region !== filters.region)
        return false

      const booleanFilters: (keyof ShowFilters)[] = [
        "tentpole",
        "isOriginal",
        "is_active",
        "is_undersized",
        "hasSponsorshipRevenue",
        "hasNonEvergreenRevenue",
        "requiresPartnerLedgerAccess",
        "hasBrandedRevenue",
        "hasMarketingRevenue",
        "hasWebManagementRevenue",
      ]
      const showToFilterKeyMap: Record<string, keyof Show> = {
        tentpole: "isTentpole",
        is_undersized: "is_undersized",
      }

      for (const key of booleanFilters) {
        if (filters[key] && filters[key] !== "all") {
          const filterValue = filters[key] === "yes"
          const showKey = (showToFilterKeyMap[key] || key) as keyof Show
          if ((show as any)[showKey] !== filterValue) return false
        }
      }

      const numericFilters: { filterKey: keyof ShowFilters; showKey: keyof Show }[] = [
        { filterKey: "minimumGuarantee", showKey: "minimumGuarantee" },
        { filterKey: "showsPerYear", showKey: "showsPerYear" },
        { filterKey: "adSlots", showKey: "adSlots" },
        { filterKey: "averageLength", showKey: "averageLength" },
        { filterKey: "revenue2023", showKey: "revenue2023" },
        { filterKey: "revenue2024", showKey: "revenue2024" },
        { filterKey: "revenue2025", showKey: "revenue2025" },
      ]
      for (const { filterKey, showKey } of numericFilters) {
        if (filters[filterKey]) {
          const filterValue = Number.parseInt(filters[filterKey] as string, 10)
          const showValue = (show as any)[showKey] as number
          if (!isNaN(filterValue) && showValue < filterValue) return false
        }
      }

      if (filters.ownershipPercentage && filters.ownershipPercentage !== "all") {
        const ownership = Number.parseInt(filters.ownershipPercentage)
        if (show.ownershipPercentage !== ownership) return false
      }

      return true
    })
  }, [shows, filters])

  /** Active filter chips with individual clear buttons */
  type ActiveBadge = { label: string; value: string; key: keyof ShowFilters }
  const activeFilterBadges: ActiveBadge[] = useMemo(() => {
    const entries: ActiveBadge[] = []
    const pushKey = (label: string, key: keyof ShowFilters) => {
      const v = String(filters[key] ?? "")
      if (v && v !== "all") entries.push({ label, value: v, key })
    }

    // Search
    pushKey("Search", "search")

    // Show Information
    pushKey("Age Demographic", "age_demographic")
    pushKey("Format", "format")
    pushKey("Gender", "genderDemographic")
    pushKey("Genre", "genre_name")
    pushKey("Original", "isOriginal")
    pushKey("Region", "region")
    pushKey("Relationship", "relationship")
    pushKey("Show Status", "is_active")
    pushKey("Show Type", "show_type")
    pushKey("Subnetwork", "subnetwork")
    pushKey("Tentpole", "tentpole")
    pushKey("Undersized", "is_undersized")
    pushKey("Requires Partner Access", "requiresPartnerLedgerAccess")

    // Financial Information
    pushKey("Ad Slots ≥", "adSlots")
    pushKey("Avg Length ≥", "averageLength")
    pushKey("Min Guarantee ≥", "minimumGuarantee")
    pushKey("Revenue 2023 ≥", "revenue2023")
    pushKey("Revenue 2024 ≥", "revenue2024")
    pushKey("Revenue 2025 ≥", "revenue2025")
    pushKey("Shows/Year ≥", "showsPerYear")
    pushKey("Ownership %", "ownershipPercentage")
    pushKey("Branded Revenue", "hasBrandedRevenue")
    pushKey("Marketing Revenue", "hasMarketingRevenue")
    pushKey("Sponsorship Revenue", "hasSponsorshipRevenue")
    pushKey("Web Mgmt Revenue", "hasWebManagementRevenue")

    return entries
  }, [filters])

  const clearSingleFilter = (key: keyof ShowFilters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }))
  }

  /** Pagination */
  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)
  const [gotoInput, setGotoInput] = useState<string>("")

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredShows.length / PAGE_SIZE)),
    [filteredShows.length]
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const paginatedShows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredShows.slice(start, start + PAGE_SIZE)
  }, [filteredShows, page])

  const pageRangeStart = filteredShows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const pageRangeEnd = Math.min(page * PAGE_SIZE, filteredShows.length)

  const gotoPrev = () => setPage((p) => Math.max(1, p - 1))
  const gotoNext = () => setPage((p) => Math.min(totalPages, p + 1))

  const handleGoto = () => {
    const n = parseInt(gotoInput, 10)
    if (!isNaN(n)) setPage(Math.min(Math.max(1, n), totalPages))
    setGotoInput("")
  }

  useEffect(() => {
    setPage(1)
  }, [JSON.stringify(filters)])

  const viewingShow = viewingShowIndex !== null ? filteredShows[viewingShowIndex] : null

  const handleNavigate = (direction: "next" | "previous") => {
    if (viewingShowIndex === null) return
    const newIndex = direction === "next" ? viewingShowIndex + 1 : viewingShowIndex - 1
    if (newIndex >= 0 && newIndex < filteredShows.length) setViewingShowIndex(newIndex)
  }

  const getUniqueValues = (key: keyof Show) => {
    const values = shows.map((show) => (show as any)[key]) as (string | number)[]
    return [...new Set(values)]
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b)))
  }

  const getYesNoBadge = (value: boolean) => (
    <Badge
      className={`text-xs border pointer-events-none ${
        value
          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
          : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
      }`}
    >
      {value ? "Yes" : "No"}
    </Badge>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Shows Management
            </h1>
            <p className="text-muted-foreground">Loading shows...</p>
          </div>
        </div>
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Shows</h3>
            <p className="text-muted-foreground">Please wait while we fetch your shows...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Shows Management
            </h1>
            <p className="text-muted-foreground">Error loading shows</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Failed to load shows</div>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => fetchShows()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Shows Management
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "admin" ? "Manage all shows in the network" : "View your assigned shows"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {user?.role === "admin" && (
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center gap-2 bg-transparent"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          {user?.role === "admin" && (
            <Button className="evergreen-button" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Show
            </Button>
          )}
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <Alert variant={importResult.success ? "default" : "destructive"} className="relative">
          <div className="flex items-start gap-2">
            {importResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription>
                <div className="font-medium mb-1">{importResult.message}</div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Errors found:</p>
                    <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-xs">• {error}</li>
                      ))}
                    </ul>
                    {importResult.errors.length === 10 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ... and more errors. Please fix these issues and try again.
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => setImportResult(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Filters */}
      <Card className="evergreen-card">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors group px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Badge variant="secondary">
                    {filteredShows.length} show{filteredShows.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-4">

              {/* ---- Divider + Search ---- */}
              <div className="space-y-2">
                {/* <SectionDivider label="Search Shows" /> */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Shows</Label>
                    <Input
                    id="search"
                    placeholder="Search by name, type, genre, contact, etc..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>

              {/* ---- Divider + Show Information (alphabetical) ---- */}
              <div className="space-y-2">      {/* Section 2 */}
              <SectionDivider label="Show Information" />
              <div className="space-y-2">
                {/* <h4 className="text-sm font-semibold text-muted-foreground">Show Information</h4>  -- replaced by divider */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Age Demographic */}
                  <div className="space-y-2">
                    <Label>Age Demographic</Label>
                    <Select
                      value={filters.age_demographic}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, age_demographic: value }))
                      }
                    >
                      <SelectTrigger className={filters.age_demographic && filters.age_demographic !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All ages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55+">55+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={filters.format}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger className={filters.format && filters.format !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All formats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Formats</SelectItem>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender Demographic</Label>
                    <Select
                      value={filters.genderDemographic}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, genderDemographic: value }))
                      }
                    >
                      <SelectTrigger className={filters.genderDemographic && filters.genderDemographic !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All genders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        {getUniqueValues("genderDemographic").map((gender) => (
                          <SelectItem key={String(gender)} value={String(gender)}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select
                      value={filters.genre_name}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, genre_name: value }))}
                    >
                      <SelectTrigger className={filters.genre_name && filters.genre_name !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {getUniqueValues("genre_name").map((genre) => (
                          <SelectItem key={String(genre)} value={String(genre)}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Original */}
                  <div className="space-y-2">
                    <Label>Original Content</Label>
                    <Select
                      value={filters.isOriginal}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, isOriginal: value }))}
                    >
                      <SelectTrigger className={filters.isOriginal && filters.isOriginal !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All content" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Content</SelectItem>
                        <SelectItem value="yes">Original</SelectItem>
                        <SelectItem value="no">Not Original</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger className={filters.region && filters.region !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {getUniqueValues("region").map((region) => (
                          <SelectItem key={String(region)} value={String(region)} className="capitalize">
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select
                      value={filters.relationship}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger className={filters.relationship && filters.relationship !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All relationships" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Relationships</SelectItem>
                        <SelectItem value="Strong">Strong</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Weak">Weak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Status */}
                  <div className="space-y-2">
                    <Label>Show Status</Label>
                    <Select
                      value={filters.is_active}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, is_active: value }))}
                    >
                      <SelectTrigger className={filters.is_active && filters.is_active !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="yes">Active</SelectItem>
                        <SelectItem value="no">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Type */}
                  <div className="space-y-2">
                    <Label>Show Type</Label>
                    <Select
                      value={filters.show_type}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, show_type: value }))}
                    >
                      <SelectTrigger className={filters.show_type && filters.show_type !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All show types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Show Types</SelectItem>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="branded">Branded</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subnetwork */}
                  <div className="space-y-2">
                    <Label>Subnetwork</Label>
                    <Select
                      value={filters.subnetwork}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, subnetwork: value }))}
                    >
                      <SelectTrigger className={filters.subnetwork && filters.subnetwork !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All subnetworks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subnetworks</SelectItem>
                        {getUniqueValues("subnetwork_id").map((sub) => (
                          <SelectItem key={String(sub)} value={String(sub)}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tentpole */}
                  <div className="space-y-2">
                    <Label>Tentpole Show</Label>
                    <Select
                      value={filters.tentpole}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, tentpole: value }))}
                    >
                      <SelectTrigger className={filters.tentpole && filters.tentpole !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All shows" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shows</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Undersized */}
                  <div className="space-y-2">
                    <Label>Undersized Show</Label>
                    <Select
                      value={filters.is_undersized}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, is_undersized: value }))}
                    >
                      <SelectTrigger className={filters.is_undersized && filters.is_undersized !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All sizes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="yes">Undersized</SelectItem>
                        <SelectItem value="no">Not Undersized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Requires Partner Ledger Access */}
                  <div className="space-y-2">
                    <Label>Requires Partner Ledger Access</Label>
                    <Select
                      value={filters.requiresPartnerLedgerAccess}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, requiresPartnerLedgerAccess: value }))
                      }
                    >
                      <SelectTrigger className={filters.requiresPartnerLedgerAccess && filters.requiresPartnerLedgerAccess !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                </div>
              </div>

              {/* ---- Divider + Financial Information ---- */}
              <div className="space-y-2">      {/* Section 3 */}
              <SectionDivider label="Financial Information" />
              <div className="space-y-2">
                {/* <h4 className="text-sm font-semibold text-muted-foreground">Financial Information</h4> -- replaced by divider */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Ad Slots */}
                  <div className="space-y-2">
                    <Label>Ad Slots</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 3"
                      value={filters.adSlots}
                      onChange={(e) => setFilters((prev) => ({ ...prev, adSlots: e.target.value }))}
                      className={filters.adSlots ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Average Length */}
                  <div className="space-y-2">
                    <Label>Average Length (min)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 60"
                      value={filters.averageLength}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, averageLength: e.target.value }))
                      }
                      className={filters.averageLength ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Branded Revenue */}
                  <div className="space-y-2">
                    <Label>Has Branded Revenue</Label>
                    <Select
                      value={filters.hasBrandedRevenue}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, hasBrandedRevenue: value }))
                      }
                    >
                      <SelectTrigger className={filters.hasBrandedRevenue && filters.hasBrandedRevenue !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Marketing Revenue */}
                  <div className="space-y-2">
                    <Label>Has Marketing Revenue</Label>
                    <Select
                      value={filters.hasMarketingRevenue}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, hasMarketingRevenue: value }))
                      }
                    >
                      <SelectTrigger className={filters.hasMarketingRevenue && filters.hasMarketingRevenue !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sponsorship Revenue */}
                  <div className="space-y-2">
                    <Label>Has Sponsorship Revenue</Label>
                    <Select
                      value={filters.hasSponsorshipRevenue}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, hasSponsorshipRevenue: value }))
                      }
                    >
                      <SelectTrigger className={filters.hasSponsorshipRevenue && filters.hasSponsorshipRevenue !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Web Mgmt Revenue */}
                  <div className="space-y-2">
                    <Label>Has Web Mngmt Revenue</Label>
                    <Select
                      value={filters.hasWebManagementRevenue}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, hasWebManagementRevenue: value }))
                      }
                    >
                      <SelectTrigger className={filters.hasWebManagementRevenue && filters.hasWebManagementRevenue !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Guarantee */}
                  <div className="space-y-2">
                    <Label>Minimum Guarantee ($)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={filters.minimumGuarantee}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, minimumGuarantee: e.target.value }))
                      }
                      className={filters.minimumGuarantee ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Ownership % */}
                  <div className="space-y-2">
                    <Label>Ownership %</Label>
                    <Select
                      value={filters.ownershipPercentage}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, ownershipPercentage: value }))
                      }
                    >
                      <SelectTrigger className={filters.ownershipPercentage && filters.ownershipPercentage !== "all" ? "ring-1 ring-emerald-400" : ""}>
                        <SelectValue placeholder="All ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ownership</SelectItem>
                        {getUniqueValues("ownershipPercentage").map((percentage) => (
                          <SelectItem key={String(percentage)} value={String(percentage)}>
                            {percentage}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Revenue 2023 */}
                  <div className="space-y-2">
                    <Label>Revenue 2023 ($) ≥</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10000"
                      value={filters.revenue2023}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, revenue2023: e.target.value }))
                      }
                      className={filters.revenue2023 ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Revenue 2024 */}
                  <div className="space-y-2">
                    <Label>Revenue 2024 ($) ≥</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      value={filters.revenue2024}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, revenue2024: e.target.value }))
                      }
                      className={filters.revenue2024 ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Revenue 2025 */}
                  <div className="space-y-2">
                    <Label>Revenue 2025 ($) ≥</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 20000"
                      value={filters.revenue2025}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, revenue2025: e.target.value }))
                      }
                      className={filters.revenue2025 ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>

                  {/* Shows/Year */}
                  <div className="space-y-2">
                    <Label>Shows/Year ≥</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 52"
                      value={filters.showsPerYear}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, showsPerYear: e.target.value }))
                      }
                      className={filters.showsPerYear ? "ring-1 ring-emerald-400" : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex items-start justify-between gap-2 pt-2">
            {/* Chips area */}
            <div className="flex flex-wrap gap-2 max-w-[85%]">
              {activeFilterBadges.map((f, idx) => (
                <Badge
                  key={`${f.label}-${f.value}-${idx}`}
                  className="text-xs border bg-emerald-100 text-emerald-800 border-emerald-300
             dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700
             flex items-center gap-1 hover:bg-emerald-100 hover:text-emerald-800
             dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300"
                >
                  <span>{f.label}: {f.value}</span>
                  <button
                    type="button"
                    aria-label={`Clear ${f.label}`}
                    className="ml-1 rounded hover:opacity-80"
                    onClick={() => clearSingleFilter(f.key)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Fixed button */}
            <div className="flex-shrink-0">
              <Button variant="outline" onClick={handleClearFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </div>


            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* TOP TOOLBAR: Selection (left) + Pagination (right) */}
      {filteredShows.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2 bg-transparent"
            >
              <Check className="h-4 w-4" />
              {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">{selectedShows.size} selected</span>
            {selectedShows.size > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedShows(new Set())}>
                  Clear Selection
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBulkDeleting ? "Deleting..." : "Delete Selected Shows"}
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              <span className="font-medium">{pageRangeStart}</span>–<span className="font-medium">{pageRangeEnd}</span> of{" "}
              <span className="font-medium">{filteredShows.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Label htmlFor="page-input" className="text-xs text-muted-foreground">Go to</Label>
                <Input
                  id="page-input"
                  type="number"
                  min={1}
                  max={totalPages}
                  value={gotoInput}
                  onChange={(e) => setGotoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoto()
                  }}
                  className="h-8 w-20"
                />
                <Button variant="outline" size="sm" onClick={handleGoto}>Go</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shows Display */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {paginatedShows.map((show) => (
            <Card
              key={show.id}
              className={`evergreen-card transition-all duration-200 group flex flex-col h-full ${
                selectedShows.has(show.id)
                  ? "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : ""
              }`}
            >
              <CardHeader className="flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedShows.has(show.id)}
                      onCheckedChange={() => handleSelectShow(show.id)}
                      className="mt-1"
                    />
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors flex-1 line-clamp-2 leading-tight">
                      {show.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 capitalize pointer-events-none">
                      {show.show_type}
                    </Badge>
                    <Badge
                      className={`text-xs border pointer-events-none ${
                        show.isTentpole
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                      }`}
                    >
                      {`Tentpole - ${show.isTentpole ? "Yes" : "No"}`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Standard & Programmatic split rows */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Standard Split</span>
                      <span className="font-medium">
                        {formatPercentage(getStandardSplit(show))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Programmatic Split</span>
                      <span className="font-medium">
                        {formatPercentage(getProgrammaticSplit(show))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 bg-transparent"
                    onClick={() => handleViewShow(show)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {user?.role === "admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2 bg-transparent">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditShow(show)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={() => handleDeleteShow(show)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="evergreen-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-sm">
                    <th className="p-4 w-12">
                      <Checkbox
                        checked={selectedShows.size === filteredShows.length && filteredShows.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-2 font-semibold">Show Name</th>
                    {/* Status column removed; new Tentpole column added */}
                    <th className="p-2 font-semibold">Type</th>
                    <th className="p-2 font-semibold">Tentpole</th>
                    {/* Genre & Format removed */}
                    <th className="p-2 font-semibold">Standard Split</th>
                    <th className="p-2 font-semibold">Programmatic Split</th>
                    <th className="p-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShows.map((show) => (
                    <tr
                      key={show.id}
                      className={`border-b hover:bg-accent/50 transition-colors ${
                        selectedShows.has(show.id)
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                          : ""
                      }`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedShows.has(show.id)}
                          onCheckedChange={() => handleSelectShow(show.id)}
                        />
                      </td>
                      <td className="p-2 font-medium">
                        <span className="cursor-pointer hover:underline" onClick={() => handleViewShow(show)}>
                          {show.name}
                        </span>
                      </td>
                      <td className="p-2 capitalize">{show.show_type}</td>
                      <td className="p-2">{getYesNoBadge(!!show.isTentpole)}</td>

                      <td className="p-2">{formatPercentage(getStandardSplit(show))}</td>
                      <td className="p-2">{formatPercentage(getProgrammaticSplit(show))}</td>

                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 bg-transparent"
                            onClick={() => handleViewShow(show)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {user?.role === "admin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-2 bg-transparent">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditShow(show)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-700"
                                  onClick={() => handleDeleteShow(show)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredShows.length === 0 && (
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shows found</h3>
            <p className="text-muted-foreground">
              {user?.role === "admin"
                ? "Try adjusting your filters or create a new show."
                : "No shows match your current filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* BOTTOM TOOLBAR */}
      {filteredShows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2 bg-transparent"
            >
              <Check className="h-4 w-4" />
              {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">{selectedShows.size} selected</span>
            {selectedShows.size > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedShows(new Set())}>
                  Clear Selection
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBulkDeleting ? "Deleting..." : "Delete Selected Shows"}
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              <span className="font-medium">{pageRangeStart}</span>–<span className="font-medium">{pageRangeEnd}</span> of{" "}
              <span className="font-medium">{filteredShows.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Label htmlFor="page-input" className="text-xs text-muted-foreground">Go to</Label>
                <Input
                  id="page-input"
                  type="number"
                  min={1}
                  max={totalPages}
                  value={gotoInput}
                  onChange={(e) => setGotoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoto()
                  }}
                  className="h-8 w-20"
                />
                <Button variant="outline" size="sm" onClick={handleGoto}>Go</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateShowDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        editingShow={editingShow}
        onShowUpdated={handleShowUpdated}
        createShow={createShow}
        updateShow={updateShow}
        existingShows={shows}
        onEditExistingShow={handleEditExistingShow}
      />
      <DeleteShowDialog
        open={!!deletingShow}
        onOpenChange={(open) => !open && setDeletingShow(null)}
        show={deletingShow}
        onShowDeleted={handleShowDeleted}
        deleteShow={deleteShow}
      />
      <ImportCSVDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
      <ShowViewDialog
        open={viewingShowIndex !== null}
        onOpenChange={(open) => !open && setViewingShowIndex(null)}
        show={viewingShow}
        onNavigate={handleNavigate}
        hasNext={viewingShowIndex !== null && viewingShowIndex < filteredShows.length - 1}
        hasPrevious={viewingShowIndex !== null && viewingShowIndex > 0}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Selected Shows
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to delete {selectedShows.size} selected show{selectedShows.size > 1 ? 's' : ''}?</p>
                <p>This action cannot be undone and will permanently remove:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>All show data and settings</li>
                  <li>Associated revenue records</li>
                  <li>Partner access permissions</li>
                  <li>Historical performance data</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isBulkDeleting ? "Deleting..." : `Delete ${selectedShows.size} Show${selectedShows.size > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

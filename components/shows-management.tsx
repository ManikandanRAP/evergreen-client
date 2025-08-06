"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useShows } from "@/hooks/use-shows"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Filter,
  Edit,
  Eye,
  DollarSign,
  Calendar,
  Users,
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
  RotateCcw,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import CreateShowDialog from "@/components/create-show-dialog"
import DeleteShowDialog from "@/components/delete-show-dialog"
import ImportCSVDialog from "@/components/import-csv-dialog"
import ShowViewDialog from "@/components/show-view-dialog"
import type { Show } from "@/lib/show-types"
import { Checkbox } from "@/components/ui/checkbox"

interface ShowFilters {
  search: string
  minimumGuarantee: string
  subnetwork: string
  format: string
  tentpole: string
  relationship: string
  showType: string
  genre_name: string
  hasSponsorshipRevenue: string
  hasNonEvergreenRevenue: string
  requiresPartnerLedgerAccess: string
  isOriginal: string
  isActive: string
  ageDemographic: string
  genderDemographic: string
  ownershipPercentage: string
  region: string
  isUndersized: string
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
  showType: "",
  genre_name: "",
  hasSponsorshipRevenue: "",
  hasNonEvergreenRevenue: "",
  requiresPartnerLedgerAccess: "",
  isOriginal: "",
  isActive: "",
  ageDemographic: "",
  genderDemographic: "",
  ownershipPercentage: "",
  region: "",
  isUndersized: "",
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

export default function ShowsManagement() {
  const { user } = useAuth()
  const { shows, loading, error, createShow, updateShow, deleteShow, fetchShows } = useShows()

  const [filters, setFilters] = useState<ShowFilters>(initialFilters)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [viewingShow, setViewingShow] = useState<Show | null>(null)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [deletingShow, setDeletingShow] = useState<Show | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [selectedShows, setSelectedShows] = useState<Set<string>>(new Set())
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleClearFilters = () => {
    setFilters(initialFilters)
  }

  const handleViewShow = (show: Show) => {
    setViewingShow(show)
  }

  const handleEditShow = (show: Show) => {
    console.log("Editing show:", show)
    setEditingShow(show)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteShow = (show: Show) => {
    setDeletingShow(show)
  }

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
    const newSelected = new Set(selectedShows)
    if (newSelected.has(showId)) {
      newSelected.delete(showId)
    } else {
      newSelected.add(showId)
    }
    setSelectedShows(newSelected)
  }

  const handleExportCSV = () => {
    const showsToExport =
      selectedShows.size > 0 ? filteredShows.filter((show) => selectedShows.has(show.id)) : filteredShows

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
      show.showType,
      show.selectType,
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
      show.isActive ? "Yes" : "No",
      show.ageDemographic,
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
      show.isUndersized ? "Yes" : "No",
    ])

    const csvContent = [csvHeaders, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

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

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      // Enhanced multi-field search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableFields = [
          show.name,
          show.showType,
          show.selectType,
          show.subnetwork,
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
          show.ageDemographic,
          show.genderDemographic,
        ]

        const matchesSearch = searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(searchTerm),
        )

        if (!matchesSearch) return false
      }

      // --- Text & Dropdown Filters ---
      if (filters.subnetwork && filters.subnetwork !== "all" && show.subnetwork_id !== filters.subnetwork) return false
      if (filters.format && filters.format !== "all" && show.format !== filters.format) return false
      if (filters.relationship && filters.relationship !== "all" && show.relationship !== filters.relationship) return false
      if (filters.showType && filters.showType !== "all" && show.showType.toLowerCase() !== filters.showType) return false
      if (filters.genre_name && filters.genre_name !== "all" && show.genre_name !== filters.genre_name) return false
      if (filters.ageDemographic && filters.ageDemographic !== "all" && show.ageDemographic !== filters.ageDemographic) return false
      if (filters.genderDemographic && filters.genderDemographic !== "all" && show.genderDemographic !== filters.genderDemographic) return false
      if (filters.region && filters.region !== "all" && show.region !== filters.region) return false

      // --- Boolean (Yes/No) Filters ---
      const booleanFilters: (keyof ShowFilters)[] = [
        "tentpole",
        "isOriginal",
        "isActive",
        "isUndersized",
        "hasSponsorshipRevenue",
        "hasNonEvergreenRevenue",
        "requiresPartnerLedgerAccess",
        "hasBrandedRevenue",
        "hasMarketingRevenue",
        "hasWebManagementRevenue",
      ]
      const showToFilterKeyMap: Record<string, keyof Show> = {
        tentpole: "isTentpole",
        isUndersized: "isUndersized",
      }

      for (const key of booleanFilters) {
        if (filters[key] && filters[key] !== "all") {
          const filterValue = filters[key] === "yes"
          const showKey = (showToFilterKeyMap[key] || key) as keyof Show
          if (show[showKey] !== filterValue) return false
        }
      }

      // --- Numeric Filters ---
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
          const showValue = show[showKey] as number
          if (!isNaN(filterValue) && showValue < filterValue) return false
        }
      }

      // --- Ownership Percentage Filter ---
      if (filters.ownershipPercentage && filters.ownershipPercentage !== "all") {
        const ownership = Number.parseInt(filters.ownershipPercentage)
        if (show.ownershipPercentage !== ownership) return false
      }

      return true
    })
  }, [shows, filters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getUniqueValues = (key: keyof Show) => {
    const values = shows.map((show) => show[key]) as (string | number)[]
    return [...new Set(values)].filter(Boolean).sort((a,b) => String(a).localeCompare(String(b)))
  }

  const getRelationshipBadgeClass = (relationship: string) => {
    switch (relationship) {
      case "Strong":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
      case "Weak":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
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
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => fetchShows()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2 bg-transparent">
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
                        <li key={index} className="text-xs">
                          • {error}
                        </li>
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
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2 col-span-1 xl:col-span-4">
                  <Label htmlFor="search">Search Shows</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, type, genre, contact, etc..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                {/* --- Main Dropdowns --- */}
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={filters.format} onValueChange={(value) => setFilters((prev) => ({ ...prev, format: value }))}>
                    <SelectTrigger><SelectValue placeholder="All formats" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="Audio">Audio</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subnetwork</Label>
                  <Select value={filters.subnetwork} onValueChange={(value) => setFilters((prev) => ({ ...prev, subnetwork: value }))}>
                    <SelectTrigger><SelectValue placeholder="All subnetworks" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subnetworks</SelectItem>
                      {getUniqueValues("subnetwork_id").map((sub) => (
                        <SelectItem key={String(sub)} value={String(sub)}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select value={filters.genre_name} onValueChange={(value) => setFilters((prev) => ({ ...prev, genre_name: value }))}>
                    <SelectTrigger><SelectValue placeholder="All Genres" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {getUniqueValues("genre_name").map((genre) => (
                        <SelectItem key={String(genre)} value={String(genre)}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select value={filters.relationship} onValueChange={(value) => setFilters((prev) => ({ ...prev, relationship: value }))}>
                    <SelectTrigger><SelectValue placeholder="All relationships" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Relationships</SelectItem>
                      <SelectItem value="Strong">Strong</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Weak">Weak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Show Type</Label>
                  <Select value={filters.showType} onValueChange={(value) => setFilters((prev) => ({ ...prev, showType: value }))}>
                    <SelectTrigger><SelectValue placeholder="All show types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Show Types</SelectItem>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="branded">Branded</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ownership %</Label>
                  <Select value={filters.ownershipPercentage} onValueChange={(value) => setFilters((prev) => ({ ...prev, ownershipPercentage: value }))}>
                    <SelectTrigger><SelectValue placeholder="All ownership" /></SelectTrigger>
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
                
                {/* --- Demographics --- */}
                <div className="space-y-2">
                  <Label>Age Demographic</Label>
                  <Select value={filters.ageDemographic} onValueChange={(value) => setFilters((prev) => ({ ...prev, ageDemographic: value }))}>
                    <SelectTrigger><SelectValue placeholder="All ages" /></SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Gender Demographic</Label>
                  <Select value={filters.genderDemographic} onValueChange={(value) => setFilters((prev) => ({ ...prev, genderDemographic: value }))}>
                    <SelectTrigger><SelectValue placeholder="All genders" /></SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={filters.region} onValueChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}>
                    <SelectTrigger><SelectValue placeholder="All Regions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {getUniqueValues("region").map((region) => (
                        <SelectItem key={String(region)} value={String(region)} className="capitalize">{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* --- Boolean Statuses --- */}
                <div className="space-y-2">
                  <Label>Tentpole Show</Label>
                  <Select value={filters.tentpole} onValueChange={(value) => setFilters((prev) => ({ ...prev, tentpole: value }))}>
                    <SelectTrigger><SelectValue placeholder="All shows" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shows</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Undersized Show</Label>
                  <Select value={filters.isUndersized} onValueChange={(value) => setFilters((prev) => ({ ...prev, isUndersized: value }))}>
                    <SelectTrigger><SelectValue placeholder="All sizes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="yes">Undersized</SelectItem>
                      <SelectItem value="no">Not Undersized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Original Content</Label>
                  <Select value={filters.isOriginal} onValueChange={(value) => setFilters((prev) => ({ ...prev, isOriginal: value }))}>
                    <SelectTrigger><SelectValue placeholder="All content" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="yes">Original</SelectItem>
                      <SelectItem value="no">Not Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Show Status</Label>
                  <Select value={filters.isActive} onValueChange={(value) => setFilters((prev) => ({ ...prev, isActive: value }))}>
                    <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="yes">Active</SelectItem>
                      <SelectItem value="no">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* --- Revenue Flags --- */}
                <div className="space-y-2">
                  <Label>Has Branded Revenue</Label>
                  <Select value={filters.hasBrandedRevenue} onValueChange={(value) => setFilters((prev) => ({ ...prev, hasBrandedRevenue: value }))}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Has Marketing Revenue</Label>
                  <Select value={filters.hasMarketingRevenue} onValueChange={(value) => setFilters((prev) => ({ ...prev, hasMarketingRevenue: value }))}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Has Web Mngmt Revenue</Label>
                  <Select value={filters.hasWebManagementRevenue} onValueChange={(value) => setFilters((prev) => ({ ...prev, hasWebManagementRevenue: value }))}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sponsorship Revenue</Label>
                  <Select value={filters.hasSponsorshipRevenue} onValueChange={(value) => setFilters((prev) => ({ ...prev, hasSponsorshipRevenue: value }))}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* --- Numeric Inputs --- */}
                <div className="space-y-2">
                  <Label>Min. Guarantee ($)</Label>
                  <Input type="number" placeholder="e.g. 5000" value={filters.minimumGuarantee} onChange={(e) => setFilters((prev) => ({ ...prev, minimumGuarantee: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Shows/Year</Label>
                  <Input type="number" placeholder="e.g. 52" value={filters.showsPerYear} onChange={(e) => setFilters((prev) => ({ ...prev, showsPerYear: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Ad Slots</Label>
                  <Input type="number" placeholder="e.g. 3" value={filters.adSlots} onChange={(e) => setFilters((prev) => ({ ...prev, adSlots: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Avg Length (min)</Label>
                  <Input type="number" placeholder="e.g. 60" value={filters.averageLength} onChange={(e) => setFilters((prev) => ({ ...prev, averageLength: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Revenue 2023 ($)</Label>
                  <Input type="number" placeholder="e.g. 10000" value={filters.revenue2023} onChange={(e) => setFilters((prev) => ({ ...prev, revenue2023: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Revenue 2024 ($)</Label>
                  <Input type="number" placeholder="e.g. 15000" value={filters.revenue2024} onChange={(e) => setFilters((prev) => ({ ...prev, revenue2024: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Min. Revenue 2025 ($)</Label>
                  <Input type="number" placeholder="e.g. 20000" value={filters.revenue2025} onChange={(e) => setFilters((prev) => ({ ...prev, revenue2025: e.target.value }))} />
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

      {/* Selection Controls */}
      {filteredShows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2 bg-transparent"
            >
              <Check className="h-4 w-4" />
              {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedShows.size} of {filteredShows.length} shows selected
            </span>
          </div>
          {selectedShows.size > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSelectedShows(new Set())}>
              Clear Selection
            </Button>
          )}
        </div>
      )}

      {/* Shows Display */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredShows.map((show) => (
            <Card
              key={show.id}
              className={`evergreen-card transition-all duration-200 group flex flex-col h-full ${
                selectedShows.has(show.id) ? "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : ""
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
                      {show.showType}
                    </Badge>
                    <Badge className={`text-xs border pointer-events-none ${show.isTentpole 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700' 
                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'}`}>
                      Tentpole - {show.isTentpole ? 'Yes' : 'No'}
                    </Badge>
                    <Badge className={`text-xs border pointer-events-none ${show.isUndersized 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700' 
                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'}`}>
                      Undersized - {show.isUndersized ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-muted-foreground">Min Guarantee:</span>
                    </div>
                    <span className="font-medium">{formatCurrency(show.minimumGuarantee)}</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      <span className="text-muted-foreground">Age:</span>
                    </div>
                    <span className="font-medium">{show.ageMonths} months</span>
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Shows/Year:</span>
                    </div>
                    <span className="font-medium">{show.showsPerYear}</span>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-muted-foreground">Relationship:</span>
                    </div>
                    <Badge
                      className={`text-xs border justify-self-start pointer-events-none ${getRelationshipBadgeClass(show.relationship)}`}
                    >
                      {show.relationship}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Revenue Split:</span>
                      <div className="flex gap-2">
                        <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 pointer-events-none">
                          EG: {show.revenueSplit.evergreen}%
                        </Badge>
                        <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 pointer-events-none">
                          Partner: {show.revenueSplit.partner}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 pt-2 border-t border-border/50">
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
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 bg-transparent"
                        onClick={() => handleEditShow(show)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
                        onClick={() => handleDeleteShow(show)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
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
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 w-12">
                      <Checkbox
                        checked={selectedShows.size === filteredShows.length && filteredShows.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 font-medium">Show Name</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Genre</th>
                    <th className="p-4 font-medium">Format</th>
                    <th className="p-4 font-medium">Relationship</th>
                    <th className="p-4 font-medium">Min Guarantee</th>
                    <th className="p-4 font-medium">Age</th>
                    <th className="p-4 font-medium">Shows/Year</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShows.map((show) => (
                    <tr
                      key={show.id}
                      className={`border-b hover:bg-accent/50 transition-colors ${
                        selectedShows.has(show.id) ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedShows.has(show.id)}
                          onCheckedChange={() => handleSelectShow(show.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{show.name}</p>
                          <div className="flex gap-1">
                            {show.isTentpole && (
                              <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                                Tentpole
                              </Badge>
                            )}
                            {show.isOriginal && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                Original
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {show.selectType}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                          {show.genre_name}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                          {show.format}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`text-xs border ${getRelationshipBadgeClass(show.relationship)}`}
                        >
                          {show.relationship}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium text-emerald-600">{formatCurrency(show.minimumGuarantee)}</td>
                      <td className="p-4">{show.ageMonths}m</td>
                      <td className="p-4">{show.showsPerYear}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs bg-transparent"
                            onClick={() => handleViewShow(show)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {user?.role === "admin" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs bg-transparent"
                                onClick={() => handleEditShow(show)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
                                onClick={() => handleDeleteShow(show)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
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

      <CreateShowDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        editingShow={editingShow}
        onShowUpdated={handleShowUpdated}
        createShow={createShow}
        updateShow={updateShow}
        existingShows={shows}
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
      <ShowViewDialog open={!!viewingShow} onOpenChange={(open) => !open && setViewingShow(null)} show={viewingShow} />
    </div>
  )
}

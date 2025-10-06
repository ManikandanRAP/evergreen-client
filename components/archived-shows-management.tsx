"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUserMapping } from "@/hooks/use-user-mapping"
import { apiClient, Show } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRankingInfo } from "@/lib/ranking-utils"
import {
  Plus,
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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MoreVertical,
  MoreHorizontal,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Archive,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteShowDialog from "@/components/delete-show-dialog"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AnimatedSwitcher from "@/components/animated-switcher"

// Mobile Toolbar Components
const MobileTopToolbar = ({ 
  selectedShows, 
  filteredShows, 
  handleSelectAll, 
  handleBulkUnarchive, 
  handleBulkDelete, 
  isBulkUnarchiving, 
  isBulkDeleting, 
  user, 
  page, 
  totalPages, 
  gotoPrev, 
  gotoNext 
}: {
  selectedShows: Set<string>
  filteredShows: Show[]
  handleSelectAll: () => void
  handleBulkUnarchive: () => void
  handleBulkDelete: () => void
  isBulkUnarchiving: boolean
  isBulkDeleting: boolean
  user: any
  page: number
  totalPages: number
  gotoPrev: () => void
  gotoNext: () => void
}) => (
  <div className="md:hidden space-y-3">
    {/* First line: Pagination (centered) */}
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Second line: Selected count and Select All button - same line */}
    <div className="flex items-center justify-between gap-2">
      {/* Selected count on left */}
      <div className="px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 h-9 border border-input bg-background rounded-md">
        <span className="text-sm font-bold leading-none">{selectedShows.size}</span>
        <span className="text-xs text-muted-foreground leading-none">Selected</span>
      </div>
      
      {/* Select All button on right */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectAll}
        className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border flex-1"
      >
        <Check className="h-4 w-4" />
        {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
        </Button>
    </div>

    {/* Third line: Archive and delete buttons - separate lines */}
    {selectedShows.size > 0 && (
      <div className="space-y-2">
        {user?.role === "admin" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBulkUnarchive}
            disabled={isBulkUnarchiving}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
          </Button>
        )}
        {user?.role === "admin" && (
          <Button 
            size="sm" 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isBulkDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        )}
      </div>
    )}
  </div>
)

const MobileBottomToolbar = ({ 
  selectedShows, 
  filteredShows, 
  handleSelectAll, 
  handleBulkUnarchive, 
  handleBulkDelete, 
  isBulkUnarchiving, 
  isBulkDeleting, 
  user, 
  page, 
  totalPages, 
  gotoPrev, 
  gotoNext 
}: {
  selectedShows: Set<string>
  filteredShows: Show[]
  handleSelectAll: () => void
  handleBulkUnarchive: () => void
  handleBulkDelete: () => void
  isBulkUnarchiving: boolean
  isBulkDeleting: boolean
  user: any
  page: number
  totalPages: number
  gotoPrev: () => void
  gotoNext: () => void
}) => (
  <div className="md:hidden space-y-3">
    {/* First line: Selected count and Select All button - same line */}
    <div className="flex items-center justify-between gap-2">
      {/* Selected count on left */}
      <div className="px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 h-9 border border-input bg-background rounded-md">
        <span className="text-sm font-bold leading-none">{selectedShows.size}</span>
        <span className="text-xs text-muted-foreground leading-none">Selected</span>
      </div>
      
      {/* Select All button on right */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectAll}
        className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border flex-1"
      >
        <Check className="h-4 w-4" />
        {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
      </Button>
    </div>

    {/* Second line: Archive and delete buttons - separate lines */}
    {selectedShows.size > 0 && (
      <div className="space-y-2">
        {user?.role === "admin" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBulkUnarchive}
            disabled={isBulkUnarchiving}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
          </Button>
        )}
        {user?.role === "admin" && (
          <Button 
            size="sm" 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isBulkDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        )}
      </div>
    )}

    {/* Third line: Pagination (centered) */}
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
)

interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

/** Helpers for Standard/Programmatic Splits displayed in views */
const formatPercentage = (n: number | null | undefined) =>
  n === null || typeof n === "undefined" ? "N/A" : `${n}%`

const getStandardSplit = (show: Show) =>
  show.standard_ads_percent ?? null

const getProgrammaticSplit = (show: Show) =>
  show.programmatic_ads_span_percent ?? null

export default function ArchivedShowsManagement() {
  const { user } = useAuth()
  const { getUserName, fetchUsers } = useUserMapping()
  const [archivedShows, setArchivedShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingShowIndex, setViewingShowIndex] = useState<number | null>(null)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [deletingShow, setDeletingShow] = useState<Show | null>(null)

  /** Default to LIST view (as per earlier change) */
  const [viewMode, setViewMode] = useState<"cards" | "list">("list")

  const [selectedShows, setSelectedShows] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [isBulkUnarchiving, setIsBulkUnarchiving] = useState(false)
  const [showBulkUnarchiveConfirm, setShowBulkUnarchiveConfirm] = useState(false)
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false)
  const [showingUnarchiveShow, setShowingUnarchiveShow] = useState<Show | null>(null)

  // Sorting state
  type SortField = 'name' | 'show_type' | 'isRateCard' | 'standardSplit' | 'programmaticSplit' | 'ranking_category' | 'archived_by' | 'archived_at'
  type SortDirection = 'asc' | 'desc' | null
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const fetchArchivedShows = async () => {
    setLoading(true)
    setError(null)
    try {
      const shows = await apiClient.getArchivedShows()
      setArchivedShows(shows)
      
      // Fetch user data for archived_by_id fields
      const userIds: string[] = []
      shows.forEach(show => {
        if (show.archived_by_id && show.archived_by_id !== 'system' && show.archived_by_id !== 'unknown') {
          userIds.push(show.archived_by_id)
        }
      })
      if (userIds.length > 0) {
        fetchUsers(userIds)
      }
    } catch (error: any) {
      console.error("Failed to fetch archived shows:", error)
      setError(error.message || "Failed to load archived shows")
    } finally {
      setLoading(false)
    }
  }

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      // New field, start with ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />
  }

  const handleViewShow = (show: Show) => {
    const index = filteredShows.findIndex((s) => s.id === show.id)
    if (index !== -1) setViewingShowIndex(index)
  }

  const handleEditShow = (show: Show) => {
    setEditingShow(show)
    // Note: Edit functionality removed for archived shows
  }

  const handleDeleteShow = (show: Show) => {
    setDeletingShow(show)
    setViewingShowIndex(null) // Close the show view dialog
  }

  const handleUnarchiveShow = (show: Show) => {
    setShowingUnarchiveShow(show)
    setShowUnarchiveConfirm(true)
  }

  const handleConfirmUnarchiveShow = async () => {
    if (!showingUnarchiveShow) return

    try {
      await apiClient.unarchiveShow(showingUnarchiveShow.id)
      await fetchArchivedShows()
      setShowUnarchiveConfirm(false)
      setShowingUnarchiveShow(null)
      toast.success("Show unarchived successfully")
    } catch (error) {
      // Error handling is done in the API client
    }
  }

  const handleUnarchiveFromDialog = (show: Show) => {
    setShowingUnarchiveShow(show)
    setShowUnarchiveConfirm(true)
    // Close the show view dialog first
    setViewingShowIndex(null)
  }

  const handleShowDeleted = async () => {
    setDeletingShow(null)
    await fetchArchivedShows()
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

  const handleBulkUnarchive = () => {
    setShowBulkUnarchiveConfirm(true)
  }

  const handleConfirmBulkUnarchive = async () => {
    if (selectedShows.size === 0) return

    setIsBulkUnarchiving(true)
    try {
      const selectedShowIds = Array.from(selectedShows)
      
      // Use the new bulk unarchive API
      const result = await apiClient.bulkUnarchiveShows(selectedShowIds)
      
      // Clear selection after unarchiving
      setSelectedShows(new Set())
      
      // Show appropriate success/error message
      if (result.failed === 0) {
        toast.success(`Successfully unarchived all ${result.successful} selected shows!`)
      } else if (result.successful > 0) {
        toast.warning(`Unarchived ${result.successful} shows, ${result.failed} failed`)
      } else {
        toast.error(`Failed to unarchive any shows. ${result.message || 'Unknown error'}`)
      }

      // Refresh the archived shows list
      await fetchArchivedShows()
    } catch (error: any) {
      console.error("Bulk unarchive error:", error)
      toast.error(error.message || "Failed to unarchive shows")
    } finally {
      setIsBulkUnarchiving(false)
      setShowBulkUnarchiveConfirm(false)
    }
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
        toast.error(`Failed to delete any shows. ${result.message || 'Unknown error'}`)
      }

      // Refresh the archived shows list
      await fetchArchivedShows()
    } catch (error: any) {
      console.error("Bulk delete failed:", error)
      toast.error(error.message || "Failed to delete selected shows")
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  // Note: Export and import functionality removed for archived shows

  /** Filtering and Sorting */
  const filteredShows = useMemo(() => {
    let filtered = archivedShows.filter((show) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const searchableFields = [
          show.title,
          show.show_type,
          show.subnetwork_id,
          show.genre_name,
          show.show_host_contact,
          show.show_primary_contact,
          show.relationship_level,
          show.media_type,
          show.age_demographic,
          show.gender,
        ]
        const matchesSearch = searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(searchLower),
        )
        if (!matchesSearch) return false
      }


      return true
    })

    // Apply sorting if specified
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortField) {
          case 'name':
            aValue = a.title?.toLowerCase() || ''
            bValue = b.title?.toLowerCase() || ''
            break
          case 'show_type':
            aValue = a.show_type?.toLowerCase() || ''
            bValue = b.show_type?.toLowerCase() || ''
            break
          case 'isRateCard':
            aValue = a.rate_card ? 1 : 0
            bValue = b.rate_card ? 1 : 0
            break
          case 'standardSplit':
            aValue = getStandardSplit(a) || 0
            bValue = getStandardSplit(b) || 0
            break
          case 'programmaticSplit':
            aValue = getProgrammaticSplit(a) || 0
            bValue = getProgrammaticSplit(b) || 0
            break
          case 'ranking_category':
            aValue = a.ranking_category ? parseInt(a.ranking_category) : 0
            bValue = b.ranking_category ? parseInt(b.ranking_category) : 0
            break
          case 'archived_by':
            aValue = getUserName(a.archived_by_id, a.archived_by)?.toLowerCase() || ''
            bValue = getUserName(b.archived_by_id, b.archived_by)?.toLowerCase() || ''
            break
          case 'archived_at':
            aValue = a.archived_at ? new Date(a.archived_at).getTime() : 0
            bValue = b.archived_at ? new Date(b.archived_at).getTime() : 0
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [archivedShows, searchTerm, sortField, sortDirection])


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
  }, [searchTerm])

  useEffect(() => {
    fetchArchivedShows()
  }, [])

  const viewingShow = viewingShowIndex !== null ? filteredShows[viewingShowIndex] : null

  const handleNavigate = (direction: "next" | "previous") => {
    if (viewingShowIndex === null) return
    const newIndex = direction === "next" ? viewingShowIndex + 1 : viewingShowIndex - 1
    if (newIndex >= 0 && newIndex < filteredShows.length) setViewingShowIndex(newIndex)
  }

  // Note: getUniqueValues removed as filters are not used in archived shows

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
              Archived Shows
            </h1>
            <p className="text-muted-foreground">Loading archived shows...</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Archived Shows</h3>
            <p className="text-muted-foreground">Please wait while we fetch your archived shows...</p>
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
              Archived Shows
            </h1>
            <p className="text-muted-foreground">Error loading archived shows</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Failed to load archived shows</div>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => fetchArchivedShows()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Mobile: Title/Description and Switcher on same line */}
        <div className="flex items-center justify-between md:block">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Archived Shows
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage shows that have been archived
            </p>
          </div>

          {/* View switcher - mobile only, top right */}
          <AnimatedSwitcher
            activeIndex={viewMode === "cards" ? 0 : 1}
            onIndexChange={(index) => setViewMode(index === 0 ? "cards" : "list")}
            options={[
              { value: "cards", label: "Cards", icon: Grid3X3 },
              { value: "list", label: "List", icon: List }
            ]}
            className="md:hidden"
          />
        </div>
        
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Search Bar with Archived Shows Count */}
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search archived shows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 h-10 border border-orange-200 bg-orange-100 dark:bg-orange-900/50 rounded-md">
              <span className="text-sm font-bold leading-none text-orange-800 dark:text-orange-300">{filteredShows.length}</span>
              <span className="text-xs text-orange-600 dark:text-orange-400 leading-none">Archived</span>
            </div>
            {searchTerm && (
              <Badge variant="outline" className="text-sm whitespace-nowrap">
                {archivedShows.length} total
              </Badge>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Show Numbers */}
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1 bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-900/50 dark:hover:text-orange-300 text-center whitespace-nowrap">
              {filteredShows.length} Archived Shows
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="text-sm whitespace-nowrap">
                {archivedShows.length} total
              </Badge>
            )}
          </div>
          
          {/* View Switcher */}
          <AnimatedSwitcher
            activeIndex={viewMode === "cards" ? 0 : 1}
            onIndexChange={(index) => setViewMode(index === 0 ? "cards" : "list")}
            options={[
              { value: "cards", label: "Cards", icon: Grid3X3 },
              { value: "list", label: "List", icon: List }
            ]}
          />

          {/* Search Bar */}
          <div className="relative w-full min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>


      {/* Shows Display */}
      <div className="-mt-2">
      {viewMode === "cards" ? (
        <Card>
          <CardContent className="p-6">
            {/* TOP TOOLBAR: Mobile Layout */}
            {filteredShows.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 rounded-lg mb-2">
                <MobileTopToolbar
                  selectedShows={selectedShows}
                  filteredShows={filteredShows}
                  handleSelectAll={handleSelectAll}
                  handleBulkUnarchive={handleBulkUnarchive}
                  handleBulkDelete={handleBulkDelete}
                  isBulkUnarchiving={isBulkUnarchiving}
                  isBulkDeleting={isBulkDeleting}
                  user={user}
                  page={page}
                  totalPages={totalPages}
                  gotoPrev={gotoPrev}
                  gotoNext={gotoNext}
                />

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
                  >
                    <Check className="h-4 w-4" />
                    {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedShows.size} of {filteredShows.length} selected
                  </Badge>
                  {selectedShows.size > 0 && (
                    <>
                      {user?.role === "admin" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkUnarchive}
                          disabled={isBulkUnarchiving}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button 
                          size="sm" 
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3">
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
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {paginatedShows.map((show) => (
            <Card
              key={show.id}
              className={`transition-all duration-200 group flex flex-col h-full ${
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
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors w-full line-clamp-2 leading-tight">
                      {show.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 capitalize pointer-events-none">
                      {show.show_type || "N/A"}
                    </Badge>
                    <Badge
                      className={`text-xs border pointer-events-none ${
                        show.rate_card
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                      }`}
                    >
                      {`Rate Card - ${show.rate_card ? "Yes" : "No"}`}
                    </Badge>
                    {(() => {
                      const rankingInfo = getRankingInfo(show.ranking_category);
                      return rankingInfo.hasRanking ? (
                        <Badge variant="secondary" className={`text-xs border pointer-events-none ${rankingInfo.badgeClasses}`}>
                          {rankingInfo.displayText}
                        </Badge>
                      ) : null;
                    })()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="w-full flex flex-col justify-between space-y-4">
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
                    className="h-8 px-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
                    onClick={() => handleViewShow(show)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {user?.role === "admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user?.role === "admin" && (
                          <DropdownMenuItem onClick={() => handleUnarchiveShow(show)} className="text-green-600 focus:text-green-700">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Unarchive
                          </DropdownMenuItem>
                        )}
                        {user?.role === "admin" && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => handleDeleteShow(show)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
            
            {/* BOTTOM TOOLBAR: Mobile Layout */}
            {filteredShows.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 rounded-lg mt-2">
                <MobileBottomToolbar
                  selectedShows={selectedShows}
                  filteredShows={filteredShows}
                  handleSelectAll={handleSelectAll}
                  handleBulkUnarchive={handleBulkUnarchive}
                  handleBulkDelete={handleBulkDelete}
                  isBulkUnarchiving={isBulkUnarchiving}
                  isBulkDeleting={isBulkDeleting}
                  user={user}
                  page={page}
                  totalPages={totalPages}
                  gotoPrev={gotoPrev}
                  gotoNext={gotoNext}
                />

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
                  >
                    <Check className="h-4 w-4" />
                    {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedShows.size} of {filteredShows.length} selected
                  </Badge>
                  {selectedShows.size > 0 && (
                    <>
                      {user?.role === "admin" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkUnarchive}
                          disabled={isBulkUnarchiving}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button 
                          size="sm" 
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3">
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
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {/* TOP TOOLBAR: Mobile Layout */}
            {filteredShows.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 rounded-lg mb-2">
                <MobileTopToolbar
                  selectedShows={selectedShows}
                  filteredShows={filteredShows}
                  handleSelectAll={handleSelectAll}
                  handleBulkUnarchive={handleBulkUnarchive}
                  handleBulkDelete={handleBulkDelete}
                  isBulkUnarchiving={isBulkUnarchiving}
                  isBulkDeleting={isBulkDeleting}
                  user={user}
                  page={page}
                  totalPages={totalPages}
                  gotoPrev={gotoPrev}
                  gotoNext={gotoNext}
                />

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
                  >
                    <Check className="h-4 w-4" />
                    {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedShows.size} of {filteredShows.length} selected
                  </Badge>
                  {selectedShows.size > 0 && (
                    <>
                      {user?.role === "admin" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkUnarchive}
                          disabled={isBulkUnarchiving}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button 
                          size="sm" 
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3">
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
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="border-b">
                  <tr className="text-left text-sm">
                    <th className="px-2 py-4 w-8 border-r bg-muted/50 text-center whitespace-nowrap">
                      <Checkbox
                        checked={selectedShows.size === filteredShows.length && filteredShows.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-80 whitespace-nowrap"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Show Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-32 whitespace-nowrap"
                      onClick={() => handleSort('archived_by')}
                    >
                      <div className="flex items-center gap-2">
                        Archived By
                        {getSortIcon('archived_by')}
                      </div>
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-32 whitespace-nowrap"
                      onClick={() => handleSort('archived_at')}
                    >
                      <div className="flex items-center gap-2">
                        Archived At
                        {getSortIcon('archived_at')}
                      </div>
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-32 whitespace-nowrap"
                      onClick={() => handleSort('ranking_category')}
                    >
                      <div className="flex items-center gap-2">
                        Ranking
                        {getSortIcon('ranking_category')}
                      </div>
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-32 whitespace-nowrap"
                      onClick={() => handleSort('standardSplit')}
                    >
                      <div className="flex items-center gap-2">
                        Standard
                        {getSortIcon('standardSplit')}
                      </div>
                    </th>
                    <th 
                      className="pl-6 pr-6 py-4 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 w-36"
                      onClick={() => handleSort('programmaticSplit')}
                    >
                      <div className="flex items-center gap-2">
                        Programmatic
                        {getSortIcon('programmaticSplit')}
                      </div>
                    </th>
                    <th className="pl-6 pr-6 py-4 font-semibold bg-muted/50 w-24">Actions</th>
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
                      <td className="px-2 py-2 border-r w-8 text-center whitespace-nowrap">
                        <Checkbox
                          checked={selectedShows.has(show.id)}
                          onCheckedChange={() => handleSelectShow(show.id)}
                        />
                      </td>
                      <td className="pl-6 pr-6 py-2 font-medium border-r cursor-pointer hover:bg-accent/30 transition-colors whitespace-nowrap" onClick={() => handleViewShow(show)}>
                        <span className="hover:underline">
                          {show.title}
                        </span>
                      </td>
                      <td className="pl-6 pr-6 py-2 border-r whitespace-nowrap">
                        {getUserName(show.archived_by_id, show.archived_by)}
                      </td>
                      <td className="pl-6 pr-6 py-2 border-r whitespace-nowrap">
                        {show.archived_at ? new Date(show.archived_at).toLocaleDateString() : "Unknown"}
                      </td>
        <td className="pl-6 pr-6 py-2 border-r whitespace-nowrap">
          {(() => {
            const rankingInfo = getRankingInfo(show.ranking_category);
            return rankingInfo.hasRanking ? (
              <Badge variant="secondary" className={rankingInfo.badgeClasses}>
                {rankingInfo.displayText}
              </Badge>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            );
          })()}
        </td>
                      <td className="pl-6 pr-6 py-2 border-r whitespace-nowrap">{formatPercentage(getStandardSplit(show))}</td>
                      <td className="pl-6 pr-6 py-2 border-r whitespace-nowrap">{formatPercentage(getProgrammaticSplit(show))}</td>
                      <td className="pl-6 pr-6 py-2 whitespace-nowrap">
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
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUnarchiveShow(show)} className="text-green-600 focus:text-green-700">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Unarchive
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
            
            {/* BOTTOM TOOLBAR: Mobile Layout */}
            {filteredShows.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 rounded-lg mt-2">
                <MobileBottomToolbar
                  selectedShows={selectedShows}
                  filteredShows={filteredShows}
                  handleSelectAll={handleSelectAll}
                  handleBulkUnarchive={handleBulkUnarchive}
                  handleBulkDelete={handleBulkDelete}
                  isBulkUnarchiving={isBulkUnarchiving}
                  isBulkDeleting={isBulkDeleting}
                  user={user}
                  page={page}
                  totalPages={totalPages}
                  gotoPrev={gotoPrev}
                  gotoNext={gotoNext}
                />

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
                  >
                    <Check className="h-4 w-4" />
                    {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedShows.size} of {filteredShows.length} selected
                  </Badge>
                  {selectedShows.size > 0 && (
                    <>
                      {user?.role === "admin" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkUnarchive}
                          disabled={isBulkUnarchiving}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button 
                          size="sm" 
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3">
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
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>

      {filteredShows.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No archived shows found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No archived shows match your search criteria."
                : "No shows have been archived yet."}
            </p>
          </CardContent>
        </Card>
      )}


      {/* Dialogs */}
      <DeleteShowDialog
        open={!!deletingShow}
        onOpenChange={(open) => !open && setDeletingShow(null)}
        show={deletingShow}
        onShowDeleted={handleShowDeleted}
        deleteShow={async (showId: string) => {
          await apiClient.deletePodcast(showId)
          return true
        }}
      />
      <ShowViewDialog
        open={viewingShowIndex !== null}
        onOpenChange={(open) => !open && setViewingShowIndex(null)}
        show={viewingShow}
        onNavigate={handleNavigate}
        hasNext={viewingShowIndex !== null && viewingShowIndex < filteredShows.length - 1}
        hasPrevious={viewingShowIndex !== null && viewingShowIndex > 0}
        onEdit={undefined}
        onDelete={user?.role === "admin" ? handleDeleteShow : undefined}
        onUnarchive={user?.role === "admin" ? handleUnarchiveFromDialog : undefined}
        isArchived={true}
      />

      {/* Individual Unarchive Confirmation Dialog */}
      <AlertDialog open={showUnarchiveConfirm} onOpenChange={setShowUnarchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <RotateCcw className="h-5 w-5" />
              Unarchive Show
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to unarchive <strong>{showingUnarchiveShow?.title}</strong>?</p>
                <p>This will move the show back to the main shows management page.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnarchiveConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnarchiveShow}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Unarchive Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Unarchive Confirmation Dialog */}
      <AlertDialog open={showBulkUnarchiveConfirm} onOpenChange={setShowBulkUnarchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <RotateCcw className="h-5 w-5" />
              Unarchive Selected Shows
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to unarchive {selectedShows.size} selected show{selectedShows.size > 1 ? 's' : ''}?</p>
                <p>This will move the shows back to the main shows management page.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkUnarchiveConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkUnarchive}
              disabled={isBulkUnarchiving}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isBulkUnarchiving ? "Unarchiving..." : `Unarchive ${selectedShows.size} Show${selectedShows.size > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

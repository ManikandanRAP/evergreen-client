"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Eye, Check, ChevronsUpDown, Link2, Trash2, History, ArrowLeft, Radio, Building, Percent, Settings, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
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

// Use the environment variable for the API URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Show {
  show_name: string
  show_qbo_id: number
}

interface Vendor {
  vendor_name: string
  vendor_qbo_id: number
}

interface Split {
  split_id: number
  show_name: string
  vendor_name: string
  partner_pct_ads: number
  partner_pct_programmatic: number
  effective_date: string
}

type VendorSplitManagementProps = {
  onBack?: () => void
  refreshSignal?: number
}

// NEW: accept a refresh signal from parent
export default function VendorSplitManagement({ onBack, refreshSignal = 0 }: VendorSplitManagementProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Data states
  const [shows, setShows] = useState<Show[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [splits, setSplits] = useState<Split[]>([])
  const [allSplits, setAllSplits] = useState<Split[]>([])

  // Selection states
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  // UI states
  const [isShowsPopoverOpen, setIsShowsPopoverOpen] = useState(false)
  const [isVendorsPopoverOpen, setIsVendorsPopoverOpen] = useState(false)
  const [showCurrentSplits, setShowCurrentSplits] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [isClosingCurrentSplits, setIsClosingCurrentSplits] = useState(false)
  const [isClosingUpdateForm, setIsClosingUpdateForm] = useState(false)
  const [isClosingContainer, setIsClosingContainer] = useState(false)

  // Loading states
  const [isLoadingShows, setIsLoadingShows] = useState(false)
  const [isLoadingVendors, setIsLoadingVendors] = useState(false)
  const [isLoadingSplits, setIsLoadingSplits] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [splitToDelete, setSplitToDelete] = useState<Split | null>(null)

  // Form states
  const [newSplit, setNewSplit] = useState({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ===== New Mapping Section (independent from existing section) =====
  const [catalogShows, setCatalogShows] = useState<Show[]>([])
  const [catalogVendors, setCatalogVendors] = useState<Vendor[]>([])
  const [selectedCatalogShow, setSelectedCatalogShow] = useState<Show | null>(null)
  const [selectedCatalogVendor, setSelectedCatalogVendor] = useState<Vendor | null>(null)
  const [isCatalogShowsPopoverOpen, setIsCatalogShowsPopoverOpen] = useState(false)
  const [isCatalogVendorsPopoverOpen, setIsCatalogVendorsPopoverOpen] = useState(false)
  const [isMappingOpen, setIsMappingOpen] = useState(false)
  const [showNewSplitForm, setShowNewSplitForm] = useState(false)
  const [isClosingNewSplitForm, setIsClosingNewSplitForm] = useState(false)

  const [newMappedSplit, setNewMappedSplit] = useState({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
  const [mapErrors, setMapErrors] = useState<Record<string, string>>({})
  const [isLoadingCatalog, setIsLoadingCatalog] = useState({ shows: false, vendors: false, save: false })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Statistics calculation (same as split history page)
  const splitStats = useMemo(() => {
    const totalSplits = allSplits.length
    const uniqueShows = new Set(allSplits.map(s => s.show_qbo_id)).size
    const uniqueVendors = new Set(allSplits.map(s => s.vendor_qbo_id)).size
    const activeSplits = allSplits.filter(split => {
      const effectiveDate = new Date(split.effective_date)
      const today = new Date()
      return effectiveDate <= today
    }).length
    
    return { totalSplits, uniqueShows, uniqueVendors, activeSplits }
  }, [allSplits])

  // Load statistics data (only need splits data)
  const loadStatsData = async () => {
    if (!token) return
    
    setIsLoadingStats(true)
    try {
      // Load all splits for stats
      const splitsResponse = await fetch(`${API_URL}/split-management/split-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (splitsResponse.ok) {
        const splitsData = await splitsResponse.json()
        setAllSplits(splitsData)
      }
    } catch (error) {
      console.error("Error loading stats data:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Fetch shows on component mount
  useEffect(() => {
    if (user && token) {
      const fetchShows = async () => {
        setIsLoadingShows(true)
        try {
          const response = await fetch(`${API_URL}/split-management/shows`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) throw new Error("Failed to fetch shows")
          const data = await response.json()
          setShows(data)
        } catch (error) {
          toast({ title: "Error", description: "Could not load shows.", variant: "destructive" })
        } finally {
          setIsLoadingShows(false)
        }
      }
      fetchShows()
      loadStatsData()
    }
  }, [user, token, toast])

  // Fetch vendors when a show is selected
  useEffect(() => {
    const fetchVendors = async () => {
      if (selectedShow && token) {
        setIsLoadingVendors(true)
        setVendors([])
        setSelectedVendor(null)
        setSplits([])
        // Close both sections when show changes
        setShowCurrentSplits(false)
        setShowUpdateForm(false)
        try {
          const response = await fetch(`${API_URL}/split-management/vendors/${selectedShow.show_qbo_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) throw new Error("Failed to fetch vendors")
          const data = await response.json()
          setVendors(data)
        } catch (error) {
          toast({ title: "Error", description: "Could not load vendors for the selected show.", variant: "destructive" })
        } finally {
          setIsLoadingVendors(false)
        }
      } else {
        // Close both sections when no show is selected
        setShowCurrentSplits(false)
        setShowUpdateForm(false)
      }
    }
    fetchVendors()
  }, [selectedShow, token, toast])

  // Close sections when vendor changes
  useEffect(() => {
    if (selectedVendor === null) {
      setSplits([])
      setShowCurrentSplits(false)
      setShowUpdateForm(false)
    }
  }, [selectedVendor])

  const handleViewCurrentSplits = async () => {
    if (!selectedShow || !selectedVendor || !token) {
      toast({
        title: "Selection required",
        description: "Please select both a show and a vendor.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingSplits(true)
    try {
      const response = await fetch(
        `${API_URL}/split-management/splits?show_qbo_id=${selectedShow.show_qbo_id}&vendor_qbo_id=${selectedVendor.vendor_qbo_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error("Failed to fetch splits")
      const data = await response.json()
      setSplits(data)
      setShowCurrentSplits(true)
      // Don't close the update form if it's open
    } catch (error) {
      toast({ title: "Error", description: "Could not load splits.", variant: "destructive" })
    } finally {
      setIsLoadingSplits(false)
    }
  }

  const handleUpdateNewSplit = () => {
    if (!selectedShow || !selectedVendor) {
      toast({
        title: "Selection required",
        description: "Please select both a show and a vendor.",
        variant: "destructive",
      })
      return
    }
    setShowUpdateForm(true)
    // Don't close the current splits if it's open
  }

  const handleCloseCurrentSplits = () => {
    setIsClosingCurrentSplits(true)
    setTimeout(() => {
      setShowCurrentSplits(false)
      setIsClosingCurrentSplits(false)
      // If both sections are now closed, close the container
      if (!showUpdateForm) {
        setIsClosingContainer(true)
        setTimeout(() => {
          setIsClosingContainer(false)
        }, 300)
      }
    }, 300)
  }

  const handleCloseUpdateForm = () => {
    setIsClosingUpdateForm(true)
    setTimeout(() => {
      setShowUpdateForm(false)
      setIsClosingUpdateForm(false)
      // If both sections are now closed, close the container
      if (!showCurrentSplits) {
        setIsClosingContainer(true)
        setTimeout(() => {
          setIsClosingContainer(false)
        }, 300)
      }
    }, 300)
  }

  const validateNewSplit = () => {
    const newErrors: Record<string, string> = {}
    const adPercent = parseFloat(newSplit.adPercent)
    const progPercent = parseFloat(newSplit.programmaticPercent)

    if (isNaN(adPercent)) newErrors.adPercent = "AD % is required"
    if (isNaN(progPercent)) newErrors.programmaticPercent = "Programmatic % is required"
    if (!newSplit.effectiveDate) newErrors.effectiveDate = "Effective date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // NEW: Cancel for first section (reset the inline add form)
  const handleCancelExistingSplit = () => {
    setNewSplit({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
    setErrors({})
    setShowUpdateForm(false)
  }

  const handleSaveSplit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateNewSplit() || !selectedShow || !selectedVendor || !token) return

    setIsLoadingSave(true)
    try {
      const payload = {
        show_qbo_id: selectedShow.show_qbo_id,
        vendor_qbo_id: selectedVendor.vendor_qbo_id,
        show_name: selectedShow.show_name,
        vendor_name: selectedVendor.vendor_name,
        partner_pct_ads: parseFloat(newSplit.adPercent) / 100,
        partner_pct_programmatic: parseFloat(newSplit.programmaticPercent) / 100,
        effective_date: newSplit.effectiveDate,
      }

      const response = await fetch(`${API_URL}/split-management/splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to save split")
      }

      toast({ title: "Success", description: "New split added." })
      setNewSplit({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
      setErrors({})
      // Don't automatically close the update form or switch sections
      // Refresh the splits table if current splits are visible
      if (showCurrentSplits) {
        const refreshResponse = await fetch(
          `${API_URL}/split-management/splits?show_qbo_id=${selectedShow.show_qbo_id}&vendor_qbo_id=${selectedVendor.vendor_qbo_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setSplits(data)
        }
      }
    } catch (error: any) {
      toast({ title: "Save Failed", description: `Error: ${error.message}`, variant: "destructive" })
    } finally {
      setIsLoadingSave(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewSplit((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // --- Delete handling ---
  const confirmDelete = (split: Split) => {
    setSplitToDelete(split)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSplit = async () => {
    if (!splitToDelete || !token) return
    setIsDeleting(true)
    try {
      const resp = await fetch(`${API_URL}/split-management/splits/${splitToDelete.split_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok && resp.status !== 204) {
        let detail = "Failed to delete split"
        try {
          const err = await resp.json()
          detail = err?.detail || detail
        } catch {}
        throw new Error(detail)
      }
      setSplits((prev) => prev.filter((s) => s.split_id !== splitToDelete.split_id))
      toast({ title: "Deleted", description: "Split has been deleted." })
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message || "Could not delete split", variant: "destructive" })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSplitToDelete(null)
    }
  }

  // --- Catalog fetch (admin-only endpoints) ---
  useEffect(() => {
    const fetchCatalog = async () => {
      if (!user || !token) return
      try {
        setIsLoadingCatalog((s) => ({ ...s, shows: true }))
        const [showsRes, vendorsRes] = await Promise.all([
          fetch(`${API_URL}/split-management/catalog/all-shows`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/split-management/catalog/all-vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!showsRes.ok) throw new Error("Failed to fetch all shows")
        if (!vendorsRes.ok) throw new Error("Failed to fetch all vendors")
        const [showsData, vendorsData] = await Promise.all([showsRes.json(), vendorsRes.json()])
        setCatalogShows(showsData || [])
        setCatalogVendors(vendorsData || [])
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to load catalog lists", variant: "destructive" })
      } finally {
        setIsLoadingCatalog((s) => ({ ...s, shows: false, vendors: false }))
      }
    }
    fetchCatalog()
  }, [user, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMappedInputChange = (field: string, value: string) => {
    setNewMappedSplit((prev) => ({ ...prev, [field]: value }))
    if (mapErrors[field]) {
      setMapErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateNewMappedSplit = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedCatalogShow) newErrors.show = "Show is required"
    if (!selectedCatalogVendor) newErrors.vendor = "Vendor is required"
    if (!newMappedSplit.adPercent) newErrors.adPercent = "AD % is required"
    if (!newMappedSplit.programmaticPercent) newErrors.programmaticPercent = "Programmatic % is required"
    if (!newMappedSplit.effectiveDate) newErrors.effectiveDate = "Effective date is required"
    setMapErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCloseNewSplitForm = () => {
    setIsClosingNewSplitForm(true)
    setTimeout(() => {
      setShowNewSplitForm(false)
      setIsClosingNewSplitForm(false)
    }, 300)
  }

  const handleSaveMappedSplit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateNewMappedSplit() || !selectedCatalogShow || !selectedCatalogVendor || !token) return
    setIsLoadingCatalog((s) => ({ ...s, save: true }))
    try {
      const payload = {
        show_qbo_id: selectedCatalogShow.show_qbo_id,
        vendor_qbo_id: selectedCatalogVendor.vendor_qbo_id,
        show_name: selectedCatalogShow.show_name,
        vendor_name: selectedCatalogVendor.vendor_name,
        partner_pct_ads: parseFloat(newMappedSplit.adPercent) / 100,
        partner_pct_programmatic: parseFloat(newMappedSplit.programmaticPercent) / 100,
        effective_date: newMappedSplit.effectiveDate,
      }
      const response = await fetch(`${API_URL}/split-management/splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to save split")
      }
      toast({ title: "Success", description: "New split mapped & saved." })
      // Reset only the form, keep selections
      setNewMappedSplit({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
      setShowNewSplitForm(false)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save split", variant: "destructive" })
    } finally {
      setIsLoadingCatalog((s) => ({ ...s, save: false }))
    }
  }

  // 🔄 NEW: respond to parent-level refresh signal
  useEffect(() => {
    if (!user || !token) return

    // 1) Re-fetch primary show list
    const refreshShows = async () => {
      setIsLoadingShows(true)
      try {
        const res = await fetch(`${API_URL}/split-management/shows`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to refresh shows")
        const data = await res.json()
        setShows(data || [])
      } catch (e: any) {
        toast({ title: "Refresh failed", description: e.message || "Could not refresh shows", variant: "destructive" })
      } finally {
        setIsLoadingShows(false)
      }
    }

    // 2) Re-fetch catalog (all shows/vendors)
    const refreshCatalog = async () => {
      try {
        setIsLoadingCatalog((s) => ({ ...s, shows: true }))
        const [showsRes, vendorsRes] = await Promise.all([
          fetch(`${API_URL}/split-management/catalog/all-shows`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/split-management/catalog/all-vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!showsRes.ok) throw new Error("Failed to refresh all shows")
        if (!vendorsRes.ok) throw new Error("Failed to refresh all vendors")
        const [showsData, vendorsData] = await Promise.all([showsRes.json(), vendorsRes.json()])
        setCatalogShows(showsData || [])
        setCatalogVendors(vendorsData || [])
      } catch (err: any) {
        toast({ title: "Refresh failed", description: err.message || "Could not refresh catalog", variant: "destructive" })
      } finally {
        setIsLoadingCatalog((s) => ({ ...s, shows: false, vendors: false }))
      }
    }

    // 3) If a show is selected, refresh its vendors
    const refreshVendorsIfNeeded = async () => {
      if (!selectedShow) return
      setIsLoadingVendors(true)
      try {
        const res = await fetch(`${API_URL}/split-management/vendors/${selectedShow.show_qbo_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to refresh vendors")
        const data = await res.json()
        setVendors(data || [])
      } catch (e: any) {
        toast({ title: "Refresh failed", description: e.message || "Could not refresh vendors", variant: "destructive" })
      } finally {
        setIsLoadingVendors(false)
      }
    }

    // 4) If both show & vendor are selected, refresh current splits table
    const refreshSplitsIfNeeded = async () => {
      if (!selectedShow || !selectedVendor) {
        setSplits([])
        return
      }
      setIsLoadingSplits(true)
      try {
        const res = await fetch(
          `${API_URL}/split-management/splits?show_qbo_id=${selectedShow.show_qbo_id}&vendor_qbo_id=${selectedVendor.vendor_qbo_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!res.ok) throw new Error("Failed to refresh splits")
        const data = await res.json()
        setSplits(data || [])
        setShowCurrentSplits(true)
      } catch (e: any) {
        toast({ title: "Refresh failed", description: e.message || "Could not refresh splits", variant: "destructive" })
      } finally {
        setIsLoadingSplits(false)
      }
    }

    // Run all refresh steps
    refreshShows()
    refreshCatalog()
    refreshVendorsIfNeeded()
    refreshSplitsIfNeeded()
    loadStatsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]) // react to parent refresh

  return (
    <div className="space-y-6">
      {/* Header with back button and split history button - Desktop: back button before title, Mobile: below */}
      {onBack && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Desktop: back button before title, Mobile: title first */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Back button - Desktop: show before title, Mobile: hide here */}
            <Button variant="outline" onClick={onBack} className="gap-2 w-fit hidden md:flex">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Vendor Split Management</h1>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-2">
            {/* Back button - Mobile: show here, Desktop: hide */}
            <Button variant="outline" onClick={onBack} className="gap-2 w-fit md:hidden">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/split-history")}
              className="flex items-center gap-2 h-10 w-fit"
            >
              <History className="h-4 w-4" />
              View All Split History
            </Button>
          </div>
        </div>
      )}

      {/* Vendor Split Statistics - Hidden on mobile, visible on desktop */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Total Splits</p>
                <p className="text-lg md:text-2xl font-bold text-slate-600">{isLoadingStats ? "..." : splitStats.totalSplits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300">Unique Shows</p>
                <p className="text-lg md:text-2xl font-bold text-emerald-600">{isLoadingStats ? "..." : splitStats.uniqueShows}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">Unique Vendors</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">{isLoadingStats ? "..." : splitStats.uniqueVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs md:text-sm font-medium text-orange-700 dark:text-orange-300">Active Splits</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">{isLoadingStats ? "..." : splitStats.activeSplits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">View and Update Existing Vendor Split Percentage</CardTitle>
          <CardDescription className="text-sm md:text-muted-foreground">Select shows and vendors to view and update split configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm md:text-sm">Select Show Name</Label>
              <Popover open={isShowsPopoverOpen} onOpenChange={setIsShowsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between md:h-10" disabled={isLoadingShows}>
                    {isLoadingShows ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedShow?.show_name ?? "Select a show..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search show..." />
                    <CommandEmpty>No show found.</CommandEmpty>
                    <ScrollArea className="h-60">
                      <CommandGroup>
                        {shows.map((show) => (
                          <CommandItem
                            key={show.show_qbo_id}
                            value={show.show_name}
                            onSelect={() => {
                              setSelectedShow(show)
                              setIsShowsPopoverOpen(false)
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedShow?.show_qbo_id === show.show_qbo_id ? "opacity-100" : "opacity-0"}`} />
                            {show.show_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-sm">Select Vendor Name</Label>
              <Popover open={isVendorsPopoverOpen} onOpenChange={setIsVendorsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between md:h-10" disabled={!selectedShow || isLoadingVendors}>
                    {isLoadingVendors ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedVendor?.vendor_name ?? "Select a vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search vendor..." />
                    <CommandEmpty>No vendor found for this show.</CommandEmpty>
                    <ScrollArea className="h-60">
                      <CommandGroup>
                        {vendors.map((vendor) => (
                          <CommandItem
                            key={vendor.vendor_qbo_id}
                            value={vendor.vendor_name}
                            onSelect={() => {
                              setSelectedVendor(vendor)
                              setIsVendorsPopoverOpen(false)
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedVendor?.vendor_qbo_id === vendor.vendor_qbo_id ? "opacity-100" : "opacity-0"}`} />
                            {vendor.vendor_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <div className="flex flex-col md:flex-row gap-3 md:gap-2 w-full">
                <Button 
                  onClick={handleViewCurrentSplits} 
                  disabled={isLoadingSplits || !selectedShow || !selectedVendor} 
                  className="evergreen-button w-full md:h-10"
                >
                  {isLoadingSplits ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                  View Current Splits
                </Button>
                <Button 
                  onClick={handleUpdateNewSplit} 
                  disabled={!selectedShow || !selectedVendor} 
                  className="evergreen-button w-full md:h-10"
                  variant="secondary"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Update New Split
                </Button>
              </div>
            </div>
          </div>

          {(showCurrentSplits || showUpdateForm) && (
            <div className={`space-y-4 pt-4 transition-all duration-300 ease-in-out ${
              isClosingContainer 
                ? 'opacity-0 transform -translate-y-4 scale-95' 
                : 'opacity-100 transform translate-y-0 scale-100'
            }`}>
              {/* Current Splits Card */}
              {showCurrentSplits && (
                <Card className={`transition-all duration-300 ease-in-out ${
                  isClosingCurrentSplits 
                    ? 'opacity-0 transform -translate-y-4 scale-95' 
                    : 'opacity-100 transform translate-y-0 scale-100 animate-in slide-in-from-top-4'
                }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      <span className="hidden md:inline">Current Splits for {selectedShow?.show_name} and {selectedVendor?.vendor_name}</span>
                      <span className="md:hidden">Current Splits</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseCurrentSplits}
                      className="h-8 w-8 p-0 border md:ml-2 ml-1 min-w-8 min-h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
              
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r border-b px-4 py-2">Show Name</TableHead>
                      <TableHead className="border-r border-b px-4 py-2">Vendor Name</TableHead>
                      <TableHead className="border-r border-b px-4 py-2">AD %</TableHead>
                      <TableHead className="border-r border-b px-4 py-2">Programmatic %</TableHead>
                      <TableHead className="border-r border-b px-4 py-2">Effective Date</TableHead>
                      <TableHead className="w-24 border-b px-4 py-2">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {splits.length > 0 ? (
                      splits.map((split, index) => (
                        <TableRow key={split.split_id}>
                          <TableCell className={`border-r px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>{split.show_name}</TableCell>
                          <TableCell className={`border-r px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>{split.vendor_name}</TableCell>
                          <TableCell className={`border-r px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>{split.partner_pct_ads * 100}%</TableCell>
                          <TableCell className={`border-r px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>{split.partner_pct_programmatic * 100}%</TableCell>
                          <TableCell className={`border-r px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>{new Date(split.effective_date).toLocaleDateString()}</TableCell>
                          <TableCell className={`px-4 py-2 ${index === splits.length - 1 ? '' : 'border-b'}`}>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete(split)}
                              className="h-7 px-2"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 px-4 py-2">No splits found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Hidden on Desktop */}
              <div className="md:hidden space-y-3">
                {splits.length > 0 ? (
                  splits.map((split) => (
                    <Card key={split.split_id} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Show Name</h4>
                          <p className="text-base">{split.show_name}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Vendor Name</h4>
                          <p className="text-base">{split.vendor_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">AD %</h4>
                            <p className="text-base">{split.partner_pct_ads * 100}%</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Prog %</h4>
                            <p className="text-base">{split.partner_pct_programmatic * 100}%</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Effective Date</h4>
                          <p className="text-base">{new Date(split.effective_date).toLocaleDateString()}</p>
                        </div>
                        <div className="pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(split)}
                            className="w-full h-10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                    No splits found.
                  </div>
                )}
              </div>
                </CardContent>
                </Card>
              )}

              {/* Confirm Delete Dialog */}
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this split?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove the selected split record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSplit} disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {showUpdateForm && (
                <Card className={`transition-all duration-300 ease-in-out ${
                  isClosingUpdateForm 
                    ? 'opacity-0 transform -translate-y-4 scale-95' 
                    : 'opacity-100 transform translate-y-0 scale-100 animate-in slide-in-from-top-4'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        <span className="hidden md:inline">Update New Split for {selectedShow?.show_name} and {selectedVendor?.vendor_name}</span>
                        <span className="md:hidden">Update New Split</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloseUpdateForm}
                        className="h-8 w-8 p-0 border md:ml-2 ml-1 min-w-8 min-h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                  <form onSubmit={handleSaveSplit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="ad-percent" className="text-sm md:text-base">AD %</Label>
                        <Input id="ad-percent" type="number" min="0" max="100" step="0.01" placeholder="e.g., 60.5" value={newSplit.adPercent} onChange={(e) => handleInputChange("adPercent", e.target.value)} className="md:h-10" />
                        {errors.adPercent && <p className="text-sm text-red-500">{errors.adPercent}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="programmatic-percent" className="text-sm md:text-base">Programmatic %</Label>
                        <Input id="programmatic-percent" type="number" min="0" max="100" step="0.01" placeholder="e.g., 39.5" value={newSplit.programmaticPercent} onChange={(e) => handleInputChange("programmaticPercent", e.target.value)} className="md:h-10" />
                        {errors.programmaticPercent && <p className="text-sm text-red-500">{errors.programmaticPercent}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="effective-date" className="text-sm md:text-base">Effective Date</Label>
                        <Input id="effective-date" type="date" value={newSplit.effectiveDate} onChange={(e) => handleInputChange("effectiveDate", e.target.value)} className="md:h-10" />
                        {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
                      </div>
                    </div>
                    {/* Mobile: Stack buttons vertically, Desktop: Right-aligned */}
                    <div className="flex flex-col md:flex-row md:justify-end gap-3">
                      <Button type="submit" disabled={isLoadingSave} className="md:h-10 w-full md:w-auto">
                        {isLoadingSave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Split
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelExistingSplit} className="md:h-10 w-full md:w-auto">
                        Cancel
                      </Button>
                    </div>
                  </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Map Show, Vendor and Add New Split Percentage</CardTitle>
          <CardDescription className="text-sm md:text-muted-foreground">Pick any show and any vendor independently, map it and then create a new split.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm md:text-sm">Select Show Name</Label>
              <Popover open={isCatalogShowsPopoverOpen} onOpenChange={setIsCatalogShowsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCatalogShowsPopoverOpen}
                    className="w-full justify-between md:h-10"
                  >
                    {selectedCatalogShow ? selectedCatalogShow.show_name : "Select show"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search show..." />
                    <CommandEmpty>No show found.</CommandEmpty>
                    <ScrollArea className="h-60">
                      <CommandGroup>
                        {catalogShows.map((show) => (
                          <CommandItem
                            key={show.show_qbo_id}
                            value={show.show_name}
                            onSelect={() => {
                              setSelectedCatalogShow(show)
                              setIsCatalogShowsPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedCatalogShow?.show_qbo_id === show.show_qbo_id ? "opacity-100" : "opacity-0"}`}
                            />
                            {show.show_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
              {mapErrors.show && <p className="text-sm text-red-600">{mapErrors.show}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-sm">Select Vendor Name</Label>
              <Popover open={isCatalogVendorsPopoverOpen} onOpenChange={setIsCatalogVendorsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCatalogVendorsPopoverOpen}
                    className="w-full justify-between md:h-10"
                  >
                    {selectedCatalogVendor ? selectedCatalogVendor.vendor_name : "Select vendor"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search vendor..." />
                    <CommandEmpty>No vendor found.</CommandEmpty>
                    <ScrollArea className="h-60">
                      <CommandGroup>
                        {catalogVendors.map((vendor) => (
                          <CommandItem
                            key={vendor.vendor_qbo_id}
                            value={vendor.vendor_name}
                            onSelect={() => {
                              setSelectedCatalogVendor(vendor)
                              setIsCatalogVendorsPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedCatalogVendor?.vendor_qbo_id === vendor.vendor_qbo_id ? "opacity-100" : "opacity-0"}`}
                            />
                            {vendor.vendor_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
              {mapErrors.vendor && <p className="text-sm text-red-600">{mapErrors.vendor}</p>}
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setShowNewSplitForm(true)}
                disabled={!selectedCatalogShow || !selectedCatalogVendor}
                className="evergreen-button w-full md:h-10"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Map Show and Vendor for Split
              </Button>
            </div>
          </div>

          {showNewSplitForm && (
            <Card className={`transition-all duration-300 ease-in-out ${
              isClosingNewSplitForm 
                ? 'opacity-0 transform -translate-y-4 scale-95' 
                : 'opacity-100 transform translate-y-0 scale-100 animate-in slide-in-from-top-4'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    <span className="hidden md:inline">Add New Split for {selectedCatalogShow?.show_name} and {selectedCatalogVendor?.vendor_name}</span>
                    <span className="md:hidden">Add New Split</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseNewSplitForm}
                    className="h-8 w-8 p-0 border md:ml-2 ml-1 min-w-8 min-h-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveMappedSplit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="map-ad-percent" className="text-sm md:text-base">AD %</Label>
                      <Input
                        id="map-ad-percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="e.g., 70"
                        value={newMappedSplit.adPercent}
                        onChange={(e) => handleMappedInputChange("adPercent", e.target.value)}
                        className="md:h-10"
                      />
                      {mapErrors.adPercent && <p className="text-sm text-red-600">{mapErrors.adPercent}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="map-programmatic-percent" className="text-sm md:text-base">Programmatic %</Label>
                      <Input
                        id="map-programmatic-percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="e.g., 30"
                        value={newMappedSplit.programmaticPercent}
                        onChange={(e) => handleMappedInputChange("programmaticPercent", e.target.value)}
                        className="md:h-10"
                      />
                      {mapErrors.programmaticPercent && <p className="text-sm text-red-600">{mapErrors.programmaticPercent}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="map-effective-date" className="text-sm md:text-base">Effective Date</Label>
                      <Input
                        id="map-effective-date"
                        type="date"
                        value={newMappedSplit.effectiveDate}
                        onChange={(e) => handleMappedInputChange("effectiveDate", e.target.value)}
                        className="md:h-10"
                      />
                      {mapErrors.effectiveDate && <p className="text-sm text-red-600">{mapErrors.effectiveDate}</p>}
                    </div>
                  </div>
                  {/* Mobile: Stack buttons vertically, Desktop: Right-aligned */}
                  <div className="flex flex-col md:flex-row md:justify-end gap-3">
                    <Button type="submit" disabled={isLoadingCatalog.save} className="md:h-10 w-full md:w-auto">
                      {isLoadingCatalog.save && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save New Split
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCloseNewSplitForm} className="md:h-10 w-full md:w-auto">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

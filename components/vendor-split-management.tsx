"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Eye, Check, ChevronsUpDown, Link2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
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
// This will be http://127.0.0.1:8000 on your local machine (from .env.local)
// and the production URL on your server.
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
  evergreen_pct_ads: number
  evergreen_pct_programmatic: number
  effective_date: string
}

export default function VendorSplitManagement() {
  const { user, token } = useAuth()
  const { toast } = useToast()

  // Data states
  const [shows, setShows] = useState<Show[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [splits, setSplits] = useState<Split[]>([])

  // Selection states
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  // UI states
  const [isShowsPopoverOpen, setIsShowsPopoverOpen] = useState(false)
  const [isVendorsPopoverOpen, setIsVendorsPopoverOpen] = useState(false)
  const [showSplitsTable, setShowSplitsTable] = useState(false)

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
  const [isUpdatingOpen, setIsUpdatingOpen] = useState(false)

  const [newMappedSplit, setNewMappedSplit] = useState({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
  const [mapErrors, setMapErrors] = useState<Record<string, string>>({})
  const [isLoadingCatalog, setIsLoadingCatalog] = useState({ shows: false, vendors: false, save: false })

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
        setShowSplitsTable(false)
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
      }
    }
    fetchVendors()
  }, [selectedShow, token, toast])

  const handleViewSplits = async () => {
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
      setShowSplitsTable(true)
      setIsUpdatingOpen(true)
    } catch (error) {
      toast({ title: "Error", description: "Could not load splits.", variant: "destructive" })
    } finally {
      setIsLoadingSplits(false)
    }
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
    setIsUpdatingOpen(false)
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
        evergreen_pct_ads: parseFloat(newSplit.adPercent) / 100,
        evergreen_pct_programmatic: parseFloat(newSplit.programmaticPercent) / 100,
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
      handleViewSplits() // Refresh the splits table
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
        evergreen_pct_ads: parseFloat(newMappedSplit.adPercent) / 100,
        evergreen_pct_programmatic: parseFloat(newMappedSplit.programmaticPercent) / 100,
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
      setIsMappingOpen(false)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save split", variant: "destructive" })
    } finally {
      setIsLoadingCatalog((s) => ({ ...s, save: false }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>View and Update Existing Vendor Split Percentage</CardTitle>
          <CardDescription>Select shows and vendors to view and update split configurations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Select Show Name</Label>
              <Popover open={isShowsPopoverOpen} onOpenChange={setIsShowsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={isLoadingShows}>
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
              <Label>Select Vendor Name</Label>
              <Popover open={isVendorsPopoverOpen} onOpenChange={setIsVendorsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!selectedShow || isLoadingVendors}>
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
              <Button onClick={handleViewSplits} disabled={isLoadingSplits || !selectedShow || !selectedVendor} className="w-full">
                {isLoadingSplits ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                View and Update Splits
              </Button>
            </div>
          </div>

          {showSplitsTable && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold">Current Splits</h3>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Show Name</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>AD %</TableHead>
                      <TableHead>Programmatic %</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {splits.length > 0 ? (
                      splits.map((split) => (
                        <TableRow key={split.split_id}>
                          <TableCell>{split.show_name}</TableCell>
                          <TableCell>{split.vendor_name}</TableCell>
                          <TableCell>{split.evergreen_pct_ads * 100}%</TableCell>
                          <TableCell>{split.evergreen_pct_programmatic * 100}%</TableCell>
                          <TableCell>{new Date(split.effective_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete(split)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No splits found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

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

              {isUpdatingOpen && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Update New Split</h3>
                  <form onSubmit={handleSaveSplit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="ad-percent">AD %</Label>
                        <Input id="ad-percent" type="number" min="0" max="100" step="0.01" placeholder="e.g., 60.5" value={newSplit.adPercent} onChange={(e) => handleInputChange("adPercent", e.target.value)} />
                        {errors.adPercent && <p className="text-sm text-red-500">{errors.adPercent}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="programmatic-percent">Programmatic %</Label>
                        <Input id="programmatic-percent" type="number" min="0" max="100" step="0.01" placeholder="e.g., 39.5" value={newSplit.programmaticPercent} onChange={(e) => handleInputChange("programmaticPercent", e.target.value)} />
                        {errors.programmaticPercent && <p className="text-sm text-red-500">{errors.programmaticPercent}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="effective-date">Effective Date</Label>
                        <Input id="effective-date" type="date" value={newSplit.effectiveDate} onChange={(e) => handleInputChange("effectiveDate", e.target.value)} />
                        {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
                      </div>
                    </div>
                    {/* UPDATED: right-aligned Save + Cancel (first section) */}
                    <div className="flex justify-end gap-3">
                      <Button type="submit" disabled={isLoadingSave}>
                        {isLoadingSave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Split
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelExistingSplit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map Show, Vendor and Add New Split Percentage</CardTitle>
          <CardDescription>Pick any show and any vendor independently, map it and then create a new split.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Select Show Name</Label>
              <Popover open={isCatalogShowsPopoverOpen} onOpenChange={setIsCatalogShowsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCatalogShowsPopoverOpen}
                    className="w-full justify-between"
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
              <Label>Select Vendor Name</Label>
              <Popover open={isCatalogVendorsPopoverOpen} onOpenChange={setIsCatalogVendorsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCatalogVendorsPopoverOpen}
                    className="w-full justify-between"
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
                onClick={() => setIsMappingOpen(true)}
                disabled={!selectedCatalogShow || !selectedCatalogVendor}
                className="w-full"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Map Show and Vendor for Split
              </Button>
            </div>
          </div>

          {isMappingOpen && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Add New Split</h3>
              <form onSubmit={handleSaveMappedSplit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="map-ad-percent">AD %</Label>
                    <Input
                      id="map-ad-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 70"
                      value={newMappedSplit.adPercent}
                      onChange={(e) => handleMappedInputChange("adPercent", e.target.value)}
                    />
                    {mapErrors.adPercent && <p className="text-sm text-red-600">{mapErrors.adPercent}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map-programmatic-percent">Programmatic %</Label>
                    <Input
                      id="map-programmatic-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 30"
                      value={newMappedSplit.programmaticPercent}
                      onChange={(e) => handleMappedInputChange("programmaticPercent", e.target.value)}
                    />
                    {mapErrors.programmaticPercent && <p className="text-sm text-red-600">{mapErrors.programmaticPercent}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map-effective-date">Effective Date</Label>
                    <Input
                      id="map-effective-date"
                      type="date"
                      value={newMappedSplit.effectiveDate}
                      onChange={(e) => handleMappedInputChange("effectiveDate", e.target.value)}
                    />
                    {mapErrors.effectiveDate && <p className="text-sm text-red-600">{mapErrors.effectiveDate}</p>}
                  </div>
                </div>
                {/* UPDATED: right-aligned Save New Split + Cancel (new mapping section) */}
                <div className="flex justify-end gap-3">
                  <Button type="submit" disabled={isLoadingCatalog.save}>
                    {isLoadingCatalog.save && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save New Split
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsMappingOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

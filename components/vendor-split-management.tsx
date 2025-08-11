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
import { Loader2, Eye, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

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

  // Form states
  const [newSplit, setNewSplit] = useState({ adPercent: "", programmaticPercent: "", effectiveDate: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor and Split Updates</CardTitle>
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
              View Splits
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No splits found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoadingSave}>
                    {isLoadingSave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Split
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

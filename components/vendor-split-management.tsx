"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const mockShows = [
  { id: "1", name: "The Daily Tech" },
  { id: "2", name: "Morning Coffee Chat" },
  { id: "3", name: "Business Insights" },
  { id: "4", name: "Creative Minds" },
]

const mockVendors = [
  { id: "1", name: "Spotify" },
  { id: "2", name: "Apple Podcasts" },
  { id: "3", name: "Google Podcasts" },
  { id: "4", name: "Amazon Music" },
]

const mockSplits = [
  {
    id: "1",
    showId: "1",
    showName: "The Daily Tech",
    vendorId: "1",
    vendorName: "Spotify",
    adPercent: 60,
    programmaticPercent: 40,
    effectiveDate: "2024-01-01",
  },
  {
    id: "2",
    showId: "2",
    showName: "Morning Coffee Chat",
    vendorId: "1",
    vendorName: "Spotify",
    adPercent: 55,
    programmaticPercent: 45,
    effectiveDate: "2024-01-15",
  },
  {
    id: "3",
    showId: "3",
    showName: "Business Insights",
    vendorId: "2",
    vendorName: "Apple Podcasts",
    adPercent: 70,
    programmaticPercent: 30,
    effectiveDate: "2024-02-01",
  },
]

export default function VendorSplitManagement() {
  const [selectedShow, setSelectedShow] = useState("")
  const [selectedVendor, setSelectedVendor] = useState("")
  const [splits, setSplits] = useState<typeof mockSplits>([])
  const [showSplits, setShowSplits] = useState(false)
  const [isLoadingSplits, setIsLoadingSplits] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [newSplit, setNewSplit] = useState({
    adPercent: "",
    programmaticPercent: "",
    effectiveDate: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleViewSplits = async () => {
    if (!selectedShow || !selectedVendor) {
      toast({
        title: "Selection required",
        description: "Please select both a show and vendor to view splits.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingSplits(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter splits by selected vendor
      const filteredSplits = mockSplits.filter((split) => split.vendorId === selectedVendor)
      setSplits(filteredSplits)
      setShowSplits(true)

      toast({
        title: "Splits loaded",
        description: `Found ${filteredSplits.length} split(s) for the selected vendor.`,
      })
    } catch (error) {
      toast({
        title: "Error loading splits",
        description: "There was a problem loading the splits. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSplits(false)
    }
  }

  const validateNewSplit = () => {
    const newErrors: Record<string, string> = {}

    if (!newSplit.adPercent) {
      newErrors.adPercent = "AD % is required"
    } else {
      const adPercent = Number.parseFloat(newSplit.adPercent)
      if (isNaN(adPercent) || adPercent < 0 || adPercent > 100) {
        newErrors.adPercent = "AD % must be between 0 and 100"
      }
    }

    if (!newSplit.programmaticPercent) {
      newErrors.programmaticPercent = "Programmatic % is required"
    } else {
      const programmaticPercent = Number.parseFloat(newSplit.programmaticPercent)
      if (isNaN(programmaticPercent) || programmaticPercent < 0 || programmaticPercent > 100) {
        newErrors.programmaticPercent = "Programmatic % must be between 0 and 100"
      }
    }

    if (!newSplit.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required"
    }

    // Check if percentages add up to 100
    if (newSplit.adPercent && newSplit.programmaticPercent) {
      const total = Number.parseFloat(newSplit.adPercent) + Number.parseFloat(newSplit.programmaticPercent)
      if (Math.abs(total - 100) > 0.01) {
        newErrors.total = "AD % and Programmatic % must add up to 100%"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveSplit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateNewSplit()) {
      return
    }

    setIsLoadingSave(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Split saved successfully",
        description: "The new split configuration has been saved.",
      })

      // Reset form
      setNewSplit({
        adPercent: "",
        programmaticPercent: "",
        effectiveDate: "",
      })
      setErrors({})

      // Refresh splits
      handleViewSplits()
    } catch (error) {
      toast({
        title: "Error saving split",
        description: "There was a problem saving the split. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSave(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewSplit((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Clear total error when either percentage changes
    if ((field === "adPercent" || field === "programmaticPercent") && errors.total) {
      setErrors((prev) => ({ ...prev, total: "" }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor and Split Updates</CardTitle>
        <CardDescription>Select shows and vendors to view and update split configurations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="show-select">Select Show Name</Label>
            <Select value={selectedShow} onValueChange={setSelectedShow}>
              <SelectTrigger>
                <SelectValue placeholder="Select a show" />
              </SelectTrigger>
              <SelectContent>
                {mockShows.map((show) => (
                  <SelectItem key={show.id} value={show.id}>
                    {show.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-select">Select Vendor Name</Label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                {mockVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleViewSplits} disabled={isLoadingSplits} className="w-full">
              {isLoadingSplits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Eye className="mr-2 h-4 w-4" />
              View Splits
            </Button>
          </div>
        </div>

        {/* Splits Table */}
        {showSplits && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Current Splits</h3>
              <p className="text-sm text-muted-foreground">
                Showing splits for {mockVendors.find((v) => v.id === selectedVendor)?.name}
              </p>
            </div>

            {splits.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Show</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>AD %</TableHead>
                      <TableHead>Programmatic %</TableHead>
                      <TableHead>Effective Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {splits.map((split) => (
                      <TableRow key={split.id}>
                        <TableCell className="font-medium">{split.showName}</TableCell>
                        <TableCell>{split.vendorName}</TableCell>
                        <TableCell>{split.adPercent}%</TableCell>
                        <TableCell>{split.programmaticPercent}%</TableCell>
                        <TableCell>{formatDate(split.effectiveDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No splits found for the selected vendor.</div>
            )}

            {/* Update New Split Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Update New Split</h3>
              <form onSubmit={handleSaveSplit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ad-percent">AD %</Label>
                    <Input
                      id="ad-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      value={newSplit.adPercent}
                      onChange={(e) => handleInputChange("adPercent", e.target.value)}
                    />
                    {errors.adPercent && <p className="text-sm text-red-500">{errors.adPercent}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programmatic-percent">Programmatic %</Label>
                    <Input
                      id="programmatic-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      value={newSplit.programmaticPercent}
                      onChange={(e) => handleInputChange("programmaticPercent", e.target.value)}
                    />
                    {errors.programmaticPercent && <p className="text-sm text-red-500">{errors.programmaticPercent}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effective-date">Effective Date</Label>
                    <Input
                      id="effective-date"
                      type="date"
                      value={newSplit.effectiveDate}
                      onChange={(e) => handleInputChange("effectiveDate", e.target.value)}
                    />
                    {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
                  </div>
                </div>

                {errors.total && <p className="text-sm text-red-500 text-center">{errors.total}</p>}

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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
]

export function VendorSplitManagement() {
  const [selectedShow, setSelectedShow] = useState("")
  const [selectedVendor, setSelectedVendor] = useState("")
  const [splits, setSplits] = useState(mockSplits)
  const [showSplits, setShowSplits] = useState(false)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [isSaveLoading, setIsSaveLoading] = useState(false)
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
        title: "Selection Required",
        description: "Please select both a show and vendor.",
        variant: "destructive",
      })
      return
    }

    setIsViewLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setShowSplits(true)
    } finally {
      setIsViewLoading(false)
    }
  }

  const validateNewSplit = () => {
    const newErrors: Record<string, string> = {}

    if (!newSplit.adPercent) {
      newErrors.adPercent = "AD % is required"
    } else if (
      isNaN(Number(newSplit.adPercent)) ||
      Number(newSplit.adPercent) < 0 ||
      Number(newSplit.adPercent) > 100
    ) {
      newErrors.adPercent = "AD % must be between 0 and 100"
    }

    if (!newSplit.programmaticPercent) {
      newErrors.programmaticPercent = "Programmatic % is required"
    } else if (
      isNaN(Number(newSplit.programmaticPercent)) ||
      Number(newSplit.programmaticPercent) < 0 ||
      Number(newSplit.programmaticPercent) > 100
    ) {
      newErrors.programmaticPercent = "Programmatic % must be between 0 and 100"
    }

    if (newSplit.adPercent && newSplit.programmaticPercent) {
      const total = Number(newSplit.adPercent) + Number(newSplit.programmaticPercent)
      if (total !== 100) {
        newErrors.total = "AD % and Programmatic % must add up to 100%"
      }
    }

    if (!newSplit.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveSplit = async () => {
    if (!validateNewSplit()) {
      return
    }

    setIsSaveLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const selectedShowName = mockShows.find((show) => show.id === selectedShow)?.name || ""
      const selectedVendorName = mockVendors.find((vendor) => vendor.id === selectedVendor)?.name || ""

      const newSplitEntry = {
        id: Date.now().toString(),
        showId: selectedShow,
        showName: selectedShowName,
        vendorId: selectedVendor,
        vendorName: selectedVendorName,
        adPercent: Number(newSplit.adPercent),
        programmaticPercent: Number(newSplit.programmaticPercent),
        effectiveDate: newSplit.effectiveDate,
      }

      setSplits((prev) => [...prev, newSplitEntry])

      toast({
        title: "Split Saved Successfully",
        description: `New split for ${selectedShowName} has been saved.`,
      })

      // Reset form
      setNewSplit({
        adPercent: "",
        programmaticPercent: "",
        effectiveDate: "",
      })
      setErrors({})
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save split. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaveLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewSplit((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.total) {
      setErrors((prev) => ({ ...prev, total: "" }))
    }
  }

  const filteredSplits = splits.filter((split) => split.vendorId === selectedVendor)

  return (
    <div className="space-y-6">
      {/* Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="show">Select Show Name</Label>
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
          <Label htmlFor="vendor">Select Vendor Name</Label>
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
          <Button onClick={handleViewSplits} disabled={isViewLoading} className="w-full">
            {isViewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Eye className="mr-2 h-4 w-4" />
            View Splits
          </Button>
        </div>
      </div>

      {/* Splits Table */}
      {showSplits && (
        <Card>
          <CardHeader>
            <CardTitle>Current Splits</CardTitle>
            <CardDescription>
              Showing splits for {mockVendors.find((v) => v.id === selectedVendor)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {filteredSplits.length > 0 ? (
                  filteredSplits.map((split) => (
                    <TableRow key={split.id}>
                      <TableCell>{split.showName}</TableCell>
                      <TableCell>{split.vendorName}</TableCell>
                      <TableCell>{split.adPercent}%</TableCell>
                      <TableCell>{split.programmaticPercent}%</TableCell>
                      <TableCell>{new Date(split.effectiveDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No splits found for the selected vendor
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Update New Split Section */}
      {showSplits && (
        <Card>
          <CardHeader>
            <CardTitle>Update New Split</CardTitle>
            <CardDescription>Add a new split configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adPercent">AD %</Label>
                <Input
                  id="adPercent"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={newSplit.adPercent}
                  onChange={(e) => handleInputChange("adPercent", e.target.value)}
                />
                {errors.adPercent && <p className="text-sm text-red-500">{errors.adPercent}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="programmaticPercent">Programmatic %</Label>
                <Input
                  id="programmaticPercent"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={newSplit.programmaticPercent}
                  onChange={(e) => handleInputChange("programmaticPercent", e.target.value)}
                />
                {errors.programmaticPercent && <p className="text-sm text-red-500">{errors.programmaticPercent}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={newSplit.effectiveDate}
                  onChange={(e) => handleInputChange("effectiveDate", e.target.value)}
                />
                {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
              </div>

              <div className="flex items-end">
                <Button onClick={handleSaveSplit} disabled={isSaveLoading} className="w-full">
                  {isSaveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Split
                </Button>
              </div>
            </div>

            {errors.total && <p className="text-sm text-red-500 mt-2">{errors.total}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

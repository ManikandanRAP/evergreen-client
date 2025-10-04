"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { useAuth } from "@/lib/auth-context"
import {
  Search,
  Download,
  Eye,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Tag,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Feedback } from "@/lib/feedback"
import { toast } from "sonner"

type SortField = keyof Feedback | null
type SortDirection = "asc" | "desc" | "original"

// Define your API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export default function Feedbacks() {
  const { user, token } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("original")
  const [originalOrder, setOriginalOrder] = useState<Feedback[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState<number>(0)
  const [animationDirection, setAnimationDirection] = useState<"next" | "previous" | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load feedbacks from API
  useEffect(() => {
    if (user?.role === "admin" && token) {
      const fetchFeedbacks = async () => {
        try {
          const response = await fetch(`${API_URL}/feedbacks`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (!response.ok) {
            throw new Error("Failed to fetch feedbacks")
          }
          const data: Feedback[] = await response.json()
          setFeedbacks(data)
          setOriginalOrder(data)
        } catch (error) {
          console.error("Error fetching feedbacks:", error)
          toast.error("Error", {
            description: "Could not load feedbacks from the server.",
          })
        }
      }
      fetchFeedbacks()
    }
  }, [user, token])

  // Check if user has access
  if (user?.role !== "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedbacks</h1>
          <p className="text-muted-foreground">View and manage user feedback.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This feature is only accessible to admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this feature. Please contact your administrator if you believe this is
              an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredAndSortedFeedbacks = useMemo(() => {
    const filtered = feedbacks.filter((feedback) => {
      const matchesSearch =
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.createdByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || feedback.type === typeFilter

      return matchesSearch && matchesType
    })

    if (sortDirection === "original") {
      // We need to filter the original order as well to match search terms
      const originalIds = new Set(filtered.map((f) => f.id))
      return originalOrder.filter((f) => originalIds.has(f.id))
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = (bValue as string).toLowerCase()
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [feedbacks, originalOrder, searchTerm, typeFilter, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedFeedbacks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageFeedbacks = filteredAndSortedFeedbacks.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, sortField, sortDirection])

  // Handle keyboard navigation when dialog is open
  useEffect(() => {
    if (!isViewDialogOpen) {
      // Reset animation direction when dialog closes
      setAnimationDirection(null)
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isViewDialogOpen) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        handlePreviousFeedback()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        handleNextFeedback()
      }
    }

    if (isViewDialogOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isViewDialogOpen, currentFeedbackIndex, filteredAndSortedFeedbacks])

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

  const handleViewFeedback = (feedback: Feedback) => {
    const index = currentPageFeedbacks.findIndex(f => f.id === feedback.id)
    setCurrentFeedbackIndex(index >= 0 ? index : 0)
    setSelectedFeedback(feedback)
    setIsViewDialogOpen(true)
  }

  const handlePreviousFeedback = () => {
    if (currentFeedbackIndex > 0 && currentPageFeedbacks.length > 0) {
      setAnimationDirection("previous")
      const newIndex = currentFeedbackIndex - 1
      setCurrentFeedbackIndex(newIndex)
      setSelectedFeedback(currentPageFeedbacks[newIndex])
      
      // Reset animation direction after animation completes
      setTimeout(() => {
        setAnimationDirection(null)
      }, 300)
    }
  }

  const handleNextFeedback = () => {
    if (currentFeedbackIndex < currentPageFeedbacks.length - 1 && currentPageFeedbacks.length > 0) {
      setAnimationDirection("next")
      const newIndex = currentFeedbackIndex + 1
      setCurrentFeedbackIndex(newIndex)
      setSelectedFeedback(currentPageFeedbacks[newIndex])
      
      // Reset animation direction after animation completes
      setTimeout(() => {
        setAnimationDirection(null)
      }, 300)
    }
  }

  const handleDeleteClick = (feedback: Feedback) => {
    setFeedbackToDelete(feedback)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    // Ensure we have a feedback item to delete
    if (!feedbackToDelete || !token) return

    // Immediately close the dialog so it doesn't interfere with the toast
    setDeleteDialogOpen(false)

    try {
      const response = await fetch(`${API_URL}/feedbacks/${feedbackToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete feedback")
      }

      // Update state to remove the feedback from the list
      const updatedFeedbacks = feedbacks.filter((f) => f.id !== feedbackToDelete.id)
      setFeedbacks(updatedFeedbacks)
      setOriginalOrder(updatedFeedbacks) // Also update original order

      // Show success toast *after* the dialog is closed and state is updated
      toast.success("Feedback deleted", {
        description: "The feedback has been successfully deleted.",
      })
    } catch (error) {
      // Show error toast *after* the dialog is closed
      toast.error("Error", {
        description: "Could not delete feedback. Please try again.",
      })
    } finally {
      // Clean up the state
      setFeedbackToDelete(null)
    }
  }

  const handleExport = () => {
    const csvContent = [
      // CSV headers
      ["Title", "Type", "Created By", "Created At", "Description"].join(","),
      // CSV data
      ...filteredAndSortedFeedbacks.map((feedback) =>
        [
          `"${feedback.title.replace(/"/g, '""')}"`,
          `"${feedback.type}"`,
          `"${feedback.createdByName}"`,
          new Date(feedback.created_at).toISOString(),
          `"${feedback.description.replace(/"/g, '""')}"`, // Escape quotes in description
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `feedbacks-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Export completed", {
      description: `${filteredAndSortedFeedbacks.length} feedbacks exported successfully.`,
    })
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "New Feature":
        return { className: "text-xs border bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 capitalize pointer-events-none" } // pastel green
      case "General Feedback":
        return { className: "text-xs border bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 capitalize pointer-events-none" } // pastel blue
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const animationClass =
    animationDirection === "next"
      ? "animate-in slide-in-from-right-2 fade-in-0 duration-300"
      : animationDirection === "previous"
      ? "animate-in slide-in-from-left-2 fade-in-0 duration-300"
      : "" // No slide animation on initial open
  

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

  const SortableHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead className={`px-4 py-2 font-semibold border-r bg-muted/50 cursor-pointer hover:bg-muted/50 select-none ${className || ''}`} onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {getSortIcon(field)}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Feedbacks</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage user feedback and feature suggestions.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="md:px-6 px-4">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search feedbacks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Mobile Feedbacks Count - styled like split history page */}
              <Button variant="outline" className="h-10 px-2 flex flex-col items-center justify-center min-w-[60px] gap-0">
                <span className="text-sm font-bold leading-none">{filteredAndSortedFeedbacks.length}</span>
                <span className="text-xs text-muted-foreground leading-none">Feedbacks</span>
              </Button>
            </div>
            
            {/* Type Filter and Export Button for Mobile */}
            <div className="flex items-center space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New Feature">New Feature</SelectItem>
                  <SelectItem value="General Feedback">General Feedback</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="evergreen-button" onClick={handleExport} disabled={filteredAndSortedFeedbacks.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search feedbacks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Type Filter for Desktop */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New Feature">New Feature</SelectItem>
                  <SelectItem value="General Feedback">General Feedback</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Feedbacks Count for Desktop */}
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedFeedbacks.length} feedback{filteredAndSortedFeedbacks.length !== 1 ? "s" : ""}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Desktop Export Button inside list box */}
              <Button className="evergreen-button" onClick={handleExport} disabled={filteredAndSortedFeedbacks.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="md:px-6 px-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="title">Title</SortableHeader>
                  <SortableHeader field="type">Type</SortableHeader>
                  <SortableHeader field="createdByName" className="whitespace-nowrap">Created By</SortableHeader>
                  <SortableHeader field="created_at" className="whitespace-nowrap">Created At</SortableHeader>
                  <TableHead className="px-4 py-2 font-semibold bg-muted/50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell 
                      className="font-medium border-r px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors whitespace-nowrap"
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      <span className="hover:underline hover:text-emerald-600 transition-colors">
                        {feedback.title}
                      </span>
                    </TableCell>
                    <TableCell className="border-r px-4 py-2 whitespace-nowrap">
                      <Badge {...getTypeBadgeVariant(feedback.type)}>{feedback.type}</Badge>
                    </TableCell>
                    <TableCell className="border-r px-4 py-2 whitespace-nowrap">{feedback.createdByName}</TableCell>
                    <TableCell className="border-r px-4 py-2 whitespace-nowrap">
                      {new Date(feedback.created_at).toLocaleDateString()}{" "}
                      {new Date(feedback.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleViewFeedback(feedback)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                          onClick={() => handleDeleteClick(feedback)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {currentPageFeedbacks.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No feedbacks found matching your search." : "No feedbacks submitted yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedFeedbacks.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedFeedbacks.length)} to {Math.min(currentPage * itemsPerPage, filteredAndSortedFeedbacks.length)} of {filteredAndSortedFeedbacks.length} feedbacks
              </span>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Feedback Details</DialogTitle>
            <DialogDescription>Complete information about this feedback submission</DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div 
              key={selectedFeedback.id} 
              className={`space-y-6 transition-all duration-300 overflow-hidden ${animationClass}`}
            >
              {/* Feedback Header with Details */}
              <div className={`p-4 sm:p-6 rounded-lg border ${
                selectedFeedback.type === 'New Feature'
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"
              }`}>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  {selectedFeedback.title}
                </h2>
                
                {/* Feedback Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground text-sm">Type:</span>
                    <Badge {...getTypeBadgeVariant(selectedFeedback.type)}>
                      {selectedFeedback.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-muted-foreground text-sm">Submitted By:</span>
                    <span className="text-sm">{selectedFeedback.createdByName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-muted-foreground text-sm">Submission Date:</span>
                    <span className="text-sm">
                      {new Date(selectedFeedback.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedFeedback.description}</p>
                  </div>
                </CardContent>
              </Card>


              {/* Actions */}
              <div className="pt-4 border-t">
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  {/* Navigation buttons - centered on mobile */}
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousFeedback}
                      disabled={currentFeedbackIndex === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextFeedback}
                      disabled={currentFeedbackIndex === currentPageFeedbacks.length - 1}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      {currentFeedbackIndex + 1} of {currentPageFeedbacks.length}
                    </span>
                  </div>

                  {/* Action buttons - full width on mobile */}
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => {
                        setIsViewDialogOpen(false)
                        handleDeleteClick(selectedFeedback)
                      }}
                      className="w-full bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsViewDialogOpen(false)}
                      className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
                    >
                      Close
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex justify-between items-center">
                  {/* Navigation buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousFeedback}
                      disabled={currentFeedbackIndex === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextFeedback}
                      disabled={currentFeedbackIndex === currentPageFeedbacks.length - 1}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      {currentFeedbackIndex + 1} of {currentPageFeedbacks.length}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        setIsViewDialogOpen(false)
                        handleDeleteClick(selectedFeedback)
                      }}
                      className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsViewDialogOpen(false)}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
              <span className="mt-2 p-2 bg-muted rounded text-sm block">
                <strong>"{feedbackToDelete?.title}"</strong> by {feedbackToDelete?.createdByName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
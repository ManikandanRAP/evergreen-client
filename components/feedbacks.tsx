"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("original")
  const [originalOrder, setOriginalOrder] = useState<Feedback[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState<number>(0)
  const [animationDirection, setAnimationDirection] = useState<"next" | "previous" | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null)

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

      return matchesSearch
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
  }, [feedbacks, originalOrder, searchTerm, sortField, sortDirection])

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
        setAnimationDirection("previous")
        handlePreviousFeedback()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        setAnimationDirection("next")
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
    const index = filteredAndSortedFeedbacks.findIndex(f => f.id === feedback.id)
    setCurrentFeedbackIndex(index >= 0 ? index : 0)
    setSelectedFeedback(feedback)
    setIsViewDialogOpen(true)
  }

  const handlePreviousFeedback = () => {
    if (currentFeedbackIndex > 0 && filteredAndSortedFeedbacks.length > 0) {
      setAnimationDirection("previous")
      const newIndex = currentFeedbackIndex - 1
      setCurrentFeedbackIndex(newIndex)
      setSelectedFeedback(filteredAndSortedFeedbacks[newIndex])
    }
  }

  const handleNextFeedback = () => {
    if (currentFeedbackIndex < filteredAndSortedFeedbacks.length - 1 && filteredAndSortedFeedbacks.length > 0) {
      setAnimationDirection("next")
      const newIndex = currentFeedbackIndex + 1
      setCurrentFeedbackIndex(newIndex)
      setSelectedFeedback(filteredAndSortedFeedbacks[newIndex])
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
      ? "animate-in slide-in-from-right-8 fade-in-0 duration-300"
      : animationDirection === "previous"
      ? "animate-in slide-in-from-left-8 fade-in-0 duration-300"
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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort(field)}>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Feedbacks</h1>
          <p className="text-muted-foreground">View and manage user feedback and feature suggestions.</p>
        </div>
        <Button className="evergreen-button" onClick={handleExport} disabled={filteredAndSortedFeedbacks.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedFeedbacks.length} feedback{filteredAndSortedFeedbacks.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="title">Title</SortableHeader>
                  <SortableHeader field="type">Type</SortableHeader>
                  <SortableHeader field="createdByName">Created By</SortableHeader>
                  <SortableHeader field="created_at">Created At</SortableHeader>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      {feedback.title}
                    </TableCell>
                    <TableCell>
                      <Badge {...getTypeBadgeVariant(feedback.type)}>{feedback.type}</Badge>
                    </TableCell>
                    <TableCell>{feedback.createdByName}</TableCell>
                    <TableCell>
                      {new Date(feedback.created_at).toLocaleDateString()}{" "}
                      {new Date(feedback.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewFeedback(feedback)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(feedback)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedFeedbacks.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No feedbacks found matching your search." : "No feedbacks submitted yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Feedback Details</DialogTitle>
            <DialogDescription>Complete information about this feedback submission</DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div key={selectedFeedback.id} className={`space-y-6 ${animationClass}`}>
              {/* Header Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedFeedback.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Type:</span>
                      </div>
                      <Badge {...getTypeBadgeVariant(selectedFeedback.type)}>{selectedFeedback.type}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Submitted By:</span>
                      </div>
                      <p className="text-muted-foreground">{selectedFeedback.createdByName}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Submission Date:</span>
                      </div>
                      <p className="text-muted-foreground">
                        {new Date(selectedFeedback.created_at).toLocaleDateString()} at{" "}
                        {new Date(selectedFeedback.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
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
              <div className="flex justify-between items-center">
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
                    disabled={currentFeedbackIndex === filteredAndSortedFeedbacks.length - 1}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">
                    {currentFeedbackIndex + 1} of {filteredAndSortedFeedbacks.length}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      handleDeleteClick(selectedFeedback)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Feedback
                  </Button>
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
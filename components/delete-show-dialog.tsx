"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle } from "lucide-react"
import type { Show } from "@/lib/api-client"

interface DeleteShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  show: Show | null
  onShowDeleted?: () => void
  deleteShow: (showId: string) => Promise<boolean>
}

export default function DeleteShowDialog({
  open,
  onOpenChange,
  show,
  onShowDeleted,
  deleteShow,
}: DeleteShowDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    if (!show) return

    setIsDeleting(true)
    try {
      const success = await deleteShow(show.id)
      if (success) {
        onShowDeleted?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to delete show:", error)
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    onOpenChange(false)
  }

  if (!show) return null

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Show
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this show? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Deleting "{show.title}" will permanently remove:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>All show data and settings</li>
                  <li>Associated revenue records</li>
                  <li>Partner access permissions</li>
                  <li>Historical performance data</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Show Details:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {show.title}
                </p>
                <p>
                  <strong>Genre:</strong> {show.genre_name}
                </p>
                <p>
                  <strong>Format:</strong> {show.media_type ? show.media_type.charAt(0).toUpperCase() + show.media_type.slice(1) : "N/A"}
                </p>
                <p>
                  <strong>Relationship:</strong> {show.relationship_level ? show.relationship_level.charAt(0).toUpperCase() + show.relationship_level.slice(1) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Show
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you absolutely sure you want to delete "{show.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>No, Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

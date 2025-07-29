"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, FileText, AlertCircle, X, Loader2 } from "lucide-react"

interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (result: ImportResult) => void
}

export default function ImportCSVDialog({ open, onOpenChange, onImportComplete }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
      } else {
        alert("Please select a CSV file")
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
      } else {
        alert("Please select a CSV file")
      }
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      // Simulate file processing with progress updates
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call to import CSV
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setImportProgress(100)

      // Simulate processing results
      const mockResult: ImportResult = {
        success: true,
        message: "Successfully imported 15 shows from CSV file",
        importedCount: 15,
        errors: [],
      }

      // Simulate some errors for demonstration
      if (Math.random() > 0.7) {
        mockResult.success = false
        mockResult.message = "Import completed with errors"
        mockResult.importedCount = 12
        mockResult.errors = [
          "Row 3: Invalid format for 'Shows per Year' field",
          "Row 7: Missing required field 'Show Name'",
          "Row 12: Invalid relationship value 'Unknown'",
        ]
      }

      setTimeout(() => {
        onImportComplete(mockResult)
        onOpenChange(false)
        setFile(null)
        setImportProgress(0)
      }, 500)
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        message: "Failed to import CSV file",
        errors: ["An unexpected error occurred during import"],
      }
      onImportComplete(errorResult)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csvTemplate = `Show Name,Show Type,Select Type,Subnetwork,Format,Relationship,Age (Months),genre_name,Shows per Year,Minimum Guarantee,Ownership %,Revenue 2023,Revenue 2024,Revenue 2025,Is Tentpole,Is Original,Is Active,Age Demographic,Gender Demographic,Branded Revenue Amount,Marketing Revenue Amount,Web Management Revenue,Latest CPM,Has Sponsorship Revenue,Has Non Evergreen Revenue,Requires Partner Ledger Access,Ad Slots,Average Length,Primary Contact Host,Primary Contact Show,Is Undersized
"Sample Show","Original","Podcasts","Sample Network","Audio","Strong","12","History","52","50000","70","125000","150000","180000","Yes","Yes","Yes","35-44","Male","15000","8000","3000","25.50","Yes","No","Yes","3","45","John Smith, (555) 123-4567, john@email.com","Sarah Johnson, (555) 987-6543, sarah@email.com","No"`

    const blob = new Blob([csvTemplate], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "evergreen-shows-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCancel = () => {
    setFile(null)
    setImportProgress(0)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Import Shows from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </CardTitle>
              <CardDescription>Download a CSV template with the correct format and sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleDownloadTemplate} className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload CSV File
              </CardTitle>
              <CardDescription>Select or drag and drop your CSV file to import shows</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)} className="mt-2">
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Import Progress */}
              {isImporting && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Importing...</span>
                    <span className="text-sm text-muted-foreground">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Import Guidelines:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>CSV file must include all required columns</li>
                  <li>Use "Yes"/"No" for boolean fields (Is Tentpole, Is Original, etc.)</li>
                  <li>Relationship values must be: Strong, Medium, or Weak</li>
                  <li>Format values must be: Audio or Video</li>
                  <li>Numeric fields should contain valid numbers only</li>
                  <li>Contact fields should follow: "Name, Phone, Email" format</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isImporting}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isImporting} className="evergreen-button">
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Shows
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

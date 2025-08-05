"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Download, Upload, Loader2, FileText, AlertCircle, BookOpen, CheckCircle } from "lucide-react"
import Papa from "papaparse"
import { apiClient, ShowCreate } from "@/lib/api-client"

interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (result: { success: boolean, message: string, errors?: string[] }) => void
}

const CSV_HEADERS = [
  "title", "show_type", "format", "relationship", "start_date", "minimum_guarantee",
  "ownership_percentage", "genre_name", "shows_per_year", "primary_contact_show",
  "age_demographic", "subnetwork_id", "is_tentpole", "is_original", "latest_cpm",
  "revenue_2023", "revenue_2024", "revenue_2025", "ad_slots", "average_length_mins",
  "gender", "region", "is_active", "is_undersized", "primary_contact_host",
  "evergreen_production_staff_name", "side_bonus_percent", "youtube_ads_percent",
  "subscriptions_percent", "standard_ads_percent", "sponsorship_ad_fp_lead_percent",
  "sponsorship_ad_partner_lead_percent", "sponsorship_ad_partner_sold_percent",
  "programmatic_ads_span_percent", "merchandise_percent", "branded_revenue_percent",
  "marketing_services_revenue_percent", "direct_customer_hands_off_percent",
  "youtube_hands_off_percent", "subscription_hands_off_percent", "has_sponsorship_revenue",
  "has_non_evergreen_revenue", "requires_partner_access", "has_branded_revenue",
  "has_marketing_revenue", "has_web_mgmt_revenue", "primary_education",
  "secondary_education", "qbo_show_name"
];

export default function ImportCSVDialog({ open, onOpenChange, onImportComplete }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const processFile = (droppedFile: File) => {
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError("Invalid file type. Please upload a CSV file.")
      setFile(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleDownloadTemplate = () => {
    const csv = Papa.unparse([CSV_HEADERS]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "shows_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handleDownloadGuide = () => {
    const link = document.createElement('a');
    // This assumes the PDF is in your /public directory
    link.href = '/CSV Import Template Guide.pdf';
    link.setAttribute('download', 'CSV Import Template Guide.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.")
      return
    }

    setIsImporting(true)
    setError(null)

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors: parsingErrors } = results;

        if (parsingErrors.length > 0) {
            setError(`Error parsing CSV: ${parsingErrors[0].message}`);
            setIsImporting(false);
            return;
        }

        const showsToCreate: ShowCreate[] = [];
        const validationErrors: string[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2;

            if (!row.title || row.title.trim() === "") {
                validationErrors.push(`Row ${rowNum}: Missing required field 'title'.`);
                continue;
            }
            
            if (row.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) {
                validationErrors.push(`Row ${rowNum}: Invalid date format for 'start_date'. Expected YYYY-MM-DD.`);
            }

            const enums = {
                show_type: ["Original", "Branded", "Partner"],
                format: ["Audio", "Video", "Both"],
                relationship: ["Strong", "Medium", "Weak"],
            };

            for (const [key, values] of Object.entries(enums)) {
                if (row[key] && !values.includes(row[key])) {
                    validationErrors.push(`Row ${rowNum}: Invalid value for '${key}'. Must be one of: ${values.join(", ")}.`);
                }
            }

            const numericFields = [
                "minimum_guarantee", "ownership_percentage", "latest_cpm", "revenue_2023", "revenue_2024", "revenue_2025",
                "shows_per_year", "ad_slots", "average_length_mins", "side_bonus_percent", "youtube_ads_percent",
                "subscriptions_percent", "standard_ads_percent", "sponsorship_ad_fp_lead_percent",
                "sponsorship_ad_partner_lead_percent", "sponsorship_ad_partner_sold_percent",
                "programmatic_ads_span_percent", "merchandise_percent", "branded_revenue_percent",
                "marketing_services_revenue_percent", "direct_customer_hands_off_percent",
                "youtube_hands_off_percent", "subscription_hands_off_percent"
            ];
            
            for (const field of numericFields) {
                if (row[field] && isNaN(parseFloat(row[field]))) {
                    validationErrors.push(`Row ${rowNum}: Invalid number for '${field}'.`);
                }
                if (field.includes('_percent') || field === 'ownership_percentage') {
                    const val = parseFloat(row[field]);
                    if (!isNaN(val) && (val < 0 || val > 100)) {
                        validationErrors.push(`Row ${rowNum}: Value for '${field}' must be between 0 and 100.`);
                    }
                }
            }

            if (validationErrors.length > 0) continue;

            const show: ShowCreate = {
                title: row.title,
                show_type: (row.show_type as "Branded" | "Original" | "Partner") || null,
                media_type: row.format ? row.format.toLowerCase() : null,
                relationship_level: row.relationship ? row.relationship.toLowerCase() : null,
                start_date: row.start_date || null,
                minimum_guarantee: row.minimum_guarantee ? parseFloat(row.minimum_guarantee) : null,
                evergreen_ownership_pct: row.ownership_percentage ? parseFloat(row.ownership_percentage) : null,
                genre_name: row.genre_name || null,
                shows_per_year: row.shows_per_year ? parseInt(row.shows_per_year) : null,
                show_primary_contact: row.primary_contact_show || null,
                ageDemographic: row.age_demographic || null,
                subnetwork_id: row.subnetwork_id || null,
                tentpole: row.is_tentpole?.toLowerCase() === 'yes',
                is_original: row.is_original?.toLowerCase() === 'yes',
                latest_cpm_usd: row.latest_cpm ? parseFloat(row.latest_cpm) : null,
                revenue_2023: row.revenue_2023 ? parseFloat(row.revenue_2023) : null,
                revenue_2024: row.revenue_2024 ? parseFloat(row.revenue_2024) : null,
                revenue_2025: row.revenue_2025 ? parseFloat(row.revenue_2025) : null,
                ad_slots: row.ad_slots ? parseInt(row.ad_slots) : null,
                avg_show_length_mins: row.average_length_mins ? parseInt(row.average_length_mins) : null,
                gender: row.gender || null,
                region: row.region || null,
                isActive: row.is_active ? row.is_active.toLowerCase() !== 'no' : true,
                isUndersized: row.is_undersized?.toLowerCase() === 'yes',
                show_host_contact: row.primary_contact_host || null,
                evergreen_production_staff_name: row.evergreen_production_staff_name || null,
                side_bonus_percent: row.side_bonus_percent ? parseFloat(row.side_bonus_percent) : null,
                youtube_ads_percent: row.youtube_ads_percent ? parseFloat(row.youtube_ads_percent) : null,
                subscriptions_percent: row.subscriptions_percent ? parseFloat(row.subscriptions_percent) : null,
                standard_ads_percent: row.standard_ads_percent ? parseFloat(row.standard_ads_percent) : null,
                sponsorship_ad_fp_lead_percent: row.sponsorship_ad_fp_lead_percent ? parseFloat(row.sponsorship_ad_fp_lead_percent) : null,
                sponsorship_ad_partner_lead_percent: row.sponsorship_ad_partner_lead_percent ? parseFloat(row.sponsorship_ad_partner_lead_percent) : null,
                sponsorship_ad_partner_sold_percent: row.sponsorship_ad_partner_sold_percent ? parseFloat(row.sponsorship_ad_partner_sold_percent) : null,
                programmatic_ads_span_percent: row.programmatic_ads_span_percent ? parseFloat(row.programmatic_ads_span_percent) : null,
                merchandise_percent: row.merchandise_percent ? parseFloat(row.merchandise_percent) : null,
                branded_revenue_percent: row.branded_revenue_percent ? parseFloat(row.branded_revenue_percent) : null,
                marketing_services_revenue_percent: row.marketing_services_revenue_percent ? parseFloat(row.marketing_services_revenue_percent) : null,
                direct_customer_hands_off_percent: row.direct_customer_hands_off_percent ? parseFloat(row.direct_customer_hands_off_percent) : null,
                youtube_hands_off_percent: row.youtube_hands_off_percent ? parseFloat(row.youtube_hands_off_percent) : null,
                subscription_hands_off_percent: row.subscription_hands_off_percent ? parseFloat(row.subscription_hands_off_percent) : null,
                has_sponsorship_revenue: row.has_sponsorship_revenue?.toLowerCase() === 'yes',
                has_non_evergreen_revenue: row.has_non_evergreen_revenue?.toLowerCase() === 'yes',
                requires_partner_access: row.requires_partner_access?.toLowerCase() === 'yes',
                has_branded_revenue: row.has_branded_revenue?.toLowerCase() === 'yes',
                has_marketing_revenue: row.has_marketing_revenue?.toLowerCase() === 'yes',
                has_web_mgmt_revenue: row.has_web_mgmt_revenue?.toLowerCase() === 'yes',
                primary_education: row.primary_education || null,
                secondary_education: row.secondary_education || null,
                show_name_in_qbo: row.qbo_show_name || null,
            };
            showsToCreate.push(show);
        }

        if (validationErrors.length > 0) {
            onImportComplete({ success: false, message: "Import failed due to validation errors.", errors: validationErrors });
            setIsImporting(false);
            onOpenChange(false);
            return;
        }

        try {
            const response = await apiClient.bulkCreatePodcasts(showsToCreate);
            onImportComplete({ 
                success: response.failed === 0, 
                message: `Import process completed. ${response.successful} of ${response.total} shows imported.`,
                errors: response.errors
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail?.message || err.message || "An unknown error occurred during import.";
            const errorList = err.response?.data?.detail?.errors || [];
            onImportComplete({ success: false, message: errorMessage, errors: errorList });
        } finally {
            setIsImporting(false);
            onOpenChange(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setIsImporting(false);
      }
    });
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
        
        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">How it Works</CardTitle>
                <CardDescription>Follow these steps to bulk import your shows.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Step 1: Download Resources.</strong> Get the CSV template and the PDF guide. The guide explains what each column means.</p>
                <p><strong>Step 2: Fill Out the Template.</strong> Add your show data to the CSV file. Only the 'title' column is required for each show.</p>
                <p><strong>Step 3: Upload the File.</strong> Drag and drop your completed CSV file into the area below and click 'Import'.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template (.csv)
              </Button>
              <Button variant="outline" onClick={handleDownloadGuide}>
                <BookOpen className="mr-2 h-4 w-4" />
                Download Guide (.pdf)
              </Button>
          </div>

          <Separator />
          
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2 flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="mt-2 text-red-500 hover:text-red-600">
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="font-medium">Drag & drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or</p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Browse for File
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

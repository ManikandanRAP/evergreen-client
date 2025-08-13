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

// Map lowercased CSV show_type to canonical values
const SHOW_TYPE_MAP: Record<string, "Original" | "Branded" | "Partner"> = {
  original: "Original",
  branded: "Branded",
  partner: "Partner",
};


interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (result: { success: boolean, message: string, errors?: string[] }) => void
}

// These are the headers for the CSV file template - matching your exact database schema
const CSV_HEADERS = [
  "title", "show_type", "media_type", "relationship_level", "start_date", "minimum_guarantee",
  "evergreen_ownership_pct", "genre_name", "shows_per_year", "show_primary_contact",
  "age_demographic", "subnetwork_id", "tentpole", "is_original", "latest_cpm_usd",
  "revenue_2023", "revenue_2024", "revenue_2025", "ad_slots", "avg_show_length_mins",
  "gender", "region", "is_active", "is_undersized", "show_host_contact",
  "evergreen_production_staff_name", "side_bonus_percent", "youtube_ads_percent",
  "subscriptions_percent", "standard_ads_percent", "sponsorship_ad_fp_lead_percent",
  "sponsorship_ad_partner_lead_percent", "sponsorship_ad_partner_sold_percent",
  "programmatic_ads_span_percent", "merchandise_percent", "branded_revenue_percent",
  "marketing_services_revenue_percent", "direct_customer_hands_off_percent",
  "youtube_hands_off_percent", "subscription_hands_off_percent", "has_sponsorship_revenue",
  "has_non_evergreen_revenue", "requires_partner_access", "has_branded_revenue",
  "has_marketing_revenue", "has_web_mgmt_revenue", "primary_education",
  "secondary_education", "qbo_show_name", "qbo_show_id"
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

            // Case-insensitive enum validation
            const mediaVal = (row.media_type ?? row.mediaType) !== undefined
            ? String(row.media_type ?? row.mediaType).trim().toLowerCase()
            : undefined;

            const relVal = (row.relationship_level ?? row.relationshipLevel) !== undefined
            ? String(row.relationship_level ?? row.relationshipLevel).trim().toLowerCase()
            : undefined;

            const showTypeKey = (row.show_type ?? row.showType) !== undefined
            ? String(row.show_type ?? row.showType).trim().toLowerCase()
            : undefined;

            if (row.media_type ?? row.mediaType) {
            if (!["video", "audio", "both"].includes(mediaVal as string)) {
              validationErrors.push(`Row ${rowNum}: Invalid value for 'media_type'. Must be one of: video, audio, both.`);
            }
            }
            if (row.relationship_level ?? row.relationshipLevel) {
            if (!["strong", "medium", "weak"].includes(relVal as string)) {
              validationErrors.push(`Row ${rowNum}: Invalid value for 'relationship_level'. Must be one of: strong, medium, weak.`);
            }
            }
            if (row.show_type ?? row.showType) {
            if (!showTypeKey || !["original", "branded", "partner"].includes(showTypeKey)) {
              validationErrors.push(`Row ${rowNum}: Invalid value for 'show_type'. Must be one of: Original, Branded, Partner.`);
            }
            }


            const numericFields = [
                "minimum_guarantee", "evergreen_ownership_pct", "latest_cpm_usd", "revenue_2023", "revenue_2024", "revenue_2025",
                "shows_per_year", "ad_slots", "avg_show_length_mins", "side_bonus_percent", "youtube_ads_percent",
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
                if (field.includes('_percent') || field === 'evergreen_ownership_pct') {
                    const val = parseFloat(row[field]);
                    if (!isNaN(val) && (val < 0 || val > 100)) {
                        validationErrors.push(`Row ${rowNum}: Value for '${field}' must be between 0 and 100.`);
                    }
                }
            }

            if (validationErrors.length > 0) continue;

            // Create ShowCreate object using snake_case field names that match database columns exactly
            const show: ShowCreate = {
                title: row.title,
                // show_type: row.show_type || undefined,
                // media_type: row.media_type || undefined,
                // relationship_level: row.relationship_level || undefined,
                show_type: showTypeKey ? SHOW_TYPE_MAP[showTypeKey] : undefined,
                media_type: mediaVal ? (mediaVal as "video" | "audio" | "both") : undefined,
                relationship_level: relVal ? (relVal as "strong" | "medium" | "weak") : undefined,            
                start_date: row.start_date || undefined,
                minimum_guarantee: row.minimum_guarantee ? parseFloat(row.minimum_guarantee) : undefined,
                evergreen_ownership_pct: row.evergreen_ownership_pct ? parseFloat(row.evergreen_ownership_pct) : undefined,
                genre_name: row.genre_name || undefined,
                shows_per_year: row.shows_per_year ? parseInt(row.shows_per_year) : undefined,
                show_primary_contact: row.show_primary_contact || undefined,
                age_demographic: row.age_demographic || undefined,
                subnetwork_id: row.subnetwork_id || undefined,
                tentpole: row.tentpole?.toLowerCase() === 'yes' || row.tentpole?.toLowerCase() === 'true' || false,
                is_original: row.is_original?.toLowerCase() === 'yes' || row.is_original?.toLowerCase() === 'true' || false,
                latest_cpm_usd: row.latest_cpm_usd ? parseFloat(row.latest_cpm_usd) : undefined,
                revenue_2023: row.revenue_2023 ? parseFloat(row.revenue_2023) : undefined,
                revenue_2024: row.revenue_2024 ? parseFloat(row.revenue_2024) : undefined,
                revenue_2025: row.revenue_2025 ? parseFloat(row.revenue_2025) : undefined,
                ad_slots: row.ad_slots ? parseInt(row.ad_slots) : undefined,
                avg_show_length_mins: row.avg_show_length_mins ? parseInt(row.avg_show_length_mins) : undefined,
                gender: row.gender || undefined,
                region: row.region || undefined,
                is_active: row.isActive ? row.isActive.toLowerCase() !== 'no' && row.isActive.toLowerCase() !== 'false' : true,
                is_undersized: row.isUndersized?.toLowerCase() === 'yes' || row.isUndersized?.toLowerCase() === 'true' || false,
                show_host_contact: row.show_host_contact || undefined,
                evergreen_production_staff_name: row.evergreen_production_staff_name || undefined,
                side_bonus_percent: row.side_bonus_percent ? parseFloat(row.side_bonus_percent) : undefined,
                youtube_ads_percent: row.youtube_ads_percent ? parseFloat(row.youtube_ads_percent) : undefined,
                subscriptions_percent: row.subscriptions_percent ? parseFloat(row.subscriptions_percent) : undefined,
                standard_ads_percent: row.standard_ads_percent ? parseFloat(row.standard_ads_percent) : undefined,
                sponsorship_ad_fp_lead_percent: row.sponsorship_ad_fp_lead_percent ? parseFloat(row.sponsorship_ad_fp_lead_percent) : undefined,
                sponsorship_ad_partner_lead_percent: row.sponsorship_ad_partner_lead_percent ? parseFloat(row.sponsorship_ad_partner_lead_percent) : undefined,
                sponsorship_ad_partner_sold_percent: row.sponsorship_ad_partner_sold_percent ? parseFloat(row.sponsorship_ad_partner_sold_percent) : undefined,
                programmatic_ads_span_percent: row.programmatic_ads_span_percent ? parseFloat(row.programmatic_ads_span_percent) : undefined,
                merchandise_percent: row.merchandise_percent ? parseFloat(row.merchandise_percent) : undefined,
                branded_revenue_percent: row.branded_revenue_percent ? parseFloat(row.branded_revenue_percent) : undefined,
                marketing_services_revenue_percent: row.marketing_services_revenue_percent ? parseFloat(row.marketing_services_revenue_percent) : undefined,
                direct_customer_hands_off_percent: row.direct_customer_hands_off_percent ? parseFloat(row.direct_customer_hands_off_percent) : undefined,
                youtube_hands_off_percent: row.youtube_hands_off_percent ? parseFloat(row.youtube_hands_off_percent) : undefined,
                subscription_hands_off_percent: row.subscription_hands_off_percent ? parseFloat(row.subscription_hands_off_percent) : undefined,
                has_sponsorship_revenue: row.has_sponsorship_revenue?.toLowerCase() === 'yes' || row.has_sponsorship_revenue?.toLowerCase() === 'true' || false,
                has_non_evergreen_revenue: row.has_non_evergreen_revenue?.toLowerCase() === 'yes' || row.has_non_evergreen_revenue?.toLowerCase() === 'true' || false,
                requires_partner_access: row.requires_partner_access?.toLowerCase() === 'yes' || row.requires_partner_access?.toLowerCase() === 'true' || false,
                has_branded_revenue: row.has_branded_revenue?.toLowerCase() === 'yes' || row.has_branded_revenue?.toLowerCase() === 'true' || false,
                has_marketing_revenue: row.has_marketing_revenue?.toLowerCase() === 'yes' || row.has_marketing_revenue?.toLowerCase() === 'true' || false,
                has_web_mgmt_revenue: row.has_web_mgmt_revenue?.toLowerCase() === 'yes' || row.has_web_mgmt_revenue?.toLowerCase() === 'true' || false,
                primary_education: row.primary_education || undefined,
                secondary_education: row.secondary_education || undefined,
                qbo_show_name: row.qbo_show_name || undefined,
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
            console.log("CSV Import sending data to API:", JSON.stringify(showsToCreate, null, 2))
            const response = await apiClient.bulkCreatePodcasts(showsToCreate);
            onImportComplete({ 
                success: response.failed === 0, 
                message: `Import process completed. ${response.successful} of ${response.total} shows imported.`,
                errors: response.errors
            });
        } catch (err: any) {
            console.error("CSV Import error:", err)
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
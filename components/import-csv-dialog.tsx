"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Loader2, FileText, AlertCircle, BookOpen, CheckCircle, Eye, ArrowLeft } from "lucide-react"
import Papa from "papaparse"
import { apiClient, ShowCreate, DuplicateCheckResult, DuplicateAction } from "@/lib/api-client"

// Map lowercased CSV show_type to canonical values
const SHOW_TYPE_MAP: Record<string, "Original" | "Branded" | "Partner"> = {
  original: "Original",
  branded: "Branded",
  partner: "Partner",
};

// Map lowercased CSV cadence to canonical values
const CADENCE_MAP: Record<string, "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc"> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  "ad hoc": "Ad hoc",
  adhoc: "Ad hoc",
};

// Map lowercased CSV region to canonical values
const REGION_MAP: Record<string, "Urban" | "Rural" | "Both"> = {
  urban: "Urban",
  rural: "Rural",
  both: "Both",
};

// Map user-friendly CSV headers to database column names
const CSV_HEADER_MAPPING: Record<string, string> = {
  // 1. Core Show Information (Most Important)
  "Show Name": "title",
  "Show Type": "show_type", 
  "Format": "media_type",
  "Ranking Category": "ranking_category",
  "Is Original Content": "is_original",
  "Is Rate Card Show": "rate_card",
  
  // 2. Business & Relationship Details
  "Relationship": "relationship_level",
  "Start Date": "start_date", 
  "Minimum Guarantee": "minimum_guarantee",
  "Ownership by Evergreen (%)": "evergreen_ownership_pct",
  "Cadence": "cadence",
  
  // 3. Content & Audience
  "Genre": "genre_name",
  "Age Demographic": "age_demographic",
  "Gender Demographic (M/F)": "gender",
  "Region Demographic": "region",
  "Average Length (Minutes)": "avg_show_length_mins",
  "Ad Slots": "ad_slots",
  
  // 4. Financial Data
  "Latest CPM": "latest_cpm_usd",
  "Revenue 2023": "revenue_2023",
  "Revenue 2024": "revenue_2024", 
  "Revenue 2025": "revenue_2025",
  
  // 5. Revenue Distribution Percentages (with standard_ads_percent and programmatic_ads_span_percent first)
  "Standard Ads (%)": "standard_ads_percent",
  "Programmatic Ads/Span (%)": "programmatic_ads_span_percent",
  "Side Bonus (%)": "side_bonus_percent",
  "YouTube Ads (%)": "youtube_ads_percent",
  "Subscriptions (%)": "subscriptions_percent",
  "Sponsorship Ad FP - Lead (%)": "sponsorship_ad_fp_lead_percent",
  "Sponsorship Ad - Partner Lead (%)": "sponsorship_ad_partner_lead_percent",
  "Sponsorship Ad - Partner Sold (%)": "sponsorship_ad_partner_sold_percent",
  "Merchandise (%)": "merchandise_percent",
  "Branded Revenue (%)": "branded_revenue_percent",
  "Marketing Services Revenue (%)": "marketing_services_revenue_percent",
  
  // 6. Hands-off Percentages
  "Direct Customer - Hands Off (%)": "direct_customer_hands_off_percent",
  "YouTube - Hands Off (%)": "youtube_hands_off_percent",
  "Subscription - Hands Off (%)": "subscription_hands_off_percent",
  
  // 7. Contact Information
  "Primary Contact (Show)": "show_primary_contact",
  "Primary Contact (Host)": "show_host_contact",
  "Evergreen Production Staff Name": "evergreen_production_staff_name",
  
  // 8. System & Operational
  "Subnetwork Name": "subnetwork_id",
  "Is Active": "is_active",
  "Is Undersized": "is_undersized",
  "Primary Education Demographic": "primary_education",
  "Secondary Education Demographic": "secondary_education",
  
  // 9. Revenue Flags
  "Has Sponsorship Revenue": "has_sponsorship_revenue",
  "Has Non Evergreen Revenue": "has_non_evergreen_revenue",
  "Has Partner Ledger Access": "requires_partner_access",
  "Has Branded Revenue": "has_branded_revenue",
  "Has Marketing Revenue": "has_marketing_revenue",
  "Has Web Management Revenue": "has_web_mgmt_revenue",
  
  // 10. Integration Data
  "QBO Show Name": "qbo_show_name",
  "QBO Show ID": "qbo_show_id"
};


interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (result: { success: boolean, message: string, errors?: string[] }) => void
}

interface ImportPreviewRow {
  title: string
  action: "create" | "update" | "skip"
  isDuplicate: boolean
  existingShow?: any
  showData: ShowCreate
}

// User-friendly CSV headers for the template
const CSV_HEADERS = [
  // 1. Core Show Information (Most Important)
  "Show Name", "Show Type", "Format", "Ranking Category", "Is Original Content", "Is Rate Card Show",
  
  // 2. Business & Relationship Details
  "Relationship", "Start Date", "Minimum Guarantee", "Ownership by Evergreen (%)", "Cadence",
  
  // 3. Content & Audience
  "Genre", "Age Demographic", "Gender Demographic (M/F)", "Region Demographic", "Average Length (Minutes)", "Ad Slots",
  
  // 4. Financial Data
  "Latest CPM", "Revenue 2023", "Revenue 2024", "Revenue 2025",
  
  // 5. Revenue Distribution Percentages (with standard_ads_percent and programmatic_ads_span_percent first)
  "Standard Ads (%)", "Programmatic Ads/Span (%)", "Side Bonus (%)", "YouTube Ads (%)",
  "Subscriptions (%)", "Sponsorship Ad FP - Lead (%)", "Sponsorship Ad - Partner Lead (%)", 
  "Sponsorship Ad - Partner Sold (%)", "Merchandise (%)", "Branded Revenue (%)",
  "Marketing Services Revenue (%)",
  
  // 6. Hands-off Percentages
  "Direct Customer - Hands Off (%)", "YouTube - Hands Off (%)", "Subscription - Hands Off (%)",
  
  // 7. Contact Information
  "Primary Contact (Show)", "Primary Contact (Host)", "Evergreen Production Staff Name",
  
  // 8. System & Operational
  "Subnetwork Name", "Is Active", "Is Undersized", "Primary Education Demographic", "Secondary Education Demographic",
  
  // 9. Revenue Flags
  "Has Sponsorship Revenue", "Has Non Evergreen Revenue", "Has Partner Ledger Access",
  "Has Branded Revenue", "Has Marketing Revenue", "Has Web Management Revenue",
  
  // 10. Integration Data
  "QBO Show Name", "QBO Show ID"
];

export default function ImportCSVDialog({ open, onOpenChange, onImportComplete }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // New state for enhanced import flow
  const [showsToImport, setShowsToImport] = useState<ShowCreate[]>([])
  const [duplicateCheckResults, setDuplicateCheckResults] = useState<DuplicateCheckResult[]>([])
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

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
      // Reset enhanced import state
      setShowsToImport([])
      setDuplicateCheckResults([])
      setImportPreview([])
      setShowPreview(false)
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

  // Helper function to map user-friendly headers to database column names
  const mapHeadersToDbColumns = (row: any): any => {
    const mappedRow: any = {};
    for (const [userFriendlyHeader, dbColumn] of Object.entries(CSV_HEADER_MAPPING)) {
      if (row[userFriendlyHeader] !== undefined) {
        mappedRow[dbColumn] = row[userFriendlyHeader];
      }
    }
    return mappedRow;
  };

  const parseCSVData = (data: any[]): { shows: ShowCreate[], errors: string[] } => {
    const shows: ShowCreate[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      // Map user-friendly headers to database column names
      const mappedRow = mapHeadersToDbColumns(row);

      if (!mappedRow.title || mappedRow.title.trim() === "") {
        errors.push(`Row ${rowNum}: Missing required field 'Show Name'.`);
        continue;
      }

      // Case-insensitive enum validation
      const mediaVal = mappedRow.media_type !== undefined
        ? String(mappedRow.media_type).trim().toLowerCase()
        : undefined;

      const relVal = mappedRow.relationship_level !== undefined
        ? String(mappedRow.relationship_level).trim().toLowerCase()
        : undefined;

      const showTypeKey = mappedRow.show_type !== undefined
        ? String(mappedRow.show_type).trim().toLowerCase()
        : undefined;

      const cadenceKey = mappedRow.cadence !== undefined
        ? String(mappedRow.cadence).trim().toLowerCase()
        : undefined;

      const regionKey = mappedRow.region !== undefined
        ? String(mappedRow.region).trim().toLowerCase()
        : undefined;

      if (mappedRow.media_type) {
        if (!["video", "audio", "both"].includes(mediaVal as string)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Format'. Must be one of: Video, Audio, Both.`);
        }
      }
      if (mappedRow.relationship_level) {
        if (!["strong", "medium", "weak"].includes(relVal as string)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Relationship'. Must be one of: Strong, Medium, Weak.`);
        }
      }
      if (mappedRow.show_type) {
        if (!showTypeKey || !["original", "branded", "partner"].includes(showTypeKey)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Show Type'. Must be one of: Original, Branded, Partner.`);
        }
      }

      // Validate ranking_category
      if (mappedRow.ranking_category) {
        const rankingVal = String(mappedRow.ranking_category).trim().toLowerCase();
        // Extract number from various formats: "1", "Level 1", "level 1", etc.
        const rankingMatch = rankingVal.match(/(?:level\s*)?(\d+)/);
        const rankingNumber = rankingMatch ? rankingMatch[1] : rankingVal;
        
        if (!["1", "2", "3", "4", "5"].includes(rankingNumber)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Ranking Category'. Must be one of: 1, 2, 3, 4, 5, Level 1, Level 2, etc.`);
        }
      }

      // Validate cadence
      if (mappedRow.cadence) {
        if (!cadenceKey || !["daily", "weekly", "biweekly", "monthly", "ad hoc", "adhoc"].includes(cadenceKey)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Cadence'. Must be one of: Daily, Weekly, Biweekly, Monthly, Ad hoc.`);
        }
      }

      // Validate region
      if (mappedRow.region) {
        if (!regionKey || !["urban", "rural", "both"].includes(regionKey)) {
          errors.push(`Row ${rowNum}: Invalid value for 'Region Demographic'. Must be one of: Urban, Rural, Both.`);
        }
      }

      const numericFields = [
        "evergreen_ownership_pct", "latest_cpm_usd", "revenue_2023", "revenue_2024", "revenue_2025",
        "ad_slots", "avg_show_length_mins", "side_bonus_percent", "youtube_ads_percent",
        "subscriptions_percent", "standard_ads_percent", "sponsorship_ad_fp_lead_percent",
        "sponsorship_ad_partner_lead_percent", "sponsorship_ad_partner_sold_percent",
        "programmatic_ads_span_percent", "merchandise_percent", "branded_revenue_percent",
        "marketing_services_revenue_percent", "direct_customer_hands_off_percent",
        "youtube_hands_off_percent", "subscription_hands_off_percent"
      ];

      for (const field of numericFields) {
        if (mappedRow[field] && isNaN(parseFloat(mappedRow[field]))) {
          // Find the user-friendly header name for this field
          const userFriendlyName = Object.entries(CSV_HEADER_MAPPING).find(([_, dbCol]) => dbCol === field)?.[0] || field;
          errors.push(`Row ${rowNum}: Invalid number for '${userFriendlyName}'.`);
        }
        if (field.includes('_percent') || field === 'evergreen_ownership_pct') {
          const val = parseFloat(mappedRow[field]);
          if (!isNaN(val) && (val < 0 || val > 100)) {
            const userFriendlyName = Object.entries(CSV_HEADER_MAPPING).find(([_, dbCol]) => dbCol === field)?.[0] || field;
            errors.push(`Row ${rowNum}: Value for '${userFriendlyName}' must be between 0 and 100.`);
          }
        }
      }

      if (errors.length > 0) continue;

      // Create ShowCreate object
      const show: ShowCreate = {
        title: mappedRow.title,
        show_type: showTypeKey ? SHOW_TYPE_MAP[showTypeKey] : undefined,
        media_type: mediaVal ? (mediaVal as "video" | "audio" | "both") : undefined,
        relationship_level: relVal ? (relVal as "strong" | "medium" | "weak") : undefined,
        start_date: mappedRow.start_date || undefined,
        minimum_guarantee: mappedRow.minimum_guarantee?.toLowerCase() === 'yes' || mappedRow.minimum_guarantee?.toLowerCase() === 'true' || false,
        evergreen_ownership_pct: mappedRow.evergreen_ownership_pct ? parseFloat(mappedRow.evergreen_ownership_pct) : undefined,
        genre_name: mappedRow.genre_name || undefined,
        cadence: cadenceKey ? CADENCE_MAP[cadenceKey] : undefined,
        show_primary_contact: mappedRow.show_primary_contact || undefined,
        age_demographic: mappedRow.age_demographic || undefined,
        subnetwork_id: mappedRow.subnetwork_id || undefined,
        rate_card: mappedRow.rate_card?.toLowerCase() === 'yes' || mappedRow.rate_card?.toLowerCase() === 'true' || false,
        is_original: mappedRow.is_original?.toLowerCase() === 'yes' || mappedRow.is_original?.toLowerCase() === 'true' || false,
        ranking_category: mappedRow.ranking_category ? (() => {
          const rankingVal = String(mappedRow.ranking_category).trim().toLowerCase();
          const rankingMatch = rankingVal.match(/(?:level\s*)?(\d+)/);
          const rankingNumber = rankingMatch ? rankingMatch[1] : rankingVal;
          return rankingNumber as "1" | "2" | "3" | "4" | "5";
        })() : undefined,
        latest_cpm_usd: mappedRow.latest_cpm_usd ? parseFloat(mappedRow.latest_cpm_usd) : undefined,
        revenue_2023: mappedRow.revenue_2023 ? parseFloat(mappedRow.revenue_2023) : undefined,
        revenue_2024: mappedRow.revenue_2024 ? parseFloat(mappedRow.revenue_2024) : undefined,
        revenue_2025: mappedRow.revenue_2025 ? parseFloat(mappedRow.revenue_2025) : undefined,
        ad_slots: mappedRow.ad_slots ? parseInt(mappedRow.ad_slots) : undefined,
        avg_show_length_mins: mappedRow.avg_show_length_mins ? parseInt(mappedRow.avg_show_length_mins) : undefined,
        gender: mappedRow.gender || undefined,
        region: regionKey ? REGION_MAP[regionKey] : undefined,
        is_active: mappedRow.is_active ? mappedRow.is_active.toLowerCase() !== 'no' && mappedRow.is_active.toLowerCase() !== 'false' : true,
        is_undersized: mappedRow.is_undersized?.toLowerCase() === 'yes' || mappedRow.is_undersized?.toLowerCase() === 'true' || false,
        show_host_contact: mappedRow.show_host_contact || undefined,
        evergreen_production_staff_name: mappedRow.evergreen_production_staff_name || undefined,
        side_bonus_percent: mappedRow.side_bonus_percent ? parseFloat(mappedRow.side_bonus_percent) : undefined,
        youtube_ads_percent: mappedRow.youtube_ads_percent ? parseFloat(mappedRow.youtube_ads_percent) : undefined,
        subscriptions_percent: mappedRow.subscriptions_percent ? parseFloat(mappedRow.subscriptions_percent) : undefined,
        standard_ads_percent: mappedRow.standard_ads_percent ? parseFloat(mappedRow.standard_ads_percent) : undefined,
        sponsorship_ad_fp_lead_percent: mappedRow.sponsorship_ad_fp_lead_percent ? parseFloat(mappedRow.sponsorship_ad_fp_lead_percent) : undefined,
        sponsorship_ad_partner_lead_percent: mappedRow.sponsorship_ad_partner_lead_percent ? parseFloat(mappedRow.sponsorship_ad_partner_lead_percent) : undefined,
        sponsorship_ad_partner_sold_percent: mappedRow.sponsorship_ad_partner_sold_percent ? parseFloat(mappedRow.sponsorship_ad_partner_sold_percent) : undefined,
        programmatic_ads_span_percent: mappedRow.programmatic_ads_span_percent ? parseFloat(mappedRow.programmatic_ads_span_percent) : undefined,
        merchandise_percent: mappedRow.merchandise_percent ? parseFloat(mappedRow.merchandise_percent) : undefined,
        branded_revenue_percent: mappedRow.branded_revenue_percent ? parseFloat(mappedRow.branded_revenue_percent) : undefined,
        marketing_services_revenue_percent: mappedRow.marketing_services_revenue_percent ? parseFloat(mappedRow.marketing_services_revenue_percent) : undefined,
        direct_customer_hands_off_percent: mappedRow.direct_customer_hands_off_percent ? parseFloat(mappedRow.direct_customer_hands_off_percent) : undefined,
        youtube_hands_off_percent: mappedRow.youtube_hands_off_percent ? parseFloat(mappedRow.youtube_hands_off_percent) : undefined,
        subscription_hands_off_percent: mappedRow.subscription_hands_off_percent ? parseFloat(mappedRow.subscription_hands_off_percent) : undefined,
        has_sponsorship_revenue: mappedRow.has_sponsorship_revenue?.toLowerCase() === 'yes' || mappedRow.has_sponsorship_revenue?.toLowerCase() === 'true' || false,
        has_non_evergreen_revenue: mappedRow.has_non_evergreen_revenue?.toLowerCase() === 'yes' || mappedRow.has_non_evergreen_revenue?.toLowerCase() === 'true' || false,
        requires_partner_access: mappedRow.requires_partner_access?.toLowerCase() === 'yes' || mappedRow.requires_partner_access?.toLowerCase() === 'true' || false,
        has_branded_revenue: mappedRow.has_branded_revenue?.toLowerCase() === 'yes' || mappedRow.has_branded_revenue?.toLowerCase() === 'true' || false,
        has_marketing_revenue: mappedRow.has_marketing_revenue?.toLowerCase() === 'yes' || mappedRow.has_marketing_revenue?.toLowerCase() === 'true' || false,
        has_web_mgmt_revenue: mappedRow.has_web_mgmt_revenue?.toLowerCase() === 'yes' || mappedRow.has_web_mgmt_revenue?.toLowerCase() === 'true' || false,
        primary_education: mappedRow.primary_education || undefined,
        secondary_education: mappedRow.secondary_education || undefined,
        qbo_show_name: mappedRow.qbo_show_name || undefined,
        qbo_show_id: mappedRow.qbo_show_id ? parseInt(mappedRow.qbo_show_id) : undefined,
      };
      shows.push(show);
    }

    return { shows, errors };
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
      complete: async (results: Papa.ParseResult<any>) => {
        const { data, errors: parsingErrors } = results;

        if (parsingErrors.length > 0) {
          setError(`Error parsing CSV: ${parsingErrors[0].message}`);
          setIsImporting(false);
          return;
        }

        // Parse CSV data
        const { shows, errors: validationErrors } = parseCSVData(data);

        if (validationErrors.length > 0) {
          onImportComplete({ success: false, message: "Import failed due to validation errors.", errors: validationErrors });
          setIsImporting(false);
          onOpenChange(false);
          return;
        }

        if (shows.length === 0) {
          setError("No valid shows found in CSV file.");
          setIsImporting(false);
          return;
        }

        // Store shows and check for duplicates
        setShowsToImport(shows);
        await checkForDuplicates(shows);
      },
      error: (err: Error) => {
        setError(err.message);
        setIsImporting(false);
      }
    });
  };

  const checkForDuplicates = async (shows: ShowCreate[]) => {
    setIsCheckingDuplicates(true);
    try {
      const duplicateResults = await apiClient.checkDuplicates(shows);
      setDuplicateCheckResults(duplicateResults.duplicates);
      
      // Create preview rows
      const previewRows: ImportPreviewRow[] = shows.map((show, index) => {
        const duplicateResult = duplicateResults.duplicates[index];
        return {
          title: show.title,
          action: duplicateResult.exists ? "update" : "create",
          isDuplicate: duplicateResult.exists,
          existingShow: duplicateResult.existing_show,
          showData: show
        };
      });
      
      setImportPreview(previewRows);
      setShowPreview(true);
    } catch (error: any) {
      setError(`Failed to check for duplicates: ${error.message}`);
    } finally {
      setIsCheckingDuplicates(false);
      setIsImporting(false);
    }
  };

  const handlePreviewActionChange = (title: string, action: "create" | "update" | "skip") => {
    setImportPreview(prev => 
      prev.map(row => 
        row.title === title ? { ...row, action } : row
      )
    );
  };

  const handleFinalImport = async () => {
    setIsImporting(true);
    try {
      const actions: DuplicateAction[] = importPreview.map(row => ({
        title: row.title,
        action: row.action
      }));

      const response = await apiClient.bulkCreatePodcastsWithActions(showsToImport, actions);
      
      onImportComplete({
        success: response.failed === 0,
        message: response.message,
        errors: response.errors
      });
      
      onOpenChange(false);
    } catch (error: any) {
      setError(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPreview ? (
              <>
                <Eye className="h-5 w-5 text-emerald-600" />
                Import Preview
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-emerald-600" />
                Import Shows from CSV
              </>
            )}
          </DialogTitle>
          {showPreview && (
            <DialogDescription className="flex items-center justify-between">
              <span>Review and configure how each show will be imported. Duplicates are highlighted.</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {!showPreview ? (
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
          ) : (
            <div className="py-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">Show Title</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Action</th>
                        <th className="p-3 text-left font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{row.title}</td>
                          <td className="p-3">
                            {row.isDuplicate ? (
                              <Badge variant="destructive" className="text-xs">
                                Duplicate Found
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                New Show
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Select
                              value={row.action}
                              onValueChange={(value: "create" | "update" | "skip") => 
                                handlePreviewActionChange(row.title, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="create">Create New</SelectItem>
                                <SelectItem value="update" disabled={!row.isDuplicate}>
                                  Update Existing
                                </SelectItem>
                                <SelectItem value="skip">Skip</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {row.isDuplicate && row.existingShow ? (
                              <div>
                                <p>Existing: {row.existingShow.title}</p>
                              </div>
                            ) : (
                              <p>Will create new show</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-background">
          {showPreview ? (
            <>
              <div className="flex items-center gap-6 text-sm text-foreground">
                <span><strong>Total:</strong> {importPreview.length} shows</span>
                <span><strong>To Create:</strong> {importPreview.filter(r => r.action === 'create').length}</span>
                <span><strong>To Update:</strong> {importPreview.filter(r => r.action === 'update').length}</span>
                <span><strong>To Skip:</strong> {importPreview.filter(r => r.action === 'skip').length}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleFinalImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Selected
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleImport} disabled={!file || isImporting || isCheckingDuplicates}>
                  {isImporting || isCheckingDuplicates ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCheckingDuplicates ? "Checking..." : "Importing..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
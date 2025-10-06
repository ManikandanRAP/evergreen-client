"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Save, X, AlertCircle, Loader2, Edit, RotateCcw, FileText, DollarSign, Radio, Users, Check, BarChart3, Handshake, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Show } from "@/lib/api-client"
import { ShowCreate, ShowUpdate, fetchAllclass, apiClient } from "@/lib/api-client" // Import both types
import { toast } from "@/hooks/use-toast"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { CustomPopoverContent } from "@/components/ui/custom-popover-content"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronsUpDown } from "lucide-react"

interface CreateShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShow?: Show | null
  onShowUpdated?: () => void
  createShow: (showData: Partial<ShowCreate>) => Promise<Show | null>
  updateShow: (showId: string, showData: Partial<ShowUpdate>) => Promise<Show | null>
  existingShows: Show[]
  onEditExistingShow?: (show: Show) => void
}

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

// Strict YYYY-MM-DD + real calendar date + bounds check
function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  if (y < 1900 || y > 2100) return false
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

// Only accept empty or proper YYYY-MM-DD from the date input
function handleDateOnly(
  e: React.ChangeEvent<HTMLInputElement>,
  set: (field: keyof ShowFormData, value: any) => void
) {
  const next = e.target.value
  if (next === "" || /^\d{4}-\d{2}-\d{2}$/.test(next)) {
    set("start_date", next)
  }
}


const educationLevels = ["No High School", "High School", "College", "Postgraduate"] as const
type EducationLevel = (typeof educationLevels)[number] | ""

export interface ShowFormData {
  // Basic Info
  title: string
  show_type: "Branded" | "Original" | "Partner" | ""
  ranking_category: "1" | "2" | "3" | "4" | "5" | ""
  subnetwork_id: string
  format: "Video" | "Audio" | "Both" | ""
  relationship: "Strong" | "Medium" | "Weak" | ""
  start_date: string
  isRateCard: boolean
  isOriginal: boolean
  qbo_show_id?: string // keep as string for Select value; will convert on save
  qbo_show_name?: string

  // Financial
  minimumGuarantee: boolean
  ownershipPercentage: string
  hasBrandedRevenue: boolean
  hasMarketingRevenue: boolean
  hasWebManagementRevenue: boolean
  latestCPM: string
  spanCPM: string
  revenue2023: string
  revenue2024: string
  revenue2025: string
  hasSponsorshipRevenue: boolean
  hasNonEvergreenRevenue: boolean
  requiresPartnerLedgerAccess: boolean

  // Contract Splits
  sideBonusPercent: string
  youtubeAdsPercent: string
  subscriptionsPercent: string
  standardAdsPercent: string
  sponsorshipAdFpLeadPercent: string
  sponsorshipAdPartnerLeadPercent: string
  sponsorshipAdPartnerSoldPercent: string
  programmaticAdsSpanPercent: string
  merchandisePercent: string
  brandedRevenuePercent: string
  marketingServicesRevenuePercent: string

  // Hands Off Splits
  directCustomerHandsOffPercent: string
  youtubeHandsOffPercent: string
  subscriptionHandsOffPercent: string

  // Content Details
  genre_name: string
  cadence: string
  adSlots: string
  averageLength: string
  primaryContactHost: string
  primaryContactShow: string
  evergreenProductionStaffContact: string

  // Demographics
  age_demographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | ""
  gender: string
  region: "Urban" | "Rural" | "Both" | ""
  primaryEducationDemographic: EducationLevel
  secondaryEducationDemographic: EducationLevel
  is_active: boolean
  is_undersized: boolean
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: ShowFormData = {
  // Basic Info
  title: "",
  show_type: "",
  ranking_category: "",
  subnetwork_id: "",
  format: "",
  relationship: "",
  start_date: "",
  isRateCard: false,
  isOriginal: false,
  qbo_show_id: "",
  qbo_show_name: "",

  // Financial
  minimumGuarantee: false,
  ownershipPercentage: "",
  hasBrandedRevenue: false,
  hasMarketingRevenue: false,
  hasWebManagementRevenue: false,
  latestCPM: "",
  spanCPM: "",
  revenue2023: "",
  revenue2024: "",
  revenue2025: "",
  hasSponsorshipRevenue: false,
  hasNonEvergreenRevenue: false,
  requiresPartnerLedgerAccess: false,

  // Contract Splits
  sideBonusPercent: "",
  youtubeAdsPercent: "",
  subscriptionsPercent: "",
  standardAdsPercent: "",
  sponsorshipAdFpLeadPercent: "",
  sponsorshipAdPartnerLeadPercent: "",
  sponsorshipAdPartnerSoldPercent: "",
  programmaticAdsSpanPercent: "",
  merchandisePercent: "",
  brandedRevenuePercent: "",
  marketingServicesRevenuePercent: "",

  // Hands Off Splits
  directCustomerHandsOffPercent: "",
  youtubeHandsOffPercent: "",
  subscriptionHandsOffPercent: "",

  // Content Details
  genre_name: "",
  cadence: "",
  adSlots: "",
  averageLength: "",
  primaryContactHost: "",
  primaryContactShow: "",
  evergreenProductionStaffContact: "",

  // Demographics
  age_demographic: "",
  gender: "",
  region: "",
  primaryEducationDemographic: "",
  secondaryEducationDemographic: "",
  is_active: true,
  is_undersized: false,
}

const genre_names = [
  "History",
  "Human Resources",
  "Human Interest",
  "Fun & Nostalgia",
  "True Crime",
  "Financial",
  "News & Politics",
  "Movies",
  "Music",
  "Religious",
  "Health & Wellness",
  "Parenting",
  "Lifestyle",
  "Storytelling",
  "Literature",
  "Sports",
  "Pop Culture",
  "Arts",
  "Business",
  "Philosophy",
]

const requiredFields = {
  basic: ["title"],
  financial: [],
  content: [],
  demographics: [],
}

export default function CreateShowDialog({
  open,
  onOpenChange,
  editingShow,
  onShowUpdated,
  createShow,
  updateShow,
  existingShows,
  onEditExistingShow,
}: CreateShowDialogProps) {
  const [formData, setFormData] = useState<ShowFormData>(initialFormData)
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [qboOptions, setQboOptions] = useState<{ id: number; name: string }[]>([])
  const [isQboOpen, setIsQboOpen] = useState(false)
  const [genreName, setGenreName] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{ isDuplicate: boolean; existingShow?: any; isArchived?: boolean } | null>(null)
  const [isUnarchiving, setIsUnarchiving] = useState(false)
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false)


  const isEditMode = !!editingShow

  // Debounced duplicate checking
  useEffect(() => {
    if (!formData.title || formData.title.trim() === "") {
      setDuplicateCheckResult(null)
      return
    }

    // Skip checking if we're editing the same show
    if (isEditMode && editingShow?.title?.toLowerCase() === formData.title.toLowerCase()) {
      setDuplicateCheckResult({ isDuplicate: false })
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingDuplicate(true)
      try {
        // Create a temporary show object to check for duplicates
        const tempShow: ShowCreate = { title: formData.title }
        const result = await apiClient.checkSingleDuplicate(tempShow)
        
        setDuplicateCheckResult({
          isDuplicate: result.exists,
          existingShow: result.existing_show,
          isArchived: result.is_archived
        })
      } catch (error) {
        console.error("Error checking duplicate:", error)
        // Don't set result to null on error - keep previous state
        // This prevents flickering between available/unavailable states
      } finally {
        setIsCheckingDuplicate(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [formData.title, isEditMode, editingShow?.title])

  useEffect(() => {
    if (editingShow) {
      const show_type = editingShow.show_type || ""
      setFormData({
        title: editingShow.title ?? "",
        show_type: editingShow.show_type as "" | "Branded" | "Original" | "Partner",
        ranking_category: editingShow.ranking_category ?? "",
        subnetwork_id: editingShow.subnetwork_id ?? "",
        format: editingShow.media_type === "video" ? "Video" : editingShow.media_type === "audio" ? "Audio" : editingShow.media_type === "both" ? "Both" : "",
        relationship: editingShow.relationship_level === "strong" ? "Strong" : editingShow.relationship_level === "medium" ? "Medium" : editingShow.relationship_level === "weak" ? "Weak" : "",
        start_date: editingShow.start_date ? new Date(editingShow.start_date).toISOString().split('T')[0] : "",
        isRateCard: !!editingShow.rate_card,
        isOriginal: !!editingShow.is_original,
        minimumGuarantee: !!editingShow.minimum_guarantee,
        ownershipPercentage: editingShow.evergreen_ownership_pct?.toString() ?? "",
        hasBrandedRevenue: !!editingShow.has_branded_revenue,
        hasMarketingRevenue: !!editingShow.has_marketing_revenue,
        hasWebManagementRevenue: !!editingShow.has_web_mgmt_revenue,
        latestCPM: editingShow.latest_cpm_usd?.toString() ?? "",
        spanCPM: editingShow.span_cpm_usd?.toString() ?? "",
        revenue2023: editingShow.revenue_2023?.toString() ?? "",
        revenue2024: editingShow.revenue_2024?.toString() ?? "",
        revenue2025: editingShow.revenue_2025?.toString() ?? "",
        hasSponsorshipRevenue: !!editingShow.has_sponsorship_revenue,
        hasNonEvergreenRevenue: !!editingShow.has_non_evergreen_revenue,
        requiresPartnerLedgerAccess: !!editingShow.requires_partner_access,
        sideBonusPercent: editingShow.side_bonus_percent?.toString() ?? "",
        youtubeAdsPercent: editingShow.youtube_ads_percent?.toString() ?? "",
        subscriptionsPercent: editingShow.subscriptions_percent?.toString() ?? "",
        standardAdsPercent: editingShow.standard_ads_percent?.toString() ?? "",
        sponsorshipAdFpLeadPercent: editingShow.sponsorship_ad_fp_lead_percent?.toString() ?? "",
        sponsorshipAdPartnerLeadPercent: editingShow.sponsorship_ad_partner_lead_percent?.toString() ?? "",
        sponsorshipAdPartnerSoldPercent: editingShow.sponsorship_ad_partner_sold_percent?.toString() ?? "",
        programmaticAdsSpanPercent: editingShow.programmatic_ads_span_percent?.toString() ?? "",
        merchandisePercent: editingShow.merchandise_percent?.toString() ?? "",
        brandedRevenuePercent: editingShow.branded_revenue_percent?.toString() ?? "",
        marketingServicesRevenuePercent: editingShow.marketing_services_revenue_percent?.toString() ?? "",
        directCustomerHandsOffPercent: editingShow.direct_customer_hands_off_percent?.toString() ?? "",
        youtubeHandsOffPercent: editingShow.youtube_hands_off_percent?.toString() ?? "",
        subscriptionHandsOffPercent: editingShow.subscription_hands_off_percent?.toString() ?? "",
        genre_name: editingShow.genre_name ?? "",
        cadence: editingShow.cadence ?? "",
        adSlots: editingShow.ad_slots?.toString() ?? "",
        averageLength: editingShow.avg_show_length_mins?.toString() ?? "",
        primaryContactHost: editingShow.show_host_contact ?? "",
        primaryContactShow: editingShow.show_primary_contact ?? "",
        evergreenProductionStaffContact: editingShow.evergreen_production_staff_name ?? "",
        age_demographic: editingShow.age_demographic ?? "",
        gender: editingShow.gender ?? "",
        region: (editingShow.region || "") as "Both" | "Urban" | "Rural",
        primaryEducationDemographic: (editingShow.primary_education || "") as EducationLevel,
        secondaryEducationDemographic: (editingShow.secondary_education || "") as EducationLevel,
        is_active: !!editingShow.is_active,
        is_undersized: !!editingShow.is_undersized,
        qbo_show_id: editingShow.qbo_show_id ? String(editingShow.qbo_show_id) : "",
        qbo_show_name: editingShow.qbo_show_name ?? "",
      })
    } else {
      setFormData(initialFormData)
    }    
  }, [editingShow])
  
  useEffect(() => {
    if (open) {
      fetchAllclass()
        .then(setQboOptions)
        .catch((e) => console.error("Failed to load QBO shows:", e))
    }
  }, [open])

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <FileText className="h-4 w-4" /> },
    { id: "financial", label: "Financial", icon: <DollarSign className="h-4 w-4" /> },
    { id: "content", label: "Content Details", icon: <Radio className="h-4 w-4" /> },
    { id: "demographics", label: "Demographics", icon: <Users className="h-4 w-4" /> },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab)

  const validateField = (field: keyof ShowFormData, value: any): string => {
    if (field === "title") {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return "This field is required"
      }
      
      // Use real-time duplicate check result if available
      if (duplicateCheckResult?.isDuplicate && duplicateCheckResult.existingShow) {
        if (duplicateCheckResult.isArchived) {
          return `A show with this name already exists and is archived: "${duplicateCheckResult.existingShow.title}". Please choose a different name or unarchive and edit the show.`
        } else {
          return `A show with this name already exists: "${duplicateCheckResult.existingShow.title}". Please choose a different name or edit the existing show.`
        }
      }
      
      // Fallback to local check if real-time check hasn't completed yet
      const duplicateShow = existingShows.find(
        (show) => show.title.toLowerCase() === value.toLowerCase() && show.id !== editingShow?.id,
      )
      if (duplicateShow) {
        return `A show with this name already exists: "${duplicateShow.title}". Please choose a different name or edit the existing show.`
      }
    }

    const numberFields = [
      "ownershipPercentage", "minimumGuarantee", "latestCPM", "revenue2023",
      "revenue2024", "revenue2025", "adSlots", "averageLength",
      "sideBonusPercent", "youtubeAdsPercent", "subscriptionsPercent", "standardAdsPercent",
      "sponsorshipAdFpLeadPercent", "sponsorshipAdPartnerLeadPercent", "sponsorshipAdPartnerSoldPercent",
      "programmaticAdsSpanPercent", "merchandisePercent", "brandedRevenuePercent",
      "marketingServicesRevenuePercent", "directCustomerHandsOffPercent",
      "youtubeHandsOffPercent", "subscriptionHandsOffPercent",
    ]

    if (numberFields.includes(field as string)) {
      if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
        return "Must be a valid positive number"
      }
      if (field.toLowerCase().includes('percent') || field === 'ownershipPercentage') {
        if (value !== "" && (Number(value) < 0 || Number(value) > 100)) {
          return "Percentage must be between 0 and 100"
        }
      }
    }


    if (field === "gender" && value && !/^\d{1,3}\/\d{1,3}$/.test(value)) {
      return "Format must be MM/FF (e.g., 60/40)"
    }

    if (field === "start_date") {
      if (value && !isValidIsoDate(value)) {
        return `Please choose a valid date between ${DATE_MIN} and ${DATE_MAX}`
      }
    }    

    return ""
  }
  
  const validateCurrentTab = (): boolean => {
    if (currentTab === 'basic') {
        const error = validateField('title', formData.title);
        if (error) {
            setErrors({ title: error });
            return false;
        }
        
        // Check for duplicate result and set error in the errors state
        if (duplicateCheckResult?.isDuplicate) {
            const duplicateError = duplicateCheckResult.isArchived 
                ? `A show with this name already exists and is archived: "${duplicateCheckResult.existingShow.title}". Please choose a different name or unarchive and edit the show.`
                : `A show with this name already exists: "${duplicateCheckResult.existingShow.title}". Please choose a different name or edit the existing show.`;
            setErrors({ title: duplicateError });
            return false;
        }
    }
    setErrors({});
    return true;
  }

  const validateAllTabs = (): boolean => {
    const allErrors: FormErrors = {}
    let isValid = true

    const error = validateField('title', formData.title)
    if (error) {
        allErrors['title'] = error
        isValid = false
    }

    // Also check if we're currently checking for duplicates
    if (isCheckingDuplicate) {
        allErrors['title'] = "Please wait while we check for duplicates..."
        isValid = false
    }

    // Check if we have a duplicate result
    if (duplicateCheckResult?.isDuplicate) {
        allErrors['title'] = `A show with this name already exists: "${duplicateCheckResult.existingShow?.title}". Please choose a different name or edit the existing show.`
        isValid = false
    }
    
    setErrors(allErrors)
    return isValid
  }

  const handleInputChange = (field: keyof ShowFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Clear duplicate check result when title changes (but not when navigating tabs)
    if (field === "title" && value !== formData.title) {
      setDuplicateCheckResult(null)
    }
  }

  const handleNext = () => {
    if (validateCurrentTab()) {
        if (currentTabIndex < tabs.length - 1) {
            setCurrentTab(tabs[currentTabIndex + 1].id)
        }
    }
  }

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(tabs[currentTabIndex - 1].id)
    }
  }

  const handleUnarchiveShow = () => {
    if (!duplicateCheckResult?.existingShow) return
    setShowUnarchiveConfirm(true)
  }

  const handleConfirmUnarchive = async () => {
    if (!duplicateCheckResult?.existingShow) return
    
    setIsUnarchiving(true)
    try {
      await apiClient.unarchiveShow(duplicateCheckResult.existingShow.id)
      toast({
        title: "Show unarchived successfully",
        description: `"${duplicateCheckResult.existingShow.title}" has been unarchived and is now available for editing.`,
      })
      
      // Close the create dialog
      onOpenChange(false)
      setShowUnarchiveConfirm(false)
      
      // Refresh the shows list in the parent component
      if (onShowUpdated) {
        await onShowUpdated()
      }
      
      // Open the edit dialog for the unarchived show after the list is refreshed
      if (onEditExistingShow) {
        // Small delay to ensure the shows list is refreshed before opening edit dialog
        setTimeout(() => {
          onEditExistingShow(duplicateCheckResult.existingShow)
        }, 200)
      }
    } catch (error) {
      console.error("Error unarchiving show:", error)
      toast({
        title: "Error unarchiving show",
        description: "Failed to unarchive the show. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUnarchiving(false)
    }
  }

  const handleSave = async () => {
    setAttemptedSubmit(true)
    if (!validateAllTabs()) {
      setCurrentTab('basic')
      return
    }

    setIsSubmitting(true)

    const toFloatOrUndef = (s: string | null | undefined) => {
      if (s === "" || s === undefined || s === null) return undefined
      const n = parseFloat(s as string)
      return Number.isFinite(n) ? n : undefined
    }
    const toIntOrUndef = (s: string | null | undefined) => {
      if (s === "" || s === undefined || s === null) return undefined
      const n = parseInt(s as string, 10)
      return Number.isFinite(n) ? n : undefined
    }

    // Guard invalid dates (prevents 422 from backend)
    if (formData.start_date && !isValidIsoDate(formData.start_date)) {
      setErrors((prev) => ({ ...prev, start_date: `Please choose a valid date between ${DATE_MIN} and ${DATE_MAX}` }))
      setCurrentTab("basic")
      setIsSubmitting(false)
      return
    }

    // Convert form data to use exact field names that match your database schema
    const showData: Partial<ShowCreate | ShowUpdate> = {
      title: formData.title,
      minimum_guarantee: formData.minimumGuarantee,
      media_type: formData.format === "Video" ? "video" : formData.format === "Audio" ? "audio" : formData.format === "Both" ? "both" : undefined,
      rate_card: formData.isRateCard,
      relationship_level: formData.relationship === "Strong" ? "strong" : formData.relationship === "Medium" ? "medium" : formData.relationship === "Weak" ? "weak" : undefined,
      show_type: formData.show_type || undefined,
      ranking_category: formData.ranking_category || undefined,
      evergreen_ownership_pct: toFloatOrUndef(formData.ownershipPercentage),
      has_sponsorship_revenue: formData.hasSponsorshipRevenue,
      has_non_evergreen_revenue: formData.hasNonEvergreenRevenue,
      requires_partner_access: formData.requiresPartnerLedgerAccess,
      has_branded_revenue: formData.hasBrandedRevenue,
      has_marketing_revenue: formData.hasMarketingRevenue,
      has_web_mgmt_revenue: formData.hasWebManagementRevenue,
      genre_name: formData.genre_name || undefined,
      is_original: formData.isOriginal,
      cadence: (formData.cadence as "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc") || undefined,
      latest_cpm_usd: toFloatOrUndef(formData.latestCPM),
      span_cpm_usd: toFloatOrUndef(formData.spanCPM),
      ad_slots: toIntOrUndef(formData.adSlots),
      avg_show_length_mins: toIntOrUndef(formData.averageLength),
      start_date: formData.start_date || undefined,
      side_bonus_percent: toFloatOrUndef(formData.sideBonusPercent),
      youtube_ads_percent: toFloatOrUndef(formData.youtubeAdsPercent),
      subscriptions_percent: toFloatOrUndef(formData.subscriptionsPercent),
      standard_ads_percent: toFloatOrUndef(formData.standardAdsPercent),
      sponsorship_ad_fp_lead_percent: toFloatOrUndef(formData.sponsorshipAdFpLeadPercent),
      sponsorship_ad_partner_lead_percent: toFloatOrUndef(formData.sponsorshipAdPartnerLeadPercent),
      sponsorship_ad_partner_sold_percent: toFloatOrUndef(formData.sponsorshipAdPartnerSoldPercent),
      programmatic_ads_span_percent: toFloatOrUndef(formData.programmaticAdsSpanPercent),
      merchandise_percent: toFloatOrUndef(formData.merchandisePercent),
      branded_revenue_percent: toFloatOrUndef(formData.brandedRevenuePercent),
      marketing_services_revenue_percent: toFloatOrUndef(formData.marketingServicesRevenuePercent),
      direct_customer_hands_off_percent: toFloatOrUndef(formData.directCustomerHandsOffPercent),
      youtube_hands_off_percent: toFloatOrUndef(formData.youtubeHandsOffPercent),
      subscription_hands_off_percent: toFloatOrUndef(formData.subscriptionHandsOffPercent),
      revenue_2023: toFloatOrUndef(formData.revenue2023),
      revenue_2024: toFloatOrUndef(formData.revenue2024),
      revenue_2025: toFloatOrUndef(formData.revenue2025),
      evergreen_production_staff_name: formData.evergreenProductionStaffContact || undefined,
      show_host_contact: formData.primaryContactHost || undefined,
      show_primary_contact: formData.primaryContactShow || undefined,
      age_demographic: formData.age_demographic || undefined,
      gender: formData.gender || undefined,
      region: formData.region || undefined,
      primary_education: formData.primaryEducationDemographic || undefined,
      secondary_education: formData.secondaryEducationDemographic || undefined,
      subnetwork_id: formData.subnetwork_id || undefined,
      is_active: formData.is_active,      // camelCase to match your database
      is_undersized: formData.is_undersized, // camelCase to match your database
      qbo_show_id: toIntOrUndef(formData.qbo_show_id),
      qbo_show_name: formData.qbo_show_name || undefined,
    }

    console.log("Show data being sent to API:", showData)

    try {
      if (isEditMode && editingShow?.id) {
        await updateShow(editingShow.id, showData as Partial<ShowUpdate>)
      } else {
        await createShow(showData as Partial<ShowCreate>)
      }
      onShowUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save show:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setCurrentTab("basic")
    setErrors({})
    setAttemptedSubmit(false)
    onOpenChange(false)
  }

  const handleEditExistingShow = () => {
    if (duplicateCheckResult?.existingShow && onEditExistingShow) {
      console.log("Edit existing show clicked, data:", duplicateCheckResult.existingShow)
      
      // Pass the existing show directly since we're now using the API interface
      onEditExistingShow(duplicateCheckResult.existingShow)
    }
  }
  
  const isTabComplete = (tabId: string) => {
    if (tabId === 'basic') {
        return !validateField('title', formData.title);
    }
    return true;
  }

  const hasTabErrors = (tabId: string) => {
    if (tabId === 'basic') {
        return !!errors['title'];
    }
    return false;
  }

  const getFieldError = (field: string) => errors[field]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl w-full sm:w-[90%] h-screen sm:h-[90vh] flex flex-col p-0 overflow-hidden dark:bg-black border-0 [&>button:not(.navigation-button)]:hidden sm:translate-x-[-50%] sm:translate-y-[-50%] sm:left-[50%] sm:top-[50%]"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on popover content
          const target = e.target as Element;
          if (target.closest('[data-radix-popover-content]') || 
              target.closest('[data-radix-select-content]') ||
              target.closest('[data-radix-command]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent dialog from closing when interacting with popover content
          const target = e.target as Element;
          if (target.closest('[data-radix-popover-content]') || 
              target.closest('[data-radix-select-content]') ||
              target.closest('[data-radix-command]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-background dark:bg-[#262626] border-b dark:border-slate-800">
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Show" : "Create New Show"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden px-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 text-xs sm:text-sm relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  isTabComplete(tab.id) &&
                    currentTab !== tab.id &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                  hasTabErrors(tab.id) &&
                    attemptedSubmit &&
                    currentTab !== tab.id &&
                    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {isTabComplete(tab.id) && !hasTabErrors(tab.id) && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </Badge>
                )}
                {hasTabErrors(tab.id) && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                    !
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><FileText className="h-4 w-4" /> Basic Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Enter the fundamental details about your show</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Show Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter Show Name"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className={cn("h-10", getFieldError("title") && "border-red-500")}
                      />
                      {getFieldError("title") && !duplicateCheckResult?.isDuplicate && !getFieldError("title")?.includes("already exists") && (
                        <div className="text-xs sm:text-sm text-red-500">
                          <div className="flex items-center gap-1 mb-2">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("title")}
                          </div>
                        </div>
                      )}
                      {formData.title && !isCheckingDuplicate && (
                        <div className="text-xs text-muted-foreground">
                          {duplicateCheckResult?.isDuplicate ? (
                            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                              <div className="text-xs text-orange-800">
                                <p className="mb-2">
                                  A show named "{duplicateCheckResult.existingShow?.title}" already exists{duplicateCheckResult.isArchived ? " and is archived" : ""}. 
                                  Choose a different name, or
                                </p>
                                <div>
                                  {duplicateCheckResult.isArchived ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleUnarchiveShow}
                                      disabled={isUnarchiving}
                                      className="h-7 px-2 text-xs bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800 hover:text-orange-900"
                                    >
                                      {isUnarchiving ? (
                                        <>
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                          Unarchiving...
                                        </>
                                      ) : (
                                        <>
                                          <RotateCcw className="h-3 w-3 mr-1" />
                                          Unarchive and edit the show
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleEditExistingShow}
                                      className="h-7 px-2 text-xs bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800 hover:text-blue-900"
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit the existing show
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Show name is available</span>
                          )}
                        </div>
                      )}
                      {isCheckingDuplicate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking availability...
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Show Type</Label>
                      <Select
                        value={formData.show_type}
                        onValueChange={(value: "Branded" | "Original" | "Partner" | "") =>
                          handleInputChange("show_type", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choose Show Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branded">Branded</SelectItem>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ranking Category</Label>
                      <Select
                        value={formData.ranking_category}
                        onValueChange={(value: "1" | "2" | "3" | "4" | "5" | "") =>
                          handleInputChange("ranking_category", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choose Ranking Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                          <SelectItem value="4">Level 4</SelectItem>
                          <SelectItem value="5">Level 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={formData.format}
                        onValueChange={(value: "Video" | "Audio" | "Both" | "") =>
                          handleInputChange("format", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choose Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subnetwork_id">Subnetwork Name</Label>
                      <Input
                        id="subnetwork_id"
                        placeholder="Enter Subnetwork Name Or None"
                        value={formData.subnetwork_id}
                        onChange={(e) => handleInputChange("subnetwork_id", e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        placeholder=", dd -------- yyyy"
                        value={formData.start_date}
                        onChange={(e) => handleDateOnly(e, handleInputChange)}
                        min={DATE_MIN}
                        max={DATE_MAX}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value: "Strong" | "Medium" | "Weak" | "") =>
                          handleInputChange("relationship", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choose Relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>QBO Show (Name – ID)</Label>
                      <Popover open={isQboOpen} onOpenChange={setIsQboOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-10"
                          >
                            {formData.qbo_show_id
                              ? `${formData.qbo_show_name} – ${formData.qbo_show_id}`
                              : "Choose a QBO Show Name"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <CustomPopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                          <Command>
                            <CommandInput placeholder="Search QBO Shows..." />
                            <CommandEmpty>No Shows Found.</CommandEmpty>
                            <ScrollArea className="h-60">
                              <CommandGroup>
                                <CommandItem
                                  key="__none__"
                                  value="__none__"
                                  onSelect={() => {
                                    handleInputChange("qbo_show_id", "")
                                    handleInputChange("qbo_show_name", "")
                                    setIsQboOpen(false)
                                  }}
                                >
                                  None
                                </CommandItem>
                                {qboOptions.map((o) => (
                                  <CommandItem
                                    key={o.id}
                                    value={String(o.id)}                // keep value as id
                                    keywords={[o.name, String(o.id)]}   // 🔍 make name searchable
                                    onSelect={() => {
                                      handleInputChange("qbo_show_id", String(o.id))
                                      handleInputChange("qbo_show_name", o.name)
                                      setIsQboOpen(false)
                                    }}
                                  >
                                    {o.name} – {o.id}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </ScrollArea>
                          </Command>
                        </CustomPopoverContent>
                      </Popover>
                    </div>
                    <div></div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRateCard"
                        checked={formData.isRateCard}
                        onCheckedChange={(checked) => handleInputChange("isRateCard", checked)}
                      />
                      <Label htmlFor="isRateCard">Is Rate Card Show</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOriginal"
                        checked={formData.isOriginal}
                        onCheckedChange={(checked) => handleInputChange("isOriginal", checked)}
                      />
                      <Label htmlFor="isOriginal">Is Original Content</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                      />
                      <Label htmlFor="is_active">Is Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_undersized"
                        checked={formData.is_undersized}
                        onCheckedChange={(checked) => handleInputChange("is_undersized", checked)}
                      />
                      <Label htmlFor="is_undersized">Is Undersized</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="mt-0 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><DollarSign className="h-4 w-4" /> Financial Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure revenue and financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownershipPercentage">Ownership by Evergreen (%)</Label>
                      <Input
                        id="ownershipPercentage"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={formData.ownershipPercentage}
                        onChange={(e) => handleInputChange("ownershipPercentage", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spanCPM">Span CPM</Label>
                      <Input
                        id="spanCPM"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={formData.spanCPM}
                        onChange={(e) => handleInputChange("spanCPM", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latestCPM">Latest CPM</Label>
                      <Input
                        id="latestCPM"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={formData.latestCPM}
                        onChange={(e) => handleInputChange("latestCPM", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="revenue2023">Revenue 2023</Label>
                      <Input
                        id="revenue2023"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2023}
                        onChange={(e) => handleInputChange("revenue2023", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue2024">Revenue 2024</Label>
                      <Input
                        id="revenue2024"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2024}
                        onChange={(e) => handleInputChange("revenue2024", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue2025">Revenue 2025</Label>
                      <Input
                        id="revenue2025"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2025}
                        onChange={(e) => handleInputChange("revenue2025", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-x-6 sm:gap-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="minimumGuarantee"
                        checked={formData.minimumGuarantee}
                        onCheckedChange={(checked) => handleInputChange("minimumGuarantee", checked)}
                      />
                      <Label htmlFor="minimumGuarantee" className="whitespace-nowrap">Minimum Guarantee</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSponsorshipRevenue"
                        checked={formData.hasSponsorshipRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasSponsorshipRevenue", checked)}
                      />
                      <Label htmlFor="hasSponsorshipRevenue" className="whitespace-nowrap">Has Sponsorship Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasNonEvergreenRevenue"
                        checked={formData.hasNonEvergreenRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasNonEvergreenRevenue", checked)}
                      />
                      <Label htmlFor="hasNonEvergreenRevenue" className="whitespace-nowrap">Has Non Evergreen Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresPartnerLedgerAccess"
                        checked={formData.requiresPartnerLedgerAccess}
                        onCheckedChange={(checked) => handleInputChange("requiresPartnerLedgerAccess", checked)}
                      />
                      <Label htmlFor="requiresPartnerLedgerAccess" className="whitespace-nowrap">Requires Partner Ledger Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasBrandedRevenue"
                        checked={formData.hasBrandedRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasBrandedRevenue", checked)}
                      />
                      <Label htmlFor="hasBrandedRevenue" className="whitespace-nowrap">Branded Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasMarketingRevenue"
                        checked={formData.hasMarketingRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasMarketingRevenue", checked)}
                      />
                      <Label htmlFor="hasMarketingRevenue" className="whitespace-nowrap">Marketing Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWebManagementRevenue"
                        checked={formData.hasWebManagementRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasWebManagementRevenue", checked)}
                      />
                      <Label htmlFor="hasWebManagementRevenue" className="whitespace-nowrap">Web Management Revenue</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><BarChart3 className="h-4 w-4" /> Contract Splits</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Define how revenue is split for various contract types.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="standardAdsPercent">Standard Ads (%)</Label>
                      <Input
                        id="standardAdsPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.standardAdsPercent}
                        onChange={(e) => handleInputChange("standardAdsPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="programmaticAdsSpanPercent">Programmatic Ads/Span (%)</Label>
                      <Input
                        id="programmaticAdsSpanPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.programmaticAdsSpanPercent}
                        onChange={(e) => handleInputChange("programmaticAdsSpanPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sideBonusPercent">Side Bonus (%)</Label>
                      <Input
                        id="sideBonusPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.sideBonusPercent}
                        onChange={(e) => handleInputChange("sideBonusPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeAdsPercent">YouTube Ads (%)</Label>
                      <Input
                        id="youtubeAdsPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.youtubeAdsPercent}
                        onChange={(e) => handleInputChange("youtubeAdsPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionsPercent">Subscriptions (%)</Label>
                      <Input
                        id="subscriptionsPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.subscriptionsPercent}
                        onChange={(e) => handleInputChange("subscriptionsPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sponsorshipAdFpLeadPercent">Sponsorship Ad FP - Lead (%)</Label>
                      <Input
                        id="sponsorshipAdFpLeadPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.sponsorshipAdFpLeadPercent}
                        onChange={(e) => handleInputChange("sponsorshipAdFpLeadPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sponsorshipAdPartnerLeadPercent">Sponsorship Ad - Partner Lead (%)</Label>
                      <Input
                        id="sponsorshipAdPartnerLeadPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.sponsorshipAdPartnerLeadPercent}
                        onChange={(e) => handleInputChange("sponsorshipAdPartnerLeadPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sponsorshipAdPartnerSoldPercent">Sponsorship Ad - Partner Sold (%)</Label>
                      <Input
                        id="sponsorshipAdPartnerSoldPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.sponsorshipAdPartnerSoldPercent}
                        onChange={(e) => handleInputChange("sponsorshipAdPartnerSoldPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="merchandisePercent">Merchandise (%)</Label>
                      <Input
                        id="merchandisePercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.merchandisePercent}
                        onChange={(e) => handleInputChange("merchandisePercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandedRevenuePercent">Branded Revenue (%)</Label>
                      <Input
                        id="brandedRevenuePercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.brandedRevenuePercent}
                        onChange={(e) => handleInputChange("brandedRevenuePercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketingServicesRevenuePercent">Marketing Services Revenue (%)</Label>
                      <Input
                        id="marketingServicesRevenuePercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.marketingServicesRevenuePercent}
                        onChange={(e) => handleInputChange("marketingServicesRevenuePercent", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Handshake className="h-4 w-4" /> Hands Off Splits</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Define revenue splits for hands-off scenarios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="directCustomerHandsOffPercent">Direct Customer - Hands Off (%)</Label>
                      <Input
                        id="directCustomerHandsOffPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.directCustomerHandsOffPercent}
                        onChange={(e) => handleInputChange("directCustomerHandsOffPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeHandsOffPercent">YouTube - Hands Off (%)</Label>
                      <Input
                        id="youtubeHandsOffPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.youtubeHandsOffPercent}
                        onChange={(e) => handleInputChange("youtubeHandsOffPercent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionHandsOffPercent">Subscription - Hands Off (%)</Label>
                      <Input
                        id="subscriptionHandsOffPercent"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        value={formData.subscriptionHandsOffPercent}
                        onChange={(e) => handleInputChange("subscriptionHandsOffPercent", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Details Tab */}
            <TabsContent value="content" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Radio className="h-4 w-4" /> Content Details</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Specify content format and production details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select value={formData.genre_name} onValueChange={(value) => handleInputChange("genre_name", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genre_names.map((genre_name) => (
                            <SelectItem key={genre_name} value={genre_name}>
                              {genre_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cadence">Cadence</Label>
                      <Select value={formData.cadence} onValueChange={(value) => handleInputChange("cadence", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Cadence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Biweekly">Biweekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Ad hoc">Ad hoc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adSlots">Ad Slots</Label>
                      <Input
                        id="adSlots"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.adSlots}
                        onChange={(e) => handleInputChange("adSlots", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averageLength">Average Length (Minutes)</Label>
                      <Input
                        id="averageLength"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.averageLength}
                        onChange={(e) => handleInputChange("averageLength", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="evergreenProductionStaffContact">
                      Evergreen Production Staff Primary Contact
                    </Label>
                    <Input
                      id="evergreenProductionStaffContact"
                      placeholder="Name Or None"
                      value={formData.evergreenProductionStaffContact}
                      onChange={(e) => handleInputChange("evergreenProductionStaffContact", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactHost">Primary Contact (Host)</Label>
                    <Textarea
                      id="primaryContactHost"
                      placeholder="Enter In This Order: Name, Address, Phone, Email"
                      rows={4}
                      value={formData.primaryContactHost}
                      onChange={(e) => handleInputChange("primaryContactHost", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactShow">Primary Contact (Show)</Label>
                    <Textarea
                      id="primaryContactShow"
                      placeholder="Enter In This Order: Name, Address, Phone, Email"
                      rows={4}
                      value={formData.primaryContactShow}
                      onChange={(e) => handleInputChange("primaryContactShow", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Users className="h-4 w-4" /> Demographics</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Define your target audience and show status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Age Demographic</Label>
                      <Select
                        value={formData.age_demographic}
                        onValueChange={(value: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "") =>
                          handleInputChange("age_demographic", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Age Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-24">18-24</SelectItem>
                          <SelectItem value="25-34">25-34</SelectItem>
                          <SelectItem value="35-44">35-44</SelectItem>
                          <SelectItem value="45-54">45-54</SelectItem>
                          <SelectItem value="55+">55+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender Demographic (M/F)</Label>
                      <Input
                        id="gender"
                        placeholder="E.g. 60/40"
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className={cn(getFieldError("gender") && "border-red-500")}
                      />
                      {getFieldError("gender") && (
                        <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("gender")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Region Demographic</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value: "Urban" | "Rural" | "Both" | "") => handleInputChange("region", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Urban">Urban</SelectItem>
                          <SelectItem value="Rural">Rural</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Education Demographic</Label>
                      <Select
                        value={formData.primaryEducationDemographic}
                        onValueChange={(value: EducationLevel) =>
                          handleInputChange("primaryEducationDemographic", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Primary Education Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Education Demographic</Label>
                      <Select
                        value={formData.secondaryEducationDemographic}
                        onValueChange={(value: EducationLevel) =>
                          handleInputChange("secondaryEducationDemographic", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Secondary Education Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {attemptedSubmit && Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mx-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all required fields and correct invalid entries before saving. Check the highlighted
                tabs and fields.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between border-t bg-background">
            {/* Desktop Navigation - with text */}
            <div className="hidden sm:flex gap-2 py-6">
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentTabIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={currentTabIndex === tabs.length - 1}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Navigation - icon only */}
            <div className="flex sm:hidden gap-2 py-6">
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentTabIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={currentTabIndex === tabs.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 py-6">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button className="evergreen-button" size="sm" onClick={handleSave} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : "Save"}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>

      {/* Unarchive Confirmation Dialog */}
      <Dialog open={showUnarchiveConfirm} onOpenChange={setShowUnarchiveConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unarchive Show</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Are you sure you want to unarchive "{duplicateCheckResult?.existingShow?.title}"? 
              This will restore the show and allow you to edit it.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUnarchiveConfirm(false)}
                disabled={isUnarchiving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnarchive}
                disabled={isUnarchiving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isUnarchiving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unarchiving...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Unarchive and Edit
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
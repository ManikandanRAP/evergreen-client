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
import { ArrowLeft, ArrowRight, Save, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Show } from "@/lib/show-types"
import { ShowCreate, ShowUpdate, fetchAllclass  } from "@/lib/api-client" // Import both types
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown } from "lucide-react"

interface CreateShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShow?: Show | null
  onShowUpdated?: () => void
  createShow: (showData: Partial<ShowCreate>) => Promise<Show | null>
  updateShow: (showId: string, showData: Partial<ShowUpdate>) => Promise<Show | null>
  existingShows: Show[]
}

const educationLevels = ["No high School", "High School", "College", "Postgraduate"] as const
type EducationLevel = (typeof educationLevels)[number] | ""

export interface ShowFormData {
  // Basic Info
  title: string
  show_type: "Branded" | "Original" | "Partner" | ""
  subnetwork_id: string
  format: "Video" | "Audio" | "Both" | ""
  relationship: "Strong" | "Medium" | "Weak" | ""
  start_date: string
  isTentpole: boolean
  isOriginal: boolean
  qbo_show_id?: string // keep as string for Select value; will convert on save
  qbo_show_name?: string

  // Financial
  minimumGuarantee: string
  ownershipPercentage: string
  hasBrandedRevenue: boolean
  hasMarketingRevenue: boolean
  hasWebManagementRevenue: boolean
  latestCPM: string
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
  showsPerYear: string
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
  subnetwork_id: "",
  format: "",
  relationship: "",
  start_date: "",
  isTentpole: false,
  isOriginal: false,
  qbo_show_id: "",
  qbo_show_name: "",

  // Financial
  minimumGuarantee: "",
  ownershipPercentage: "",
  hasBrandedRevenue: false,
  hasMarketingRevenue: false,
  hasWebManagementRevenue: false,
  latestCPM: "",
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
  showsPerYear: "",
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
}: CreateShowDialogProps) {
  const [formData, setFormData] = useState<ShowFormData>(initialFormData)
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [qboOptions, setQboOptions] = useState<{ id: number; name: string }[]>([])
  const [isQboOpen, setIsQboOpen] = useState(false)


  const isEditMode = !!editingShow

  useEffect(() => {
    if (editingShow) {
      const show_type = editingShow.show_type || ""
      setFormData({
        title: editingShow.name ?? "",
        show_type: editingShow.show_type as "" | "Branded" | "Original" | "Partner",
        subnetwork_id: editingShow.subnetwork_id ?? "",
        format: editingShow.format ?? "",
        relationship: editingShow.relationship ?? "",
        start_date: editingShow.start_date ? new Date(editingShow.start_date).toISOString().split('T')[0] : "",
        isTentpole: !!editingShow.isTentpole,
        isOriginal: !!editingShow.isOriginal,
        minimumGuarantee: editingShow.minimumGuarantee?.toString() ?? "",
        ownershipPercentage: editingShow.ownershipPercentage?.toString() ?? "",
        hasBrandedRevenue: !!editingShow.hasBrandedRevenue,
        hasMarketingRevenue: !!editingShow.hasMarketingRevenue,
        hasWebManagementRevenue: !!editingShow.hasWebManagementRevenue,
        latestCPM: editingShow.latestCPM?.toString() ?? "",
        revenue2023: editingShow.revenue2023?.toString() ?? "",
        revenue2024: editingShow.revenue2024?.toString() ?? "",
        revenue2025: editingShow.revenue2025?.toString() ?? "",
        hasSponsorshipRevenue: !!editingShow.hasSponsorshipRevenue,
        hasNonEvergreenRevenue: !!editingShow.hasNonEvergreenRevenue,
        requiresPartnerLedgerAccess: !!editingShow.requiresPartnerLedgerAccess,
        sideBonusPercent: editingShow.sideBonusPercent?.toString() ?? "",
        youtubeAdsPercent: editingShow.youtubeAdsPercent?.toString() ?? "",
        subscriptionsPercent: editingShow.subscriptionsPercent?.toString() ?? "",
        standardAdsPercent: editingShow.standardAdsPercent?.toString() ?? "",
        sponsorshipAdFpLeadPercent: editingShow.sponsorshipAdFpLeadPercent?.toString() ?? "",
        sponsorshipAdPartnerLeadPercent: editingShow.sponsorshipAdPartnerLeadPercent?.toString() ?? "",
        sponsorshipAdPartnerSoldPercent: editingShow.sponsorshipAdPartnerSoldPercent?.toString() ?? "",
        programmaticAdsSpanPercent: editingShow.programmaticAdsSpanPercent?.toString() ?? "",
        merchandisePercent: editingShow.merchandisePercent?.toString() ?? "",
        brandedRevenuePercent: editingShow.brandedRevenuePercent?.toString() ?? "",
        marketingServicesRevenuePercent: editingShow.marketingServicesRevenuePercent?.toString() ?? "",
        directCustomerHandsOffPercent: editingShow.directCustomerHandsOffPercent?.toString() ?? "",
        youtubeHandsOffPercent: editingShow.youtubeHandsOffPercent?.toString() ?? "",
        subscriptionHandsOffPercent: editingShow.subscriptionHandsOffPercent?.toString() ?? "",
        genre_name: editingShow.genre_name ?? "",
        showsPerYear: editingShow.showsPerYear?.toString() ?? "",
        adSlots: editingShow.adSlots?.toString() ?? "",
        averageLength: editingShow.averageLength?.toString() ?? "",
        primaryContactHost: editingShow.primaryContactHost ?? "",
        primaryContactShow: editingShow.primaryContactShow ?? "",
        evergreenProductionStaffContact: editingShow.evergreenProductionStaffName ?? "",
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
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "financial", label: "Financial", icon: "💰" },
    { id: "content", label: "Content Details", icon: "🎙️" },
    { id: "demographics", label: "Demographics", icon: "👥" },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab)

  const validateField = (field: keyof ShowFormData, value: any): string => {
    if (field === "title") {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return "This field is required"
      }
      const isDuplicate = existingShows.some(
        (show) => show.name.toLowerCase() === value.toLowerCase() && show.id !== editingShow?.id,
      )
      if (isDuplicate) {
        return "A show with this name already exists."
      }
    }

    const numberFields = [
      "ownershipPercentage", "minimumGuarantee", "latestCPM", "revenue2023",
      "revenue2024", "revenue2025", "showsPerYear", "adSlots", "averageLength",
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

    if (field === "showsPerYear" && value !== "" && Number(value) < 1) {
      return "Shows per year must be at least 1"
    }

    if (field === "gender" && value && !/^\d{1,3}\/\d{1,3}$/.test(value)) {
      return "Format must be MM/FF (e.g., 60/40)"
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


    // Convert form data to use exact field names that match your database schema
    const showData: Partial<ShowCreate | ShowUpdate> = {
      title: formData.title,
      minimum_guarantee: toFloatOrUndef(formData.minimumGuarantee),
      media_type: formData.format === "Video" ? "video" : formData.format === "Audio" ? "audio" : formData.format === "Both" ? "both" : undefined,
      tentpole: formData.isTentpole,
      relationship_level: formData.relationship === "Strong" ? "strong" : formData.relationship === "Medium" ? "medium" : formData.relationship === "Weak" ? "weak" : undefined,
      show_type: formData.show_type || undefined,
      evergreen_ownership_pct: toFloatOrUndef(formData.ownershipPercentage),
      has_sponsorship_revenue: formData.hasSponsorshipRevenue,
      has_non_evergreen_revenue: formData.hasNonEvergreenRevenue,
      requires_partner_access: formData.requiresPartnerLedgerAccess,
      has_branded_revenue: formData.hasBrandedRevenue,
      has_marketing_revenue: formData.hasMarketingRevenue,
      has_web_mgmt_revenue: formData.hasWebManagementRevenue,
      genre_name: formData.genre_name || undefined,
      is_original: formData.isOriginal,
      shows_per_year: toIntOrUndef(formData.showsPerYear),
      latest_cpm_usd: toFloatOrUndef(formData.latestCPM),
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
  
  const isTabComplete = (tabId: string) => {
    if (tabId === 'basic') {
        return !validateField('title', formData.title);
    }
    return true;
  }

  const hasTabErrors = (tabId: string) => {
    if (tabId === 'basic' && attemptedSubmit) {
        return !!errors['title'];
    }
    return false;
  }

  const getFieldError = (field: string) => errors[field]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Show" : "Create New Show"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 text-sm relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
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
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs bg-emerald-100 text-emerald-700">
                    ✓
                  </Badge>
                )}
                {hasTabErrors(tab.id) && attemptedSubmit && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
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
                  <CardTitle className="flex items-center gap-2">📝 Basic Information</CardTitle>
                  <CardDescription>Enter the fundamental details about your show</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-1">
                        Show Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter show name"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className={cn(getFieldError("title") && "border-red-500")}
                      />
                      {getFieldError("title") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("title")}
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
                        <SelectTrigger>
                          <SelectValue placeholder="Choose show type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branded">Branded</SelectItem>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subnetwork_id">Subnetwork Name</Label>
                      <Input
                        id="subnetwork_id"
                        placeholder="Enter Subnetwork Name or None"
                        value={formData.subnetwork_id}
                        onChange={(e) => handleInputChange("subnetwork_id", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={formData.format}
                        onValueChange={(value: "Video" | "Audio" | "Both" | "") => handleInputChange("format", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value: "Strong" | "Medium" | "Weak" | "") =>
                          handleInputChange("relationship", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"                        
                        value={formData.start_date}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QBO Show (name – id)</Label>
                      <Popover open={isQboOpen} onOpenChange={setIsQboOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {formData.qbo_show_id
                              ? `${formData.qbo_show_name} – ${formData.qbo_show_id}`
                              : "Optional: choose QBO show"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          side="bottom"
                          align="start"
                          sideOffset={1}
                          avoidCollisions={false}
                        >
                          <Command>
                            <CommandInput placeholder="Search QBO shows..." />
                            <CommandEmpty>No shows found.</CommandEmpty>
                            {/* ✅ Scrollable list */}
                            <CommandList className="max-h-60 overflow-y-auto">
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
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>


                    
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isTentpole"
                        checked={formData.isTentpole}
                        onCheckedChange={(checked) => handleInputChange("isTentpole", checked)}
                      />
                      <Label htmlFor="isTentpole">Is Tentpole Show</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOriginal"
                        checked={formData.isOriginal}
                        onCheckedChange={(checked) => handleInputChange("isOriginal", checked)}
                      />
                      <Label htmlFor="isOriginal">Is Original Content</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="mt-0 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">💰 Financial Information</CardTitle>
                  <CardDescription>Configure revenue and financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimumGuarantee">Minimum Guarantee (Annual)</Label>
                      <Input
                        id="minimumGuarantee"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.minimumGuarantee}
                        onChange={(e) => handleInputChange("minimumGuarantee", e.target.value)}
                      />
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSponsorshipRevenue"
                        checked={formData.hasSponsorshipRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasSponsorshipRevenue", checked)}
                      />
                      <Label htmlFor="hasSponsorshipRevenue">Has Sponsorship Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasNonEvergreenRevenue"
                        checked={formData.hasNonEvergreenRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasNonEvergreenRevenue", checked)}
                      />
                      <Label htmlFor="hasNonEvergreenRevenue">Has Non Evergreen Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresPartnerLedgerAccess"
                        checked={formData.requiresPartnerLedgerAccess}
                        onCheckedChange={(checked) => handleInputChange("requiresPartnerLedgerAccess", checked)}
                      />
                      <Label htmlFor="requiresPartnerLedgerAccess">Requires Partner Ledger Access</Label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasBrandedRevenue"
                        checked={formData.hasBrandedRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasBrandedRevenue", checked)}
                      />
                      <Label htmlFor="hasBrandedRevenue">Branded Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasMarketingRevenue"
                        checked={formData.hasMarketingRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasMarketingRevenue", checked)}
                      />
                      <Label htmlFor="hasMarketingRevenue">Marketing Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWebManagementRevenue"
                        checked={formData.hasWebManagementRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasWebManagementRevenue", checked)}
                      />
                      <Label htmlFor="hasWebManagementRevenue">Web Management Revenue</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📊 Contract Splits</CardTitle>
                  <CardDescription>Define how revenue is split for various contract types.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CardTitle className="flex items-center gap-2">🤝 Hands Off Splits</CardTitle>
                  <CardDescription>Define revenue splits for hands-off scenarios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CardTitle className="flex items-center gap-2">🎙️ Content Details</CardTitle>
                  <CardDescription>Specify content format and production details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="showsPerYear">Shows per Year</Label>
                      <Input
                        id="showsPerYear"
                        type="number"
                        placeholder="0"
                        min="1"
                        value={formData.showsPerYear}
                        onChange={(e) => handleInputChange("showsPerYear", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Name or None"
                      value={formData.evergreenProductionStaffContact}
                      onChange={(e) => handleInputChange("evergreenProductionStaffContact", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactHost">Primary Contact (Host)</Label>
                    <Textarea
                      id="primaryContactHost"
                      placeholder="Enter in this order: Name, Address, Phone, Email"
                      rows={4}
                      value={formData.primaryContactHost}
                      onChange={(e) => handleInputChange("primaryContactHost", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactShow">Primary Contact (Show)</Label>
                    <Textarea
                      id="primaryContactShow"
                      placeholder="Enter in this order: Name, Address, Phone, Email"
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
                  <CardTitle className="flex items-center gap-2">👥 Demographics</CardTitle>
                  <CardDescription>Define your target audience and show status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="first:pt-2 space-y-2">
                      <Label>Age Demographic</Label>
                      <Select
                        value={formData.age_demographic}
                        onValueChange={(value: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "") =>
                          handleInputChange("age_demographic", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose age range" />
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
                        placeholder="Eg. 60/40"
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className={cn(getFieldError("gender") && "border-red-500")}
                      />
                      {getFieldError("gender") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("gender")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Region Demographic</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value: "Urban" | "Rural" | "Both" | "") => handleInputChange("region", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Urban">Urban</SelectItem>
                          <SelectItem value="Rural">Rural</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Education Demographic</Label>
                      <Select
                        value={formData.primaryEducationDemographic}
                        onValueChange={(value: EducationLevel) =>
                          handleInputChange("primaryEducationDemographic", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose primary education level" />
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
                          <SelectValue placeholder="Choose secondary education level" />
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
                  </div>

                  <div className="flex gap-6 pt-4">
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

          <div className="flex items-center justify-between p-6 border-t bg-background">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentTabIndex === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={handleNext} disabled={currentTabIndex === tabs.length - 1}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button className="evergreen-button" onClick={handleSave} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update Show" : "Save Show"}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
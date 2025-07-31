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

interface CreateShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShow?: Show | null
  onShowUpdated?: () => void
  createShow: (showData: Partial<Show>) => Promise<Show | null>
  updateShow: (showId: string, showData: Partial<Show>) => Promise<Show | null>
}

const educationLevels = ["No high School", "High School", "College", "Postgraduate"] as const
type EducationLevel = (typeof educationLevels)[number] | ""

export interface ShowFormData {
  // Basic Info
  title: string
  showType: "Branded" | "Original" | "Partner" | ""
  subnetwork_id: string
  format: "Video" | "Audio" | "Both" | ""
  relationship: "Strong" | "Medium" | "Weak" | ""
  start_date: string
  isTentpole: boolean
  isOriginal: boolean

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
  ageDemographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | ""
  gender: string
  region: "Urban" | "Rural" | "Both" | ""
  primaryEducationDemographic: EducationLevel
  secondaryEducationDemographic: EducationLevel
  isActive: boolean
  isUndersized: boolean
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: ShowFormData = {
  // Basic Info
  title: "",
  showType: "",
  subnetwork_id: "",
  format: "",
  relationship: "",
  start_date: "",
  isTentpole: false,
  isOriginal: false,

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
  ageDemographic: "",
  gender: "",
  region: "",
  primaryEducationDemographic: "",
  secondaryEducationDemographic: "",
  isActive: true,
  isUndersized: false,
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

// Define required fields for each tab
const requiredFields = {
  basic: ["title", "showType", "format", "relationship", "start_date"],
  financial: ["minimumGuarantee", "ownershipPercentage"],
  content: ["genre_name", "showsPerYear", "primaryContactShow"],
  demographics: ["ageDemographic"],
}

export default function CreateShowDialog({
  open,
  onOpenChange,
  editingShow,
  onShowUpdated,
  createShow,
  updateShow,
}: CreateShowDialogProps) {
  const [formData, setFormData] = useState<ShowFormData>(initialFormData)
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isEditMode = !!editingShow

  // Load editing data when editingShow changes
  useEffect(() => {
    if (editingShow) {
      const showType = editingShow.showType || ""
      setFormData({
        // Basic Info
        title: editingShow.name ?? "",
        showType: showType as "" | "Branded" | "Original" | "Partner",
        subnetwork_id: editingShow.subnetwork_id ?? "",
        format: editingShow.format ?? "",
        relationship: editingShow.relationship ?? "",
        start_date: editingShow.start_date ?? "",
        isTentpole: !!editingShow.isTentpole,
        isOriginal: !!editingShow.isOriginal,

        // Financial
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

        // Contract Splits in Percentage
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

        // Hands Off Splits in Percentage
        directCustomerHandsOffPercent: editingShow.directCustomerHandsOffPercent?.toString() ?? "",
        youtubeHandsOffPercent: editingShow.youtubeHandsOffPercent?.toString() ?? "",
        subscriptionHandsOffPercent: editingShow.subscriptionHandsOffPercent?.toString() ?? "",

        // Content Details
        genre_name: editingShow.genre_name ?? "",
        showsPerYear: editingShow.showsPerYear?.toString() ?? "",
        adSlots: editingShow.adSlots?.toString() ?? "",
        averageLength: editingShow.averageLength?.toString() ?? "",
        primaryContactHost: editingShow.primaryContactHost ?? "",
        primaryContactShow: editingShow.primaryContactShow ?? "",
        evergreenProductionStaffContact: editingShow.evergreenProductionStaffName ?? "",

        // Demographics
        ageDemographic: editingShow.ageDemographic ?? "",
        gender: editingShow.gender ?? "",
        region: (editingShow.region || "") as "Both" | "Urban" | "Rural",
        primaryEducationDemographic: (editingShow.primary_education || "") as EducationLevel,
        secondaryEducationDemographic: (editingShow.secondary_education || "") as EducationLevel,
        isActive: !!editingShow.isActive,
        isUndersized: !!editingShow.isUndersized,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingShow])

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "financial", label: "Financial", icon: "💰" },
    { id: "content", label: "Content Details", icon: "🎙️" },
    { id: "demographics", label: "Demographics", icon: "👥" },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab)

  const validateField = (field: keyof ShowFormData, value: any): string => {
    const currentTabFields = requiredFields[currentTab as keyof typeof requiredFields] || []

    if (currentTabFields.includes(field as string)) {
      if (!value || value === "" || (typeof value === "string" && value.trim() === "")) {
        return "This field is required"
      }
    }

    // Specific validations for number/percentage fields
    const numberFields = [
      "ownershipPercentage",
      "minimumGuarantee",
      "latestCPM",
      "revenue2023",
      "revenue2024",
      "revenue2025",
      "showsPerYear",
      "adSlots",
      "averageLength",
      "sideBonusPercent",
      "youtubeAdsPercent",
      "subscriptionsPercent",
      "standardAdsPercent",
      "sponsorshipAdFpLeadPercent",
      "sponsorshipAdPartnerLeadPercent",
      "sponsorshipAdPartnerSoldPercent",
      "programmaticAdsSpanPercent",
      "merchandisePercent",
      "brandedRevenuePercent",
      "marketingServicesRevenuePercent",
      "directCustomerHandsOffPercent",
      "youtubeHandsOffPercent",
      "subscriptionHandsOffPercent",
    ]

    if (numberFields.includes(field as string)) {
      if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
        return "Must be a valid positive number"
      }
      if (
        [
          "ownershipPercentage",
          "sideBonusPercent",
          "youtubeAdsPercent",
          "subscriptionsPercent",
          "standardAdsPercent",
          "sponsorshipAdFpLeadPercent",
          "sponsorshipAdPartnerLeadPercent",
          "sponsorshipAdPartnerSoldPercent",
          "programmaticAdsSpanPercent",
          "merchandisePercent",
          "brandedRevenuePercent",
          "marketingServicesRevenuePercent",
          "directCustomerHandsOffPercent",
          "youtubeHandsOffPercent",
          "subscriptionHandsOffPercent",
        ].includes(field as string)
      ) {
        if (value !== "" && (Number(value) < 0 || Number(value) > 100)) {
          return "Percentage must be between 0 and 100"
        }
      }
    }

    if (field === "showsPerYear" && value !== "" && Number(value) < 1) {
      return "Shows per year must be at least 1"
    }

    // Validation for Gender Demographic (M/F) format
    if (field === "gender" && value && !/^\d{1,3}\/\d{1,3}$/.test(value)) {
      return "Format must be MM/FF (e.g., 60/40)"
    }

    return ""
  }

  const validateCurrentTab = (): boolean => {
    const currentTabFields = requiredFields[currentTab as keyof typeof requiredFields] || []
    const newErrors: FormErrors = {}
    let isValid = true

    currentTabFields.forEach((field) => {
      const error = validateField(field as keyof ShowFormData, formData[field as keyof ShowFormData])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    // Also validate optional fields that have specific format rules
    const optionalFieldsWithValidation: (keyof ShowFormData)[] = [
      "latestCPM",
      "revenue2023",
      "revenue2024",
      "revenue2025",
      "sideBonusPercent",
      "youtubeAdsPercent",
      "subscriptionsPercent",
      "standardAdsPercent",
      "sponsorshipAdFpLeadPercent",
      "sponsorshipAdPartnerLeadPercent",
      "sponsorshipAdPartnerSoldPercent",
      "programmaticAdsSpanPercent",
      "merchandisePercent",
      "brandedRevenuePercent",
      "marketingServicesRevenuePercent",
      "directCustomerHandsOffPercent",
      "youtubeHandsOffPercent",
      "subscriptionHandsOffPercent",
    ]

    if (currentTab === "content") {
      optionalFieldsWithValidation.push("adSlots", "averageLength")
    } else if (currentTab === "demographics") {
      optionalFieldsWithValidation.push("gender", "region") // Corrected variable name here
    }

    optionalFieldsWithValidation.forEach((field) => {
      // Only validate if the field is part of the current tab or always validated (like gender)
      // and if it has a non-empty value.
      if (formData[field] !== "") {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field as string] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const validateAllTabs = (): boolean => {
    const allErrors: FormErrors = {}
    let isValid = true

    Object.entries(requiredFields).forEach(([tabId, fields]) => {
      fields.forEach((field) => {
        const error = validateField(field as keyof ShowFormData, formData[field as keyof ShowFormData])
        if (error) {
          allErrors[field] = error
          isValid = false
        }
      })
    })

    // Validate all optional number/percentage fields and gender demographic
    const allOptionalFieldsWithValidation: (keyof ShowFormData)[] = [
      "latestCPM",
      "revenue2023",
      "revenue2024",
      "revenue2025",
      "adSlots",
      "averageLength",
      "sideBonusPercent",
      "youtubeAdsPercent",
      "subscriptionsPercent",
      "standardAdsPercent",
      "sponsorshipAdFpLeadPercent",
      "sponsorshipAdPartnerLeadPercent",
      "sponsorshipAdPartnerSoldPercent",
      "programmaticAdsSpanPercent",
      "merchandisePercent",
      "brandedRevenuePercent",
      "marketingServicesRevenuePercent",
      "directCustomerHandsOffPercent",
      "youtubeHandsOffPercent",
      "subscriptionHandsOffPercent",
      "gender",
      "region",
    ]
    allOptionalFieldsWithValidation.forEach((field) => {
      if (formData[field] !== "") {
        const error = validateField(field, formData[field])
        if (error) {
          allErrors[field as string] = error
          isValid = false
        }
      }
    })

    setErrors(allErrors)
    return isValid
  }

  const handleInputChange = (field: keyof ShowFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
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
      // Find first tab with errors and switch to it
      const tabsWithErrors = Object.entries(requiredFields).find(([tabId, fields]) =>
        fields.some((field) => errors[field]),
      )

      if (tabsWithErrors) {
        setCurrentTab(tabsWithErrors[0])
      } else if (errors["gender"] && currentTab !== "demographics") {
        setCurrentTab("demographics")
      } else if (errors["region"] && currentTab !== "demographics") {
        setCurrentTab("demographics")
      }
      return
    }

    setIsSubmitting(true)

    const showData: Partial<Show> = {
      name: formData.title,
      minimumGuarantee: parseFloat(formData.minimumGuarantee),
      format: formData.format || undefined,
      isTentpole: formData.isTentpole,
      relationship: formData.relationship || undefined,
      showType: formData.showType,
      ownershipPercentage: parseFloat(formData.ownershipPercentage),
      hasSponsorshipRevenue: formData.hasSponsorshipRevenue,
      hasNonEvergreenRevenue: formData.hasNonEvergreenRevenue,
      requiresPartnerLedgerAccess: formData.requiresPartnerLedgerAccess,
      hasBrandedRevenue: formData.hasBrandedRevenue,
      hasMarketingRevenue: formData.hasMarketingRevenue,
      hasWebManagementRevenue: formData.hasWebManagementRevenue,
      genre_name: formData.genre_name,
      isOriginal: formData.isOriginal,
      showsPerYear: parseInt(formData.showsPerYear),
      latestCPM: parseFloat(formData.latestCPM || "0"),
      adSlots: parseInt(formData.adSlots || "0"),
      averageLength: parseInt(formData.averageLength || "0"),
      start_date: formData.start_date,
      sideBonusPercent: parseFloat(formData.sideBonusPercent || "0"),
      youtubeAdsPercent: parseFloat(formData.youtubeAdsPercent || "0"),
      subscriptionsPercent: parseFloat(formData.subscriptionsPercent || "0"),
      standardAdsPercent: parseFloat(formData.standardAdsPercent || "0"),
      sponsorshipAdFpLeadPercent: parseFloat(formData.sponsorshipAdFpLeadPercent || "0"),
      sponsorshipAdPartnerLeadPercent: parseFloat(formData.sponsorshipAdPartnerLeadPercent || "0"),
      sponsorshipAdPartnerSoldPercent: parseFloat(formData.sponsorshipAdPartnerSoldPercent || "0"),
      programmaticAdsSpanPercent: parseFloat(formData.programmaticAdsSpanPercent || "0"),
      merchandisePercent: parseFloat(formData.merchandisePercent || "0"),
      brandedRevenuePercent: parseFloat(formData.brandedRevenuePercent || "0"),
      marketingServicesRevenuePercent: parseFloat(formData.marketingServicesRevenuePercent || "0"),
      directCustomerHandsOffPercent: parseFloat(formData.directCustomerHandsOffPercent || "0"),
      youtubeHandsOffPercent: parseFloat(formData.youtubeHandsOffPercent || "0"),
      subscriptionHandsOffPercent: parseFloat(formData.subscriptionHandsOffPercent || "0"),
      revenue2023: parseFloat(formData.revenue2023 || "0"),
      revenue2024: parseFloat(formData.revenue2024 || "0"),
      revenue2025: parseFloat(formData.revenue2025 || "0"),
      evergreenProductionStaffName: formData.evergreenProductionStaffContact,
      primaryContactHost: formData.primaryContactHost,
      primaryContactShow: formData.primaryContactShow,
      ageDemographic: formData.ageDemographic || undefined,
      gender: formData.gender,
      region: formData.region || undefined,
      primary_education: formData.primaryEducationDemographic || undefined,
      secondary_education: formData.secondaryEducationDemographic || undefined,
      subnetwork_id: formData.subnetwork_id,
      isActive: formData.isActive,
      isUndersized: formData.isUndersized,
    }

    console.log("Show Data:", showData)

    try {
      if (isEditMode && editingShow?.id) {
        await updateShow(editingShow.id, showData)
      } else {
        await createShow(showData)
      }
      onShowUpdated?.()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook and api-client, which shows a toast
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
    const tabFields = requiredFields[tabId as keyof typeof requiredFields] || []
    const allRequiredFieldsComplete = tabFields.every((field) => {
      const value = formData[field as keyof ShowFormData]
      return value && value !== "" && (typeof value !== "string" || value.trim() !== "")
    })

    // Also check for validity of optional fields with specific formats/ranges if they are filled
    const optionalFieldsWithValidation: (keyof ShowFormData)[] = []
    if (tabId === "financial") {
      optionalFieldsWithValidation.push(
        "latestCPM",
        "revenue2023",
        "revenue2024",
        "revenue2025",
        "sideBonusPercent",
        "youtubeAdsPercent",
        "subscriptionsPercent",
        "standardAdsPercent",
        "sponsorshipAdFpLeadPercent",
        "sponsorshipAdPartnerLeadPercent",
        "sponsorshipAdPartnerSoldPercent",
        "programmaticAdsSpanPercent",
        "merchandisePercent",
        "brandedRevenuePercent",
        "marketingServicesRevenuePercent",
        "directCustomerHandsOffPercent",
        "youtubeHandsOffPercent",
        "subscriptionHandsOffPercent",
      )
    } else if (tabId === "content") {
      optionalFieldsWithValidation.push("adSlots", "averageLength")
    } else if (tabId === "demographics") {
      optionalFieldsWithValidation.push("gender", "region")
    }

    const allOptionalFieldsValid = optionalFieldsWithValidation.every((field) => {
      const value = formData[field]
      if (value === "") return true // Empty optional fields are valid
      return !validateField(field, value) // No error means valid
    })

    return allRequiredFieldsComplete && allOptionalFieldsValid
  }

  const hasTabErrors = (tabId: string) => {
    const tabFields = requiredFields[tabId as keyof typeof requiredFields] || []
    const hasRequiredErrors = tabFields.some((field) => errors[field])

    const optionalFieldsWithValidation: (keyof ShowFormData)[] = []
    if (tabId === "financial") {
      optionalFieldsWithValidation.push(
        "latestCPM",
        "revenue2023",
        "revenue2024",
        "revenue2025",
        "sideBonusPercent",
        "youtubeAdsPercent",
        "subscriptionsPercent",
        "standardAdsPercent",
        "sponsorshipAdFpLeadPercent",
        "sponsorshipAdPartnerLeadPercent",
        "sponsorshipAdPartnerSoldPercent",
        "programmaticAdsSpanPercent",
        "merchandisePercent",
        "brandedRevenuePercent",
        "marketingServicesRevenuePercent",
        "directCustomerHandsOffPercent",
        "youtubeHandsOffPercent",
        "subscriptionHandsOffPercent",
      )
    } else if (tabId === "content") {
      optionalFieldsWithValidation.push("adSlots", "averageLength")
    } else if (tabId === "demographics") {
      optionalFieldsWithValidation.push("gender", "region") // Corrected variable name here
    }

    const hasOptionalErrors = optionalFieldsWithValidation.some((field) => errors[field])

    return hasRequiredErrors || hasOptionalErrors
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
                      <Label className="flex items-center gap-1">
                        Show Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.showType}
                        onValueChange={(value: "Branded" | "Original" | "Partner" | "") =>
                          handleInputChange("showType", value)
                        }
                      >
                        <SelectTrigger className={cn(getFieldError("showType") && "border-red-500")}>
                          <SelectValue placeholder="Choose show type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branded">Branded</SelectItem>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("showType") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("showType")}
                        </p>
                      )}
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
                        className={cn(getFieldError("subnetwork_id") && "border-red-500")}
                      />
                      {getFieldError("subnetwork_id") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("subnetwork_id")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Format <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.format}
                        onValueChange={(value: "Video" | "Audio" | "Both" | "") => handleInputChange("format", value)}
                      >
                        <SelectTrigger className={cn(getFieldError("format") && "border-red-500")}>
                          <SelectValue placeholder="Choose format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("format") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("format")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Relationship <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value: "Strong" | "Medium" | "Weak" | "") =>
                          handleInputChange("relationship", value)
                        }
                      >
                        <SelectTrigger className={cn(getFieldError("relationship") && "border-red-500")}>
                          <SelectValue placeholder="Choose relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("relationship") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("relationship")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="flex items-center gap-1">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="start_date"
                        type="date"                        
                        value={formData.start_date}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                        className={cn(getFieldError("start_date") && "border-red-500")}
                      />
                      {getFieldError("start_date") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("start_date")}
                        </p>
                      )}
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
              {" "}
              {/* Added space-y-8 here */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">💰 Financial Information</CardTitle>
                  <CardDescription>Configure revenue and financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimumGuarantee" className="flex items-center gap-1">
                        Minimum Guarantee (Annual) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minimumGuarantee"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.minimumGuarantee}
                        onChange={(e) => handleInputChange("minimumGuarantee", e.target.value)}
                        className={cn(getFieldError("minimumGuarantee") && "border-red-500")}
                      />
                      {getFieldError("minimumGuarantee") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("minimumGuarantee")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownershipPercentage" className="flex items-center gap-1">
                        Ownership by Evergreen (%) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ownershipPercentage"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={formData.ownershipPercentage}
                        onChange={(e) => handleInputChange("ownershipPercentage", e.target.value)}
                        className={cn(getFieldError("ownershipPercentage") && "border-red-500")}
                      />
                      {getFieldError("ownershipPercentage") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("ownershipPercentage")}
                        </p>
                      )}
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
                        className={cn(getFieldError("latestCPM") && "border-red-500")}
                      />
                      {getFieldError("latestCPM") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("latestCPM")}
                        </p>
                      )}
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
                        className={cn(getFieldError("revenue2023") && "border-red-500")}
                      />
                      {getFieldError("revenue2023") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("revenue2023")}
                        </p>
                      )}
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
                        className={cn(getFieldError("revenue2024") && "border-red-500")}
                      />
                      {getFieldError("revenue2024") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("revenue2024")}
                        </p>
                      )}
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
                        className={cn(getFieldError("revenue2025") && "border-red-500")}
                      />
                      {getFieldError("revenue2025") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("revenue2025")}
                        </p>
                      )}
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

                  {/* New Checkboxes for Branded, Marketing, Web Management Revenue */}
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

              {/* Contract Splits Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📊 Contract Splits</CardTitle>{" "}
                  {/* Changed title */}
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
                        className={cn(getFieldError("sideBonusPercent") && "border-red-500")}
                      />
                      {getFieldError("sideBonusPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("sideBonusPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("youtubeAdsPercent") && "border-red-500")}
                      />
                      {getFieldError("youtubeAdsPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("youtubeAdsPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("subscriptionsPercent") && "border-red-500")}
                      />
                      {getFieldError("subscriptionsPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("subscriptionsPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("standardAdsPercent") && "border-red-500")}
                      />
                      {getFieldError("standardAdsPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("standardAdsPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("sponsorshipAdFpLeadPercent") && "border-red-500")}
                      />
                      {getFieldError("sponsorshipAdFpLeadPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("sponsorshipAdFpLeadPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("sponsorshipAdPartnerLeadPercent") && "border-red-500")}
                      />
                      {getFieldError("sponsorshipAdPartnerLeadPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("sponsorshipAdPartnerLeadPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("sponsorshipAdPartnerSoldPercent") && "border-red-500")}
                      />
                      {getFieldError("sponsorshipAdPartnerSoldPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("sponsorshipAdPartnerSoldPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("programmaticAdsSpanPercent") && "border-red-500")}
                      />
                      {getFieldError("programmaticAdsSpanPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("programmaticAdsSpanPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("merchandisePercent") && "border-red-500")}
                      />
                      {getFieldError("merchandisePercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("merchandisePercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("brandedRevenuePercent") && "border-red-500")}
                      />
                      {getFieldError("brandedRevenuePercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("brandedRevenuePercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("marketingServicesRevenuePercent") && "border-red-500")}
                      />
                      {getFieldError("marketingServicesRevenuePercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("marketingServicesRevenuePercent")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hands Off Splits Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🤝 Hands Off Splits</CardTitle>{" "}
                  {/* Changed title */}
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
                        className={cn(getFieldError("directCustomerHandsOffPercent") && "border-red-500")}
                      />
                      {getFieldError("directCustomerHandsOffPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("directCustomerHandsOffPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("youtubeHandsOffPercent") && "border-red-500")}
                      />
                      {getFieldError("youtubeHandsOffPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("youtubeHandsOffPercent")}
                        </p>
                      )}
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
                        className={cn(getFieldError("subscriptionHandsOffPercent") && "border-red-500")}
                      />
                      {getFieldError("subscriptionHandsOffPercent") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("subscriptionHandsOffPercent")}
                        </p>
                      )}
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
                      <Label className="flex items-center gap-1">
                        Genre <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.genre_name} onValueChange={(value) => handleInputChange("genre_name", value)}>
                        <SelectTrigger className={cn(getFieldError("genre_name") && "border-red-500")}>
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
                      {getFieldError("genre_name") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("genre_name")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="showsPerYear" className="flex items-center gap-1">
                        Shows per Year <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="showsPerYear"
                        type="number"
                        placeholder="0"
                        min="1"
                        value={formData.showsPerYear}
                        onChange={(e) => handleInputChange("showsPerYear", e.target.value)}
                        className={cn(getFieldError("showsPerYear") && "border-red-500")}
                      />
                      {getFieldError("showsPerYear") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("showsPerYear")}
                        </p>
                      )}
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
                        className={cn(getFieldError("adSlots") && "border-red-500")}
                      />
                      {getFieldError("adSlots") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("adSlots")}
                        </p>
                      )}
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
                        className={cn(getFieldError("averageLength") && "border-red-500")}
                      />
                      {getFieldError("averageLength") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("averageLength")}
                        </p>
                      )}
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
                    <Label htmlFor="primaryContactShow" className="flex items-center gap-1">
                      Primary Contact (Show) <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="primaryContactShow"
                      placeholder="Enter in this order: Name, Address, Phone, Email"
                      rows={4}
                      value={formData.primaryContactShow}
                      onChange={(e) => handleInputChange("primaryContactShow", e.target.value)}
                      className={cn(getFieldError("primaryContactShow") && "border-red-500")}
                    />
                    {getFieldError("primaryContactShow") && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError("primaryContactShow")}
                      </p>
                    )}
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
                      <Label className="flex items-center gap-1">
                        Age Demographic <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.ageDemographic}
                        onValueChange={(value: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "") =>
                          handleInputChange("ageDemographic", value)
                        }
                      >
                        <SelectTrigger className={cn(getFieldError("ageDemographic") && "border-red-500")}>
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
                      {getFieldError("ageDemographic") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("ageDemographic")}
                        </p>
                      )}
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
                        <SelectTrigger className={cn(getFieldError("region") && "border-red-500")}>
                          <SelectValue placeholder="Choose region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Urban">Urban</SelectItem>
                          <SelectItem value="Rural">Rural</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("region") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("region")}
                        </p>
                      )}
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
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                      />
                      <Label htmlFor="isActive">Is Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUndersized"
                        checked={formData.isUndersized}
                        onCheckedChange={(checked) => handleInputChange("isUndersized", checked)}
                      />
                      <Label htmlFor="isUndersized">Is Undersized</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Show validation errors summary if attempted to submit */}
          {attemptedSubmit && Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mx-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all required fields and correct invalid entries before saving. Check the highlighted
                tabs and fields.
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Footer */}
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

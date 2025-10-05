"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  DollarSign,
  Calendar,
  Users,
  Radio,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Info,
  BarChart3,
  Target,
  GraduationCap,
  Briefcase,
  Percent,
  Hash,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Archive,
  RotateCcw,
  User,
} from "lucide-react"
import type { Show } from "@/lib/api-client"
import { getRankingInfo } from "@/lib/ranking-utils"
import { useUserMapping } from "@/hooks/use-user-mapping"
import React, { useEffect, useState } from "react"

// --- Reusable Sub-components for Cleaner Layout ---

// A generic component to display a piece of detail with a label and value
const DetailItem = ({
  label,
  value,
  icon,
  isBadge = false,
  badgeVariant = "outline",
}: {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
  isBadge?: boolean
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}) => {
  const Icon = icon
  
  // Check if the value is a React element (like a Badge component)
  const isReactElement = React.isValidElement(value)
  
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      {isBadge || isReactElement ? (
        <div className="mt-1">
          {isBadge ? (
            <Badge variant={badgeVariant} className="text-xs md:text-sm">
              {value}
            </Badge>
          ) : (
            value
          )}
        </div>
      ) : (
        <p className="text-sm md:text-base font-semibold">{value || "N/A"}</p>
      )}
    </div>
  )
}

// A dedicated component for displaying contact information cleanly
const ContactCard = ({
  title,
  contactString,
}: {
  title: string
  contactString: string
}) => {
  const parseContact = (str: string) => {
    if (!str || str === "Internal" || str === "-") {
      return { name: str || "Not specified", address: "", phone: "", email: "" }
    }
    const parts = str.split(", ")
    return {
      name: parts[0] || "",
      address: parts.slice(1, -2).join(", ") || "",
      phone: parts[parts.length - 2] || "",
      email: parts[parts.length - 1] || "",
    }
  }

  const contact = parseContact(contactString)

  return (
    <div className="space-y-2">
      <h5 className="font-semibold text-sm text-muted-foreground">{title}</h5>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{contact.name}</span>
        </div>
        {contact.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
            <span>{contact.address}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Main Dialog Component ---

interface ShowViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  show: Show | null
  onNavigate: (direction: "next" | "previous") => void
  hasNext: boolean
  hasPrevious: boolean
  onEdit?: (show: Show) => void
  onDelete?: (show: Show) => void
  onArchive?: (show: Show) => void
  onUnarchive?: (show: Show) => void
  isArchived?: boolean
}

export default function ShowViewDialog({
  open,
  onOpenChange,
  show,
  onNavigate,
  hasNext,
  hasPrevious,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  isArchived = false,
}: ShowViewDialogProps) {
  const { getUserName, fetchUser } = useUserMapping()
  const [animationDirection, setAnimationDirection] = useState<"next" | "previous" | null>(null)
  const [isContactOpen, setIsContactOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      // Reset animation direction when dialog closes
      setAnimationDirection(null)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) {
        setAnimationDirection("next")
        onNavigate("next")
      } else if (e.key === "ArrowLeft" && hasPrevious) {
        setAnimationDirection("previous")
        onNavigate("previous")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, hasNext, hasPrevious, onNavigate])

  // Fetch user data when dialog opens
  useEffect(() => {
    if (open && show) {
      console.log('Show data in dialog:', { 
        created_by: show.created_by, 
        created_by_id: show.created_by_id, 
        created_at: show.created_at,
        archived_by: show.archived_by,
        archived_by_id: show.archived_by_id
      })
      if (show.created_by_id) {
        fetchUser(show.created_by_id)
      }
      if (show.archived_by_id) {
        fetchUser(show.archived_by_id)
      }
    }
  }, [open, show, fetchUser])

  if (!show) return null

  const handleNavigationClick = (direction: "next" | "previous") => {
    setAnimationDirection(direction)
    onNavigate(direction)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  const formatPercentage = (amount: number | null | undefined) =>
    amount === null || typeof amount === "undefined" ? "N/A" : `${amount}%`

  const revenueFlags = [
    { label: "Branded Revenue", value: show.has_branded_revenue },
    { label: "Marketing Revenue", value: show.has_marketing_revenue },
    { label: "Web Management Revenue", value: show.has_web_mgmt_revenue },
    { label: "Minimum Guarantee", value: show.minimum_guarantee },
    { label: "Sponsorship Revenue", value: show.has_sponsorship_revenue },
    { label: "Non Evergreen Revenue", value: show.has_non_evergreen_revenue },
    { label: "Partner Ledger Access", value: show.requires_partner_access },
  ]

  const statusFlags = [
    { label: "Rate Card", value: show.rate_card },
    { label: "Original", value: show.is_original },
    { label: "Active", value: show.is_active },
    { label: "Undersized", value: show.is_undersized },
  ]

  const contractSplits = [
    { label: "Side Bonus", value: formatPercentage(show.side_bonus_percent) },
    { label: "YouTube Ads", value: formatPercentage(show.youtube_ads_percent) },
    { label: "Subscriptions", value: formatPercentage(show.subscriptions_percent) },
    { label: "Standard Ads", value: formatPercentage(show.standard_ads_percent) },
    { label: "Sponsorship (FP Lead)", value: formatPercentage(show.sponsorship_ad_fp_lead_percent) },
    {
      label: "Sponsorship (Partner Lead)",
      value: formatPercentage(show.sponsorship_ad_partner_lead_percent),
    },
    {
      label: "Sponsorship (Partner Sold)",
      value: formatPercentage(show.sponsorship_ad_partner_sold_percent),
    },
    { label: "Programmatic Ads", value: formatPercentage(show.programmatic_ads_span_percent) },
    { label: "Merchandise", value: formatPercentage(show.merchandise_percent) },
    { label: "Branded Revenue", value: formatPercentage(show.branded_revenue_percent) },
    {
      label: "Marketing Services",
      value: formatPercentage(show.marketing_services_revenue_percent),
    },
  ]

  const handsOffSplits = [
    { label: "Direct Customer", value: formatPercentage(show.direct_customer_hands_off_percent) },
    { label: "YouTube", value: formatPercentage(show.youtube_hands_off_percent) },
    { label: "Subscriptions", value: formatPercentage(show.subscription_hands_off_percent) },
  ]

  const animationClass =
    animationDirection === "next"
      ? "animate-in slide-in-from-right-8 fade-in-0 duration-300"
      : animationDirection === "previous"
      ? "animate-in slide-in-from-left-8 fade-in-0 duration-300"
      : "" // No slide animation on initial open

  const buttonStyles =
    "navigation-button rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none border-2 border-slate-300 dark:border-slate-700 p-1.5"

  const paginationButtonStyles = "variant-outline size-sm"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full sm:w-[90%] h-screen sm:h-[95vh] flex flex-col p-0 overflow-hidden dark:bg-black border-0 [&>button:not(.navigation-button)]:hidden" hideClose>
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-background dark:bg-[#262626] border-b dark:border-slate-800">
          {/* Mobile: Title left, Close right */}
          <div className="flex sm:hidden w-full items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-left truncate flex-1 pr-4">
              {show.title}
            </DialogTitle>
            <DialogClose className={buttonStyles}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          {/* Desktop: Navigation, Title, Actions in one row */}
          <div className="hidden sm:flex flex-row items-center justify-between w-full">
          <div className="flex flex-none items-center gap-2 w-32">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigationClick("previous")}
                disabled={!hasPrevious}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigationClick("next")}
                disabled={!hasNext}
                className="h-8"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
          </div>

          <DialogTitle className="flex-1 text-2xl font-semibold text-center truncate px-4">
            {show.title}
          </DialogTitle>

          <div className="flex flex-none justify-end gap-2 w-32">
            {onEdit && show && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(show)}
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
              >
                Edit
              </Button>
            )}
            {onDelete && show && (
              <Button
                size="sm"
                onClick={() => onDelete(show)}
                className="h-8 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
              >
                Delete
              </Button>
            )}
            {onArchive && show && !isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(show)}
                className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
            {onUnarchive && show && isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnarchive(show)}
                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Unarchive
              </Button>
            )}
            <div className="ml-4">
              <DialogClose className={buttonStyles}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div key={show.id} className={`grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 ${animationClass}`}>
            {/* Column 1 */}
            <div className="space-y-6">
              <Card className="dark:bg-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-emerald-500" /> Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-x-6 gap-y-6">
                  <DetailItem label="Show Type" value={show.show_type} />
                  <DetailItem label="Format" value={show.media_type ? show.media_type.charAt(0).toUpperCase() + show.media_type.slice(1) : "N/A"} />
                  <DetailItem label="Relationship" value={show.relationship_level ? show.relationship_level.charAt(0).toUpperCase() + show.relationship_level.slice(1) : "N/A"} />
                  <DetailItem 
                    label="Ranking Category" 
                    value={(() => {
                      const rankingInfo = getRankingInfo(show.ranking_category);
                      return rankingInfo.hasRanking ? (
                        <Badge variant="secondary" className={rankingInfo.badgeClasses}>
                          {rankingInfo.displayText}
                        </Badge>
                      ) : "N/A";
                    })()} 
                  />
                  <DetailItem
                    label="Created Date"
                    value={show.start_date ? new Date(show.start_date).toLocaleDateString() : "N/A"}
                  />
                  <DetailItem label="Age" value={show.start_date ? `${Math.floor((new Date().getTime() - new Date(show.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months` : "N/A"} />
                  <DetailItem label="Subnetwork" value={show.subnetwork_id} />
                  <div className="col-span-3">
                    <label className="text-xs font-medium text-muted-foreground">
                      Status Flags
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {statusFlags.map((flag) => (
                        <Badge
                          key={flag.label}
                          className={`text-xs border pointer-events-none ${
                            flag.value
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                          }`}
                        >
                          {flag.label} - {flag.value ? "Yes" : "No"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Contact Information — collapsible with smooth slide - Desktop only */}
              <Card className="dark:bg-[#262626] hidden lg:block">
                <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
                  {/* Clickable header (keeps your exact title style) */}
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5 text-emerald-500" />
                          Contact Information
                        </CardTitle>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${isContactOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  {/* Slide down/up with grid-rows trick (no height:auto jank) */}
                  <CollapsibleContent asChild forceMount>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isContactOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div
                        className={`overflow-hidden min-h-0 transition-all duration-300 ease-out ${
                          isContactOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                        }`}
                      >
                        <CardContent className="space-y-4">
                          <ContactCard title="Host Contact" contactString={show.show_host_contact} />
                          <Separator className="dark:bg-slate-700" />
                          <ContactCard title="Show Primary Contact" contactString={show.show_primary_contact} />
                          <Separator className="dark:bg-slate-700" />
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground">Evergreen Production Staff</h5>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                              <span>{show.evergreen_production_staff_name || "None"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <Card className="dark:bg-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-emerald-500" /> Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <DetailItem label="EVG Ownership %" value={show.evergreen_ownership_pct ? `${show.evergreen_ownership_pct}%` : "N/A"} />
                    <DetailItem label="Span CPM" value={show.span_cpm_usd ? `$${show.span_cpm_usd}` : "N/A"} />
                    <DetailItem label="Latest CPM" value={show.latest_cpm_usd ? `$${show.latest_cpm_usd}` : "N/A"} />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                        <BarChart3 className="h-4 w-4" /> Revenue by Year
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">2023</p>
                          <p className="text-base font-bold text-emerald-600">
                            {formatCurrency(show.revenue_2023)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                          <p className="text-xs text-cyan-700 dark:text-cyan-300">2024</p>
                          <p className="text-base font-bold text-cyan-600">
                            {formatCurrency(show.revenue_2024)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300">2025</p>
                          <p className="text-base font-bold text-green-600">
                            {formatCurrency(show.revenue_2025)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                        <Percent className="h-4 w-4" /> Revenue Split to Partner
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300">Standard Ads</p>
                          <p className="text-base font-bold text-blue-600">
                            {show.standard_ads_percent ? `${show.standard_ads_percent}%` : "N/A"}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-xs text-purple-700 dark:text-purple-300">Programmatic Ads</p>
                          <p className="text-base font-bold text-purple-600">
                            {show.programmatic_ads_span_percent ? `${show.programmatic_ads_span_percent}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4 dark:bg-slate-700" />

                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                      <TrendingUp className="h-4 w-4" /> Revenue Flags
                    </h4>
                    {/* Only show flags that are true */}
                    <div className="flex flex-wrap gap-2">
                      {revenueFlags.filter((flag) => !!flag.value).length > 0 ? (
                        revenueFlags
                          .filter((flag) => !!flag.value)
                          .map((flag) => (
                            <Badge
                              key={flag.label}
                              className={`text-xs border pointer-events-none ${
                                flag.value
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                                  : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                              }`}
                            >
                              {flag.label}
                            </Badge>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No Revenue Flags Available for this Show
                        </p>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              {/* <Card className="dark:bg-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Percent className="h-5 w-5 text-gray-500" /> Financial Splits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Contract Splits
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {contractSplits.map((split) => (
                        <DetailItem key={split.label} label={split.label} value={split.value} />
                      ))}
                    </div>
                  </div>
                  <Separator className="dark:bg-slate-700" />
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Hands-Off Splits
                    </h4>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                      {handsOffSplits.map((split) => (
                        <DetailItem key={split.label} label={split.label} value={split.value} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card> */}
              <Card className="dark:bg-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Radio className="h-5 w-5 text-emerald-500" /> Content Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <DetailItem label="Genre" value={show.genre_name} />
                  <DetailItem label="Cadence" value={show.cadence} />
                  <DetailItem label="Ad Slots" value={show.ad_slots} />
                  <DetailItem label="Average Length" value={show.avg_show_length_mins ? `${show.avg_show_length_mins} min` : "N/A"} />
                </CardContent>
              </Card>
              <Card className="dark:bg-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-emerald-500" /> Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <DetailItem label="Age" value={show.age_demographic} />
                    <DetailItem label="Gender (M/F)" value={show.gender} />
                    <DetailItem label="Region" value={show.region} />
                    <DetailItem label="Primary Education" value={show.primary_education} />
                    <DetailItem label="Secondary Education" value={show.secondary_education} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information - moved to bottom for mobile only */}
            <div className="lg:col-span-3 lg:hidden">
              <Card className="dark:bg-[#262626]">
                <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
                  {/* Clickable header (keeps your exact title style) */}
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5 text-emerald-500" />
                          Contact Information
                        </CardTitle>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${isContactOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  {/* Slide down/up with grid-rows trick (no height:auto jank) */}
                  <CollapsibleContent asChild forceMount>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isContactOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div
                        className={`overflow-hidden min-h-0 transition-all duration-300 ease-out ${
                          isContactOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                        }`}
                      >
                        <CardContent className="space-y-4">
                          <ContactCard title="Host Contact" contactString={show.show_host_contact} />
                          <Separator className="dark:bg-slate-700" />
                          <ContactCard title="Show Primary Contact" contactString={show.show_primary_contact} />
                          <Separator className="dark:bg-slate-700" />
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground">Evergreen Production Staff</h5>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                              <span>{show.evergreen_production_staff_name || "None"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          </div>
        </ScrollArea>
        
        {/* Mobile Footer - Navigation and Actions */}
        <div className="sm:hidden border-t bg-muted/30 px-6 py-3">
          {/* First line: Navigation and Action buttons */}
          <div className="flex items-center justify-between mb-3">
            {/* Left: Arrow buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigationClick("previous")}
                disabled={!hasPrevious}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigationClick("next")}
                disabled={!hasNext}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {onEdit && show && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(show)}
                  className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
                >
                  Edit
                </Button>
              )}
              {onDelete && show && (
                <Button
                  size="sm"
                  onClick={() => onDelete(show)}
                  className="h-8 px-3 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Delete
                </Button>
              )}
              {onArchive && show && !isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onArchive(show)}
                  className="h-8 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              )}
              {onUnarchive && show && isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnarchive(show)}
                  className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Unarchive
                </Button>
              )}
            </div>
          </div>

          {/* Separator line */}
          <div className="border-t border-muted-foreground/20 my-3"></div>

          {/* Second line: Created by and Archived by info */}
        {show && (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground items-center">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Created by <span className="font-medium">{getUserName(show.created_by_id, show.created_by)}</span> on{' '}
                  <span className="font-medium">
                    {show.created_at ? new Date(show.created_at).toLocaleString() : 'Unknown date'}
                  </span>
                </span>
              </div>
              {isArchived && (
                <>
                  <div className="border-t border-muted-foreground/20 w-full my-1"></div>
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    <span>
                      Archived by <span className="font-medium">{getUserName(show.archived_by_id, show.archived_by)}</span> on{' '}
                      <span className="font-medium">
                        {show.archived_at ? new Date(show.archived_at).toLocaleString() : 'Unknown date'}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Footer - Show creation and archive info */}
        {show && (
          <div className="hidden sm:block border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    Created by <span className="font-medium">{getUserName(show.created_by_id, show.created_by)}</span> on{' '}
                    <span className="font-medium">
                      {show.created_at ? new Date(show.created_at).toLocaleString() : 'Unknown date'}
                    </span>
                  </span>
                </div>
                {isArchived && (
                  <>
                    <span className="text-muted-foreground/50">|</span>
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      <span>
                        Archived by <span className="font-medium">{getUserName(show.archived_by_id, show.archived_by)}</span> on{' '}
                        <span className="font-medium">
                          {show.archived_at ? new Date(show.archived_at).toLocaleString() : 'Unknown date'}
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    </>
  )
}
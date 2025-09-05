"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
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
} from "lucide-react"
import type { Show } from "@/lib/show-types"
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
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      {isBadge ? (
        <Badge variant={badgeVariant} className="mt-1 text-xs md:text-sm">
          {value}
        </Badge>
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
}

export default function ShowViewDialog({
  open,
  onOpenChange,
  show,
  onNavigate,
  hasNext,
  hasPrevious,
}: ShowViewDialogProps) {
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
    { label: "Branded Revenue", value: show.hasBrandedRevenue },
    { label: "Marketing Revenue", value: show.hasMarketingRevenue },
    { label: "Web Management Revenue", value: show.hasWebManagementRevenue },
    { label: "Sponsorship Revenue", value: show.hasSponsorshipRevenue },
    { label: "Non Evergreen Revenue", value: show.hasNonEvergreenRevenue },
    { label: "Partner Ledger Access", value: show.requiresPartnerLedgerAccess },
  ]

  const statusFlags = [
    { label: "Tentpole", value: show.isTentpole },
    { label: "Original", value: show.isOriginal },
    { label: "Active", value: show.is_active },
    { label: "Undersized", value: show.is_undersized },
  ]

  const contractSplits = [
    { label: "Side Bonus", value: formatPercentage(show.sideBonusPercent) },
    { label: "YouTube Ads", value: formatPercentage(show.youtubeAdsPercent) },
    { label: "Subscriptions", value: formatPercentage(show.subscriptionsPercent) },
    { label: "Standard Ads", value: formatPercentage(show.standardAdsPercent) },
    { label: "Sponsorship (FP Lead)", value: formatPercentage(show.sponsorshipAdFpLeadPercent) },
    {
      label: "Sponsorship (Partner Lead)",
      value: formatPercentage(show.sponsorshipAdPartnerLeadPercent),
    },
    {
      label: "Sponsorship (Partner Sold)",
      value: formatPercentage(show.sponsorshipAdPartnerSoldPercent),
    },
    { label: "Programmatic Ads", value: formatPercentage(show.programmaticAdsSpanPercent) },
    { label: "Merchandise", value: formatPercentage(show.merchandisePercent) },
    { label: "Branded Revenue", value: formatPercentage(show.brandedRevenuePercent) },
    {
      label: "Marketing Services",
      value: formatPercentage(show.marketingServicesRevenuePercent),
    },
  ]

  const handsOffSplits = [
    { label: "Direct Customer", value: formatPercentage(show.directCustomerHandsOffPercent) },
    { label: "YouTube", value: formatPercentage(show.youtubeHandsOffPercent) },
    { label: "Subscriptions", value: formatPercentage(show.subscriptionHandsOffPercent) },
  ]

  const animationClass =
    animationDirection === "next"
      ? "animate-in slide-in-from-right-8 fade-in-0 duration-300"
      : animationDirection === "previous"
      ? "animate-in slide-in-from-left-8 fade-in-0 duration-300"
      : "" // No slide animation on initial open

  const buttonStyles =
    "navigation-button rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none border-2 border-slate-300 dark:border-slate-700 p-1.5"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-full sm:w-[90%] h-screen sm:h-[95vh] flex flex-col p-0 overflow-hidden dark:bg-black border-0 [&>button:not(.navigation-button)]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-background dark:bg-[#262626] border-b dark:border-slate-800">
          <div className="flex flex-none items-center gap-2">
            {hasPrevious ? (
              <Button
                variant="ghost"
                onClick={() => handleNavigationClick("previous")}
                className={buttonStyles}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              // Placeholder to maintain spacing
              <div className="w-8" />
            )}
            {hasNext ? (
              <Button
                variant="ghost"
                onClick={() => handleNavigationClick("next")}
                className={buttonStyles}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              // Placeholder to maintain spacing
              <div className="w-8" />
            )}
          </div>

          <DialogTitle className="flex-1 text-2xl font-semibold text-center truncate px-4">
            {show.name}
          </DialogTitle>

          <div className="flex flex-none justify-end">
            <DialogClose className={buttonStyles}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
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
                  <DetailItem label="Format" value={show.format} />
                  <DetailItem label="Relationship" value={show.relationship} />
                  <DetailItem label="Subnetwork" value={show.subnetwork_id} />
                  <DetailItem
                    label="Created Date"
                    value={new Date(show.start_date).toLocaleDateString()}
                  />
                  <DetailItem label="Age" value={`${show.ageMonths} months`} />
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
              {/* Contact Information — collapsible with smooth slide */}
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
                          <ContactCard title="Host Contact" contactString={show.primaryContactHost} />
                          <Separator className="dark:bg-slate-700" />
                          <ContactCard title="Show Primary Contact" contactString={show.primaryContactShow} />
                          <Separator className="dark:bg-slate-700" />
                          <div>
                            <h5 className="font-semibold text-sm text-muted-foreground">Evergreen Production Staff</h5>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                              <span>{show.evergreenProductionStaffName || "None"}</span>
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
                    <DetailItem
                      label="Minimum Guarantee"
                      value={formatCurrency(show.minimumGuarantee)}
                    />
                    <DetailItem label="Ownership %" value={`${show.ownershipPercentage}%`} />
                    <DetailItem label="Latest CPM" value={`$${show.latestCPM}`} />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                        <BarChart3 className="h-4 w-4" /> Revenue by Year
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-muted/50 dark:bg-black rounded-lg">
                          <p className="text-xs text-muted-foreground">2023</p>
                          <p className="text-base font-bold text-emerald-600">
                            {formatCurrency(show.revenue2023)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 dark:bg-black rounded-lg">
                          <p className="text-xs text-muted-foreground">2024</p>
                          <p className="text-base font-bold text-cyan-600">
                            {formatCurrency(show.revenue2024)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 dark:bg-black rounded-lg">
                          <p className="text-xs text-muted-foreground">2025</p>
                          <p className="text-base font-bold text-green-600">
                            {formatCurrency(show.revenue2025)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                        <Percent className="h-4 w-4" /> Revenue Split
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-muted/50 dark:bg-black rounded-lg">
                          <p className="text-xs text-muted-foreground">Standard Ads</p>
                          <p className="text-base font-bold text-emerald-600">
                            {show.standardAdsPercent}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 dark:bg-black rounded-lg">
                          <p className="text-xs text-muted-foreground">Programmatic Ads</p>
                          <p className="text-base font-bold text-cyan-600">
                            {show.programmaticAdsSpanPercent}%
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
                  <DetailItem label="Shows per Year" value={show.showsPerYear} />
                  <DetailItem label="Ad Slots" value={show.adSlots} />
                  <DetailItem label="Average Length" value={`${show.averageLength} min`} />
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
                    <DetailItem label="Gender" value={show.gender} />
                    <DetailItem label="Region" value={show.region} />
                    <DetailItem label="Primary Education" value={show.primary_education} />
                    <DetailItem label="Secondary Education" value={show.secondary_education} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
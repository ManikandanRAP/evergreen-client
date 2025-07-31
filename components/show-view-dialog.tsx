"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"
import type { Show } from "@/lib/show-types"

interface ShowViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  show: Show | null
}

export default function ShowViewDialog({ open, onOpenChange, show }: ShowViewDialogProps) {
  if (!show) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (amount: number | null | undefined) => {
    if (amount === null || typeof amount === "undefined") {
      return "N/A"
    }
    return `${amount}%`
  }

  const parseContact = (contactString: string) => {
    if (!contactString || contactString === "Internal" || contactString === "-") {
      return {
        name: contactString || "Not specified",
        address: "",
        phone: "",
        email: "",
      }
    }

    // Parse contact string format: "Name, Address, Phone, Email"
    const parts = contactString.split(", ")
    return {
      name: parts[0] || "",
      address: parts.slice(1, -2).join(", ") || "",
      phone: parts[parts.length - 2] || "",
      email: parts[parts.length - 1] || "",
    }
  }

  const hostContact = parseContact(show.primaryContactHost)
  const showContact = parseContact(show.primaryContactShow)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {show.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="evergreen-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Show Type</label>
                      <p className="font-medium capitalize">{show.showType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Format</label>
                      <div className="mt-1">
                        <Badge variant={show.format === "Video" ? "default" : "secondary"}>{show.format}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            show.relationship === "Strong"
                              ? "default"
                              : show.relationship === "Medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {show.relationship}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                      <p className="font-medium">{new Date(show.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Subnetwork</label>
                      <p className="font-medium">{show.subnetwork_id || "None"}</p>
                    </div>
                  </div>

                  
                  <div className="space-y-4">
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-600" />
                        <span className="font-medium">{show.ageMonths} months</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Badge variant={show.isTentpole ? "default" : "outline"} className="text-xs px-2 w-auto">
                            {show.isTentpole ? "Tentpole" : "Not Tentpole"}
                          </Badge>
                          <Badge variant={show.isOriginal ? "default" : "outline"} className="text-xs px-2 w-auto">
                            {show.isOriginal ? "Original" : "Not Original"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={show.isActive ? "default" : "outline"} className="text-xs px-2 w-auto">
                            {show.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={show.isUndersized ? "default" : "outline"} className="text-xs px-2 w-auto">
                            {show.isUndersized ? "Undersized" : "Not Undersized"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="evergreen-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Minimum Guarantee</label>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(show.minimumGuarantee)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ownership %</label>
                      <p className="text-lg font-bold">{show.ownershipPercentage}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Latest CPM</label>
                      <p className="text-lg font-bold text-cyan-600">${show.latestCPM}</p>
                    </div>
                    {/* <div>
                      <label className="text-sm font-medium text-muted-foreground">Branded Revenue</label>
                      <p className="font-medium">{formatCurrency(show.brandedRevenueAmount)}</p>
                    </div> */}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Revenue Flags</label>
                      <div className="flex gap-2  p-2 justify-start w-[400px] ">
                        <div className="flex-row gap-2  h-[100px]">
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.hasBrandedRevenue ? "default" : "outline"} className="text-xs">
                              {show.hasBrandedRevenue ? "Has" : "No"} Branded
                            </Badge>
                          </div>
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.hasMarketingRevenue ? "default" : "outline"} className="text-xs ">
                              {show.hasMarketingRevenue ? "Has" : "No"} Marketing
                            </Badge>
                          </div>
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.hasWebManagementRevenue ? "default" : "outline"} className="text-xs ">
                              {show.hasWebManagementRevenue ? "Has" : "No"} Web Management
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-row gap-2  ">
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.hasSponsorshipRevenue ? "default" : "outline"} className="text-xs ">
                              {show.hasSponsorshipRevenue ? "Has" : "No"} Sponsorship
                            </Badge>
                          </div>
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.hasNonEvergreenRevenue ? "default" : "outline"} className="text-xs ">
                              {show.hasNonEvergreenRevenue ? "Has" : "No"} Non Evergreen
                            </Badge>
                          </div>
                          <div className=" w-full h-[20px] mb-2">
                            <Badge variant={show.requiresPartnerLedgerAccess ? "default" : "outline"} className="text-xs ">
                              {show.requiresPartnerLedgerAccess ? "Requires" : "No"} Partner Access
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Revenue Split */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Revenue Split
                  </h4>
                  <div className="flex gap-4">
                    <Badge variant="outline" className="text-sm">
                      Evergreen: {show.revenueSplit.evergreen}%
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Partner: {show.revenueSplit.partner}%
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Revenue by Year */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Revenue by Year
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">2023</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(show.revenue2023)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">2024</p>
                      <p className="text-lg font-bold text-cyan-600">{formatCurrency(show.revenue2024)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">2025</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(show.revenue2025)}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4 mt-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Contract Splits
                  </h4>
                  <div className="space-y-4 grid grid-cols-3 justify-center ">
                    <div className="first:pt-4">
                      <label className="text-sm font-medium text-muted-foreground">Side Bonus</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.sideBonusPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">YouTube Ads</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.youtubeAdsPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Subscriptions</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.subscriptionsPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Standard Ads</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.standardAdsPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sponsorship (FP Lead)</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.sponsorshipAdFpLeadPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sponsorship (Partner Lead)</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.sponsorshipAdPartnerLeadPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sponsorship (Partner Sold)</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.sponsorshipAdPartnerSoldPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Programmatic Ads</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.programmaticAdsSpanPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Merchandise</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.merchandisePercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Branded Revenue</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.brandedRevenuePercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Marketing Services</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.marketingServicesRevenuePercent)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4 mt-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Hands Off Splits
                  </h4>
                  <div className="space-y-4 grid grid-cols-3  justify-center ">
                    <div className="first:pt-4">
                      <label className="text-sm font-medium text-muted-foreground">Direct Customer</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.directCustomerHandsOffPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">YouTube</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.youtubeHandsOffPercent)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Subscriptions</label>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatPercentage(show.subscriptionHandsOffPercent)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card className="evergreen-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-emerald-600" />
                  Content Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Genre</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="mt-1">
                        {show.genre_name}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shows per Year</label>
                    <p className="text-lg font-bold text-cyan-600">{show.showsPerYear}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ad Slots</label>
                    <p className="text-lg font-bold">{show.adSlots}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Average Length</label>
                    <p className="text-lg font-bold">{show.averageLength} min</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Contact Information */}
                <div className="space-y-6">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contact Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Host Contact */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-muted-foreground">Host Contact</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{hostContact.name}</span>
                        </div>
                        {hostContact.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{hostContact.address}</span>
                          </div>
                        )}
                        {hostContact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hostContact.phone}</span>
                          </div>
                        )}
                        {hostContact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hostContact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show Contact */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-muted-foreground">Show Primary Contact</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{showContact.name}</span>
                        </div>
                        {showContact.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{showContact.address}</span>
                          </div>
                        )}
                        {showContact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{showContact.phone}</span>
                          </div>
                        )}
                        {showContact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{showContact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-medium text-muted-foreground">Evergreen Production Staff Primary Contact</h5>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{show.evergreenProductionStaffName || "None"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card className="evergreen-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age Demographic</label>
                    <div className="mt-1">
                      <Badge variant="outline">{show.ageDemographic || "N/A"}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender Demographic</label>
                    <div className="mt-1">
                      <Badge variant="outline">{show.gender || "N/A"}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Region</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize">
                        {show.region || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4" />
                      Education Demographic
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Primary: <Badge variant="outline">{show.primary_education || "N/A"}</Badge>
                      </p>
                      <p className="text-sm font-medium">
                        Secondary: <Badge variant="outline">{show.secondary_education || "N/A"}</Badge>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

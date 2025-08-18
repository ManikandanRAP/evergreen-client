import type { Show as ApiShow } from "./api-client"

// Legacy Show interface for backward compatibility
export interface Show {
  id: string
  name: string
  partnerUsers: string[] // Replace 'any' with a specific type if available
  revenueSplit: {
    evergreen: number
    partner: number
  }
  

  // Basic Info
  show_type: string
  selectType: "Podcasts" | "Video Series" | "Live Show" | "Interview Series"
  subnetwork_id: string
  format: "Video" | "Audio" | "Both"
  relationship: "Strong" | "Medium" | "Weak"
  ageMonths: number
  isTentpole: boolean
  isOriginal: boolean

  // Financial
  minimumGuarantee: number
  ownershipPercentage: number
  brandedRevenueAmount: number
  marketingRevenueAmount: number
  webManagementRevenue: number
  latestCPM: number
  revenue2023: number
  revenue2024: number
  revenue2025: number
  hasSponsorshipRevenue: boolean
  hasNonEvergreenRevenue: boolean
  requiresPartnerLedgerAccess: boolean

  // Content Details
  genre_name: string
  showsPerYear: number
  adSlots: number
  averageLength: number
  primaryContactHost: string
  primaryContactShow: string

  // Demographics
  age_demographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "" | null
  gender: string | null
  is_undersized: boolean | null
  primary_education: string | null
  secondary_education: string | null
  evergreenProductionStaffName?: string | null
  evergreenProductionStaffPrimaryContact?: string | null

  // Additional fields for compatibility
  host?: {
    name: string
    email: string
    phone: string
  }
  showPrimaryContact?: {
    name: string
    email: string
    phone: string
  }
  demographics: {
    region: string
    primary_education: string
    secondary_education: string
  }
  hasBrandedRevenue: boolean
  hasMarketingRevenue: boolean
  hasWebManagementRevenue: boolean
  genderDemographic: string | null  
  avgShowLengthMins: number
  start_date: string
  sideBonusPercent:number
  youtubeAdsPercent:number
  subscriptionsPercent:number
  standardAdsPercent:number
  sponsorshipAdFpLeadPercent:number
  sponsorshipAdPartnerLeadPercent:number
  sponsorshipAdPartnerSoldPercent:number
  programmaticAdsSpanPercent:number
  merchandePercent:number
  brandedRevenuePercent:number
  marketingServicesRevenuePercent:number
  directCustomerHandsOffPercent:number
  youtubeHandsOffPercent:number
  subscriptionHandsOffPercent:number
  region:string
  is_active:boolean

}

// Utility function to convert API Show to legacy Show format
export function convertApiShowToLegacy(apiShow: ApiShow): Show {
  // Calculate age in months from start_date
  const ageMonths = apiShow.start_date
    ? Math.floor((new Date().getTime() - new Date(apiShow.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0

  // Map relationship levels
  const relationshipMap: Record<string, "Strong" | "Medium" | "Weak"> = {
    strong: "Strong",
    medium: "Medium",
    weak: "Weak",
  }

  // Map media types to format
  const formatMap: Record<string, "Video" | "Audio" | "Both"> = {
    video: "Video",
    audio: "Audio",
    both: "Both",
  }

  return {
    id: apiShow.id,
    name: apiShow.title || "Untitled Show",
    partnerUsers: [],
    revenueSplit: { evergreen: apiShow.evergreen_ownership_pct || 0, partner: 100 - (apiShow.evergreen_ownership_pct || 0) },
    start_date: apiShow.start_date || new Date().toISOString(),
    show_type: apiShow.show_type || "Original",
    selectType: "Podcasts",    
    format: formatMap[apiShow.media_type || "audio"] || "Audio",
    relationship: relationshipMap[apiShow.relationship_level || "medium"] || "Medium",
    ageMonths,
    isTentpole: apiShow.tentpole || false,
    isOriginal: apiShow.is_original || false,
    minimumGuarantee: apiShow.minimum_guarantee || 0,
    ownershipPercentage: apiShow.evergreen_ownership_pct || 0,
    brandedRevenueAmount: apiShow.branded_revenue_percent ? (apiShow.branded_revenue_percent * (apiShow.revenue_2024 || 0)) / 100 : 0,
    marketingRevenueAmount: apiShow.marketing_services_revenue_percent ? (apiShow.marketing_services_revenue_percent * (apiShow.revenue_2024 || 0)) / 100 : 0,
    webManagementRevenue: 0,
    latestCPM: apiShow.latest_cpm_usd || 0,
    revenue2023: apiShow.revenue_2023 || 0,
    revenue2024: apiShow.revenue_2024 || 0,
    revenue2025: apiShow.revenue_2025 || 0,
    hasSponsorshipRevenue: apiShow.has_sponsorship_revenue || false,
    hasNonEvergreenRevenue: apiShow.has_non_evergreen_revenue || false,
    requiresPartnerLedgerAccess: apiShow.requires_partner_access || false,
    genre_name: apiShow.genre_name || "General",
    showsPerYear: apiShow.shows_per_year || 0,
    adSlots: apiShow.ad_slots || 0,
    averageLength: apiShow.avg_show_length_mins || 0,
    primaryContactHost: apiShow.show_host_contact || "",
    primaryContactShow: apiShow.show_primary_contact || "",
    age_demographic: apiShow.age_demographic || null,
    gender: apiShow.gender || null,
    is_active: apiShow.is_active || false,
    is_undersized: apiShow.is_undersized || false,
    host: apiShow.show_host_contact ? { name: apiShow.show_host_contact, email: "", phone: "" } : undefined,
    showPrimaryContact: apiShow.show_primary_contact ? { name: apiShow.show_primary_contact, email: "", phone: "" } : undefined,
    demographics: { region: apiShow.region || "", primary_education: apiShow.primary_education || "", secondary_education: apiShow.secondary_education || "" },
    hasBrandedRevenue: apiShow.has_branded_revenue || false,
    hasMarketingRevenue: apiShow.has_marketing_revenue || false,
    hasWebManagementRevenue: apiShow.has_web_mgmt_revenue || false,
    genderDemographic: apiShow.gender || null,
    subnetwork_id: apiShow.subnetwork_id || "",
    avgShowLengthMins: apiShow.avg_show_length_mins || 0,
    sideBonusPercent: apiShow.side_bonus_percent || 0,
    youtubeAdsPercent: apiShow.youtube_ads_percent || 0,
    subscriptionsPercent: apiShow.subscriptions_percent || 0,
    standardAdsPercent: apiShow.standard_ads_percent || 0,
    sponsorshipAdFpLeadPercent: apiShow.sponsorship_ad_fp_lead_percent || 0,
    sponsorshipAdPartnerLeadPercent: apiShow.sponsorship_ad_partner_lead_percent || 0,
    sponsorshipAdPartnerSoldPercent: apiShow.sponsorship_ad_partner_sold_percent || 0,
    programmaticAdsSpanPercent: apiShow.programmatic_ads_span_percent || 0,
    merchandisePercent: apiShow.merchandise_percent || 0,
    brandedRevenuePercent: apiShow.branded_revenue_percent || 0,
    marketingServicesRevenuePercent: apiShow.marketing_services_revenue_percent || 0,
    directCustomerHandsOffPercent: apiShow.direct_customer_hands_off_percent || 0,
    youtubeHandsOffPercent: apiShow.youtube_hands_off_percent || 0,
    subscriptionHandsOffPercent: apiShow.subscription_hands_off_percent || 0,
    region: apiShow.region || "",
    primary_education: apiShow.primary_education || "",
    secondary_education: apiShow.secondary_education || "",
    evergreenProductionStaffName: apiShow.evergreen_production_staff_name || "",
  }
}

// Utility function to convert legacy Show to API ShowCreate format
export function convertLegacyShowToApiCreate(legacyShow: Partial<Show>): any {
  const relationshipMap: Record<string, "strong" | "medium" | "weak"> = {
    Strong: "strong",
    Medium: "medium",
    Weak: "weak",
  }

  const formatMap: Record<string, "video" | "audio" | "both"> = {
    Video: "video",
    Audio: "audio",
    Both: "both",
  }

  const showTypeMap: Record<string, "Branded" | "Original" | "Partner"> = {
    Branded: "Branded",
    Original: "Original",
    Partner: "Partner",
  }

  return {
    title: legacyShow.name || "",
    minimum_guarantee: legacyShow.minimumGuarantee || 0,
    subnetwork_id: legacyShow.subnetwork_id || null,
    media_type: formatMap[legacyShow.format || "Audio"] || "audio",
    tentpole: legacyShow.isTentpole || false,
    relationship_level: relationshipMap[legacyShow.relationship || "Medium"] || "medium",
    show_type: showTypeMap[legacyShow.show_type || "Original"] || "Original",
    evergreen_ownership_pct: legacyShow.ownershipPercentage || 0,
    has_sponsorship_revenue: legacyShow.hasSponsorshipRevenue || false,
    has_non_evergreen_revenue: legacyShow.hasNonEvergreenRevenue || false,
    requires_partner_access: legacyShow.requiresPartnerLedgerAccess || false,
    has_branded_revenue: (legacyShow.brandedRevenueAmount || 0) > 0,
    has_marketing_revenue: (legacyShow.marketingRevenueAmount || 0) > 0,
    has_web_mgmt_revenue: (legacyShow.webManagementRevenue || 0) > 0,
    genre_name: legacyShow.genre_name || null,
    is_original: legacyShow.isOriginal || false,
    shows_per_year: legacyShow.showsPerYear || null,
    latest_cpm_usd: legacyShow.latestCPM || null,
    ad_slots: legacyShow.adSlots || null,
    avg_show_length_mins: legacyShow.averageLength || null,
    start_date: legacyShow.start_date ? new Date(legacyShow.start_date).toISOString().split("T")[0] : null,
    revenue_2023: legacyShow.revenue2023 || null,
    revenue_2024: legacyShow.revenue2024 || null,
    revenue_2025: legacyShow.revenue2025 || null,
    show_host_contact: legacyShow.primaryContactHost || null,
    show_primary_contact: legacyShow.primaryContactShow || null,
    age_demographic: legacyShow.age_demographic || null
  }
}

// Mock data for fallback (keeping existing structure)
export const mockShows: Show[] = [
]

export interface LedgerEntry {
  id: string
  showId: string
  showName: string
  month: string
  totalGross: number
  totalNet: number
  evergreenComp: number
  partnerComp: number
  description: string
  category: "sponsorship" | "programmatic" | "subscription" | "merchandise"
}

export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: "1",
    showId: "1",
    showName: "The History Hour",
    month: "2024-01",
    totalGross: 15000,
    totalNet: 12000,
    evergreenComp: 8400,
    partnerComp: 3600,
    description: "January sponsorship revenue",
    category: "sponsorship",
  },
]
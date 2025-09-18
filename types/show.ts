export interface Show {
  id: string
  name: string
  partnerUsers: string[]
  revenueSplit: {
    evergreen: number
    partner: number
  }
  createdDate: string

  // Basic Info
  showType: string
  subnetwork: string
  format: "Video" | "Audio" | "Both"
  relationship: "Strong" | "Medium" | "Weak"
  ageMonths: number
  isRateCard: boolean
  isOriginal: boolean
  rankingCategory: "1" | "2" | "3" | "4" | "5" | null

  // Financial
  minimumGuarantee: boolean
  ownershipPercentage: number
  brandedRevenueAmount: number
  marketingRevenueAmount: number
  webManagementRevenue: number
  latestCPM: number
  revenue2023: number
  revenue2024: number
  revenue2025: number
  hasSponsorshipRevenue: boolean
  hasNonBussownerRevenue: boolean
  requiresPartnerLedgerAccess: boolean

  // Content Details
  genre_name: string
  cadence: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc"
  adSlots: number
  averageLength: number
  primaryContactHost: string
  primaryContactShow: string

  // Demographics
  age_demographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+"
  genderDemographic: "Male" | "Female" | "Others"
  is_active: boolean
  isUndersized: boolean
}

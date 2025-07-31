"use client"

import { useState, useEffect } from "react"
import { apiClient, type Show as ApiShow, type FilterParams } from "@/lib/api-client"
import { convertApiShowToLegacy, type Show } from "@/lib/show-types"
import { useAuth } from "@/lib/auth-context"

export function useShows() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchShows = async (filters?: FilterParams) => {
    try {
      setLoading(true)
      setError(null)

      let apiShows: ApiShow[]

      if (user?.role === "partner") {
        // Partners only see their assigned shows
        apiShows = await apiClient.getMyPodcasts()
      } else if (filters && Object.keys(filters).length > 0) {
        // Apply filters for admin users
        console.log("Applying filters:", filters)
        apiShows = await apiClient.filterPodcasts(filters)
      } else {
        // Get all shows for admin users
        apiShows = await apiClient.getAllPodcasts()
        console.log("Fetching all shows", apiShows)
      }

      const legacyShows = apiShows.map(convertApiShowToLegacy)
      console.log("Fetched shows:", legacyShows)
      setShows(legacyShows)
    } catch (err) {
      console.error("Failed to fetch shows:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch shows")
    } finally {
      setLoading(false)
    }
  }

  const createShow = async (showData: Partial<Show>): Promise<Show | null> => {
    try {
      const apiCreateData = {
        title: showData.name || "",
        start_date: showData.start_date ? new Date(showData.start_date).toISOString() : null,
        minimum_guarantee: showData.minimumGuarantee || 0,
        subnetwork_id: showData.subnetwork_id || null,
        media_type: showData.format === "Video" ? ("video" as const) : ("audio" as const),
        tentpole: showData.isTentpole || false,
        relationship_level: (showData.relationship?.toLowerCase() as "strong" | "medium" | "weak") || "medium",
        show_type: (showData.showType as "Branded" | "Original" | "Partner") || "Original",
        evergreen_ownership_pct: showData.ownershipPercentage || 0,
        has_sponsorship_revenue: showData.hasSponsorshipRevenue || false,
        has_non_evergreen_revenue: showData.hasNonEvergreenRevenue || false,
        requires_partner_access: showData.requiresPartnerLedgerAccess || false,
        has_branded_revenue: showData.hasBrandedRevenue || false,
        has_marketing_revenue: showData.hasMarketingRevenue || false,
        has_web_mgmt_revenue: showData.hasWebManagementRevenue || false,
        genre_name: showData.genre_name || null,
        is_original: showData.isOriginal || false,
        shows_per_year: showData.showsPerYear || null,
        latest_cpm_usd: showData.latestCPM || null,
        ad_slots: showData.adSlots || null,
        avg_show_length_mins: showData.averageLength || null,
        revenue_2023: showData.revenue2023 || null,
        revenue_2024: showData.revenue2024 || null,
        revenue_2025: showData.revenue2025 || null,
        show_host_contact: showData.primaryContactHost || null,
        show_primary_contact: showData.primaryContactShow || null,
        ageDemographic: showData.ageDemographic || null,
        gender: showData.gender || null,
        region: showData.region || null,
        isActive: showData.isActive || false,
        isUndersized: showData.isUndersized || false,
        primary_education: showData.primary_education || null,
        secondary_education: showData.secondary_education || null,
        evergreen_production_staff_name: showData.evergreenProductionStaffName || null,
        evergreen_production_staff_primary_contact: showData.evergreenProductionStaffPrimaryContact || null,
        side_bonus_percent: showData.sideBonusPercent || 0,
        youtube_ads_percent: showData.youtubeAdsPercent || 0,
        subscriptions_percent: showData.subscriptionsPercent || 0,
        standard_ads_percent: showData.standardAdsPercent || 0,
        sponsorship_ad_fp_lead_percent: showData.sponsorshipAdFpLeadPercent || 0,
        sponsorship_ad_partner_lead_percent: showData.sponsorshipAdPartnerLeadPercent || 0,
        sponsorship_ad_partner_sold_percent: showData.sponsorshipAdPartnerSoldPercent || 0,
        programmatic_ads_span_percent: showData.programmaticAdsSpanPercent || 0,
        merchandise_percent: showData.merchandisePercent || 0,
        branded_revenue_percent: showData.brandedRevenuePercent || 0,
        marketing_services_revenue_percent: showData.marketingServicesRevenuePercent || 0,
        direct_customer_hands_off_percent: showData.directCustomerHandsOffPercent || 0,
        youtube_hands_off_percent: showData.youtubeHandsOffPercent || 0,
        subscription_hands_off_percent: showData.subscriptionHandsOffPercent || 0,
      }

      console.log("API Create Data:", apiCreateData)

      const apiShow = await apiClient.createPodcast(apiCreateData)
      const legacyShow = convertApiShowToLegacy(apiShow)

      // Refresh the shows list
      await fetchShows()

      return legacyShow
    } catch (err) {
      console.error("Failed to create show:", err)
      setError(err instanceof Error ? err.message : "Failed to create show")
      throw err
    }
  }

  const updateShow = async (showId: string, showData: Partial<Show>): Promise<Show | null> => {
    try {
      const apiUpdateData = {
        title: showData.name || "",
        start_date: showData.start_date ? new Date(showData.start_date).toISOString() : null,
        minimum_guarantee: showData.minimumGuarantee || 0,
        subnetwork_id: showData.subnetwork_id || null,
        media_type: showData.format === "Video" ? ("video" as const) : ("audio" as const),
        tentpole: showData.isTentpole || false,
        relationship_level: (showData.relationship?.toLowerCase() as "strong" | "medium" | "weak") || "medium",
        show_type: (showData.showType as "Branded" | "Original" | "Partner") || "Original",
        evergreen_ownership_pct: showData.ownershipPercentage || 0,
        has_sponsorship_revenue: showData.hasSponsorshipRevenue || false,
        has_non_evergreen_revenue: showData.hasNonEvergreenRevenue || false,
        requires_partner_access: showData.requiresPartnerLedgerAccess || false,
        has_branded_revenue: showData.hasBrandedRevenue || false,
        has_marketing_revenue: showData.hasMarketingRevenue || false,
        has_web_mgmt_revenue: showData.hasWebManagementRevenue || false,
        genre_name: showData.genre_name || null,
        is_original: showData.isOriginal || false,
        shows_per_year: showData.showsPerYear || null,
        latest_cpm_usd: showData.latestCPM || null,
        ad_slots: showData.adSlots || null,
        avg_show_length_mins: showData.averageLength || null,
        revenue_2023: showData.revenue2023 || null,
        revenue_2024: showData.revenue2024 || null,
        revenue_2025: showData.revenue2025 || null,
        show_host_contact: showData.primaryContactHost || null,
        show_primary_contact: showData.primaryContactShow || null,
        ageDemographic: showData.ageDemographic || null,
        gender: showData.gender || null,
        region: showData.region || null,
        isActive: showData.isActive || false,
        isUndersized: showData.isUndersized || false,
        primary_education: showData.primary_education || null,
        secondary_education: showData.secondary_education || null,
        evergreen_production_staff_name: showData.evergreenProductionStaffName || null,
        evergreen_production_staff_primary_contact: showData.evergreenProductionStaffPrimaryContact || null,
        side_bonus_percent: showData.sideBonusPercent || 0,
        youtube_ads_percent: showData.youtubeAdsPercent || 0,
        subscriptions_percent: showData.subscriptionsPercent || 0,
        standard_ads_percent: showData.standardAdsPercent || 0,
        sponsorship_ad_fp_lead_percent: showData.sponsorshipAdFpLeadPercent || 0,
        sponsorship_ad_partner_lead_percent: showData.sponsorshipAdPartnerLeadPercent || 0,
        sponsorship_ad_partner_sold_percent: showData.sponsorshipAdPartnerSoldPercent || 0,
        programmatic_ads_span_percent: showData.programmaticAdsSpanPercent || 0,
        merchandise_percent: showData.merchandisePercent || 0,
        branded_revenue_percent: showData.brandedRevenuePercent || 0,
        marketing_services_revenue_percent: showData.marketingServicesRevenuePercent || 0,
        direct_customer_hands_off_percent: showData.directCustomerHandsOffPercent || 0,
        youtube_hands_off_percent: showData.youtubeHandsOffPercent || 0,
        subscription_hands_off_percent: showData.subscriptionHandsOffPercent || 0,

      }

      const apiShow = await apiClient.updatePodcast(showId, apiUpdateData)
      const legacyShow = convertApiShowToLegacy(apiShow)

      // Refresh the shows list
      await fetchShows()

      return legacyShow
    } catch (err) {
      console.error("Failed to update show:", err)
      setError(err instanceof Error ? err.message : "Failed to update show")
      throw err
    }
  }

  const deleteShow = async (showId: string): Promise<boolean> => {
    try {
      await apiClient.deletePodcast(showId)

      // Refresh the shows list
      await fetchShows()

      return true
    } catch (err) {
      console.error("Failed to delete show:", err)
      setError(err instanceof Error ? err.message : "Failed to delete show")
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchShows()
    }
  }, [user])

  return {
    shows,
    loading,
    error,
    fetchShows,
    createShow,
    updateShow,
    deleteShow,
    refetch: () => fetchShows(),
  }
}

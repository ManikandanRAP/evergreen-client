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
        has_branded_revenue: (showData.brandedRevenueAmount || 0) > 0,
        has_marketing_revenue: (showData.marketingRevenueAmount || 0) > 0,
        has_web_mgmt_revenue: (showData.webManagementRevenue || 0) > 0,
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
      }

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
        title: showData.name || null,
        minimum_guarantee: showData.minimumGuarantee || null,
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

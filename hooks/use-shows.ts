"use client"

import { useState, useEffect } from "react"
import { apiClient, ShowUpdate, ShowCreate, type Show, type FilterParams } from "@/lib/api-client"
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

      let apiShows: Show[]

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

      console.log("Fetched shows:", apiShows)
      setShows(apiShows)
    } catch (err) {
      console.error("Failed to fetch shows:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch shows")
    } finally {
      setLoading(false)
    }
  }

  const createShow = async (showData: Partial<ShowCreate>): Promise<Show | null> => {
    try {
      // Pass the showData directly since create-show-dialog already formats it correctly
      console.log("Creating show with data:", showData)

      const apiShow = await apiClient.createPodcast(showData as any)

      // Refresh the shows list
      await fetchShows()

      return apiShow
    } catch (err) {
      console.error("Failed to create show:", err)
      setError(err instanceof Error ? err.message : "Failed to create show")
      throw err
    }
  }

  const updateShow = async (showId: string, showData: Partial<ShowUpdate>): Promise<Show | null> => {
    try {
      // Process the update data
      const apiUpdateData: Partial<ShowUpdate> = (() => {
        // Accept API-shaped payload from the form and send only provided fields.
        const data: Partial<ShowUpdate> = { ...showData };

        // Normalize date to 'YYYY-MM-DD' if an ISO string slipped in.
        if (data.start_date && typeof data.start_date === "string" && data.start_date.includes("T")) {
          data.start_date = data.start_date.slice(0, 10);
        }

        // Drop empty-string fields to avoid overwriting DB values with ''.
        for (const key in data) {
          const v = (data as any)[key];
          if (v === "") {
            delete (data as any)[key];
          }
        }

        return data;
      })()

      const apiShow = await apiClient.updatePodcast(showId, apiUpdateData as ShowUpdate)

      // Refresh the shows list
      await fetchShows()

      return apiShow
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
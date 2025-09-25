import { toast } from "sonner"

export async function authHeaders() {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

interface LoginCredentials {
  username: string
  password: string
}

interface Token {
  access_token: string
  token_type: string
}

interface User {
  id: string
  name: string | null
  email: string | null
  password_hash: string | null
  role: "admin" | "partner" | "internal" | null
  created_at: string | null
}

interface Show {
  id: string;
  title: string;
  minimum_guarantee: boolean;
  annual_usd: Record<string, any>;
  subnetwork_id: string;
  media_type: "video" | "audio" | "both";
  rate_card: boolean;
  relationship_level: "strong" | "medium" | "weak";
  show_type: "Branded" | "Original" | "Partner";
  ranking_category: "1" | "2" | "3" | "4" | "5" | null;
  evergreen_ownership_pct: number;
  has_sponsorship_revenue: boolean;
  has_non_evergreen_revenue: boolean;
  requires_partner_access: boolean;
  has_branded_revenue: boolean;
  has_marketing_revenue: boolean;
  has_web_mgmt_revenue: boolean;
  genre_name: string;
  is_original: boolean;
  cadence: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc";
  latest_cpm_usd: number;
  ad_slots: number;
  avg_show_length_mins: number;
  start_date: string;
  side_bonus_percent: number;
  youtube_ads_percent: number;
  subscriptions_percent: number;
  standard_ads_percent: number;
  sponsorship_ad_fp_lead_percent: number;
  sponsorship_ad_partner_lead_percent: number;
  sponsorship_ad_partner_sold_percent: number;
  programmatic_ads_span_percent: number;
  merchandise_percent: number;
  branded_revenue_percent: number;
  marketing_services_revenue_percent: number;
  direct_customer_hands_off_percent: number;
  youtube_hands_off_percent: number;
  subscription_hands_off_percent: number;
  revenue_2023: number;
  revenue_2024: number;
  revenue_2025: number;
  show_host_contact: string;
  show_primary_contact: string;
  age_demographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  region: string;
  is_undersized: boolean;  // camelCase to match your database
  gender: string;
  is_active: boolean;      // camelCase to match your database
  primary_education: string;
  secondary_education: string;
  evergreen_production_staff_name: string;
  qbo_show_name: string;
  qbo_show_id: string;
  // Archive fields
  is_archived?: boolean;
  archived_at?: string;
  archived_by?: string;
}

interface ShowCreate {
  title: string;
  minimum_guarantee?: boolean;
  annual_usd?: Record<string, any>;
  subnetwork_id?: string;
  media_type?: "video" | "audio" | "both";
  rate_card?: boolean;
  relationship_level?: "strong" | "medium" | "weak";
  show_type?: "Branded" | "Original" | "Partner";
  ranking_category?: "1" | "2" | "3" | "4" | "5" | null;
  evergreen_ownership_pct?: number;
  has_sponsorship_revenue?: boolean;
  has_non_evergreen_revenue?: boolean;
  requires_partner_access?: boolean;
  has_branded_revenue?: boolean;
  has_marketing_revenue?: boolean;
  has_web_mgmt_revenue?: boolean;
  genre_name?: string;
  is_original?: boolean;
  cadence?: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc";
  latest_cpm_usd?: number;
  ad_slots?: number;
  avg_show_length_mins?: number;
  start_date?: string;
  side_bonus_percent?: number;
  youtube_ads_percent?: number;
  subscriptions_percent?: number;
  standard_ads_percent?: number;
  sponsorship_ad_fp_lead_percent?: number;
  sponsorship_ad_partner_lead_percent?: number;
  sponsorship_ad_partner_sold_percent?: number;
  programmatic_ads_span_percent?: number;
  merchandise_percent?: number;
  branded_revenue_percent?: number;
  marketing_services_revenue_percent?: number;
  direct_customer_hands_off_percent?: number;
  youtube_hands_off_percent?: number;
  subscription_hands_off_percent?: number;
  revenue_2023?: number;
  revenue_2024?: number;
  revenue_2025?: number;
  evergreen_production_staff_name?: string;
  show_host_contact?: string;
  show_primary_contact?: string;
  age_demographic?: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  is_undersized?: boolean;  // camelCase to match your database
  is_active?: boolean;      // camelCase to match your database
  primary_education?: string;
  secondary_education?: string;
  region?: string;
  gender?: string;
  qbo_show_id?: number
  qbo_show_name?: string
}

interface ShowUpdate {
  title: string;
  minimum_guarantee?: boolean;
  annual_usd?: Record<string, any>;
  subnetwork_id?: string;
  media_type?: "video" | "audio" | "both";
  rate_card?: boolean;
  relationship_level?: "strong" | "medium" | "weak";
  show_type?: "Branded" | "Original" | "Partner";
  evergreen_ownership_pct?: number;
  has_sponsorship_revenue?: boolean;
  has_non_evergreen_revenue?: boolean;
  requires_partner_access?: boolean;
  has_branded_revenue?: boolean;
  has_marketing_revenue?: boolean;
  has_web_mgmt_revenue?: boolean;
  genre_name?: string;
  is_original?: boolean;
  cadence?: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Ad hoc";
  latest_cpm_usd?: number;
  ad_slots?: number;
  avg_show_length_mins?: number;
  start_date?: string;
  side_bonus_percent?: number;
  youtube_ads_percent?: number;
  subscriptions_percent?: number;
  standard_ads_percent?: number;
  sponsorship_ad_fp_lead_percent?: number;
  sponsorship_ad_partner_lead_percent?: number;
  sponsorship_ad_partner_sold_percent?: number;
  programmatic_ads_span_percent?: number;
  merchandise_percent?: number;
  branded_revenue_percent?: number;
  marketing_services_revenue_percent?: number;
  direct_customer_hands_off_percent?: number;
  youtube_hands_off_percent?: number;
  subscription_hands_off_percent?: number;
  revenue_2023?: number;
  revenue_2024?: number;
  revenue_2025?: number;
  evergreen_production_staff_name?: string;
  show_host_contact?: string;
  show_primary_contact?: string;
  age_demographic?: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  is_undersized?: boolean;  // camelCase to match your database
  is_active?: boolean;      // camelCase to match your database
  primary_education?: string;
  secondary_education?: string;
  gender?: string;
  region?: string;
  qbo_show_id?: number
  qbo_show_name?: string
}

interface PartnerCreate {
  name: string
  email: string
  password: string
}

interface PasswordUpdate {
  password: string
}

interface FilterParams {
  title?: string | null
  media_type?: "video" | "audio" | "both" | null
  rate_card?: boolean | null
  relationship_level?: "strong" | "medium" | "weak" | null
  show_type?: "Branded" | "Original" | "Partner" | null
  has_sponsorship_revenue?: boolean | null
  has_non_evergreen_revenue?: boolean | null
  requires_partner_access?: boolean | null
  has_branded_revenue?: boolean | null
  has_marketing_revenue?: boolean | null
  has_web_mgmt_revenue?: boolean | null
  is_original?: boolean | null
}

// --- NEW INTERFACE FOR BULK RESPONSE ---
interface BulkImportResponse {
  message: string;
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

// --- NEW INTERFACES FOR DUPLICATE HANDLING ---
interface DuplicateCheckResult {
  title: string;
  exists: boolean;
  existing_show: Show | null;
}

interface DuplicateCheckResponse {
  duplicates: DuplicateCheckResult[];
  total_checked: number;
  duplicates_found: number;
  message: string;
}

interface DuplicateAction {
  title: string;
  action: "create" | "update" | "skip";
}

interface BulkImportWithActionsResponse {
  message: string;
  total: number;
  successful: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  // DEFAULT to same-origin '/api' if env is not set
  constructor(baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api") as string) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = new Headers(options.headers)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`)
    }
    const response = await fetch(url, { ...options, headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API Error: ${response.status} - ${response.statusText}`, errorData)
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.")
      } else if (response.status === 404) {
        throw new Error("Endpoint not found. Please check if the backend server is running with the latest code.")
      }
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }
    if (response.status === 204) {
      return {} as T
    }
    return response.json()
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
  }

  async login(credentials: LoginCredentials): Promise<Token> {
    const formData = new URLSearchParams()
    formData.append("username", credentials.username)
    formData.append("password", credentials.password)
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Login failed")
    }
    const token = await response.json()
    this.setToken(token.access_token)
    localStorage.setItem("access_token", token.access_token)
    return token
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/users/me")
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request<void>(`/users/${userId}`, { method: "DELETE" })
  }

  async getAllPodcasts(): Promise<Show[]> {
    return this.request<Show[]>("/podcasts")
  }

  async filterPodcasts(params: FilterParams): Promise<Show[]> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/podcasts/filter?${queryString}` : "/podcasts/filter"
    return this.request<Show[]>(endpoint)
  }

  async getPodcast(showId: string): Promise<Show> {
    return this.request<Show>(`/podcasts/${showId}`)
  }

  async createPodcast(data: ShowCreate): Promise<Show> {
    try {
      console.log("API Client sending data to backend:", JSON.stringify(data, null, 2))
      const newShow = await this.request<Show>("/podcasts", {
        method: "POST",
        body: JSON.stringify(data),
      })
      toast.success("Show created successfully!")
      return newShow
    } catch (error: any) {
      console.error("API Client error:", error)
      toast.error(error.message || "Failed to create show.")
      throw error
    }
  }

  // --- UPDATED BULK CREATE METHOD ---
  async bulkCreatePodcasts(data: ShowCreate[]): Promise<BulkImportResponse> {
    try {
      console.log("Bulk import sending data to backend:", JSON.stringify(data, null, 2))
      const response = await this.request<BulkImportResponse>("/podcasts/bulk-import", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Custom toast message based on the outcome
      if (response.failed > 0 && response.successful === 0) {
        toast.error(response.message || "All show imports failed.");
      } else if (response.failed > 0) {
        toast.warning(response.message || "Bulk import completed with some errors.");
      } else {
        toast.success(response.message || "Bulk import completed successfully!");
      }
      
      return response;
    } catch (error: any) {
      console.error("Bulk import error:", error)
      // This will now only catch true network/server errors
      toast.error(error.message || "An unexpected error occurred during the import process.");
      throw error;
    }
  }
  // --- END UPDATED METHOD ---

  // --- NEW DUPLICATE CHECKING METHODS ---
  async checkDuplicates(data: ShowCreate[]): Promise<DuplicateCheckResponse> {
    try {
      console.log("Checking for duplicates:", JSON.stringify(data, null, 2))
      const response = await this.request<DuplicateCheckResponse>("/podcasts/check-duplicates", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error: any) {
      console.error("Duplicate check error:", error)
      throw error
    }
  }

  async checkSingleDuplicate(data: ShowCreate): Promise<{ exists: boolean; existing_show: any }> {
    try {
      console.log("Checking single duplicate:", JSON.stringify(data, null, 2))
      const response = await this.request<{ exists: boolean; existing_show: any }>("/podcasts/check-duplicate", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error: any) {
      console.error("Single duplicate check error:", error)
      throw error
    }
  }

  async bulkCreatePodcastsWithActions(
    data: ShowCreate[], 
    actions: DuplicateAction[]
  ): Promise<BulkImportWithActionsResponse> {
    try {
      console.log("Bulk import with actions:", JSON.stringify({ data, actions }, null, 2))
      const response = await this.request<BulkImportWithActionsResponse>("/podcasts/bulk-import-with-actions", {
        method: "POST",
        body: JSON.stringify({ shows_data: data, actions }),
      })

      // Custom toast message based on the outcome
      if (response.failed > 0 && response.successful === 0 && response.updated === 0) {
        toast.error(response.message || "All show imports failed.")
      } else if (response.failed > 0) {
        toast.warning(response.message || "Bulk import completed with some errors.")
      } else {
        toast.success(response.message || "Bulk import completed successfully!")
      }
      
      return response
    } catch (error: any) {
      console.error("Bulk import with actions error:", error)
      toast.error(error.message || "An unexpected error occurred during the import process.")
      throw error
    }
  }

  async updatePodcast(showId: string, data: ShowUpdate): Promise<Show> {
    try {
      const updatedShow = await this.request<Show>(`/podcasts/${showId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      toast.success("Show updated successfully!")
      return updatedShow
    } catch (error: any) {
      toast.error(error.message || "Failed to update show.")
      throw error
    }
  }

  async deletePodcast(showId: string): Promise<void> {
    try {
      await this.request<void>(`/podcasts/${showId}`, { method: "DELETE" })
      toast.success("Show deleted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete show.")
      throw error
    }
  }

  async bulkDeletePodcasts(showIds: string[]): Promise<{ successful: number; failed: number; errors: string[]; message: string }> {
    try {
      const response = await this.request<{ successful: number; failed: number; errors: string[]; message: string }>("/podcasts/bulk-delete", {
        method: "DELETE",
        body: JSON.stringify({ show_ids: showIds }),
      })
      return response
    } catch (error: any) {
      console.error("Bulk delete podcasts error:", error)
      throw error
    }
  }

  async createPartner(data: PartnerCreate): Promise<User> {
    return this.request<User>("/partners", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePartnerPassword(userId: string, data: PasswordUpdate): Promise<void> {
    return this.request<void>(`/partners/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getMyPodcasts(): Promise<Show[]> {
    return this.request<Show[]>("/partners/me/podcasts")
  }

  async getPodcastsForPartner(partnerId: string): Promise<Show[]> {
    return this.request<Show[]>(`/partners/${partnerId}/podcasts`)
  }

  async associatePartnerWithShow(showId: string, partnerId: string): Promise<void> {
    return this.request<void>(`/podcasts/${showId}/partners/${partnerId}`, {
      method: "POST",
    })
  }

  async unassociatePartnerFromShow(showId: string, partnerId: string): Promise<void> {
    return this.request<void>(`/podcasts/${showId}/partners/${partnerId}`, {
      method: "DELETE",
    })
  }

  // Archive methods
  async archiveShow(showId: string): Promise<Show> {
    try {
      const response = await this.request<Show>(`/podcasts/${showId}/archive`, {
        method: "PATCH",
      })
      toast.success("Show archived successfully!")
      return response
    } catch (error: any) {
      toast.error(error.message || "Failed to archive show.")
      throw error
    }
  }

  async unarchiveShow(showId: string): Promise<Show> {
    try {
      const response = await this.request<Show>(`/podcasts/${showId}/unarchive`, {
        method: "PATCH",
      })
      toast.success("Show unarchived successfully!")
      return response
    } catch (error: any) {
      toast.error(error.message || "Failed to unarchive show.")
      throw error
    }
  }

  async getArchivedShows(): Promise<Show[]> {
    try {
      return await this.request<Show[]>("/podcasts/archived")
    } catch (error: any) {
      // If the error is "not found" or similar, return empty array instead of throwing
      if (error.message?.includes("not found") || error.message?.includes("404")) {
        return []
      }
      throw error
    }
  }

  async bulkArchiveShows(showIds: string[]): Promise<{ successful: number; failed: number; message: string }> {
    try {
      const response = await this.request<{ successful: number; failed: number; message: string }>("/podcasts/bulk-archive", {
        method: "PATCH",
        body: JSON.stringify({ show_ids: showIds }),
      })
      toast.success(`Successfully archived ${response.successful} shows!`)
      return response
    } catch (error: any) {
      toast.error(error.message || "Failed to archive shows.")
      throw error
    }
  }

  async bulkUnarchiveShows(showIds: string[]): Promise<{ successful: number; failed: number; message: string }> {
    try {
      const response = await this.request<{ successful: number; failed: number; message: string }>("/podcasts/bulk-unarchive", {
        method: "PATCH",
        body: JSON.stringify({ show_ids: showIds }),
      })
      toast.success(`Successfully unarchived ${response.successful} shows!`)
      return response
    } catch (error: any) {
      toast.error(error.message || "Failed to unarchive shows.")
      throw error
    }
  }
}

export interface AllclassItem {
  id: number
  name: string
}

// Use same-origin '/api' if env missing
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export async function fetchAllclass(): Promise<AllclassItem[]> {
  const res = await fetch(`${API_URL}/qbo/allclass`, {
    method: 'GET',
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to load QBO shows')
  return res.json()
}


export const apiClient = new ApiClient()

export type { 
  User, 
  Show, 
  ShowCreate, 
  ShowUpdate, 
  PartnerCreate, 
  PasswordUpdate, 
  FilterParams, 
  Token, 
  LoginCredentials,
  DuplicateCheckResult,
  DuplicateCheckResponse,
  DuplicateAction,
  BulkImportWithActionsResponse
}
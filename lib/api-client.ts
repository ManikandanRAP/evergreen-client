import { toast } from "sonner"

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
  role: "admin" | "partner" | null
  created_at: string | null
}

interface Show {
  id: string;
  title: string | null;
  minimum_guarantee: number | null;
  annual_usd: Record<string, any> | null;
  subnetwork_id: string | null;
  media_type: "video" | "audio" | "both" | null;
  tentpole: boolean;
  relationship_level: "strong" | "medium" | "weak" | null;
  show_type: "Branded" | "Original" | "Partner" | null;
  evergreen_ownership_pct: number | null;
  has_sponsorship_revenue: boolean | null;
  has_non_evergreen_revenue: boolean | null;
  requires_partner_access: boolean | null;
  has_branded_revenue: boolean | null;
  has_marketing_revenue: boolean | null;
  has_web_mgmt_revenue: boolean | null;
  genre_name: string | null;
  is_original: boolean | null;
  shows_per_year: number | null;
  latest_cpm_usd: number | null;
  ad_slots: number | null;
  avg_show_length_mins: number | null;
  start_date: string | null;
  show_name_in_qbo: string | null;
  side_bonus_percent: number | null;
  youtube_ads_percent: number | null;
  subscriptions_percent: number | null;
  standard_ads_percent: number | null;
  sponsorship_ad_fp_lead_percent: number | null;
  sponsorship_ad_partner_lead_percent: number | null;
  sponsorship_ad_partner_sold_percent: number | null;
  programmatic_ads_span_percent: number | null;
  merchandise_percent: number | null;
  branded_revenue_percent: number | null;
  marketing_services_revenue_percent: number | null;
  direct_customer_hands_off_percent: number | null;
  youtube_hands_off_percent: number | null;
  subscription_hands_off_percent: number | null;
  revenue_2023: number | null;
  revenue_2024: number | null;
  revenue_2025: number | null;
  show_host_contact: string | null;
  show_primary_contact: string | null;
  ageDemographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "" | null;
  region: string | null;
  isUndersized: boolean | null;
  gender: string | null;
  isActive: boolean | null;
  primary_education: string | null;
  secondary_education: string | null;
  evergreen_production_staff_name: string | null;
  evergreen_production_staff_primary_contact: string | null;
}

interface ShowCreate {
  title: string;
  minimum_guarantee?: number | null;
  annual_usd?: Record<string, any> | null;
  subnetwork_id?: string | null;
  media_type?: "video" | "audio" | "both" | null;
  tentpole?: boolean;
  relationship_level?: "strong" | "medium" | "weak" | null;
  show_type?: "Branded" | "Original" | "Partner" | null;
  evergreen_ownership_pct?: number | null;
  has_sponsorship_revenue?: boolean | null;
  has_non_evergreen_revenue?: boolean | null;
  requires_partner_access?: boolean | null;
  has_branded_revenue?: boolean | null;
  has_marketing_revenue?: boolean | null;
  has_web_mgmt_revenue?: boolean | null;
  genre_name?: string | null;
  is_original?: boolean;
  shows_per_year?: number | null;
  latest_cpm_usd?: number | null;
  ad_slots?: number | null;
  avg_show_length_mins?: number | null;
  start_date?: string | null;
  show_name_in_qbo?: string | null;
  side_bonus_percent?: number | null;
  youtube_ads_percent?: number | null;
  subscriptions_percent?: number | null;
  standard_ads_percent?: number | null;
  sponsorship_ad_fp_lead_percent?: number | null;
  sponsorship_ad_partner_lead_percent?: number | null;
  sponsorship_ad_partner_sold_percent?: number | null;
  programmatic_ads_span_percent?: number | null;
  merchandise_percent?: number | null;
  branded_revenue_percent?: number | null;
  marketing_services_revenue_percent?: number | null;
  direct_customer_hands_off_percent?: number | null;
  youtube_hands_off_percent?: number | null;
  subscription_hands_off_percent?: number | null;
  revenue_2023?: number | null;
  revenue_2024?: number | null;
  revenue_2025?: number | null;
  evergreen_production_staff_name?: string | null;
  show_host_contact?: string | null;
  show_primary_contact?: string | null;
  ageDemographic?: string | null;
  isUndersized: boolean | null;
  isActive: boolean | null;
  primary_education?: string | null;
  secondary_education?: string | null;
  evergreen_production_staff_primary_contact?: string | null;
  region?: string | null;
  gender?: string | null;
}

interface ShowUpdate {
  title: string;
  minimum_guarantee?: number | null;
  annual_usd?: Record<string, any> | null;
  subnetwork_id?: string | null;
  media_type?: "video" | "audio" | "both" | null;
  tentpole?: boolean;
  relationship_level?: "strong" | "medium" | "weak" | null;
  show_type?: "Branded" | "Original" | "Partner" | null;
  evergreen_ownership_pct?: number | null;
  has_sponsorship_revenue?: boolean | null;
  has_non_evergreen_revenue?: boolean | null;
  requires_partner_access?: boolean | null;
  has_branded_revenue?: boolean | null;
  has_marketing_revenue?: boolean | null;
  has_web_mgmt_revenue?: boolean | null;
  genre_name?: string | null;
  is_original?: boolean;
  shows_per_year?: number | null;
  latest_cpm_usd?: number | null;
  ad_slots?: number | null;
  avg_show_length_mins?: number | null;
  start_date?: string | null;
  show_name_in_qbo?: string | null;
  side_bonus_percent?: number | null;
  youtube_ads_percent?: number | null;
  subscriptions_percent?: number | null;
  standard_ads_percent?: number | null;
  sponsorship_ad_fp_lead_percent?: number | null;
  sponsorship_ad_partner_lead_percent?: number | null;
  sponsorship_ad_partner_sold_percent?: number | null;
  programmatic_ads_span_percent?: number | null;
  merchandise_percent?: number | null;
  branded_revenue_percent?: number | null;
  marketing_services_revenue_percent?: number | null;
  direct_customer_hands_off_percent?: number | null;
  youtube_hands_off_percent?: number | null;
  subscription_hands_off_percent?: number | null;
  revenue_2023?: number | null;
  revenue_2024?: number | null;
  revenue_2025?: number | null;
  evergreen_production_staff_name?: string | null;
  show_host_contact?: string | null;
  show_primary_contact?: string | null;
  ageDemographic?: string | null;
  isUndersized: boolean | null;
  isActive: boolean | null;
  primary_education?: string | null;
  secondary_education?: string | null;
  gender?: string | null;
  region?: string | null;
  evergreen_production_staff_primary_contact?: string | null;
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
  tentpole?: boolean | null
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

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL as string) {
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
      const newShow = await this.request<Show>("/podcasts", {
        method: "POST",
        body: JSON.stringify(data),
      })
      toast.success("Show created successfully!")
      return newShow
    } catch (error: any) {
      toast.error(error.message || "Failed to create show.")
      throw error
    }
  }

  // --- NEW BULK CREATE METHOD ---
  async bulkCreatePodcasts(data: ShowCreate[]): Promise<BulkImportResponse> {
    try {
      const response = await this.request<BulkImportResponse>("/podcasts/bulk-import", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success(response.message || "Bulk import completed!");
      return response;
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const errorMessage = typeof detail === 'string' ? detail : "Failed to import shows.";
      toast.error(errorMessage);
      if (detail?.errors) {
        console.error("Import errors:", detail.errors);
      }
      throw error;
    }
  }
  // --- END NEW METHOD ---

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
}

export const apiClient = new ApiClient()

export type { User, Show, ShowCreate, ShowUpdate, PartnerCreate, PasswordUpdate, FilterParams, Token, LoginCredentials }

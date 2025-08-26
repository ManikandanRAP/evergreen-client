"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useShows } from "@/hooks/use-shows"
import LoginForm from "@/components/login-form"
import DashboardNav from "@/components/dashboard-nav"
import ShowsManagement from "@/components/shows-management"
import AdministratorPage from "@/components/administrator-page"
import RevenueLedger from "@/components/revenue-ledger"
import AddFeatureSuggestion from "@/components/add-feature-suggestion"
import Feedbacks from "@/components/feedbacks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, DollarSign, TrendingUp, Users, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function DashboardOverview() {
  const { user, token } = useAuth()
  const { shows, loading } = useShows()

  type LedgerItem = {
    payment_amount: number | null
    evergreen_compensation: number | null
    invoice_date: string | null
    invoice_classref_name: string | null
  }

  type PartnerPayout = {
    linked_paymentid: string | null
    paid_amount: number | null
  }

  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!token) {
        setLedger([])
        setPayouts([])
        return
      }
      setFetching(true)
      setError(null)
      try {
        const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        const base = API_URL?.replace(/\/$/, "") || ""
        const [ledgerRes, payoutRes] = await Promise.all([
          fetch(`${base}/ledger`, { headers }),
          fetch(`${base}/partner_payouts`, { headers }),
        ])
        if (!ledgerRes.ok) throw new Error(await readErr(ledgerRes, "Ledger request failed"))
        if (!payoutRes.ok) throw new Error(await readErr(payoutRes, "Partner payouts request failed"))
        const ledgerJson: LedgerItem[] = await ledgerRes.json()
        const payoutsJson: PartnerPayout[] = await payoutRes.json()
        if (!isMounted) return
        setLedger(Array.isArray(ledgerJson) ? ledgerJson : [])
        setPayouts(Array.isArray(payoutsJson) ? payoutsJson : [])
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || "Failed to load dashboard summary")
      } finally {
        if (isMounted) setFetching(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [token])

  const summary = useMemo(() => {
    const totalNetRevenue = ledger.reduce((s, i) => s + num(i.payment_amount), 0)
    const totalEvergreenShare = ledger.reduce((s, i) => s + num(i.evergreen_compensation), 0)
    const seen = new Set<string>()
    const totalPaymentsMade = payouts.reduce((s, i) => {
      if (i.linked_paymentid && !seen.has(i.linked_paymentid)) {
        seen.add(i.linked_paymentid)
        return s + num(i.paid_amount)
      }
      return s
    }, 0)
    return { totalNetRevenue, totalEvergreenShare, totalPaymentsMade }
  }, [ledger, payouts])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(amount))

  const getRelationshipBadgeClass = (relationship: string) => {
    switch (relationship) {
      case "Strong":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
      case "Weak":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700"
    }
  }

  if (loading || fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "admin"
            ? "Manage your podcast network and track performance"
            : "View your shows and revenue performance"}
        </p>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <Radio className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{shows.length}</div>
            <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Network shows" : "Network shows"}</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatCurrency(summary.totalNetRevenue)}</div>
            <p className="text-xs text-muted-foreground">Across all shows</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evergreen Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalEvergreenShare)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalNetRevenue > 0 ? ((summary.totalEvergreenShare / summary.totalNetRevenue) * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaymentsMade)}</div>
            <p className="text-xs text-muted-foreground">Sum of unique partner payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shows — LIST VIEW with comfy container */}
      <Card className="evergreen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600" />
            {user?.role === "admin" ? "Recent Shows" : "Recent Shows"}
          </CardTitle>
          <CardDescription>
            {user?.role === "admin" ? "Latest shows added to the network" : "Latest shows added to the network"}
          </CardDescription>
        </CardHeader>

        {/* CHANGED: added inner padding container so the table isn't edge-to-edge */}
        <CardContent className="p-0">
          <div className="px-4 pb-4 lg:px-6">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr className="text-left text-sm">
                    <th className="p-3 px-6 font-semibold">Show Name</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Genre</th>
                    <th className="p-3 font-semibold">Format</th>
                    <th className="p-3 font-semibold">Relationship</th>
                    <th className="p-3 font-semibold">Min Guarantee</th>
                    <th className="p-3 font-semibold">Age</th>
                    <th className="p-3 font-semibold">Shows/Year</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.slice(0, 5).map((show) => (
                    <tr key={show.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3 px-6 font-medium">{(show as any).name ?? (show as any).title ?? "—"}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            className={`text-xs border pointer-events-none ${
                              (show as any).isTentpole
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                                : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                            }`}
                          >
                            Tentpole - {(show as any).isTentpole ? "Yes" : "No"}
                          </Badge>
                          <Badge
                            className={`text-xs border pointer-events-none ${
                              (show as any).is_undersized
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                                : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                            }`}
                          >
                            Undersized - {(show as any).is_undersized ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{(show as any).show_type ?? "—"}</td>
                      <td className="p-3">{(show as any).genre_name ?? "—"}</td>
                      <td className="p-3">{(show as any).format ?? "—"}</td>
                      <td className="p-3">
                        <Badge className={`text-xs border pointer-events-none ${getRelationshipBadgeClass((show as any).relationship)}`}>
                          {(show as any).relationship ?? "—"}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-emerald-600">
                        {formatCurrency(Number((show as any).minimumGuarantee || 0))}
                      </td>
                      <td className="p-3">{(show as any).ageMonths ?? "—"}m</td>
                      <td className="p-3">{(show as any).showsPerYear ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const isPartner = user?.role === "partner"
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setActiveTab(isPartner ? "ledger" : "dashboard")
    }
  }, [isLoading, isPartner])

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (activeTab === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "shows":
        return <ShowsManagement />
      case "users":
        return <AdministratorPage />
      case "ledger":
        return <RevenueLedger />
      case "administrator":
        return user.role === "admin" ? <AdministratorPage /> : <DashboardOverview />
      case "add-feature":
        return user.role === "internal" ? <AddFeatureSuggestion /> : <DashboardOverview />
      case "feedbacks":
        return user.role === "admin" ? <Feedbacks /> : <DashboardOverview />
      case "settings":
        return <AdministratorPage />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-cyan-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav
        activeTab={activeTab ?? (user?.role === "partner" ? "ledger" : "dashboard")}
        onTabChange={setActiveTab}
        onSidebarToggle={setIsSidebarCollapsed}
      />
      <div className={cn("transition-all duration-300 ease-in-out", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <main className="p-4 lg:p-8">
          {isPartner ? <RevenueLedger /> : <div>{renderContent()}</div>}
        </main>
      </div>
    </div>
  )
}

function num(v: any): number {
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function readErr(res: Response, prefix = "Request failed") {
  try {
    const text = await res.text()
    return `${prefix}: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
  } catch {
    return `${prefix}: ${res.status} ${res.statusText}`
  }
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useShows } from "@/hooks/use-shows"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, DollarSign, TrendingUp, Users, CreditCard, Loader2, Zap, Plus, Upload, History, Settings } from "lucide-react"
import { getRankingInfo } from "@/lib/ranking-utils"
import CreateShowDialog from "@/components/create-show-dialog"
import ImportCSVDialog from "@/components/import-csv-dialog"
import { apiClient, Show } from "@/lib/api-client"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function HomePage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { shows, loading } = useShows()

  type LedgerItem = {
    show_name: string
    customer: string
    invoice_date: string | null
    invoice_description: string
    invoice_amount: number | null
    evergreen_percentage: number | null
    partner_percentage: number | null
    evergreen_compensation: number | null
    partner_compensation: number | null
    effective_payment_received: number | null
    outstanding_balance: number | null
    partner_comp_waiting: number | null
  }

  type PartnerPayout = {
    bill_number: string | null
    bill_date: string
    partner_name: string
    bill_amount: number | null
    payment_id: string | null
    date_of_payment: string | null
    effective_billed_amount_paid: number | null
    billed_amount_outstanding: number | null
    show_name: string
  }

  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
  const [isCreateShowDialogOpen, setIsCreateShowDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)

  useEffect(() => {
    if (user?.role === "partner") {
      router.push("/revenue-ledger")
    } else if (user?.role === "internal_show_access") {
      router.push("/shows-management")
    }
  }, [user, router])

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
    const totalNetRevenue = ledger.reduce((s, i) => s + num(i.effective_payment_received), 0)
    const totalEvergreenShare = ledger.reduce((s, i) => s + num(i.evergreen_compensation), 0)
    const seen = new Set<string>()
    const totalPaymentsMade = payouts.reduce((s, i) => {
      if (i.payment_id && !seen.has(i.payment_id)) {
        seen.add(i.payment_id)
        return s + num(i.effective_billed_amount_paid)
      }
      return s
    }, 0)
    return { totalNetRevenue, totalEvergreenShare, totalPaymentsMade }
  }, [ledger, payouts])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(amount))

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-show':
        setIsCreateShowDialogOpen(true)
        break
      case 'import-shows':
        setIsImportDialogOpen(true)
        break
      case 'split-history':
        router.push('/split-history')
        break
      case 'user-management':
        router.push('/user-management')
        break
      case 'record-revenue':
        router.push('/revenue-ledger')
        break
      case 'contact-partner':
        // Could open a modal or redirect to partner management
        console.log('Contact partner functionality')
        break
      case 'export-data':
        // Export functionality could be added here
        console.log('Export data functionality')
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  // Show creation handler
  const createShow = async (showData: any) => {
    try {
      const newShow = await apiClient.createPodcast(showData)
      if (newShow) {
        setIsCreateShowDialogOpen(false)
        // Redirect to shows management page
        router.push('/shows-management')
      }
    } catch (error) {
      console.error('Error creating show:', error)
    }
    return null
  }

  // Show update handler
  const updateShow = async (showId: string, showData: any) => {
    try {
      const updatedShow = await apiClient.updatePodcast(showId, showData)
      if (updatedShow) {
        setIsCreateShowDialogOpen(false)
        // Redirect to shows management page
        router.push('/shows-management')
      }
    } catch (error) {
      console.error('Error updating show:', error)
    }
    return null
  }

  // Handle show updated callback
  const handleShowUpdated = () => {
    // Redirect to shows management page
    router.push('/shows-management')
  }

  // Handle editing existing show
  const handleEditExistingShow = (show: Show) => {
    setEditingShow(show)
    setIsCreateShowDialogOpen(true)
  }

  // Import completion handler
  const handleImportComplete = (result: { success: boolean, message: string, errors?: string[] }) => {
    if (result.success) {
      setIsImportDialogOpen(false)
      // Redirect to shows management page
      router.push('/shows-management')
    } else {
      // Show detailed error toast message
      const errorMessage = result.errors && result.errors.length > 0 
        ? `${result.message}\n\nDetails:\n${result.errors.join('\n')}`
        : result.message
      toast.error(errorMessage)
    }
  }

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
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
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
        <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-sm text-muted-foreground md:text-base md:text-muted-foreground">
          {user?.role === "admin"
            ? "Manage your podcast network and track performance"
            : "View your shows and revenue performance"}
        </p>
      </div>

      {/* Mobile Stats - Hidden on Desktop */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card className="evergreen-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 py-2">
            <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Total Shows</CardTitle>
            <Radio className="h-3 w-3 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <div className="text-base font-bold text-emerald-600">{shows.length}</div>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 py-2">
            <CardTitle className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Total Net Revenue</CardTitle>
            <DollarSign className="h-3 w-3 text-cyan-600" />
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <div className="text-base font-bold text-cyan-600">{formatCurrency(summary.totalNetRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 py-2">
            <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300">Total Evergreen Share</CardTitle>
            <TrendingUp className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <div className="text-base font-bold text-green-600">{formatCurrency(summary.totalEvergreenShare)}</div>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 py-2">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Payments Made</CardTitle>
            <CreditCard className="h-3 w-3 text-blue-600" />
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <div className="text-base font-bold text-blue-600">{formatCurrency(summary.totalPaymentsMade)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Stats - Hidden on Mobile */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="evergreen-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Shows</CardTitle>
            <Radio className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{shows.length}</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{user?.role === "admin" ? "Network shows" : "Network shows"}</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Total Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatCurrency(summary.totalNetRevenue)}</div>
            <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70">Across all shows</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Evergreen Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEvergreenShare)}</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              {summary.totalNetRevenue > 0 ? ((summary.totalEvergreenShare / summary.totalNetRevenue) * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalPaymentsMade)}</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Sum of unique partner payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shows — LIST VIEW with comfy container */}
      <Card className="evergreen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Radio className="h-5 w-5 text-emerald-600" />
            {user?.role === "admin" ? "Recent Shows" : "Recent Shows"}
          </CardTitle>
          <CardDescription className="text-muted-foreground md:text-muted-foreground">
            {user?.role === "admin" ? "Latest shows added to the network" : "Latest shows added to the network"}
          </CardDescription>
        </CardHeader>

        {/* CHANGED: added inner padding container so the table isn't edge-to-edge */}
        <CardContent className="p-0">
          <div className="px-4 pb-4 lg:px-6">
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr className="text-left text-sm">
                    <th className="p-3 px-6 font-semibold border-r border-border">Show Name</th>
                    <th className="p-3 font-semibold border-r border-border hidden md:table-cell">Type</th>
                    <th className="p-3 font-semibold border-r border-border hidden md:table-cell">Ranking</th>
                    <th className="p-3 font-semibold border-r border-border hidden md:table-cell">Rate Card</th>
                    <th className="p-3 font-semibold border-r border-border">
                      <span className="md:hidden">Std</span>
                      <span className="hidden md:inline">Standard</span>
                    </th>
                    <th className="p-3 font-semibold md:border-r border-border">
                      <span className="md:hidden">Prog</span>
                      <span className="hidden md:inline">Programmatic</span>
                    </th>
                    <th className="p-3 font-semibold hidden md:table-cell">Cadence</th>
                  </tr>
                </thead>
                <tbody>
                  {shows
                    .sort((a, b) => {
                      // Sort by created_at in descending order (most recent first)
                      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                      return dateB - dateA
                    })
                    .slice(0, 5)
                    .map((show, index, array) => (
                    <tr key={show.id} className={`${index < array.length - 1 ? 'border-b border-border' : ''} hover:bg-accent/50 transition-colors`}>
                      <td className="p-3 px-6 font-medium border-r border-border">{show.title ?? "N/A"}</td>
                      <td className="p-3 capitalize border-r border-border hidden md:table-cell">{(show as any).show_type ?? "N/A"}</td>
                      <td className="p-3 border-r border-border hidden md:table-cell">
                        {(() => {
                          const rankingInfo = getRankingInfo((show as any).ranking_category);
                          return rankingInfo.hasRanking ? (
                            <Badge variant="secondary" className={rankingInfo.badgeClasses}>
                              {rankingInfo.displayText}
                            </Badge>
                          ) : "N/A";
                        })()}
                      </td>
                      <td className="p-3 border-r border-border hidden md:table-cell">
                        <Badge
                          className={`text-xs border pointer-events-none ${
                            show.rate_card
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                          }`}
                        >
                          {show.rate_card ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="p-3 border-r border-border">
                        {(() => {
                          const standardSplit = show.standard_ads_percent ?? null;
                          return standardSplit !== null ? `${standardSplit}%` : "N/A";
                        })()}
                      </td>
                      <td className="p-3 md:border-r border-border">
                        {(() => {
                          const programmaticSplit = show.programmatic_ads_span_percent ?? null;
                          return programmaticSplit !== null ? `${programmaticSplit}%` : "N/A";
                        })()}
                      </td>
                      <td className="p-3 hidden md:table-cell">{show.cadence ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Admin Only */}
      {user?.role === "admin" && (
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-muted-foreground md:text-muted-foreground">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30"
                onClick={() => handleQuickAction('add-show')}
              >
                <Plus className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">Add Show</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30"
                onClick={() => handleQuickAction('import-shows')}
              >
                <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">Import Shows</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30"
                onClick={() => handleQuickAction('split-history')}
              >
                <History className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Split History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30"
                onClick={() => handleQuickAction('user-management')}
              >
                <Settings className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
                <span className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">User Management</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateShowDialog
        open={isCreateShowDialogOpen}
        onOpenChange={(open) => {
          setIsCreateShowDialogOpen(open)
          if (!open) {
            setEditingShow(null)
          }
        }}
        editingShow={editingShow}
        onShowUpdated={handleShowUpdated}
        createShow={createShow}
        updateShow={updateShow}
        existingShows={shows}
        onEditExistingShow={handleEditExistingShow}
      />
      <ImportCSVDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
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

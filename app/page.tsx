"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useShows } from "@/hooks/use-shows"
import LoginForm from "@/components/login-form"
import DashboardNav from "@/components/dashboard-nav"
import ShowsManagement from "@/components/shows-management"
import RevenueLedger from "@/components/revenue-ledger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, DollarSign, TrendingUp, Users, BarChart3, Loader2 } from "lucide-react"
import { mockLedgerEntries } from "@/lib/show-types"
import { cn } from "@/lib/utils"

function DashboardOverview() {
  const { user } = useAuth()
  const { shows, loading } = useShows()

  // Filter data based on user role
  const userShows = shows
  const userLedgerEntries = mockLedgerEntries.filter((entry) => userShows.some((show) => show.id === entry.showId))

  const totalRevenue = userLedgerEntries.reduce((sum, entry) => sum + entry.totalNet, 0)
  const partnerRevenue = userLedgerEntries.reduce((sum, entry) => sum + entry.partnerComp, 0)
  const evergreenRevenue = userLedgerEntries.reduce((sum, entry) => sum + entry.evergreenComp, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <Card className="evergreen-card">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <Radio className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{userShows.length}</div>
            <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Network shows" : "Your shows"}</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Across all shows</p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === "admin" ? "Evergreen Share" : "Your Share"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(user?.role === "admin" ? evergreenRevenue : partnerRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? (((user?.role === "admin" ? evergreenRevenue : partnerRevenue) / totalRevenue) * 100).toFixed(1)
                : "0"}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="evergreen-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Entries</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userLedgerEntries.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shows */}
      <Card className="evergreen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600" />
            {user?.role === "admin" ? "Recent Shows" : "Your Shows"}
          </CardTitle>
          <CardDescription>
            {user?.role === "admin" ? "Latest shows added to the network" : "Shows you have access to"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userShows.slice(0, 5).map((show) => (
              <div
                key={show.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{show.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={show.format === "Video" ? "default" : "secondary"}>{show.format}</Badge>
                    <Badge variant="outline">{show.genre_name}</Badge>
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
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(show.minimumGuarantee)}</p>
                  <p className="text-sm text-muted-foreground">Min Guarantee</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {user?.role === "admin" && (
        <Card className="evergreen-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Create New Show</h4>
                <p className="text-sm text-muted-foreground">Add a new podcast to the network</p>
              </div>
              <div className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Add Partner User</h4>
                <p className="text-sm text-muted-foreground">Invite a new partner to the platform</p>
              </div>
              <div className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Generate Report</h4>
                <p className="text-sm text-muted-foreground">Create revenue and performance reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UserManagement() {
  const { user } = useAuth()

  if (user?.role !== "admin") {
    return (
      <Card className="evergreen-card">
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">Only administrators can access user management.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground">Manage admin and partner users</p>
        </div>
      </div>

      <Card className="evergreen-card">
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">User Management</h3>
          <p className="text-muted-foreground">User creation and management functionality would be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card className="evergreen-card">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Member Since</label>
              <p className="text-sm text-muted-foreground">{user?.created_at}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
        return <UserManagement />
      case "ledger":
        return <RevenueLedger />
      case "settings":
        return <Settings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-cyan-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} onSidebarToggle={setIsSidebarCollapsed} />

      {/* Dynamic padding based on sidebar state */}
      <div className={cn("transition-all duration-300 ease-in-out", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

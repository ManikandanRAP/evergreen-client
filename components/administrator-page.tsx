"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Loader2, RotateCcw } from "lucide-react"
import CreateUserDialog from "@/components/create-user-dialog"
import VendorSplitManagement from "@/components/vendor-split-management"
import { useAuth } from "@/lib/auth-context"
import UserManagement from "@/components/user-management"
import { Toaster } from "@/components/ui/toaster"

export default function AdministratorPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [showEditUsersPage, setShowEditUsersPage] = useState(false)
  const { user, token, isLoading } = useAuth()

  // Global refresh signal for children
  const [refreshCounter, setRefreshCounter] = useState(0)
  const triggerRefresh = () => setRefreshCounter((c) => c + 1)

  const isCreateUserDisabled = isLoading || !user || !token
  const isEditUsersDisabled = isCreateUserDisabled

  // Block access for non-admin users
  if (!isLoading && (!user || (user.role && user.role.toLowerCase() != "admin"))) {
    return (
      <>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access denied</CardTitle>
              <CardDescription>This page is available to admin users only.</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Toaster />
      </>
    )
  }

  // Full-page editor when viewing users list
  if (showEditUsersPage) {
    return (
      <>
        <UserManagement onBack={() => setShowEditUsersPage(false)} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header + Refresh */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Administrator
            </h1>
            <p className="text-muted-foreground">Manage users and vendor split configurations.</p>
          </div>

          <Button variant="outline" onClick={triggerRefresh} disabled={isLoading} title="Refresh data in this page">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Single Section: User Management */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users on the platform: create Admin, Internal, or Partner accounts, and view, edit, or delete
                existing users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {/* First button: Create User (moved here) */}
                <Button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="evergreen-button"
                  disabled={isCreateUserDisabled}
                >
                  {isCreateUserDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Create User
                </Button>

                {/* Second button: View Users List */}
                <Button
                  onClick={() => setShowEditUsersPage(true)}
                  className="evergreen-button"
                  disabled={isEditUsersDisabled}
                  variant="secondary"
                >
                  {isEditUsersDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  View Users List
                </Button>
              </div>

              {(isCreateUserDisabled || isEditUsersDisabled) && (
                <p className="text-xs text-center text-muted-foreground mt-2">Waiting for authentication...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vendor Split Management - Full Width (unchanged) */}
        <VendorSplitManagement refreshSignal={refreshCounter} />

        {/* Create User Dialog (kept mounted) */}
        <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
      </div>

      <Toaster />
    </>
  )
}

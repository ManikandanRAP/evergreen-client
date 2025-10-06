"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Loader2, Settings, Eye, History, MessageSquare, Lightbulb } from "lucide-react"
import CreateUserDialog from "@/components/create-user-dialog"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"

export default function AdministratorPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const { user, token, isLoading } = useAuth()
  const router = useRouter()


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

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Administrator
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage users and vendor split configurations.</p>
        </div>

        {/* User Management Section */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage users on the platform: create Admin, Internal, or Partner accounts, and view, edit, or delete
                existing users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 md:gap-2 flex-wrap">
                {/* First button: Create User (moved here) */}
                <Button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="evergreen-button md:h-10"
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
                  onClick={() => router.push("/user-management")}
                  className="evergreen-button md:h-10"
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

        {/* Vendor Split Management Section */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Settings className="h-5 w-5" />
                Vendor Split Management
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage vendor split configurations: view and update split percentages for shows and vendors, map show-vendor relationships.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 md:gap-2 flex-wrap">
                {/* View and Update button */}
                <Button
                  onClick={() => router.push("/vendor-split-management")}
                  className="evergreen-button md:h-10"
                  disabled={isCreateUserDisabled}
                >
                  {isCreateUserDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  View and Update
                </Button>

                {/* View All Split History button */}
                <Button
                  onClick={() => router.push("/split-history")}
                  className="evergreen-button md:h-10"
                  disabled={isCreateUserDisabled}
                  variant="secondary"
                >
                  {isCreateUserDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <History className="mr-2 h-4 w-4" />
                  )}
                  View All Split History
                </Button>
              </div>

              {isCreateUserDisabled && (
                <p className="text-xs text-center text-muted-foreground mt-2">Waiting for authentication...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback Management Section */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MessageSquare className="h-5 w-5" />
                Feedback Management
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage user feedback and feature suggestions: view submitted feedback, feature requests, and respond to user suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 md:gap-2 flex-wrap">
                {/* Feature Suggestion button */}
                <Button
                  onClick={() => router.push("/add-feature-suggestion")}
                  className="evergreen-button md:h-10"
                  disabled={isCreateUserDisabled}
                >
                  {isCreateUserDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  Feature Suggestion
                </Button>

                {/* Feedbacks button */}
                <Button
                  onClick={() => router.push("/feedbacks")}
                  className="evergreen-button md:h-10"
                  disabled={isCreateUserDisabled}
                  variant="secondary"
                >
                  {isCreateUserDisabled ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Feedbacks
                </Button>
              </div>

              {isCreateUserDisabled && (
                <p className="text-xs text-center text-muted-foreground mt-2">Waiting for authentication...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create User Dialog (kept mounted) */}
        <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
      </div>

      <Toaster />
    </>
  )
}

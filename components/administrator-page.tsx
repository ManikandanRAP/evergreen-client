"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Loader2 } from "lucide-react"
import CreateUserDialog from "@/components/create-user-dialog"
import VendorSplitManagement from "@/components/vendor-split-management"
import { useAuth } from "@/lib/auth-context"
import EditUserPage from "@/components/edit-user-page"

export default function AdministratorPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [showEditUsersPage, setShowEditUsersPage] = useState(false)
  const { user, token, loading } = useAuth() // Get auth status

  // Disable buttons if auth is loading or if user/token is not available
  const isCreateUserDisabled = loading || !user || !token
  const isEditUsersDisabled = isCreateUserDisabled

  // When Edit Users is active, render the full-page editor and hide the rest
  if (showEditUsersPage) {
    return <EditUserPage onBack={() => setShowEditUsersPage(false)} />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          Administrator
        </h1>
        <p className="text-muted-foreground">Manage users and vendor split configurations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create User Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create User
            </CardTitle>
            <CardDescription>Add new admin or partner users to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreateUserOpen(true)} className="w-full" disabled={isCreateUserDisabled}>
              {isCreateUserDisabled ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create User
            </Button>
            {isCreateUserDisabled && (
              <p className="text-xs text-center text-muted-foreground mt-2">Waiting for authentication...</p>
            )}
          </CardContent>
        </Card>

        {/* Edit Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>View, edit, and delete existing users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowEditUsersPage(true)} className="w-full" disabled={isEditUsersDisabled}>
              {isEditUsersDisabled ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              View Users List
            </Button>
            {isEditUsersDisabled && (
              <p className="text-xs text-center text-muted-foreground mt-2">Waiting for authentication...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Split Management - Full Width */}
      <VendorSplitManagement />

      {/* Create User Dialog */}
      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
    </div>
  )
}

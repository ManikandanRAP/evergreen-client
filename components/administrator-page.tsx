"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Settings, Loader2 } from "lucide-react"
import CreateUserDialog from "@/components/create-user-dialog"
import VendorSplitManagement from "@/components/vendor-split-management"
import { useAuth } from "@/lib/auth-context"

export default function AdministratorPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const { user, token, loading } = useAuth() // Get auth status

  // Disable the button if auth is loading or if user/token is not available
  const isCreateUserDisabled = loading || !user || !token

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Administrator</h1>
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
              <p className="text-xs text-center text-muted-foreground mt-2">
                Waiting for authentication...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vendor and Split Updates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Vendor and Split Updates
            </CardTitle>
            <CardDescription>Manage vendor splits and revenue configurations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select shows and vendors to view and update split configurations.
            </p>
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
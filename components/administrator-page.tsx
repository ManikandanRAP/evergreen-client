"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { VendorSplitManagement } from "@/components/vendor-split-management"
import { Shield, UserPlus, TrendingUp } from "lucide-react"

export default function AdministratorPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)

  return (
    <div className="container mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Administrator</h1>
          <p className="text-muted-foreground">Manage users and vendor splits</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Create User Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create User
            </CardTitle>
            <CardDescription>Add new admin or partner users to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsCreateUserOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </CardContent>
        </Card>

        {/* Vendor and Split Updates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vendor and Split Updates
            </CardTitle>
            <CardDescription>Manage vendor splits and revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <VendorSplitManagement />
          </CardContent>
        </Card>
      </div>

      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
    </div>
  )
}

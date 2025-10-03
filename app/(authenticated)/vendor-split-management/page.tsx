"use client"

import VendorSplitManagement from "@/components/vendor-split-management"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

export default function VendorSplitManagementPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect non-admin users
  if (!isLoading && (!user || user.role?.toLowerCase() !== "admin")) {
    router.push("/administrator")
    return null
  }

  const handleBack = () => {
    router.push("/administrator")
  }

  return (
    <>
      <VendorSplitManagement onBack={handleBack} />
      <Toaster />
    </>
  )
}

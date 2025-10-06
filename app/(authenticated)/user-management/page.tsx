"use client"

import UserManagement from "@/components/user-management"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function UserManagementPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect non-admin users
  if (!isLoading && (!user || user.role?.toLowerCase() !== "admin")) {
    router.push("/administrator")
    return null
  }

  const handleBack = () => {
    router.back()
  }

  return <UserManagement onBack={handleBack} />
}

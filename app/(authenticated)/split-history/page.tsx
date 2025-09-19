"use client"

import SplitHistory from "@/components/split-history"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function SplitHistoryPage() {
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

  return <SplitHistory onBack={handleBack} />
}

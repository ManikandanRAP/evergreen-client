"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ArchivedShowsManagement from "@/components/archived-shows-management"

export default function ArchivedShowsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect partner users only (admin and internal users can access)
  if (!isLoading && (!user || user.role?.toLowerCase() === "partner")) {
    router.push("/")
    return null
  }

  return <ArchivedShowsManagement />
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RevenueLedger from "@/components/revenue-ledger"

export default function RevenueLedgerPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && user.role === "internal_show_access") {
      router.push("/shows-management")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (user?.role === "internal_show_access") {
    return null
  }

  return <RevenueLedger />
}

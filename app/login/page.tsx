"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to appropriate page based on user role
      if (user.role === "partner") {
        router.push("/revenue-ledger")
      } else if (user.role === "internal_show_access") {
        router.push("/shows-management")
      } else {
        router.push("/")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}

"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import MobileFloatingNav from "@/components/mobile-floating-nav"
import { cn } from "@/lib/utils"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
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

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-cyan-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav
        onSidebarToggle={setIsSidebarCollapsed}
      />
      <div className={cn("transition-all duration-300 ease-in-out", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <main className="p-4 lg:p-8 pb-[100px] lg:pb-8">
          {children}
        </main>
      </div>
      <MobileFloatingNav />
    </div>
  )
}

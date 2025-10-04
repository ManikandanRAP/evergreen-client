"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Radio, DollarSign, Shield, Lightbulb } from "lucide-react"

export default function MobileFloatingNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Role-based navigation items
  let mainNavItems: { href: string; label: string; icon: any; shortLabel: string }[] = []

  if (user?.role === "partner") {
    // Partners don't need bottom navbar - they only have access to revenue ledger
    return null
  } else if (user?.role === "internal_show_access") {
    // Internal show access users don't need bottom navbar - they only have access to shows
    return null
  } else if (user?.role === "internal_full_access") {
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
      { href: "/shows-management", label: "Shows", icon: Radio, shortLabel: "Shows" },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign, shortLabel: "Revenue" },
      { href: "/add-feature-suggestion", label: "Feature Suggestion", icon: Lightbulb, shortLabel: "Feature" }
    ]
  } else if (user?.role === "admin") {
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
      { href: "/shows-management", label: "Shows", icon: Radio, shortLabel: "Shows" },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign, shortLabel: "Revenue" },
      { href: "/administrator", label: "Administrator", icon: Shield, shortLabel: "Admin" }
    ]
  } else {
    // Default fallback
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
      { href: "/shows-management", label: "Shows", icon: Radio, shortLabel: "Shows" },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign, shortLabel: "Revenue" }
    ]
  }

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-around py-1 px-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3 rounded-full transition-all duration-200 min-w-0 flex-1",
                  isActive
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive ? "scale-110" : "scale-100"
                )} />
                <span className={cn(
                  "text-xs font-medium transition-all duration-200 mt-1",
                  isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                )}>
                  {item.shortLabel}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

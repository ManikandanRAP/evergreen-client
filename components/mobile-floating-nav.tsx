"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Radio, DollarSign, Shield } from "lucide-react"

export default function MobileFloatingNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Role-based navigation items (same logic as dashboard-nav.tsx)
  let mainNavItems: { href: string; label: string; icon: any; shortLabel: string }[] = []

  if (user?.role === "partner") {
    mainNavItems = [{ 
      href: "/revenue-ledger", 
      label: "Revenue Ledger", 
      icon: DollarSign,
      shortLabel: "Revenue"
    }]
  } else if (user?.role === "internal_show_access") {
    mainNavItems = [{ 
      href: "/shows-management", 
      label: "Shows", 
      icon: Radio,
      shortLabel: "Shows"
    }]
  } else {
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
      { href: "/shows-management", label: "Shows", icon: Radio, shortLabel: "Shows" },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign, shortLabel: "Revenue" },
      ...(user?.role === "admin"
        ? [{ href: "/administrator", label: "Administrator", icon: Shield, shortLabel: "Admin" }]
        : []),
    ]
  }

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
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
                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive ? "scale-110" : "scale-100"
                )} />
                <span className={cn(
                  "text-xs font-medium transition-all duration-200 mt-1",
                  isActive ? "text-white" : "text-gray-600"
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

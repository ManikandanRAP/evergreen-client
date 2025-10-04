"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Radio, DollarSign, Shield, Lightbulb } from "lucide-react"
import AnimatedNavIndicator from "./animated-nav-indicator"
import { useState, useEffect } from "react"

export default function MobileFloatingNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  // Update active index when pathname changes (but don't override user clicks)
  useEffect(() => {
    const currentIndex = mainNavItems.findIndex(item => item.href === pathname)
    if (currentIndex !== -1 && currentIndex !== activeIndex) {
      // Only update if we're not already transitioning (user clicked)
      if (!isTransitioning) {
        setActiveIndex(currentIndex)
      }
    }
  }, [pathname, mainNavItems, activeIndex, isTransitioning])

  const handleNavClick = (index: number) => {
    // Trigger animation immediately on click
    setActiveIndex(index)
    setIsTransitioning(true)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full border border-white/20 dark:border-gray-700/50 shadow-lg overflow-hidden">
        {/* Animated background indicator */}
        <AnimatedNavIndicator 
          activeIndex={activeIndex} 
          totalItems={mainNavItems.length}
          pathname={pathname}
          className="opacity-90"
        />
        
        <div className="relative flex items-center justify-around py-1 px-1">
          {mainNavItems.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(index)}
                data-nav-item
                className={cn(
                  "relative flex flex-col items-center justify-center px-3 py-3 rounded-full transition-all duration-300 ease-out min-w-0 flex-1 z-10",
                  "transform-gpu", // Hardware acceleration
                  "hover:scale-105 active:scale-95", // iOS-style touch feedback
                  "border-0 outline-none", // Remove any borders/outlines
                  isActive 
                    ? "text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-600"
                )}
                style={{
                  willChange: isTransitioning ? "transform, color" : "auto",
                  transition: "color 0.15s ease-out, transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                }}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-150 ease-out",
                  isActive 
                    ? "scale-110 drop-shadow-sm" 
                    : "scale-100 hover:scale-105"
                )} 
                style={{
                  transition: "color 0.15s ease-out, transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                }} />
                <span className={cn(
                  "text-xs font-medium transition-all duration-150 ease-out mt-1",
                  isActive 
                    ? "text-white font-semibold" 
                    : "text-gray-600 dark:text-gray-300"
                )}
                style={{
                  transition: "color 0.15s ease-out, transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                }}>
                  {item.shortLabel}
                </span>
                
                {/* Subtle glow effect for active item */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

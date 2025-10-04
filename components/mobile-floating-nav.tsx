"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Radio, DollarSign, Shield, Lightbulb } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function MobileFloatingNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState(0)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Role-based navigation items
  let mainNavItems: { href: string; label: string; icon: any; shortLabel: string }[] = []

  if (user?.role === "partner") {
    return null
  } else if (user?.role === "internal_show_access") {
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
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
      { href: "/shows-management", label: "Shows", icon: Radio, shortLabel: "Shows" },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign, shortLabel: "Revenue" }
    ]
  }

  // Update active index based on pathname
  useEffect(() => {
    const currentIndex = mainNavItems.findIndex(item => item.href === pathname)
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex)
    }
  }, [pathname, mainNavItems])

  // Animate indicator position
  useEffect(() => {
    if (indicatorRef.current && navRef.current) {
      const navItems = navRef.current.children
      const activeItem = navItems[activeIndex] as HTMLElement
      
      if (activeItem) {
        const navRect = navRef.current.getBoundingClientRect()
        const itemRect = activeItem.getBoundingClientRect()
        
        // Calculate position and width to cover the full element including padding
        const left = itemRect.left - navRect.left
        const width = itemRect.width
        
        // Set the background to cover the full element
        indicatorRef.current.style.left = `${left}px`
        indicatorRef.current.style.width = `${width}px`
        indicatorRef.current.style.opacity = '1'
        
        // Force a reflow to ensure the positioning is applied
        indicatorRef.current.offsetHeight
      }
    }
  }, [activeIndex])

  const handleNavClick = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      {/* Background navbar layer */}
        <div className="bg-white dark:bg-gray-900 rounded-full border border-gray-300 dark:border-gray-600 py-1 px-1">
        {/* Current navbar layer on top */}
        <div className="relative bg-white dark:bg-gray-900 rounded-full overflow-hidden">
          {/* Animated background indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-emerald-500 rounded-full transition-all duration-300 ease-out opacity-0"
            style={{
              willChange: 'left, width, opacity'
            }}
          />
          
          <div ref={navRef} className="relative flex items-center justify-around py-0 px-0">
            {mainNavItems.map((item, index) => {
              const isActive = activeIndex === index
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(index)}
                  className={cn(
                    "relative flex flex-col items-center justify-center px-0 py-2 rounded-full transition-all duration-200 ease-out flex-1 min-w-0",
                    "hover:scale-105 active:scale-95",
                    isActive 
                      ? "text-white" 
                      : "text-gray-600 dark:text-gray-300 hover:text-emerald-600"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200",
                    isActive 
                      ? "scale-110" 
                      : "scale-100"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isActive 
                      ? "text-white font-semibold" 
                      : "text-gray-600 dark:text-gray-300"
                  )}>
                    {item.shortLabel}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
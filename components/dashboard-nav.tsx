"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Radio,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Archive,
} from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  onSidebarToggle?: (collapsed: boolean) => void
}

export default function DashboardNav({ onSidebarToggle }: DashboardNavProps) {
  const { user, logout } = useAuth()
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Helper function to format role names for display
  const formatRoleName = (role: string | null) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'partner': return 'Partner'
      case 'internal_full_access': return 'Internal - Full Access'
      case 'internal_show_access': return 'Internal - Show Access'
      default: return role || '—'
    }
  }

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onSidebarToggle?.(isDesktopCollapsed)
  }, [isDesktopCollapsed, onSidebarToggle])

  let mainNavItems: { href: string; label: string; icon: any; variant?: "default" | "ghost" | "outline" }[] = []

  if (user?.role === "partner") {
    mainNavItems = [{ href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign }]
  } else if (user?.role === "internal_show_access") {
    mainNavItems = [{ href: "/shows-management", label: "Shows", icon: Radio }]
  } else {
    mainNavItems = [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/shows-management", label: "Shows", icon: Radio },
      { href: "/revenue-ledger", label: "Revenue Ledger", icon: DollarSign },
      ...(user?.role === "admin"
        ? [{ href: "/administrator", label: "Administrator", icon: Shield }]
        : []),
    ]
    
  }

  const secondaryNavItems = [
    ...(user?.role === "internal_full_access" || user?.role === "internal_show_access" || user?.role === "admin" ? [{ href: "/add-feature-suggestion", label: "Feature Suggestion", variant: "outline", icon: Lightbulb }] : []),
    ...(user?.role === "admin" ? [{ href: "/feedbacks", label: "Feedbacks", variant: "outline", icon: MessageSquare }] : []),
  ]

  const handleSidebarToggle = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed)
  }

  const ThemeToggle = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!mounted) {
      return (
        <Button variant="outline" size="icon" className={cn("transition-colors", isMobile ? "w-full justify-start" : "")}>
          <Sun className="h-4 w-4" />
          {isMobile && <span className="ml-3">Theme</span>}
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("transition-colors", isMobile ? "w-full justify-start" : "")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            {isMobile && <span className="ml-3">Theme</span>}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "p-6 border-b border-border/50 flex items-center",
          isDesktopCollapsed && !isMobile ? "justify-center p-4" : "",
        )}
      >
        {(!isDesktopCollapsed || isMobile) && (
          <Link href="/" className="block">
            <Image src="/myco-beta-logo.png" alt="Myco" width={200} height={50} className="h-12 w-auto" priority />
          </Link>
        )}
        {isDesktopCollapsed && !isMobile && (
          <Link href="/" className="block">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 flex flex-col p-4">
        <div className="space-y-2">
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={pathname === item.href ? "default" : (item.variant ?? "outline")}
                className={cn(
                  "w-full transition-all duration-200",
                  pathname === item.href ? "evergreen-button shadow-lg" : "hover:bg-accent hover:text-accent-foreground",
                  isDesktopCollapsed && !isMobile ? "justify-center px-2" : "justify-start",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isDesktopCollapsed && !isMobile ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4", (!isDesktopCollapsed || isMobile) && "mr-3")} />
                {(!isDesktopCollapsed || isMobile) && item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="mt-auto space-y-2">
          {secondaryNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={pathname === item.href ? "default" : "outline"}
                className={cn(
                  "w-full transition-all duration-200",
                  pathname === item.href ? "evergreen-button shadow-lg" : "hover:bg-accent hover:text-accent-foreground",
                  isDesktopCollapsed && !isMobile ? "justify-center px-2" : "justify-start",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isDesktopCollapsed && !isMobile ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4", (!isDesktopCollapsed || isMobile) && "mr-3")} />
                {(!isDesktopCollapsed || isMobile) && item.label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        {(!isDesktopCollapsed || isMobile) && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm min-w-0 flex-1">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-muted-foreground text-xs">{formatRoleName(user?.role)}</p>
            </div>
            <ThemeToggle />
          </div>
        )}

        {isDesktopCollapsed && !isMobile && (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{user?.name?.charAt(0)}</span>
            </div>
            <ThemeToggle />
          </div>
        )}

        <Button
          variant="outline"
          className={cn(
            "w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors",
            isDesktopCollapsed && !isMobile ? "justify-center px-2" : "justify-start",
          )}
          onClick={logout}
          title={isDesktopCollapsed && !isMobile ? "Sign Out" : undefined}
        >
          <LogOut className={cn("h-4 w-4", (!isDesktopCollapsed || isMobile) && "mr-3")} />
          {(!isDesktopCollapsed || isMobile) && "Sign Out"}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-card lg:border-r lg:border-border/50 transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:shadow-lg transition-all duration-200 z-10"
          onClick={handleSidebarToggle}
        >
          {isDesktopCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border/50 sticky top-0 z-40">
        <Link href="/" className="block">
          <Image src="/myco-beta-logo.png" alt="Myco" width={180} height={50} className="h-10 w-auto" priority />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Select a page to navigate to from the list of options.
                </SheetDescription>
              </SheetHeader>
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
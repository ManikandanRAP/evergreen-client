"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
} from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onSidebarToggle?: (collapsed: boolean) => void
}

export default function DashboardNav({ activeTab, onTabChange, onSidebarToggle }: DashboardNavProps) {
  const { user, logout } = useAuth()
  const { setTheme, theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onSidebarToggle?.(isDesktopCollapsed)
  }, [isDesktopCollapsed, onSidebarToggle])

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "shows", label: "Shows", icon: Radio },
    // ...(user?.role === "admin" ? [{ id: "users", label: "Users", icon: Users }] : []),
    { id: "ledger", label: "Revenue Ledger", icon: DollarSign },
    // { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleSidebarToggle = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed)
  }

  const ThemeToggle = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!mounted) {
      return (
        <Button variant="ghost" size="icon" className={cn("transition-colors", isMobile ? "w-full justify-start" : "")}>
          <Sun className="h-4 w-4" />
          {isMobile && <span className="ml-3">Theme</span>}
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
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
          <Image src="/evergreen-logo.svg" alt="Evergreen Podcasts" width={150} height={40} className="h-8 w-auto" />
        )}
        {isDesktopCollapsed && !isMobile && (
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              "w-full transition-all duration-200",
              activeTab === item.id ? "evergreen-button shadow-lg" : "hover:bg-accent hover:text-accent-foreground",
              isDesktopCollapsed && !isMobile ? "justify-center px-2" : "justify-start",
            )}
            onClick={() => {
              onTabChange(item.id)
              setIsMobileMenuOpen(false)
            }}
            title={isDesktopCollapsed && !isMobile ? item.label : undefined}
          >
            <item.icon className={cn("h-4 w-4", (!isDesktopCollapsed || isMobile) && "mr-3")} />
            {(!isDesktopCollapsed || isMobile) && item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        {(!isDesktopCollapsed || isMobile) && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm min-w-0 flex-1">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-muted-foreground capitalize text-xs">{user?.role}</p>
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
          variant="ghost"
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
        <Image src="/evergreen-logo.svg" alt="Evergreen Podcasts" width={120} height={30} className="h-6 w-auto" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Sidebar,
  SidebarClose,
  X,
  Building,
  User as UserIcon,
  Pencil,
} from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false)

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

  // Helper function to get first name from full name
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return 'User'
    return fullName.split(' ')[0]
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
          <div className="flex items-center justify-between mb-2 gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`flex-1 text-left justify-start p-2 transition-colors h-10 ${
                user?.role === 'admin' 
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30"
                  : user?.role === 'internal_full_access'
                  ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30"
                  : user?.role === 'internal_show_access'
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                  : user?.role === 'partner'
                  ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30"
                  : "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
              }`}
              onClick={() => setIsUserProfileOpen(true)}
            >
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium truncate">{getFirstName(user?.name)}</p>
                <p className="text-muted-foreground text-xs">{formatRoleName(user?.role)}</p>
              </div>
            </Button>
            <ThemeToggle />
          </div>
        )}

        {isDesktopCollapsed && !isMobile && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors p-0 ${
                user?.role === 'admin' 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  : user?.role === 'internal_full_access'
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : user?.role === 'internal_show_access'
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  : user?.role === 'partner'
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
              }`}
              onClick={() => setIsUserProfileOpen(true)}
              title={`${getFirstName(user?.name)} - ${formatRoleName(user?.role)}`}
            >
              <span className="text-white font-bold text-xs">{getFirstName(user?.name)?.charAt(0)}</span>
            </Button>
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
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:shadow-lg transition-all duration-200 z-10"
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

      {/* User Profile Dialog */}
      <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
        <DialogContent className="max-w-none w-full sm:w-[600px] h-screen sm:h-[80vh] mobile-fullscreen flex flex-col p-0 overflow-hidden dark:bg-black border-0 [&>button:not(.navigation-button)]:hidden" hideClose>
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-background dark:bg-[#262626] border-b dark:border-slate-800">
            {/* Mobile: Title left, Close right */}
            <div className="flex sm:hidden w-full items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-left truncate flex-1 pr-4">
                User Profile
              </DialogTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsUserProfileOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Desktop: Navigation, Title, Actions in one row */}
            <div className="hidden sm:flex flex-row items-center justify-between w-full">
              <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsUserProfileOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {user && (
              <div className="space-y-6 p-6">
                {/* User Header with Basic Info */}
                <div className={`p-6 rounded-lg border ${
                  user.role === 'admin' 
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : user.role === 'internal_full_access'
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
                    : user.role === 'internal_show_access'
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"
                    : user.role === 'partner'
                    ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"
                    : "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800"
                }`}>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {user.name || "Unnamed User"}
                      </h2>
                      <p className="text-lg text-muted-foreground font-mono">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Badge 
                          className={`text-xs border pointer-events-none uppercase font-semibold ${
                            user.role === 'admin' 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                              : user.role === 'internal_full_access'
                              ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                              : user.role === 'internal_show_access'
                              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                              : user.role === 'partner'
                              ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                              : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {formatRoleName(user.role)}
                        </Badge>
                      </div>
                      {user.created_at && (
                        <div className="text-sm text-muted-foreground">
                          Member since {new Date(user.created_at).toLocaleDateString()}, {new Date(user.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vendor Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building className="h-5 w-5 text-emerald-600" />
                      Vendor Mapping
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.mapped_vendor_qbo_id ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                              {user.mapped_vendor_name || "Unknown Vendor"}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-mono">
                            QBO ID: {user.mapped_vendor_qbo_id}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        {user.role === 'admin' ? (
                          <>
                            <p className="text-muted-foreground font-medium">Admin users cannot be assigned to vendors</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Admin users have system-wide access and don't require vendor mapping
                            </p>
                          </>
                        ) : (user.role === 'internal_full_access' || user.role === 'internal_show_access') ? (
                          <>
                            <p className="text-muted-foreground font-medium">Internal users cannot be assigned to vendors</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Internal users are company employees and don't need vendor mapping
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-muted-foreground">No vendor mapping assigned</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              This partner user is not linked to any vendor in QuickBooks
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sticky Footer - Mobile: 2 lines full width, Desktop: right side */}
          <div className="sticky bottom-0 bg-background border-t dark:border-slate-800 p-6">
            {/* Mobile Layout */}
            <div className="sm:hidden space-y-3">
              <Button 
                onClick={() => {
                  setIsUserProfileOpen(false)
                  window.location.href = '/user-management'
                }}
                className={`w-full flex items-center gap-2 ${
                  user?.role === 'admin' 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    : user?.role === 'internal_full_access'
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-0"
                    : user?.role === 'internal_show_access'
                    ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                    : user?.role === 'partner'
                    ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                    : "bg-slate-500 hover:bg-slate-600 text-white border-0"
                }`}
              >
                <Users className="h-4 w-4" />
                User Management
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsUserProfileOpen(false)}
                className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
              >
                Close
              </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex justify-end gap-3">
              <Button 
                onClick={() => {
                  setIsUserProfileOpen(false)
                  window.location.href = '/user-management'
                }}
                className={`flex items-center gap-2 ${
                  user?.role === 'admin' 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    : user?.role === 'internal_full_access'
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-0"
                    : user?.role === 'internal_show_access'
                    ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                    : user?.role === 'partner'
                    ? "bg-purple-500 hover:bg-purple-600 text-white border-0"
                    : "bg-slate-500 hover:bg-slate-600 text-white border-0"
                }`}
              >
                <Users className="h-4 w-4" />
                User Management
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsUserProfileOpen(false)}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
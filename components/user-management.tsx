"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { CustomPopoverContent } from "@/components/ui/custom-popover-content"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, ChevronsUpDown, Loader2, Pencil, Trash2, ArrowLeft, Eye, EyeOff, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Plus, Download, Users, UserCheck, UserX, MoreHorizontal, User as UserIcon, Building, FileText, Calendar, MoreVertical, Settings } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import CreateUserDialog from "@/components/create-user-dialog"

type UserManagementProps = {
  onBack: () => void
}

type UserRow = {
  id: string
  name: string | null
  email: string
  role?: string | null
  created_at?: string | null
  mapped_vendor_qbo_id?: number | null
  mapped_vendor_name?: string | null
}

type Vendor = {
  vendor_qbo_id: number
  vendor_name: string
}

type SortField = keyof UserRow | null
type SortDirection = "asc" | "desc" | "original"

// const API_URL = "http://127.0.0.1:8000"
const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 10

export default function UserManagement({ onBack }: UserManagementProps) {
  const { user: currentUser, token } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  // Search, sorting, and pagination state
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("original")
  const [originalOrder, setOriginalOrder] = useState<UserRow[]>([])

  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Create user state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // User profile view state
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  const [editing, setEditing] = useState<UserRow | null>(null)
  const [form, setForm] = useState<{ name: string; email: string; role: string; password: string; confirmPassword: string; mapped_vendor_qbo_id: number | null }>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    mapped_vendor_qbo_id: null,
  })
  const [saving, setSaving] = useState(false)
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toDelete, setToDelete] = useState<UserRow | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [realTimeErrors, setRealTimeErrors] = useState<Record<string, string>>({})
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [emailError, setEmailError] = useState<string>("")

  const isPartner = useMemo(() => (form.role || "").toLowerCase() === "partner", [form.role])

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

  // Real-time password validation for edit dialog
  useEffect(() => {
    setRealTimeErrors(prev => {
      const newErrors = { ...prev }
      
      if (form.password && form.confirmPassword) {
        if (form.password !== form.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          // Clear password error if passwords match
          delete newErrors.confirmPassword
        }
      } else {
        // Clear password error if either field is empty
        delete newErrors.confirmPassword
      }
      
      return newErrors
    })
  }, [form.password, form.confirmPassword])

  // Real-time username availability check for edit dialog
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!form.email || !token || !editing) return
      
      // Don't check if email hasn't changed from original
      if (form.email === editing.email) {
        setEmailError("")
        return
      }
      
      // Basic email validation first
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setEmailError("")
        return
      }

      setIsCheckingUsername(true)
      
      try {
        const response = await fetch(`${API_URL}/users/check-username`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ username: form.email }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.available) {
            setEmailError("")
          } else {
            setEmailError("Username already exists")
          }
        } else {
          console.error('Failed to check username availability')
        }
      } catch (error) {
        console.error('Error checking username availability:', error)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(checkUsernameAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [form.email, token, editing])

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const name = (user.name || "").toLowerCase()
        const email = user.email.toLowerCase()
        const role = (user.role || "").toLowerCase()
        
        if (!name.includes(searchLower) && 
            !email.includes(searchLower) && 
            !role.includes(searchLower)) {
          return false
        }
      }

      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false
      }

      return true
    })

    if (sortDirection === "original") {
      // We need to filter the original order as well to match search terms
      const originalIds = new Set(filtered.map((u) => u.id))
      return originalOrder.filter((u) => originalIds.has(u.id))
    }

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortField] ?? "").toLowerCase()
        const bValue = String(b[sortField] ?? "").toLowerCase()

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [users, originalOrder, searchTerm, sortField, sortDirection, roleFilter])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAndSortedUsers.length / PAGE_SIZE)), [filteredAndSortedUsers.length])

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredAndSortedUsers.slice(start, start + PAGE_SIZE)
  }, [filteredAndSortedUsers, page])

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, roleFilter])

  // User statistics
  const userStats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === "admin").length
    const partners = users.filter(u => u.role === "partner").length
    const internalFullAccess = users.filter(u => u.role === "internal_full_access").length
    const internalShowAccess = users.filter(u => u.role === "internal_show_access").length
    
    return { total, admins, partners, internalFullAccess, internalShowAccess }
  }, [users])

  // Function to load users
  const loadUsers = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = (await res.json()) as UserRow[]
      setUsers(data)
      setOriginalOrder(data)
    } catch (e: any) {
      toast({ title: "Failed to load users", description: e?.message ?? String(e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Load users & vendors on mount
  useEffect(() => {
    const run = async () => {
      await loadUsers()
      // preload vendors for combobox
      try {
        const resp = await fetch(`${API_URL}/vendors`, { headers: { Authorization: `Bearer ${token}` } })
        if (resp.ok) {
          const v = (await resp.json()) as Vendor[]
          setVendors(v || [])
        }
      } catch {}
    }
    run()
  }, [token]) // run once when token ready

  function openEditor(u: UserRow) {
    setEditing(u)
    setForm({
      name: u.name ?? "",
      email: u.email,
      role: u.role ?? "",
      password: "",
      confirmPassword: "",
      mapped_vendor_qbo_id: u.mapped_vendor_qbo_id ?? null,
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setRealTimeErrors({})
    setIsCheckingUsername(false)
    setEmailError("")
  }

  async function saveEdits() {
    if (!editing || !token) return
    
    // Validate password confirmation if password is provided
    if (form.password && form.password.trim().length > 0) {
      if (!form.confirmPassword) {
        toast({ title: "Validation Error", description: "Please confirm the password", variant: "destructive" })
        return
      }
      if (form.password !== form.confirmPassword) {
        toast({ title: "Validation Error", description: "Passwords do not match", variant: "destructive" })
        return
      }
      if (form.password.length < 8) {
        toast({ title: "Validation Error", description: "Password must be at least 8 characters", variant: "destructive" })
        return
      }
    }

    // Check for real-time username validation errors
    if (emailError) {
      toast({ title: "Validation Error", description: emailError, variant: "destructive" })
      return
    }
    
    setSaving(true)
    try {
      // only send changed fields
      const payload: any = {}
      const changed: string[] = []

      if (form.name !== (editing.name ?? "")) {
        payload.name = form.name
        changed.push(`name → "${form.name || "—"}"`)
      }
      if (form.email !== editing.email) {
        payload.email = form.email
        changed.push(`email → ${form.email}`)
      }
      if (form.password && form.password.trim().length > 0) {
        payload.password = form.password
        changed.push("password updated")
      }
      // vendor mapping (only for partner; allow clearing)
      if (isPartner) {
        if ((form.mapped_vendor_qbo_id ?? null) !== (editing.mapped_vendor_qbo_id ?? null)) {
          payload.mapped_vendor_qbo_id = form.mapped_vendor_qbo_id
          const fromName =
            editing.mapped_vendor_qbo_id != null
              ? `${editing.mapped_vendor_name ?? "Unknown"} · ID ${editing.mapped_vendor_qbo_id}`
              : "—"
          const toName =
            form.mapped_vendor_qbo_id != null
              ? `${vendors.find((v) => v.vendor_qbo_id === form.mapped_vendor_qbo_id)?.vendor_name ?? "Unknown"} · ID ${
                  form.mapped_vendor_qbo_id
                }`
              : "—"
          changed.push(`vendor: ${fromName} → ${toName}`)
        }
      } else if (editing.mapped_vendor_qbo_id != null) {
        payload.mapped_vendor_qbo_id = null
        changed.push("vendor: cleared (non-partner)")
      }

      if (Object.keys(payload).length === 0) {
        toast({ title: "No changes", description: "There are no changes to save." })
        return
      }

      const resp = await fetch(`${API_URL}/users/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.detail || "Failed to update user")
      }
      const updated = (await resp.json()) as UserRow

      // update list
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)))

      // success toast (with changed fields)
      toast({
        title: "User updated",
        description:
          `${updated.name ?? updated.email} has been saved.` +
          (changed.length ? ` Changes: ${changed.join("; ")}.` : ""),
      })

      // close editor
      setEditing(null)
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(u: UserRow) {
    setToDelete(u)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!toDelete || !token) return
    setDeleting(true)
    try {
      const resp = await fetch(`${API_URL}/users/${toDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok && resp.status !== 204) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.detail || "Failed to delete user")
      }
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id))
      toast({
        title: "User deleted",
        description: `${toDelete.name ?? toDelete.email} has been removed.`,
      })
      setToDelete(null)
      setConfirmOpen(false)
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? String(e), variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const canDelete = (u: UserRow) => currentUser?.id && currentUser.id !== u.id

  // Export users function
  const handleExportUsers = () => {
    const csvContent = [
      // CSV headers
      ["Name", "Email", "Role", "Created At", "Mapped Vendor"].join(","),
      // CSV data
      ...filteredAndSortedUsers.map((user) =>
        [
          `"${(user.name || "").replace(/"/g, '""')}"`,
          `"${user.email}"`,
          `"${user.role || ""}"`,
          user.created_at ? new Date(user.created_at).toISOString() : "",
          user.mapped_vendor_name ? `"${user.mapped_vendor_name} (ID: ${user.mapped_vendor_qbo_id})"` : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: `${filteredAndSortedUsers.length} users exported successfully.`,
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> original
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection("original")
        setSortField(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }

    switch (sortDirection) {
      case "asc":
        return <ArrowUp className="h-4 w-4 text-blue-600" />
      case "desc":
        return <ArrowDown className="h-4 w-4 text-blue-600" />
      case "original":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="px-4 py-2 font-semibold border-r cursor-pointer hover:bg-accent/50 transition-colors bg-muted/50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {getSortIcon(field)}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">User Management</h1>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Users</p>
                <p className="text-2xl font-bold text-slate-600">{userStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Admins</p>
                <p className="text-2xl font-bold text-emerald-600">{userStats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Partners</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.partners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Full Access Internals</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.internalFullAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Show Access Internals</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.internalShowAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="internal_full_access">Internal - Full Access</SelectItem>
                  <SelectItem value="internal_show_access">Internal - Show Access</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedUsers.length} user{filteredAndSortedUsers.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExportUsers} disabled={filteredAndSortedUsers.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="evergreen-button" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users…
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="name">Name</SortableHeader>
                      <SortableHeader field="email">Email</SortableHeader>
                      <SortableHeader field="role">Role</SortableHeader>
                      <SortableHeader field="created_at">Created At</SortableHeader>
                      <TableHead className="px-4 py-2 font-semibold border-r bg-muted/50">Mapped Vendor</TableHead>
                      <TableHead className="px-4 py-2 font-semibold bg-muted/50">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell 
                          className="font-medium border-r px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
                          onClick={() => { setViewingUser(u); setIsProfileDialogOpen(true); }}
                        >
                          <span className="hover:underline hover:text-emerald-600 transition-colors">
                            {u.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono border-r px-4 py-2">{u.email}</TableCell>
                        <TableCell className="border-r px-4 py-2">
                          <Badge 
                            className={`text-xs border pointer-events-none uppercase font-semibold ${
                              u.role === 'admin' 
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                                : u.role === 'internal_full_access'
                                ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                                : u.role === 'internal_show_access'
                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                                : u.role === 'partner'
                                ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                                : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
                            }`}
                          >
                            {formatRoleName(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="border-r px-4 py-2">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="border-r px-4 py-2">
                          {u.mapped_vendor_qbo_id != null ? (
                            <span>
                              {u.mapped_vendor_name || "Unknown"}{" "}
                              <span className="text-muted-foreground">· ID {u.mapped_vendor_qbo_id}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => { setViewingUser(u); setIsProfileDialogOpen(true); }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-2">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditor(u)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => requestDelete(u)}
                                  disabled={!canDelete(u)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Activity Log
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginatedUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">👥</div>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No users found matching your search." : "No users found."}
                  </p>
                </div>
              )}

              {/* Pagination controls */}
              {filteredAndSortedUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredAndSortedUsers.length)} to {Math.min(page * PAGE_SIZE, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(Math.max(1, page - 1))} 
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} / {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(Math.min(totalPages, page + 1))} 
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Nested editor dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user fields of Name, Email, Password, and Mapped Vendor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
            <div className="space-y-2">
              <Label htmlFor="email">Username (Email)</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className={emailError ? "border-red-500" : ""}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Type</Label>
              <Input id="role" value={form.role} readOnly className="bg-muted/30" />
            </div>

            <div className={form.password ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-2"}>
              <div className="space-y-2">
                <Label htmlFor="password">Password (leave blank to keep current)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 grid place-items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {form.password && (
                <div className="space-y-2 animate-in slide-in-from-right-4 duration-300 ease-out">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 grid place-items-center text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {realTimeErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{realTimeErrors.confirmPassword}</p>
                  )}
                </div>
              )}
            </div>

            {isPartner && (
              <div className="space-y-2">
                <Label>Vendor Name as in QBO</Label>
                <Popover open={vendorPopoverOpen} onOpenChange={setVendorPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={clsx("w-full justify-between", !form.mapped_vendor_qbo_id && "text-muted-foreground")}
                    >
                      {form.mapped_vendor_qbo_id
                        ? `${
                            vendors.find((v) => v.vendor_qbo_id === form.mapped_vendor_qbo_id)?.vendor_name ?? "Unknown"
                          } · ID ${form.mapped_vendor_qbo_id}`
                        : "Select vendor…"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <CustomPopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search vendor..." />
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <ScrollArea className="h-52">
                        <CommandGroup>
                        {vendors.map((v) => (
                          <CommandItem
                            key={v.vendor_qbo_id}
                            value={`${v.vendor_name} ${v.vendor_qbo_id}`}
                            onSelect={() => {
                              setForm((f) => ({ ...f, mapped_vendor_qbo_id: v.vendor_qbo_id }))
                              setVendorPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                form.mapped_vendor_qbo_id === v.vendor_qbo_id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {v.vendor_name} <span className="text-muted-foreground">· ID {v.vendor_qbo_id}</span>
                          </CommandItem>
                        ))}
                        </CommandGroup>
                      </ScrollArea>
                    </Command>
                  </CustomPopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdits} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action permanently removes the selected user and cannot be undone.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create User Dialog */}
      <CreateUserDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onUserCreated={loadUsers} />

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
            <DialogDescription>Complete information and activity for this user</DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* User Header with Avatar and Basic Info */}
              <div className={`flex items-start gap-6 p-6 rounded-lg border ${
                viewingUser.role === 'admin' 
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : viewingUser.role === 'internal_full_access'
                  ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
                  : viewingUser.role === 'internal_show_access'
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"
                  : viewingUser.role === 'partner'
                  ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"
                  : "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800"
              }`}>
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    viewingUser.role === 'admin' 
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : viewingUser.role === 'internal_full_access'
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : viewingUser.role === 'internal_show_access'
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : viewingUser.role === 'partner'
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "bg-slate-100 dark:bg-slate-900/30"
                  }`}>
                    <UserIcon className={`h-8 w-8 ${
                      viewingUser.role === 'admin' 
                        ? "text-emerald-600 dark:text-emerald-400"
                        : viewingUser.role === 'internal_full_access'
                        ? "text-orange-600 dark:text-orange-400"
                        : viewingUser.role === 'internal_show_access'
                        ? "text-blue-600 dark:text-blue-400"
                        : viewingUser.role === 'partner'
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {viewingUser.name || "Unnamed User"}
                  </h2>
                  <p className="text-lg text-muted-foreground font-mono truncate">
                    {viewingUser.email}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge 
                      className={`text-xs border pointer-events-none uppercase font-semibold ${
                        viewingUser.role === 'admin' 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          : viewingUser.role === 'internal_full_access'
                          ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                          : viewingUser.role === 'internal_show_access'
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                          : viewingUser.role === 'partner'
                          ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                          : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {formatRoleName(viewingUser.role)}
                    </Badge>
                    {viewingUser.created_at && (
                      <span className="text-sm text-muted-foreground">
                        Member since {new Date(viewingUser.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-muted/50">
                        <span className="font-medium text-muted-foreground">User ID</span>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {viewingUser.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-muted/50">
                        <span className="font-medium text-muted-foreground">Email Address</span>
                        <span className="font-mono text-sm">{viewingUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-muted/50">
                        <span className="font-medium text-muted-foreground">Full Name</span>
                        <span className="text-sm">{viewingUser.name || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-muted-foreground">Account Created</span>
                        <span className="text-sm">
                          {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString() : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor Information */}
                <Card>
                  <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-emerald-600" />
                    Vendor Mapping
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewingUser.mapped_vendor_qbo_id ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                              {viewingUser.mapped_vendor_name || "Unknown Vendor"}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-mono">
                            QBO ID: {viewingUser.mapped_vendor_qbo_id}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        {viewingUser.role === 'admin' ? (
                          <>
                            <p className="text-muted-foreground font-medium">Admin users cannot be assigned to vendors</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Admin users have system-wide access and don't require vendor mapping
                            </p>
                          </>
                        ) : viewingUser.role === 'internal' ? (
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

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => { setIsProfileDialogOpen(false); openEditor(viewingUser); }}
                      className={`flex items-center gap-2 ${
                        viewingUser.role === 'admin' 
                          ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30"
                          : viewingUser.role === 'internal_full_access'
                          ? "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30"
                          : viewingUser.role === 'internal_show_access'
                          ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                          : viewingUser.role === 'partner'
                          ? "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30"
                          : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit User Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:from-cyan-100 hover:to-cyan-200 dark:hover:from-cyan-900/30 dark:hover:to-cyan-800/30"
                    >
                      <FileText className="h-4 w-4" />
                      View Activity Log
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsProfileDialogOpen(false)}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-900/30 dark:hover:to-slate-800/30"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
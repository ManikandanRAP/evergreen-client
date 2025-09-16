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
import { Check, ChevronsUpDown, Loader2, Pencil, Trash2, ArrowLeft, Eye, EyeOff, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Plus, Download, Users, UserCheck, UserX, MoreHorizontal, User as UserIcon, Building, FileText, Calendar, MoreVertical } from "lucide-react"
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
  const [form, setForm] = useState<{ name: string; email: string; role: string; password: string; mapped_vendor_qbo_id: number | null }>({
    name: "",
    email: "",
    role: "",
    password: "",
    mapped_vendor_qbo_id: null,
  })
  const [saving, setSaving] = useState(false)
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toDelete, setToDelete] = useState<UserRow | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const isPartner = useMemo(() => (form.role || "").toLowerCase() === "partner", [form.role])

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
    const internals = users.filter(u => u.role === "internal").length
    
    return { total, admins, partners, internals }
  }, [users])

  // Load users & vendors on mount
  useEffect(() => {
    const run = async () => {
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
      mapped_vendor_qbo_id: u.mapped_vendor_qbo_id ?? null,
    })
    setShowPassword(false)
  }

  async function saveEdits() {
    if (!editing || !token) return
    setSaving(true)
    try {
      // only send changed fields
      const payload: any = {}
      const changed: string[] = []

      if (form.name !== (editing.name ?? "")) {
        payload.name = form.name
        changed.push(`name → “${form.name || "—"}”`)
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
    <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold">{userStats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Partners</p>
                <p className="text-2xl font-bold">{userStats.partners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Internals</p>
                <p className="text-2xl font-bold">{userStats.internals}</p>
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
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
                      <TableHead>Mapped Vendor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          <span 
                            className="cursor-pointer hover:underline hover:text-emerald-600 transition-colors"
                            onClick={() => { setViewingUser(u); setIsProfileDialogOpen(true); }}
                          >
                            {u.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">{u.email}</TableCell>
                        <TableCell className="uppercase">{u.role || "—"}</TableCell>
                        <TableCell>
                          {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>
                          {u.mapped_vendor_qbo_id != null ? (
                            <span>
                              {u.mapped_vendor_name || "Unknown"}{" "}
                              <span className="text-muted-foreground">· ID {u.mapped_vendor_qbo_id}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditor(u)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => requestDelete(u)}
                              disabled={!canDelete(u)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
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
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Type</Label>
              <Input id="role" value={form.role} readOnly className="bg-muted/30" />
            </div>

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
      <CreateUserDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Profile</DialogTitle>
            <DialogDescription>Complete information about this user</DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* Header Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    {viewingUser.name || viewingUser.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                      </div>
                      <p className="text-muted-foreground font-mono">{viewingUser.email}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Role:</span>
                      </div>
                      <Badge variant="outline" className="uppercase">{viewingUser.role || "—"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Created:</span>
                      </div>
                      <p className="text-muted-foreground">
                        {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Mapping Section */}
              {viewingUser.mapped_vendor_qbo_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Vendor Mapping
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Mapped Vendor:</span>
                      </div>
                      <p className="text-muted-foreground">
                        {viewingUser.mapped_vendor_name || "Unknown"} · ID {viewingUser.mapped_vendor_qbo_id}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => { setIsProfileDialogOpen(false); openEditor(viewingUser); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
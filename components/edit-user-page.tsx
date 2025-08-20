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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Card } from "@/components/ui/card"
import { Check, ChevronsUpDown, Loader2, Pencil, Trash2, ArrowLeft } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

type EditUserPageProps = {
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

const API_URL = "http://127.0.0.1:8000"

export default function EditUserPage({ onBack }: EditUserPageProps) {
  const { user: currentUser, token } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

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

  const isPartner = useMemo(() => (form.role || "").toLowerCase() === "partner", [form.role])

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
  }

  async function saveEdits() {
    if (!editing || !token) return
    setSaving(true)
    try {
      // only send changed fields
      const payload: any = {}
      if (form.name !== (editing.name ?? "")) payload.name = form.name
      if (form.email !== editing.email) payload.email = form.email
      if (form.password && form.password.trim().length > 0) payload.password = form.password
      // vendor mapping (only for partner; allow clearing)
      if (isPartner) {
        if ((form.mapped_vendor_qbo_id ?? null) !== (editing.mapped_vendor_qbo_id ?? null)) {
          payload.mapped_vendor_qbo_id = form.mapped_vendor_qbo_id
        }
      } else if (editing.mapped_vendor_qbo_id != null) {
        payload.mapped_vendor_qbo_id = null
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

      // success toast
      toast({
        title: "User updated",
        description: `${updated.name ?? updated.email} has been saved.`,
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

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Edit Users</h1>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                  <th className="w-[220px]">Name</th>
                  <th className="w-[260px]">Email</th>
                  <th className="w-[140px]">Role</th>
                  <th className="w-[200px]">Created At</th>
                  <th className="w-[320px]">Mapped Vendor (Name · ID)</th>
                  <th className="w-[160px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t [&>td]:px-4 [&>td]:py-3">
                    <td>{u.name || "—"}</td>
                    <td className="font-mono">{u.email}</td>
                    <td className="uppercase">{u.role || "—"}</td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleString() : "—"}</td>
                    <td>
                      {u.mapped_vendor_qbo_id != null ? (
                        <span>
                          {u.mapped_vendor_name || "Unknown"}{" "}
                          <span className="text-muted-foreground">· ID {u.mapped_vendor_qbo_id}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditor(u)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => requestDelete(u)}
                        disabled={!canDelete(u)}
                        title={!canDelete(u) ? "You cannot delete your own account" : undefined}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Nested editor dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the fields below and click Save.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={form.role} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
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
                        ? `${vendors.find((v) => v.vendor_qbo_id === form.mapped_vendor_qbo_id)?.vendor_name ?? "Unknown"} · ID ${form.mapped_vendor_qbo_id}`
                        : "Select vendor…"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search vendors…" />
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <CommandGroup>
                        {/* Clear selection */}
                        <CommandItem
                          onSelect={() => {
                            setForm((f) => ({ ...f, mapped_vendor_qbo_id: null }))
                            setVendorPopoverOpen(false)
                          }}
                        >
                          <span className="text-muted-foreground">— No vendor —</span>
                        </CommandItem>
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
                              className={clsx(
                                "mr-2 h-4 w-4",
                                form.mapped_vendor_qbo_id === v.vendor_qbo_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {v.vendor_name} · ID {v.vendor_qbo_id}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
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
    </div>
  )
}

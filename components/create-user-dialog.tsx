"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Eye, EyeOff, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Vendor {
  vendor_name: string
  vendor_qbo_id: number
}

// Define the API URL. In a real application, this should be in a .env file.
const API_URL = "http://127.0.0.1:8000"

export default function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    userType: "",
    username: "",
    password: "",
    fullName: "",
    mapped_vendor_qbo_id: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isVendorPopoverOpen, setIsVendorPopoverOpen] = useState(false)

  useEffect(() => {
    if (open && token) {
      const fetchVendors = async () => {
        try {
          const response = await fetch(`${API_URL}/vendors`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            let errorMessage = `API request failed with status ${response.status}.`
            if (response.status === 401 || response.status === 403) {
              errorMessage = "Authorization Error: You must be logged in as an admin to view vendors."
            } else if (response.status === 404) {
              errorMessage = "API Endpoint Not Found: Please ensure the backend server is running at the correct address."
            }
            throw new Error(errorMessage)
          }

          const data = await response.json()
          if (!data || data.length === 0) {
            toast({
              title: "No Vendors Found",
              description: "The database query returned no vendors. Please check the 'split_history' table.",
              variant: "default",
            })
          }
          setVendors(data)
        } catch (error: any) {
          console.error("Error fetching vendors:", error)
          toast({
            title: "Failed to Load Vendors",
            description: error.message || "Could not connect to the API.",
            variant: "destructive",
          })
        }
      }
      fetchVendors()
    }
  }, [open, token, toast])

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userType: value,
      mapped_vendor_qbo_id: value === "admin" ? "" : prev.mapped_vendor_qbo_id,
    }))
    if (value === "admin" && errors.mapped_vendor_qbo_id) {
      setErrors((prev) => ({ ...prev, mapped_vendor_qbo_id: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userType) newErrors.userType = "User type is required"
    if (!formData.username) newErrors.username = "Username is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address"
    }
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (formData.userType === "partner" && !formData.mapped_vendor_qbo_id) {
      newErrors.mapped_vendor_qbo_id = "Vendor is required for partner users"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        name: formData.fullName,
        email: formData.username,
        password: formData.password,
        role: formData.userType,
        mapped_vendor_qbo_id:
          formData.userType === "partner" ? Number(formData.mapped_vendor_qbo_id) : null,
      }

      const response = await fetch(`${API_URL}/create_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create user")
      }

      toast({
        title: "User created successfully",
        description: `${formData.fullName} has been added as a ${formData.userType}.`,
      })

      setFormData({
        userType: "",
        username: "",
        password: "",
        fullName: "",
        mapped_vendor_qbo_id: "",
      })
      setErrors({})
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message || "There was a problem creating the user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new admin or partner user to the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select value={formData.userType} onValueChange={handleUserTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && <p className="text-sm text-red-500">{errors.userType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username (Email ID)</Label>
            <Input
              id="username"
              type="email"
              placeholder="user@example.com"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          {formData.userType === "partner" && (
            <div className="space-y-2">
              <Label>Vendor Name as in QBO</Label>
              <Popover open={isVendorPopoverOpen} onOpenChange={setIsVendorPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isVendorPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.mapped_vendor_qbo_id
                      ? vendors.find((v) => v.vendor_qbo_id.toString() === formData.mapped_vendor_qbo_id)?.vendor_name
                      : "Select vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  side="bottom"
                  align="start"
                  sideOffset={5}
                  avoidCollisions={false}
                >
                  <Command>
                    <CommandInput placeholder="Search vendor..." />
                    <CommandEmpty>No vendor found.</CommandEmpty>
                    <CommandGroup className="max-h-52 overflow-y-auto">
                      {vendors.map((vendor) => (
                        <CommandItem
                          key={vendor.vendor_qbo_id}
                          value={vendor.vendor_name}
                          onSelect={() => {
                            handleInputChange("mapped_vendor_qbo_id", vendor.vendor_qbo_id.toString())
                            setIsVendorPopoverOpen(false)
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.mapped_vendor_qbo_id === vendor.vendor_qbo_id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {vendor.vendor_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.mapped_vendor_qbo_id && (
                <p className="text-sm text-red-500">{errors.mapped_vendor_qbo_id}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
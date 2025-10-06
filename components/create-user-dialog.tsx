"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { CustomPopoverContent } from "@/components/ui/custom-popover-content"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, EyeOff, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated?: () => void
}

interface Vendor {
  vendor_name: string
  vendor_qbo_id: number
}

// const API_URL = "http://127.0.0.1:8000"
const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    userType: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    mapped_vendor_qbo_id: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [realTimeErrors, setRealTimeErrors] = useState<Record<string, string>>({})
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string>("")
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
      mapped_vendor_qbo_id: value !== "partner" ? "" : prev.mapped_vendor_qbo_id,
    }))
    if (value !== "partner" && errors.mapped_vendor_qbo_id) {
      setErrors((prev) => ({ ...prev, mapped_vendor_qbo_id: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userType) newErrors.userType = "User type is required"
    if (!formData.username) newErrors.username = "Username is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address"
    } else if (usernameError) {
      newErrors.username = usernameError
    }
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required"
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (formData.userType === "partner" && !formData.mapped_vendor_qbo_id) {
      newErrors.mapped_vendor_qbo_id = "Vendor is required for partner users"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseErrorMessage = async (resp: Response) => {
    try {
      const data = await resp.json()
      return data?.detail || data?.message || `Request failed (${resp.status})`
    } catch {
      try {
        const text = await resp.text()
        return text || `Request failed (${resp.status})`
      } catch {
        return `Request failed (${resp.status})`
      }
    }
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
        const msg = await parseErrorMessage(response)
        throw new Error(msg)
      }

      // Try to read the created user (if backend returns it). Fall back to form data.
      const created = await response.json().catch(() => null as any)

      const role = (created?.role ?? formData.userType) as string
      const email = (created?.email ?? formData.username) as string
      const name = (created?.name ?? formData.fullName) as string

      // If partner with vendor mapping, include vendor name + ID in toast.
      const mappedId =
        created?.mapped_vendor_qbo_id ??
        (formData.userType === "partner" ? Number(formData.mapped_vendor_qbo_id) : null)

      const vendorLine =
        role === "partner" && mappedId != null
          ? (() => {
              const vend = vendors.find((v) => v.vendor_qbo_id === Number(mappedId))
              const vendName = vend?.vendor_name ?? "Unknown Vendor"
              return ` · Vendor: ${vendName} · ID ${mappedId}`
            })()
          : ""

      toast({
        title: "User created successfully",
        description: `${name} (${email}) · Role: ${role}${vendorLine}`,
      })

      setFormData({
        userType: "",
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        mapped_vendor_qbo_id: "",
      })
      setErrors({})
      setRealTimeErrors({})
      setUsernameError("")
      onOpenChange(false)
      
      // Notify parent component to reload users list
      onUserCreated?.()
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error?.message || "There was a problem creating the user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Only clear regular form errors for the specific field being changed
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Don't clear real-time errors when typing in other fields
  }

  // Real-time password validation
  useEffect(() => {
    setRealTimeErrors(prev => {
      const newErrors = { ...prev }
      
      if (formData.password && formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
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
  }, [formData.password, formData.confirmPassword])

  // Real-time username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!formData.username || !token) return
      
      // Basic email validation first
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
        setUsernameError("")
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
          body: JSON.stringify({ username: formData.username }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.available) {
            setUsernameError("")
          } else {
            setUsernameError("Username already exists")
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

    // Only run if username actually changed and is not empty
    if (formData.username.trim()) {
      // Debounce the API call
      const timeoutId = setTimeout(checkUsernameAvailability, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [formData.username, token])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
        <DialogHeader className="text-left pr-8">
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add new Admin, Internal, or Partner users to the Myco System.</DialogDescription>
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
                <SelectItem value="internal_full_access">Internal - Full Access</SelectItem>
                <SelectItem value="internal_show_access">Internal - Show Access</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && <p className="text-sm text-red-500">{errors.userType}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="username">Username (Email ID)</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={usernameError ? "border-red-500" : ""}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {(errors.confirmPassword || realTimeErrors.confirmPassword) && (
                <p className="text-sm text-red-500">{errors.confirmPassword || realTimeErrors.confirmPassword}</p>
              )}
            </div>
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
                      ? `${vendors.find((v) => v.vendor_qbo_id.toString() === formData.mapped_vendor_qbo_id)?.vendor_name ?? "Unknown"} · ID ${formData.mapped_vendor_qbo_id}`
                      : "Select vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <CustomPopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search vendor..." />
                    <CommandEmpty>No vendor found.</CommandEmpty>
                    <ScrollArea className="h-52">
                      <CommandGroup>
                      {vendors.map((vendor) => (
                        <CommandItem
                          key={vendor.vendor_qbo_id}
                          value={`${vendor.vendor_name} ${vendor.vendor_qbo_id}`}
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
                          {vendor.vendor_name} <span className="text-muted-foreground">· ID {vendor.vendor_qbo_id}</span>
                        </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </CustomPopoverContent>
              </Popover>
              {errors.mapped_vendor_qbo_id && (
                <p className="text-sm text-red-500">{errors.mapped_vendor_qbo_id}</p>
              )}
            </div>
          )}

          <div className="space-y-3 pt-4">
            {/* Mobile Layout */}
            <div className="sm:hidden space-y-3">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Cancel
              </Button>
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden sm:flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

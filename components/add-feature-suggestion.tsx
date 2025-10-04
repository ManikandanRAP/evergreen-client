"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { Lightbulb, Send, X } from "lucide-react"
import { toast } from "sonner" // 1. Import toast from sonner

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  type: z.enum(["New Feature", "General Feedback"], {
    required_error: "Please select a feedback type",
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
})

type FormData = z.infer<typeof formSchema>

// Define your API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export default function AddFeatureSuggestion() {
  const { user, token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: undefined,
      description: "",
    },
  })

  // Check if user has access
  if (user?.role !== "internal_full_access" && user?.role !== "internal_show_access" && user?.role !== "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Feature Suggestions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Submit feature requests and feedback.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Access Denied</CardTitle>
            <CardDescription className="text-sm sm:text-base">This feature is only accessible to internal and admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this feature. Please contact your administrator if you believe this is
              an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      // 2. Update the success toast to sonner's format
      toast.success("Feedback submitted successfully!", {
        description: "Thank you for your suggestion. It has been forwarded to the development team.",
      })

      // Reset form
      form.reset()
    } catch (error) {
      // 3. Update the error toast to sonner's format
      toast.error("Error submitting feedback", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
          Feature Suggestions
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Submit feature requests and feedback to help improve our platform.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>Share your ideas and suggestions with our development team.</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a brief title for your suggestion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New Feature">New Feature</SelectItem>
                        <SelectItem value="General Feedback">General Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about your suggestion or feedback..."
                        className="min-h-[100px] sm:min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="evergreen-button w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
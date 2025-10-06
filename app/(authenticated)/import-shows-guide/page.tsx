"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info, CheckCircle, AlertCircle, Download, BookOpen, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ImportShowsGuide() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header with back button - Mobile: below title, Desktop: back button before title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Desktop: back button before title, Mobile: title first */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Back button - Desktop: show before title, Mobile: hide here */}
          <Button variant="outline" onClick={() => router.push('/shows-management?openImport=true')} className="gap-2 w-fit hidden md:flex">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              CSV Import Template Guide
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Complete reference for importing show data into the Myco Shows Management System
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          {/* Last Updated - Button-styled for both desktop and mobile */}
          <div className="hidden md:block">
            <div className="px-3 py-2 border border-border rounded-md bg-background text-sm text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          {/* Mobile: back button on left, last updated on right */}
          <div className="flex items-center justify-between w-full md:hidden">
            <Button variant="outline" onClick={() => router.push('/shows-management?openImport=true')} className="gap-2 w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="px-3 py-2 border border-border rounded-md bg-background text-sm text-muted-foreground">
              Updated {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="mb-6 sm:mb-8 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Info className="w-5 h-5" />
            Quick Start Process
          </CardTitle>
          <CardDescription className="text-emerald-700 dark:text-emerald-300">
            Follow these steps to successfully import your show data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Download Template</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Get the CSV template from the import dialog</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Fill Your Data</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Use this guide to fill out the template correctly</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Upload & Import</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Upload your completed CSV file</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="mb-6 sm:mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Only the <strong>"Show Name"</strong> field is required. All other fields are optional but help with better reporting and data completeness.
        </AlertDescription>
      </Alert>

      {/* Field Reference Tables */}
      <div className="space-y-8">
        
        {/* Core Show Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">1. Core Show Information</CardTitle>
            <CardDescription>Essential show details (Show Name is required)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Field</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Valid Values</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Example</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-red-50 dark:bg-red-950/20">
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-red-800 dark:text-red-200 text-sm sm:text-base">Show Name</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Any text</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"The Daily Show"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="destructive">Required</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Show Type</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Branded, Original, Partner</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"Original"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Format</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">video, audio, both</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"audio"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Ranking Category</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">1, 2, 3, 4, 5 or Level 1-5</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"3"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Is Original Content</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Yes, No</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"Yes"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Is Rate Card Show</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Yes, No</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"No"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business & Relationship Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">2. Business & Relationship Details</CardTitle>
            <CardDescription>Partnership and business information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Field</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Valid Values</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Example</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Relationship</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">strong, medium, weak</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"strong"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Start Date</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Multiple formats supported</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"01/15/2024"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-blue-600 dark:text-blue-400">See Date Formats</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Minimum Guarantee</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Decimal number</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"5000.00"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">No currency symbol</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Ownership by Evergreen (%)</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">0-100</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"75.5"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Decimal number</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Cadence</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Daily, Weekly, Biweekly, Monthly, Ad hoc</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"Weekly"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content & Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">3. Content & Audience</CardTitle>
            <CardDescription>Target audience and content details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Field</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Valid Values</TableHead>
                      <TableHead className="border-r px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Example</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Genre</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">20 predefined genres</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"True Crime"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Age Demographic</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">18-24, 25-34, 35-44, 45-54, 55+</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"25-34"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Exact values only</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Gender Demographic (M/F)</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">MM/FF format</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"60/40"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Male/Female percentage</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Region Demographic</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Urban, Rural, Both</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"Urban"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Case Insensitive</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Average Length (Minutes)</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Integer</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"30"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Whole number</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base">Ad Slots</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Integer</TableCell>
                      <TableCell className="border-r px-3 sm:px-4 py-2 sm:py-3 text-purple-600 dark:text-purple-400 italic text-sm sm:text-base">"5"</TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">Whole number</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Format Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">Date Format Support</CardTitle>
            <CardDescription>The Start Date field accepts multiple common date formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Supported Formats:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-muted px-2 py-1 rounded">2024-01-15</code> (ISO Standard)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-muted px-2 py-1 rounded">01/15/2024</code> (US Format)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-muted px-2 py-1 rounded">1-15-24</code> (2-digit year)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-muted px-2 py-1 rounded">12,31,23</code> (Comma separator)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Year Logic (2-digit years):</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Years 00-68 → 2000-2068
                  </li>
                  <li className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Years 69-99 → 1969-1999
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Genre Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">Genre Options (20 Predefined)</CardTitle>
            <CardDescription>Select from these predefined genre categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                "History", "Human Resources", "Human Interest", "Fun & Nostalgia",
                "True Crime", "Financial", "News & Politics", "Movies",
                "Music", "Religious", "Health & Wellness", "Parenting",
                "Lifestyle", "Storytelling", "Literature", "Sports",
                "Pop Culture", "Arts", "Business", "Philosophy"
              ].map((genre, index) => (
                <Badge key={index} variant="outline" className="p-2 text-center text-xs sm:text-sm">
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Validation Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-red-800 dark:text-red-200">Common Validation Errors & Solutions</CardTitle>
            <CardDescription>How to fix the most common import errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">"Invalid Show Type"</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">Use exactly: Branded, Original, or Partner (any case)</p>
                <p className="text-sm text-muted-foreground">❌ Invalid: "branded", "Podcast", "Video Series"</p>
                <p className="text-sm text-green-600 dark:text-green-400">✅ Valid: "original", "Original", "ORIGINAL"</p>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">"Format must be MM/FF"</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">Use MM/FF format for Gender Demographic</p>
                <p className="text-sm text-muted-foreground">❌ Invalid: "Male", "Female", "Both", "60-40"</p>
                <p className="text-sm text-green-600 dark:text-green-400">✅ Valid: "60/40", "70/30", "50/50"</p>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">"Invalid Age Demographic"</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">Use exactly: 18-24, 25-34, 35-44, 45-54, 55+</p>
                <p className="text-sm text-muted-foreground">❌ Invalid: "18-34", "25-54", "Young Adult"</p>
                <p className="text-sm text-green-600 dark:text-green-400">✅ Valid: "25-34", "55+"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-blue-800 dark:text-blue-200">Best Practices</CardTitle>
            <CardDescription>Tips for successful CSV imports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Before Importing:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Test with a few shows first
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Use the preview feature to catch errors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Fill as many fields as possible for better reporting
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Data Quality:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Use consistent formatting for similar data types
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Keep your data current with regular updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Reference this guide while filling the template
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

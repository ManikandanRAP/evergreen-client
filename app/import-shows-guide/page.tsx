"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, CheckCircle, AlertCircle, Download, BookOpen } from "lucide-react"

export default function ImportShowsGuide() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-4">
          CSV Import Template Guide
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Complete reference for importing show data into the Myco Shows Management System
        </p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="w-5 h-5" />
            Quick Start Process
          </CardTitle>
          <CardDescription className="text-green-700">
            Follow these steps to successfully import your show data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <h3 className="font-semibold text-green-800">Download Template</h3>
              <p className="text-sm text-green-600">Get the CSV template from the import dialog</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <h3 className="font-semibold text-green-800">Fill Your Data</h3>
              <p className="text-sm text-green-600">Use this guide to fill out the template correctly</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <h3 className="font-semibold text-green-800">Upload & Import</h3>
              <p className="text-sm text-green-600">Upload your completed CSV file</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="mb-8">
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
            <CardTitle className="text-2xl text-blue-800">1. Core Show Information</CardTitle>
            <CardDescription>Essential show details (Show Name is required)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Field</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Valid Values</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Example</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-red-800">Show Name</td>
                    <td className="border border-gray-300 px-4 py-3">Any text</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"The Daily Show"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="destructive">Required</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Show Type</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Branded, Original, Partner</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"Original"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Format</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">video, audio, both</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"audio"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Ranking Category</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">1, 2, 3, 4, 5 or Level 1-5</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"3"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Is Original Content</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Yes, No</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"Yes"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Is Rate Card Show</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Yes, No</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"No"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Business & Relationship Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">2. Business & Relationship Details</CardTitle>
            <CardDescription>Partnership and business information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Field</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Valid Values</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Example</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Relationship</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">strong, medium, weak</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"strong"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Start Date</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Multiple formats supported</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"01/15/2024"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-blue-600">See Date Formats</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Minimum Guarantee</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Decimal number</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"5000.00"</td>
                    <td className="border border-gray-300 px-4 py-3">No currency symbol</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Ownership by Evergreen (%)</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">0-100</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"75.5"</td>
                    <td className="border border-gray-300 px-4 py-3">Decimal number</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Cadence</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Daily, Weekly, Biweekly, Monthly, Ad hoc</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"Weekly"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Content & Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">3. Content & Audience</CardTitle>
            <CardDescription>Target audience and content details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Field</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Valid Values</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Example</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Genre</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">20 predefined genres</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"True Crime"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Age Demographic</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">18-24, 25-34, 35-44, 45-54, 55+</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"25-34"</td>
                    <td className="border border-gray-300 px-4 py-3">Exact values only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Gender Demographic (M/F)</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">MM/FF format</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"60/40"</td>
                    <td className="border border-gray-300 px-4 py-3">Male/Female percentage</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Region Demographic</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Urban, Rural, Both</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"Urban"</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Badge variant="outline" className="text-orange-600">Case Insensitive</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Average Length (Minutes)</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Integer</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"30"</td>
                    <td className="border border-gray-300 px-4 py-3">Whole number</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Ad Slots</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-600 font-semibold">Integer</td>
                    <td className="border border-gray-300 px-4 py-3 text-purple-600 italic">"5"</td>
                    <td className="border border-gray-300 px-4 py-3">Whole number</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Date Format Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Date Format Support</CardTitle>
            <CardDescription>The Start Date field accepts multiple common date formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Supported Formats:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded">2024-01-15</code> (ISO Standard)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded">01/15/2024</code> (US Format)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded">1-15-24</code> (2-digit year)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded">12,31,23</code> (Comma separator)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Year Logic (2-digit years):</h4>
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
            <CardTitle className="text-2xl text-blue-800">Genre Options (20 Predefined)</CardTitle>
            <CardDescription>Select from these predefined genre categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "History", "Human Resources", "Human Interest", "Fun & Nostalgia",
                "True Crime", "Financial", "News & Politics", "Movies",
                "Music", "Religious", "Health & Wellness", "Parenting",
                "Lifestyle", "Storytelling", "Literature", "Sports",
                "Pop Culture", "Arts", "Business", "Philosophy"
              ].map((genre, index) => (
                <Badge key={index} variant="outline" className="p-2 text-center">
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Validation Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-800">Common Validation Errors & Solutions</CardTitle>
            <CardDescription>How to fix the most common import errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">"Invalid Show Type"</h4>
                <p className="text-sm text-red-700 mb-2">Use exactly: Branded, Original, or Partner (any case)</p>
                <p className="text-sm text-gray-600">❌ Invalid: "branded", "Podcast", "Video Series"</p>
                <p className="text-sm text-green-600">✅ Valid: "original", "Original", "ORIGINAL"</p>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">"Format must be MM/FF"</h4>
                <p className="text-sm text-red-700 mb-2">Use MM/FF format for Gender Demographic</p>
                <p className="text-sm text-gray-600">❌ Invalid: "Male", "Female", "Both", "60-40"</p>
                <p className="text-sm text-green-600">✅ Valid: "60/40", "70/30", "50/50"</p>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">"Invalid Age Demographic"</h4>
                <p className="text-sm text-red-700 mb-2">Use exactly: 18-24, 25-34, 35-44, 45-54, 55+</p>
                <p className="text-sm text-gray-600">❌ Invalid: "18-34", "25-54", "Young Adult"</p>
                <p className="text-sm text-green-600">✅ Valid: "25-34", "55+"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Best Practices</CardTitle>
            <CardDescription>Tips for successful CSV imports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Before Importing:</h4>
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
                <h4 className="font-semibold text-blue-800 mb-3">Data Quality:</h4>
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

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>CSV Import Template Guide - Myco</p>
        <p>Updated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}

"use client"

import { ReactNode } from "react"

interface AnimatedContentWrapperProps {
  cardsView: ReactNode
  listView: ReactNode
  viewMode: "cards" | "list"
  className?: string
}

export default function AnimatedContentWrapper({ 
  cardsView,
  listView,
  viewMode, 
  className = "" 
}: AnimatedContentWrapperProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        className="flex transition-transform duration-300 ease-in-out"
        style={{
          transform: viewMode === "cards" 
            ? "translateX(0%)" 
            : "translateX(-100%)"
        }}
      >
        {/* Cards view - takes up full width */}
        <div className="w-full flex-shrink-0">
          {viewMode === "cards" && cardsView}
        </div>
        
        {/* List view - takes up full width */}
        <div className="w-full flex-shrink-0">
          {viewMode === "list" && listView}
        </div>
      </div>
    </div>
  )
}
